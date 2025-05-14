// Initialize font size preference on load
window.addEventListener('load', () => {
  const savedSize = localStorage.getItem('fontSizePreference') || 'medium';
  document.body.className = `font-size-${savedSize}`;
});


// Game state management
let gameState = {
  cash: 100,
  collection: [],
  achievements: {},
  tutorialComplete: false,
  isMobile: false,
  ownedProperty: null,
  playerLevel: 1,
  playerXP: 0
};

const ACHIEVEMENTS = {
  // Collection Achievements
  cardCollector: { id: 'cardCollector', name: 'Card Collector', description: 'Collect 50 cards', xp: 50, requirement: 50, type: 'collection' },
  masterCollector: { id: 'masterCollector', name: 'Master Collector', description: 'Collect 200 cards', xp: 200, requirement: 200, type: 'collection' },
  legendaryHunter: { id: 'legendaryHunter', name: 'Legendary Hunter', description: 'Collect 10 legendary cards', xp: 100, requirement: 10, type: 'legendary' },
  
  // Heist Achievements
  firstHeist: { id: 'firstHeist', name: 'First Score', description: 'Complete your first heist', xp: 20, requirement: 1, type: 'heist' },
  heistMaster: { id: 'heistMaster', name: 'Heist Master', description: 'Complete 50 heists', xp: 100, requirement: 50, type: 'heist' },
  perfectHeist: { id: 'perfectHeist', name: 'Perfect Score', description: 'Complete a heist with 100% success chance', xp: 75, type: 'special' },
  
  // Drug Related
  drugBaron: { id: 'drugBaron', name: 'Drug Baron', description: 'Collect 1000 drug units', xp: 150, requirement: 1000, type: 'drugs' },
  kingpin: { id: 'kingpin', name: 'Kingpin', description: 'Own all properties', xp: 300, type: 'property' },
  
  // Money Achievements
  thousandaire: { id: 'thousandaire', name: 'Thousandaire', description: 'Have $1,000 at once', xp: 30, requirement: 1000, type: 'money' },
  millionaire: { id: 'millionaire', name: 'Millionaire', description: 'Have $1,000,000 at once', xp: 500, requirement: 1000000, type: 'money' },
  
  // Level Achievements
  level10: { id: 'level10', name: 'Rising Star', description: 'Reach level 10', xp: 100, requirement: 10, type: 'level' },
  level50: { id: 'level50', name: 'Criminal Legend', description: 'Reach level 50', xp: 500, requirement: 50, type: 'level' },
  
  // Special Achievements
  rerollMaster: { id: 'rerollMaster', name: 'Second Chances', description: 'Successfully complete a heist after rerolling', xp: 50, type: 'special' },
  setCollector: { id: 'setCollector', name: 'Set Collector', description: 'Complete 3 card sets', xp: 200, requirement: 3, type: 'sets' }
};

function showAchievements() {
  const gameArea = document.getElementById('gameArea');
  const achievementTypes = {
    collection: 'Collection',
    heist: 'Heists',
    drugs: 'Drug Empire',
    property: 'Property',
    money: 'Wealth',
    level: 'Progress',
    special: 'Special',
    sets: 'Card Sets'
  };

  let achievementsHTML = `
    <div class="achievements-page">
      <h1>Achievements</h1>
      <div class="achievement-stats">
        <div class="total-achievements">
          Completed: ${Object.keys(gameState.achievements).length}/${Object.keys(ACHIEVEMENTS).length}
        </div>
        <div class="achievement-progress">
          <div class="progress-bar" style="width: ${(Object.keys(gameState.achievements).length / Object.keys(ACHIEVEMENTS).length) * 100}%"></div>
        </div>
      </div>
      <div class="achievement-categories">`;

  for (const [type, title] of Object.entries(achievementTypes)) {
    const typeAchievements = Object.values(ACHIEVEMENTS).filter(a => a.type === type);
    achievementsHTML += `
      <div class="achievement-category">
        <h2>${title}</h2>
        <div class="achievement-list">
          ${typeAchievements.map(achievement => {
            const isComplete = gameState.achievements[achievement.id];
            return `
              <div class="achievement-item ${isComplete ? 'completed' : 'locked'}">
                <div class="achievement-icon">${isComplete ? '🏆' : '🔒'}</div>
                <div class="achievement-info">
                  <div class="achievement-name">${achievement.name}</div>
                  <div class="achievement-desc">${achievement.description}</div>
                  <div class="achievement-reward">Reward: ${achievement.xp} XP</div>
                </div>
                ${isComplete ? '<div class="completion-badge">✓</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>`;
  }

  achievementsHTML += `</div></div>`;
  gameArea.innerHTML = achievementsHTML;
  setActiveTab('ACHIEVEMENTS');
}

function checkAchievements() {
  const totalCards = gameState.collection.length;
  const legendaryCards = gameState.collection.filter(id => {
    const card = [...CARDS.Location, ...CARDS.Crew, ...CARDS.Gear].find(c => c.id === id);
    return card && card.rarity === 'Legendary';
  }).length;

  // Check each achievement
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (gameState.achievements[achievement.id]) return; // Skip if already achieved

    let achieved = false;
    switch (achievement.type) {
      case 'collection':
        achieved = totalCards >= achievement.requirement;
        break;
      case 'legendary':
        achieved = legendaryCards >= achievement.requirement;
        break;
      case 'money':
        achieved = gameState.cash >= achievement.requirement;
        break;
      case 'level':
        achieved = gameState.playerLevel >= achievement.requirement;
        break;
      // Add more achievement checks as needed
    }

    if (achieved) {
      unlockAchievement(achievement);
    }
  });
}

function unlockAchievement(achievement) {
  if (gameState.achievements[achievement.id]) return;
  
  gameState.achievements[achievement.id] = true;
  addXP(achievement.xp);
  saveGame();

  // Show achievement notification
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">🏆</div>
    <div class="achievement-text">
      <div class="achievement-title">${achievement.name}</div>
      <div class="achievement-desc">${achievement.description}</div>
      <div class="achievement-xp">+${achievement.xp} XP</div>
    </div>
  `;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

const PROPERTIES = [
  {
    id: 'apt1',
    name: 'Studio Apartment',
    description: 'A modest start - one room, shared bathroom down the hall. Unlocks drug unit rewards from drug location heists!',
    price: 5000,
    image: '🏢',
    perks: ['Basic shelter', 'Drug Unit Rewards']
  },
  {
    id: 'apt2',
    name: 'One Bedroom Apartment',
    description: 'Moving up - your own bathroom and kitchen!',
    price: 15000,
    image: '🏬',
    perks: ['Private bathroom', 'Kitchen']
  },
  {
    id: 'house1',
    name: 'Small House',
    description: 'A tiny house in the suburbs.',
    price: 50000,
    image: '🏡',
    perks: ['Yard', 'Two bedrooms']
  },
  {
    id: 'house2',
    name: 'Family Home',
    description: 'A proper house with a garage.',
    price: 150000,
    image: '🏠',
    perks: ['Garage', 'Three bedrooms', 'Garden']
  },
  {
    id: 'mansion1',
    name: 'Luxury Villa',
    description: 'Your first taste of luxury living.',
    price: 500000,
    image: '🏯',
    perks: ['Pool', 'Guest house', 'Security system']
  },
  {
    id: 'mansion2',
    name: 'Beachfront Mansion',
    description: 'Paradise by the sea.',
    price: 1500000,
    image: '⛱️',
    perks: ['Private beach', 'Boat dock', 'Staff quarters']
  },
  {
    id: 'estate1',
    name: 'Country Estate',
    description: 'A sprawling estate with extensive grounds.',
    price: 5000000,
    image: '🏰',
    perks: ['Tennis court', 'Wine cellar', 'Helicopter pad']
  },
  {
    id: 'penthouse1',
    name: 'City Penthouse',
    description: 'Top floor luxury in the heart of the city.',
    price: 10000000,
    image: '🌆',
    perks: ['360° views', 'Private elevator', 'Rooftop garden']
  },
  {
    id: 'compound1',
    name: 'Private Island Compound',
    description: 'Your own slice of paradise.',
    price: 25000000,
    image: '🏝️',
    perks: ['Private island', 'Multiple buildings', 'Yacht marina']
  },
  {
    id: 'penthouse2',
    name: 'Ultra Luxury Sky Palace',
    description: 'The ultimate in urban luxury.',
    price: 50000000,
    image: '🌃',
    perks: ['Multiple floors', 'Indoor pool', 'Private helipad', 'Art gallery']
  }
];

// Check if device is mobile and handle tab navigation
function checkMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
}

function setActiveTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.label === tabName) {
      btn.classList.add('active');
    }
  });
}

// Update navigation based on device type
function updateNavigation() {
  const isMobile = checkMobile();
  const navTabs = document.querySelector('.nav-tabs');

  if (isMobile) {
    navTabs.classList.add('mobile-nav');
  } else {
    navTabs.classList.remove('mobile-nav');
  }
}

const TUTORIAL_STEPS = [
  {
    text: "Welcome to HeistPacks! You start with $100 to build your criminal empire.",
    action: null
  },
  {
    text: "Let's start by opening a pack! Click the PACKS button above to get your first cards.",
    action: "showPackSelection"
  },
  {
    text: "Each pack contains 3 cards: a Location to target, a Crew member for the job, and Gear to help you succeed.",
    action: null
  },
  {
    text: "Now that you have cards, let's try a heist! Click the HEIST button to begin planning.",
    action: "showHeistSetup"
  },
  {
    text: "Select one card of each type for your heist. Your success chance depends on your cards' stats - better cards mean better odds!",
    action: null
  }
];

function showTutorial() {
  if (gameState.tutorialComplete) return;

  let currentStep = gameState.tutorialStep || 0;
  const gameArea = document.getElementById('gameArea');

  function displayStep() {
    const step = TUTORIAL_STEPS[currentStep];
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
      <div class="tutorial">
        <p>${step.text}</p>
        <button onclick="nextTutorialStep(${currentStep})">${currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Start Playing!'}</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  displayStep();
}

function nextTutorialStep(currentStep) {
  const tutorialOverlay = document.querySelector('.tutorial-overlay');
  if (tutorialOverlay) {
    tutorialOverlay.remove();
  }

  if (currentStep >= TUTORIAL_STEPS.length - 1) {
    gameState.tutorialComplete = true;
    saveGame();
    return;
  }

  gameState.tutorialStep = currentStep + 1;
  saveGame();

  const nextStep = TUTORIAL_STEPS[gameState.tutorialStep];
  if (nextStep.action) {
    window[nextStep.action]();
  } else {
    showTutorial();
  }
}

// Card categories and rarities
const CATEGORIES = ['Location', 'Crew', 'Gear'];
const RARITIES = {
  Common: { chance: 0.5, color: '#AAA' },
  Rare: { chance: 0.3, color: '#4488FF' },
  Epic: { chance: 0.15, color: '#AA44FF' },
  Legendary: { chance: 0.05, color: '#FFD700' }
};

// Get flavor text for cards
function getFlavor(card) {
  const flavors = {
    // Common Locations
    'Local Bank': "Small security, smaller rewards",
    'Jewelry Store': "Diamonds are a thief's best friend",
    'Corner Store': "Start small, dream big",
    'Small Post Office': "Neither rain, nor sleet, nor sticky fingers",
    'Suburban House': "The suburbs hide many secrets",
    'Pawn Shop': "One person's treasure...",
    'Mini Mall': "Shop till you drop... everything in the bag",
    'Local Museum': "History has its price",
    'Small Casino': "Place your bets, take your chances",
    'Convenience Store': "Quick and easy does it",

    // Rare Locations
    'Art Gallery': "Beauty is in the eye of the beholder... and the buyer",
    'City Bank': "The bigger the bank, the sweeter the score",
    'Police Evidence Room': "Evidence has a way of disappearing",
    'Corporate Office': "White collar, dark deeds",
    'Luxury Yacht': "High society, low morals",
    'Private Collection': "Some collectors don't like to share",
    'Research Facility': "Knowledge is power, power is profit",
    'High-Rise Penthouse': "The view is to die for",
    'Underground Vault': "What lies beneath...",
    'Airport Terminal': "Lost and found, mostly lost",

    // Epic Locations
    'Casino Vault': "High stakes, higher rewards",
    'Military Base': "High risk, higher security",
    'Government Facility': "Classified information costs extra",
    'Diamond Exchange': "A thief's best friend",
    'Nuclear Plant': "Handle with care",
    'Space Station': "One small step for thieves...",
    'Royal Palace': "Fit for a king, perfect for a thief",
    'Ancient Temple': "Raiders beware",
    'Presidential Train': "First class ticket to fortune",
    'Deep Sea Laboratory': "Pressure makes diamonds",

    // Legendary Locations
    'Federal Reserve': "The ultimate score",
    'Area 51': "The truth is in there",
    'Vatican Secret Archives': "Divine secrets require divine skill",
    'Fort Knox': "America's piggy bank",
    'Time Bank': "Time is money, literally",
    'Quantum Vault': "Reality is negotiable",
    'Galactic Museum': "Out of this world artifacts",
    'Dimensional Rift': "Reality is what you make of it",
    'Ancient Dragon\'s Lair': "Hot stuff, handle with care",
    'Infinity Vault': "Endless possibilities, endless riches",

    // Common Crew
    'Amateur Thief': "Everyone starts somewhere",
    'Lookout': "Eyes on the prize",
    'Street Runner': "Fast feet, faster getaway",
    'Rookie Hacker': "Learning the binary basics",
    'Ex-Security Guard': "Knows the routine all too well",
    'Getaway Driver': "Never missed a light... or a cop",
    'Local Fence': "One man's theft is another man's profit",
    'Safe Cracker': "The old-fashioned way",
    'Distraction Specialist': "Look here, not there",
    'Underground Scout': "Knows every alley and escape route",

    // Rare Crew
    'Security Expert': "Knows the system inside and out",
    'Professional Driver': "Never tell them the odds",
    'Tech Specialist': "Have you tried turning it off and on again?",
    'Disguise Artist': "Face value is never what it seems",
    'Skilled Negotiator': "Words are cheaper than bullets",
    'Demolitions Expert': "Precision explosions, precise timing",
    'Inside Contact': "Knowledge is power",
    'Elite Locksmith': "No lock too complex",
    'Stealth Operative': "You'll never see them coming",
    'Data Analyst': "Numbers tell the real story",

    // Epic Crew
    'Master Hacker': "Code is just another lock to pick",
    'Elite Infiltrator': "Like a ghost in the machine",
    'Neural Specialist': "Mind over matter, brain over brawn",
    'Quantum Physicist': "Reality is merely a suggestion",
    'Military Strategist': "Every plan has a plan B",
    'International Spy': "Licensed to steal",
    'AI Whisperer': "Speaking in binary",
    'Time Manipulator': "Time waits for no one, except them",
    'Ghost Protocol': "Now you see them... actually, you never did",
    'Mind Reader': "Thoughts are the key to every lock",

    // Legendary Crew
    'Legendary Mastermind': "The one they whisper about",
    'Reality Bender': "Reality is whatever they want it to be",
    'Dragon Tamer': "Fire-breathing problems require fire-breathing solutions",
    'Time Lord': "Time is relative, theft is absolute",
    'Dimensional Walker': "No wall can contain them",
    'Universe Hacker': "Rewriting the laws of physics",
    'Cosmic Entity': "Beyond human comprehension",
    'Shadow Master': "The darkness serves them",
    'Eternal One': "Time is an illusion, loot is eternal",
    'Infinity Weaver': "Reality is their playground",

    // Common Gear
    'Basic Tools': "Gets the job done... mostly",
    'Lockpick Set': "The old ways are sometimes the best",
    'Burner Phone': "Disposable, untraceable, essential",
    'Ski Mask': "Classic never goes out of style",
    'Gloves': "Leave no trace",
    'Flashlight': "Light in the darkness",
    'Rope': "Sometimes the simplest solution is the best",
    'Duffle Bag': "Carries hopes, dreams, and loot",
    'Basic Radio': "Testing, testing, 1-2-3",
    'Wire Cutters': "Snip snip!",

    // Rare Gear
    'Advanced Kit': "Professional grade equipment",
    'Encrypted Phone': "Secure communications for secure operations",
    'Thermal Camera': "See the invisible",
    'Signal Jammer': "Silence is golden",
    'Grappling Hook': "Up, up, and away!",
    'EMF Detector': "The truth is out there",
    'Voice Modulator': "Speak softly and carry a big stick",
    'Smoke Bombs': "Now you see me...",
    'Motion Sensors': "Movement is life",
    'Plasma Cutter': "Hot knife through butter",

    // Epic Gear
    'High-Tech Equipment': "Military grade hardware",
    'Neural Interface': "Mind over matter",
    'Hologram Generator': "Seeing is believing",
    'Gravity Manipulator': "What goes up...",
    'Phase Shifter': "Walk through walls",
    'AI Assistant': "Silicon dreams",
    'Quantum Scanner': "See all possibilities",
    'Energy Shield': "The best defense",
    'Time Dilation Device': "Time is on your side",
    'Memory Eraser': "Forget about it",

    // Legendary Gear
    'Reality Bender': "Reality is whatever I want it to be",
    'Time Manipulator': "Time is but a window",
    'Dragon Scale Armor': "Fireproof, bulletproof, foolproof",
    'Infinity Gauntlet': "Power beyond measure",
    'Cosmic Key': "Opens more than just doors",
    'Universal Translator': "Speak any language, including binary",
    'Dimensional Scissors': "Cut through reality",
    'Soul Extractor': "Borrow more than just possessions",
    'Matrix Interface': "Hack the planet",
    'Void Generator': "Create something from nothing"
  };
  return flavors[card.name] || "";
}

// Card Sets Definition
const CARD_SETS = {
  // Classic Sets
  oldSchoolHeist: {
    name: "Old School Heist",
    description: "Master the classic crew techniques",
    expansion: "classic",
    cards: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'],
    reward: {
      id: 'SR2',
      name: 'Master Safecracker',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Master of the old ways"
    }
  },
  undercover: {
    name: "Deep Undercover",
    description: "Master all the classic tools of deception",
    expansion: "classic",
    cards: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'],
    reward: {
      id: 'SR3',
      name: 'The Ghost',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Unseen, unheard, unknown"
    }
  },
  mobScene: {
    name: "Mob Scene",
    description: "Master the rare cards from the classic set",
    expansion: "classic",
    cards: ['L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'C11', 'C12', 'C13', 'C14', 'C15', 'C17', 'C18', 'C19', 'C20', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18', 'G19', 'G20'],
    reward: {
      id: 'SR4',
      name: 'Mob Boss',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "King of the classic underground"
    }
  },
  nightStalker: {
    name: "Night Stalker",
    description: "Master all epic cards from the classic set",
    cards: ['L21', 'L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'L30', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26', 'C27', 'C28', 'C29', 'C30', 'G21', 'G22', 'G23', 'G24', 'G25', 'G26', 'G27', 'G28', 'G29', 'G30'],
    reward: {
      id: 'SR5',
      name: 'Shadow Walker',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Master of epic heists"
    }
  },
  proJob: {
    name: "Professional Job",
    description: "Master all legendary cards from the classic set",
    expansion: "classic",
    cards: ['L31', 'L32', 'L33', 'L34', 'L35', 'L36', 'L37', 'L38', 'L39', 'L40', 'C31', 'C32', 'C33', 'C34', 'C35', 'C36', 'C37', 'C38', 'C39', 'C40', 'G31', 'G32', 'G33', 'G34', 'G35', 'G36', 'G37', 'G38', 'G39', 'G40'],
    reward: {
      id: 'SR7',
      name: 'The Professional',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Master of legendary heists"
    }
  },
  // Drug Expansion Sets
  drugRunner: {
    name: "Drug Runner",
    description: "Master the common drug crew techniques",
    expansion: "drug",
    cards: ['DC1', 'DC2', 'DC3', 'DC4', 'DC5', 'DC6', 'DC7', 'DC8', 'DC9', 'DC10'],
    reward: {
      id: 'DSR1',
      name: 'Street King',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Master of the streets"
    }
  },
  narcoEmpire: {
    name: "Narco Empire",
    description: "Master all drug locations",
    expansion: "drug",
    cards: ['DL1', 'DL2', 'DL3', 'DL4', 'DL5', 'DL6', 'DL7', 'DL8', 'DL9', 'DL10'],
    reward: {
      id: 'DSR2',
      name: 'Territory Lord',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Master of territories"
    }
  },
  drugLord: {
    name: "Drug Lord",
    description: "Master the rare drug cards",
    expansion: "drug",
    cards: ['DL11', 'DL12', 'DL13', 'DL14', 'DL15', 'DC11', 'DC12', 'DC13', 'DC14', 'DC15', 'DG11', 'DG12', 'DG13', 'DG14', 'DG15'],
    reward: {
      id: 'DSR3',
      name: 'Cartel Boss',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Master of the cartel"
    }
  },
  kingpin: {
    name: "Kingpin",
    description: "Master the epic drug cards",
    expansion: "drug",
    cards: ['DL21', 'DL22', 'DL23', 'DL24', 'DL25', 'DL26', 'DL27', 'DC21', 'DC22', 'DC23', 'DC24', 'DC25', 'DC26', 'DC27', 'DG21', 'DG22', 'DG23', 'DG24', 'DG25', 'DG26', 'DG27'],
    reward: {
      id: 'DSR4',
      name: 'El Padrino',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Supreme ruler of the underworld"
    }
  },
  narcoLegend: {
    name: "Narco Legend",
    description: "Master all legendary drug cards",
    expansion: "drug",
    cards: ['DL28', 'DL29', 'DL30', 'DC28', 'DC29', 'DC30', 'DG28', 'DG29', 'DG30'],
    reward: {
      id: 'DSR5',
      name: 'Drug Emperor',
      category: 'Crew',
      rarity: 'Legendary',
      skill: 7,
      flavor: "Legend of the drug empire"
    }
  }
};

function showSetDetails(setId) {
  const set = CARD_SETS[setId];
  if (!set) return;

  const content = document.getElementById('collection-content');

  // Check if the set is complete
  const isSetComplete = set.cards.every(cardId => gameState.collection.includes(cardId));

  // Check if the player already has the reward card
  const hasRewardCard = gameState.collection.includes(set.reward.id);

  const cardsHtml = set.cards.map(cardId => {
    let card;
    const firstLetter = cardId[0];
    let category;
    
    // Determine the category based on the first letter of the card ID
    if (firstLetter === 'L') category = 'Location';
    else if (firstLetter === 'C') category = 'Crew';
    else category = 'Gear';

    // Handle drug expansion cards
    if (cardId.startsWith('D')) {
      card = CARDS['Drug' + category].find(c => c.id === cardId);
    } else {
      card = CARDS[category].find(c => c.id === cardId);
    }

    const owned = gameState.collection.includes(cardId);

    return `
      <div class="card card-${card.rarity.toLowerCase()} ${owned ? 'owned' : 'not-owned'}">
        <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : 'Classic'}</div>
        <div class="card-id">#${card.id.startsWith('D') ? card.id.substring(2) : card.id.substring(1)}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-rarity">✧ ${card.rarity} ✧</div>
        <div class="card-category">${card.category}</div>
        <div class="card-stats">
          ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
          ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
          ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
        </div>
        ${owned ? '<div class="card-owned-badge">✓ Collected</div>' : ''}
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="set-details">
      <button class="back-button" onclick="showSets()">← Back to Sets</button>
      <h2>${set.name}</h2>
      <p>${set.description}</p>
      <div class="required-cards">
        <h3>Required Cards:</h3>
        <div class="cards-grid">
          ${cardsHtml}
        </div>
      </div>
      <div class="set-reward">
        <h3>Set Reward:</h3>
        <div class="card card-legendary ${isSetComplete && !hasRewardCard ? 'unclaimed-reward' : ''}" 
             onclick="${isSetComplete && !hasRewardCard ? `claimSetReward('${setId}')` : ''}">
          <div class="expansion-tag">${set.reward.id.startsWith('D') ? 'Drug' : 'Classic'}</div>
          <div class="card-id">#${set.reward.id.startsWith('D') ? set.reward.id.substring(2) : set.reward.id.substring(1)}</div>
          <div class="card-name">${set.reward.name}</div>
          <div class="card-rarity">✧ Legendary ✧</div>
          <div class="card-category">${set.reward.category}</div>
          <div class="card-stats">
            ⚔️ Skill: ${set.reward.skill}
          </div>
          ${isSetComplete && !hasRewardCard ? '<div class="claim-overlay">Click to Claim!</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

// Collection display
function showCollection() {
  const gameArea = document.getElementById('gameArea');
  const collection = {};

  // Count duplicates
  gameState.collection.forEach(cardId => {
    collection[cardId] = (collection[cardId] || 0) + 1;
  });

  // Create category tabs and filters
  gameArea.innerHTML = `
    <div class="collection-view">
      <div class="collection-header">
        <h2>Card Collection</h2>
        <div class="collection-filters">
          <div class="filter-group">
            <span class="filter-label">Expansion:</span>
            <select id="expansion-filter">
              <option value="all">All Expansions</option>
              <option value="classic">Classic Set</option>
              <option value="drug">Drug Expansion</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Rarity:</span>
            <select id="rarity-filter">
              <option value="all">All Rarities</option>
              ${Object.keys(RARITIES).map(rarity => 
                `<option value="${rarity.toLowerCase()}">${rarity}</option>`
              ).join('')}
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Sort By:</span>
            <select id="sort-filter">
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <button class="sort-button" onclick="filterCollection()">Sort Cards</button>
        </div>
      </div>
      <div class="collection-tabs">
        ${CATEGORIES.map(cat => `
          <button class="tab-button" onclick="showCollectionCategory('${cat}')">${cat}</button>
        `).join('')}
        <button class="tab-button" onclick="showSets()">Sets</button>
      </div>
      <div id="collection-content"></div>
    </div>
  `;

  showCollectionCategory(CATEGORIES[0]);
  setActiveTab('COLLECTION');
}

function filterCollection() {
  const expansion = document.getElementById('expansion-filter').value;
  const rarity = document.getElementById('rarity-filter').value;
  const sort = document.getElementById('sort-filter').value;

  const activeCategory = document.querySelector('.tab-button.active')?.textContent || CATEGORIES[0];
  showCollectionCategory(activeCategory, { expansion, rarity, sort });
}

function showCollectionCategory(category, filters = { expansion: 'all', rarity: 'all', sort: 'name' }) {
  const content = document.getElementById('collection-content');

  // Get cards from all expansions
  let cards = [];

  // Add classic cards
  if (filters.expansion === 'all' || filters.expansion === 'classic') {
    const classicCards = CARDS[category] ? CARDS[category].filter(card => !card.id.startsWith('D') && !card.id.startsWith('P')) : [];
    cards = cards.concat(classicCards);
  }

  // Add drug expansion cards
  if (filters.expansion === 'all' || filters.expansion === 'drug') {
    const drugCards = CARDS[`Drug${category}`] || [];
    cards = cards.concat(drugCards);
  }

  // Add prison expansion cards
  if (filters.expansion === 'all' || filters.expansion === 'prison') {
    const prisonCards = CARDS[`Prison${category}`] || [];
    cards = cards.concat(prisonCards);
  }

  // Apply rarity filter
  if (filters.rarity !== 'all') {
    cards = cards.filter(card => card.rarity.toLowerCase() === filters.rarity.toLowerCase());
  }

  // Apply expansion filter
  if (filters.expansion !== 'all') {
    cards = cards.filter(card => {
      if (filters.expansion === 'drug') return card.id.startsWith('D');
      if (filters.expansion === 'prison') return card.id.startsWith('P');
      return !card.id.startsWith('D') && !card.id.startsWith('P'); // classic cards
    });
  }

  // Apply sorting
  cards.sort((a, b) => {
    switch (filters.sort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rarity':
        return Object.keys(RARITIES).indexOf(b.rarity) - Object.keys(RARITIES).indexOf(a.rarity);
      case 'newest':
        const aNum = parseInt(a.id.replace(/[^0-9]/g, ''));
        const bNum = parseInt(b.id.replace(/[^0-9]/g, ''));
        return bNum - aNum;
      default:
        return 0;
    }
  });

  // Get unique cards and their counts
  const cardCounts = {};
  gameState.collection.forEach(id => {
    cardCounts[id] = (cardCounts[id] || 0) + 1;
  });

  // Filter for owned cards only and remove duplicates
  cards = cards.filter(card => cardCounts[card.id]);

  // Render cards
  content.innerHTML = `
    <div class="collection-grid">
      ${cards.map(card => {
        const count = cardCounts[card.id];
        const isExpansionCard = card.id.startsWith('D');
        return `
          <div class="collection-card card-${card.rarity.toLowerCase()} owned">
            <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : card.id.startsWith('P') ? 'Prison Break' : 'Classic'}</div>
            <div class="card-id">#${isExpansionCard ? card.id.substring(2) : card.id.substring(1)}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">✧ ${card.rarity} ✧</div>
            <div class="card-category">${category}</div>
            <div class="card-stats">
              ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
              ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
              ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
            </div>
            <div class="card-count">Owned: ${count}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showSets() {
  const content = document.getElementById('collection-content');
  const selectedExpansion = document.getElementById('expansion-filter')?.value || 'all';

  // Filter sets based on selected expansion
  const filteredSets = Object.entries(CARD_SETS).filter(([_, set]) => 
    selectedExpansion === 'all' || set.expansion === selectedExpansion
  );

  content.innerHTML = `
    <div class="sets-controls">
      <div class="expansion-selector">
        <label>Filter by Expansion:</label>
        <select onchange="filterSets(this.value)">
          <option value="all">All Expansions</option>
          <option value="classic">Classic Set</option>
          <option value="drug">Drug Expansion</option>
        </select>
      </div>
    </div>
    <div class="sets-grid">
      ${filteredSets.map(([setId, set]) => {
        const collectedCards = set.cards.filter(cardId => gameState.collection.includes(cardId));
        const progress = Math.round((collectedCards.length / set.cards.length) * 100);

        return `
          <div class="set-card" onclick="showSetDetails('${setId}')">
            <h3>${set.name}</h3>
            <p>${set.description}</p>
            <div class="set-progress">
              <div class="progress-bar" style="width: ${progress}%"></div>
              <span>${progress}% Complete</span>
            </div>
            <div class="set-reward-preview">
              <span class="reward-tease">🎁 Complete set to unlock ${set.reward.name}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showSetDetails(setId) {
  const set = CARD_SETS[setId];
  const content = document.getElementById('collection-content');

  // Check if the set is complete
  const isSetComplete = set.cards.every(cardId => gameState.collection.includes(cardId));

  // Check if the player already has the reward card
  const hasRewardCard = gameState.collection.includes(set.reward.id);

  const requiredCards = set.cards.map(cardId => {
    let card;
    const firstLetter = cardId[0];
    let category;
    
    // Determine the category based on the first letter of the card ID
    if (firstLetter === 'L') category = 'Location';
    else if (firstLetter === 'C') category = 'Crew';
    else category = 'Gear';

    // Handle drug and prison expansion cards
    if (cardId.startsWith('D')) {
      card = CARDS['Drug' + category].find(c => c.id === cardId);
    } else if (cardId.startsWith('P')) {
      card = CARDS['Prison' + category].find(c => c.id === cardId);
    } else {
      card = CARDS[category].find(c => c.id === cardId);
    }

    const owned = gameState.collection.includes(cardId);

    return `
      <div class="card card-${card.rarity.toLowerCase()} ${owned ? 'owned' : 'not-owned'}">
        <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : card.id.startsWith('P') ? 'Prison Break' : 'Classic'}</div>
        <div class="card-id">#${card.id.startsWith('D') || card.id.startsWith('P') ? card.id.substring(2) : card.id.substring(1)}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-rarity">✧ ${card.rarity} ✧</div>
        <div class="card-category">${card.category}</div>
        <div class="card-stats">
          ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
          ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
          ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
        </div>
        ${owned ? '<div class="card-owned-badge">✓ Collected</div>' : ''}
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="set-details">
      <button class="back-button" onclick="showSets()">← Back to Sets</button>
      <h2>${set.name}</h2>
      <p>${set.description}</p>
      <div class="required-cards">
        <h3>Required Cards:</h3>
        <div class="cards-grid">
          ${requiredCards}
        </div>
      </div>
      <div class="set-reward">
          <h3>Set Reward:</h3>
          <div class="card card-legendary ${isSetComplete && !hasRewardCard ? 'unclaimed-reward' : ''}" 
               onclick="${isSetComplete && !hasRewardCard ? `claimSetReward('${setId}')` : ''}">
            <div class="expansion-tag">${set.reward.id.startsWith('D') ? 'Drug' : 'Classic'}</div>
            <div class="card-id">#${set.reward.id.startsWith('D') ? set.reward.id.substring(2) : set.reward.id.substring(1)}</div>
            <div class="card-name">${set.reward.name}</div>
            <div class="card-rarity">✧ Legendary ✧</div>
            <div class="card-category">${set.reward.category}</div>
            <div class="card-stats">
              ⚔️ Skill: ${set.reward.skill}
            </div>
            ${isSetComplete && !hasRewardCard ? '<div class="claim-overlay">Click to Claim!</div>' : ''}
          </div>
        </div>
    </div>
  `;
}

function claimSetReward(setId) {
  const set = CARD_SETS[setId];

  // Add the reward card to the collection
  gameState.collection.push(set.reward.id);
  saveGame();

  // Show a special animation or popup
  showRewardAnimation(set.reward);

  // Re-render the set details to update the reward card's status
  showSetDetails(setId);
}

function showRewardAnimation(reward) {
  const content = document.getElementById('collection-content');

  // Create the animation container
  const animationContainer = document.createElement('div');
  animationContainer.className = 'reward-animation-container';

  // Create the card element
  const cardElement = document.createElement('div');
  cardElement.className = `card card-legendary reward-animation`;
  cardElement.innerHTML = `
    <div class="expansion-tag">${reward.id.startsWith('D') ? 'Drug' : 'Classic'}</div>
    <div class="card-id">#${reward.id.startsWith('D') ? reward.id.substring(2) : reward.id.substring(1)}</div>
    <div class="card-name">${reward.name}</div>
    <div class="card-rarity">✧ Legendary ✧</div>
    <div class="card-category">${reward.category}</div>
    <div class="card-stats">
      ⚔️ Skill: ${reward.skill}
    </div>
  `;

  // Add the card to the animation container
  animationContainer.appendChild(cardElement);

  // Add the animation container to the content area
  content.appendChild(animationContainer);

  // After the animation, remove the animation container
  setTimeout(() => {
    animationContainer.remove();
  }, 3000); // Adjust the time as needed
}

function showCollectionCategory(category) {
  const content = document.getElementById('collection-content');
  const expansionFilter = document.getElementById('expansion-filter')?.value || 'all';
  const rarityFilter = document.getElementById('rarity-filter')?.value || 'all';

  // Get all relevant cards
  let cards = [];

  // Add classic cards if selected
  if (expansionFilter === 'all' || expansionFilter === 'classic') {
    const classicCards = CARDS[category] ? CARDS[category].filter(card => !card.id.startsWith('D') && !card.id.startsWith('P')) : [];
    cards = cards.concat(classicCards);
  }

  // Add drug expansion cards if selected
  if (expansionFilter === 'all' || expansionFilter === 'drug') {
    const drugCards = CARDS[`Drug${category}`] || [];
    cards = cards.concat(drugCards);
  }

  // Add prison expansion cards if selected
  if (expansionFilter === 'all' || expansionFilter === 'prison') {
    const prisonCards = CARDS[`Prison${category}`] || [];
    cards = cards.concat(prisonCards);
  }

  // Apply rarity filter
  if (rarityFilter !== 'all') {
    cards = cards.filter(card => card.rarity.toLowerCase() === rarityFilter.toLowerCase());
  }

  // Filter for owned cards only
  cards = cards.filter(card => gameState.collection.includes(card.id));

  content.innerHTML = `
    <div class="collection-grid">
      ${cards.map(card => {
        const count = gameState.collection.filter(id => id === card.id).length;
        const isExpansionCard = card.id.startsWith('D');
        return `
          <div class="collection-card card-${card.rarity.toLowerCase()} ${count > 0 ? 'owned' : 'not-owned'}">
            <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : card.id.startsWith('P') ? 'Prison Break' : 'Classic'}</div>
            <div class="card-id">#${isExpansionCard ? card.id.substring(2) : card.id.substring(1)}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">✧ ${card.rarity} ✧</div>
            <div class="card-category">${category}</div>
            <div class="card-stats">
              ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
              ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
              ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
            </div>
            <div class="card-count">${count > 0 ? `Owned: ${count}` : 'Not Owned'}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Card database
const CARDS = {
  DrugLocation: [
    // Common Locations (10)
    { id: 'DL1', name: 'Corner Trap House', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Every block has one, if you know where to look" },
    { id: 'DL2', name: 'Abandoned Warehouse', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Perfect cover for a makeshift lab" },
    { id: 'DL3', name: 'Motel Room', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "Cash only, no questions asked" },
    { id: 'DL4', name: 'Street Corner', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "The oldest office in the business" },
    { id: 'DL5', name: 'Storage Unit', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Hidden in plain sight" },
    { id: 'DL6', name: 'Back Alley', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "Where deals go down after dark" },
    { id: 'DL7', name: 'Parking Garage', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Quick drops, quicker getaways" },
    { id: 'DL8', name: 'Condemned Building', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "No better place to conduct business" },
    { id: 'DL9', name: 'Local Bar', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Where everybody knows your game" },
    { id: 'DL10', name: 'Construction Site', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Always under construction, never completed" },

    // Rare Locations (10)
    { id: 'DL11', name: 'Border Crossing', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Where two worlds meet, deals are made" },
    { id: 'DL12', name: 'Shipping Container Yard', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Lost among thousands" },
    { id: 'DL13', name: 'Underground Lab', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "State-of-the-art equipment, off the grid" },
    { id: 'DL14', name: 'Private Airstrip', category: 'Location', rarity: 'Rare', difficulty: 5, flavor: "No flight plan required" },
    { id: 'DL15', name: 'Desert Safe House', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Miles from anywhere, exactly as planned" },
    { id: 'DL16', name: 'Cartel Front Store', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Business in the front, empire in the back" },
    { id: 'DL17', name: 'Mountain Grow Op', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "High altitude, higher profits" },
    { id: 'DL18', name: 'Suburban Stash House', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Behind white picket fences" },
    { id: 'DL19', name: 'Waterfront Dock', category: 'Location', rarity: 'Rare', difficulty: 5, flavor: "Where shipments disappear into the night" },
    { id: 'DL20', name: 'Hidden Farm Lab', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "The only thing growing here isn't corn" },

    // Epic Locations (7)
    { id: 'DL21', name: 'Cartel Compound', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Fortress of the underground empire" },
    { id: 'DL22', name: 'Submarine Dock', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Below radar, above suspicion" },
    { id: 'DL23', name: 'Mountain Fortress', category: 'Location', rarity: 'Epic', difficulty: 7, flavor: "Where eagles dare to fly" },
    { id: 'DL24', name: 'Island Processing Plant', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Paradise has a dark side" },
    { id: 'DL25', name: 'Desert Airfield', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Where ghost planes land" },
    { id: 'DL26', name: 'Underground Bunker', category: 'Location', rarity: 'Epic', difficulty: 7, flavor: "Deeper than secrets" },
    { id: 'DL27', name: 'Jungle Laboratory', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Nature's perfect cover" },

    // Legendary Locations (3)
    { id: 'DL28', name: 'El Jefe\'s Palace', category: 'Location', rarity: 'Legendary', difficulty: 8, flavor: "The throne room of an empire" },
    { id: 'DL29', name: 'Golden Triangle Base', category: 'Location', rarity: 'Legendary', difficulty: 9, flavor: "Where empires are built" },
    { id: 'DL30', name: 'Shadow Port', category: 'Location', rarity: 'Legendary', difficulty: 8, flavor: "The world's black market hub" }
  ],

  DrugCrew: [
    // Common Crew (10)
    { id: 'DC1', name: 'Street Dealer', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Hustling on the corner, day and night" },
    { id: 'DC2', name: 'Runner', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Fast feet, no questions" },
    { id: 'DC3', name: 'Lookout', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Eyes on the street, always watching" },
    { id: 'DC4', name: 'Local Muscle', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Protecting the product" },
    { id: 'DC5', name: 'Small-Time Cook', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Making magic in motel rooms" },
    { id: 'DC6', name: 'Street Scout', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Knows every alley and escape route" },
    { id: 'DC7', name: 'Corner Boy', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Learning the trade young" },
    { id: 'DC8', name: 'Local Driver', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Knows every backroad" },
    { id: 'DC9', name: 'Package Handler', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Moving product, no questions asked" },
    { id: 'DC10', name: 'Stash House Keeper', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Guardian of the goods" },

    // Rare Crew (10)
    { id: 'DC11', name: 'Master Chemist', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Breaking bad never looked so good" },
    { id: 'DC12', name: 'Enforcer', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "When negotiations fail" },
    { id: 'DC13', name: 'Corrupt Cop', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Badge by day, blind eye by night" },
    { id: 'DC14', name: 'Border Runner', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Knows every gap in the fence" },
    { id: 'DC15', name: 'Money Launderer', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Making dirty money clean" },
    { id: 'DC16', name: 'Smuggler', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Professional ghost" },
    { id: 'DC17', name: 'Field Boss', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Running the streets with an iron fist" },
    { id: 'DC18', name: 'Master Grower', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Green thumb, golden touch" },
    { id: 'DC19', name: 'Territory Manager', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Keeping peace on the streets" },
    { id: 'DC20', name: 'Quality Control', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Testing the product, personally" },

    // Epic Crew (7)
    { id: 'DC21', name: 'Cartel Lieutenant', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Second in command, first to act" },
    { id: 'DC22', name: 'Master Distributor', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Moving mountains, one package at a time" },
    { id: 'DC23', name: 'Kingpin\'s Assassin', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "The last face you never see" },
    { id: 'DC24', name: 'Regional Boss', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Running the show in their territory" },
    {id: 'DC25', name: 'Cartel Accountant', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Making millions disappear" },
    { id: 'DC26', name: 'International Connect', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Global reach, local touch" },
    { id: 'DC27', name: 'Shadow Broker', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Information is the real currency" },

    // Legendary Crew (3)
    { id: 'DC28', name: 'El Padrino', category: 'Crew', rarity: 'Legendary', skill: 6, flavor: "The boss of bosses" },
    { id: 'DC29', name: 'The Connection', category: 'Crew', rarity: 'Legendary', skill: 6, flavor: "Where all roads meet" },
    { id: 'DC30', name: 'Ghost King', category: 'Crew', rarity: 'Legendary', skill: 6, flavor: "The invisible hand that moves mountains" }
  ],

  PrisonLocation: [
    // Common Locations (12)
    { id: 'PL1', name: 'County Jail', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Small time, big opportunities" },
    { id: 'PL2', name: 'Prison Yard', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Where deals are made" },
    { id: 'PL3', name: 'Laundry Room', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "Clean clothes, dirty business" },
    { id: 'PL4', name: 'Visitor Area', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Face to face, glass between" },
    { id: 'PL5', name: 'Kitchen Block', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "More than just meals cooking" },
    { id: 'PL6', name: 'Cell Block A', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Home sweet home" },
    { id: 'PL7', name: 'Guard Break Room', category: 'Location', rarity: 'Common', difficulty: 3, flavor: "Where watchers rest" },
    { id: 'PL8', name: 'Prison Chapel', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Seeking redemption" },
    { id: 'PL9', name: 'Workshop', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Tools of the trade" },
    { id: 'PL10', name: 'Library', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "Knowledge is freedom" },
    { id: 'PL11', name: 'Exercise Yard', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Building strength" },
    { id: 'PL12', name: 'Mess Hall', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Daily gathering" },

    // Rare Locations (9)
    { id: 'PL13', name: 'Solitary Wing', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "The hole holds secrets" },
    { id: 'PL14', name: 'Guard Tower', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Eyes in the sky" },
    { id: 'PL15', name: 'Warden\'s Office', category: 'Location', rarity: 'Rare', difficulty: 5, flavor: "Seat of power" },
    { id: 'PL16', name: 'Medical Bay', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Healing and dealing" },
    { id: 'PL17', name: 'Security Room', category: 'Location', rarity: 'Rare', difficulty: 5, flavor: "Nerve center" },
    { id: 'PL18', name: 'Prison Roof', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Top of the world" },
    { id: 'PL19', name: 'Underground Tunnels', category: 'Location', rarity: 'Rare', difficulty: 5, flavor: "The old escape route" },
    { id: 'PL20', name: 'Evidence Room', category: 'Location', rarity: 'Rare', difficulty: 4, flavor: "Secrets and lies" },
    { id: 'PL21', name: 'Death Row', category: 'Location', rarity: 'Rare', difficulty: 5, flavor: "Last chance" },

    // Epic Locations (6)
    { id: 'PL22', name: 'Maximum Security Wing', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "The worst of the worst" },
    { id: 'PL23', name: 'Prison Transport', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Moving day" },
    { id: 'PL24', name: 'Execution Chamber', category: 'Location', rarity: 'Epic', difficulty: 7, flavor: "Point of no return" },
    { id: 'PL25', name: 'Prison Riot Control', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Chaos control" },
    { id: 'PL26', name: 'Prison Database', category: 'Location', rarity: 'Epic', difficulty: 6, flavor: "Digital freedom" },
    { id: 'PL27', name: 'Armory', category: 'Location', rarity: 'Epic', difficulty: 7, flavor: "Tools of control" },

    // Legendary Locations (3)
    { id: 'PL28', name: 'Supermax Facility', category: 'Location', rarity: 'Legendary', difficulty: 8, flavor: "No one gets out" },
    { id: 'PL29', name: 'Black Site Prison', category: 'Location', rarity: 'Legendary', difficulty: 9, flavor: "Off the books" },
    { id: 'PL30', name: 'The Rock', category: 'Location', rarity: 'Legendary', difficulty: 8, flavor: "Island fortress" }
  ],

  PrisonCrew: [
    // Common Crew (12)
    { id: 'PC1', name: 'Prison Janitor', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Eyes down, ears open" },
    { id: 'PC2', name: 'Kitchen Worker', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Serving more than meals" },
    { id: 'PC3', name: 'New Fish', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Fresh meat, fresh opportunities" },
    { id: 'PC4', name: 'Prison Chaplain', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Faith and fellowship" },
    { id: 'PC5', name: 'Library Trustee', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Knowledge keeper" },
    { id: 'PC6', name: 'Workshop Instructor', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Teaching useful skills" },
    { id: 'PC7', name: 'Prison Nurse', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Healing touch" },
    { id: 'PC8', name: 'Rookie Guard', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Green but eager" },
    { id: 'PC9', name: 'Maintenance Worker', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Fixing problems" },
    { id: 'PC10', name: 'Visiting Doctor', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Making rounds" },
    { id: 'PC11', name: 'Prison Teacher', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Lessons learned" },
    { id: 'PC12', name: 'Laundry Boss', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Clean operator" },

    // Rare Crew (9)
    { id: 'PC13', name: 'Gang Leader', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Running the yard" },
    { id: 'PC14', name: 'Corrupt Guard', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Badge for sale" },
    { id: 'PC15', name: 'Prison Doctor', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Alternative medicine" },
    { id: 'PC16', name: 'Tower Guard', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Birds eye view" },
    { id: 'PC17', name: 'Prison Lawyer', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Legal eagle" },
    { id: 'PC18', name: 'Cell Block Captain', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Block boss" },
    { id: 'PC19', name: 'Security Tech', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "System specialist" },
    { id: 'PC20', name: 'Transfer Officer', category: 'Crew', rarity: 'Rare', skill: 4, flavor: "Going places" },
    { id: 'PC21', name: 'Prison Psychologist', category: 'Crew', rarity: 'Rare', skill: 3, flavor: "Mind games" },

    // Epic Crew (6)
    { id: 'PC22', name: 'Prison Warden', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "The boss" },
    { id: 'PC23', name: 'Head of Security', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Security chief" },
    { id: 'PC24', name: 'Prison Fixer', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Problem solver" },
    { id: 'PC25', name: 'Riot Squad Leader', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Chaos controller" },
    { id: 'PC26', name: 'Prison Hacker', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Digital liberator" },
    { id: 'PC27', name: 'Escape Artist', category: 'Crew', rarity: 'Epic', skill: 5, flavor: "Freedom finder" },

    // Legendary Crew (3)
    { id: 'PC28', name: 'Shadow Warden', category: 'Crew', rarity: 'Legendary', skill: 6, flavor: "True power behind bars" },
    { id: 'PC29', name: 'Master of Locks', category: 'Crew', rarity: 'Legendary', skill: 6, flavor: "No door stays closed" },
    { id: 'PC30', name: 'Prison King', category: 'Crew', rarity: 'Legendary', skill: 6, flavor: "Ruler of the yard" }
  ],

  PrisonGear: [
    // Common Gear (12)
    { id: 'PG1', name: 'Makeshift Shiv', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Crafted in secret" },
    { id: 'PG2', name: 'Contraband Map', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "X marks the spot" },
    { id: 'PG3', name: 'Guard Schedule', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Timing is everything" },
    { id: 'PG4', name: 'Smuggled Phone', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Outside connection" },
    { id: 'PG5', name: 'Prison Uniform', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Blend in" },
    { id: 'PG6', name: 'Mess Hall Pass', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Access granted" },
    { id: 'PG7', name: 'Library Card', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Knowledge is power" },
    { id: 'PG8', name: 'Workshop Tools', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Practical applications" },
    { id: 'PG9', name: 'Medical Pass', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Doctor's orders" },
    { id: 'PG10', name: 'Visiting Hours Pass', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Face time" },
    { id: 'PG11', name: 'Cleaning Supplies', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "More than meets the eye" },
    { id: 'PG12', name: 'Commissary Card', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Currency inside" },

    // Rare Gear (9)
    { id: 'PG13', name: 'Guard Uniform', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Authority borrowed" },
    { id: 'PG14', name: 'Security Keycard', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Access all areas" },
    { id: 'PG15', name: 'Camera Jammer', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Technical difficulties" },
    { id: 'PG16', name: 'Medical Records', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Prescription for freedom" },
    { id: 'PG17', name: 'Guard Radio', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Ears on the inside" },
    { id: 'PG18', name: 'Tunnel Map', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "The way out" },
    { id: 'PG19', name: 'Riot Gear', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Crowd control" },
    { id: 'PG20', name: 'Prison Registry', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Names and numbers" },
    { id: 'PG21', name: 'Maintenance Keys', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Universal access" },

    // Epic Gear (6)
    { id: 'PG22', name: 'Warden\'s Keys', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Master set" },
    { id: 'PG23', name: 'Security Console', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Override authority" },
    { id: 'PG24', name: 'Prison Blueprint', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Complete layout" },
    { id: 'PG25', name: 'Transport Schedule', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Perfect timing" },
    { id: 'PG26', name: 'Cell Block Override', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Mass release" },
    { id: 'PG27', name: 'Prison Database', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Digital master key" },

    // Legendary Gear (3)
    { id: 'PG28', name: 'Master Control Unit', category: 'Gear', rarity: 'Legendary', bonus: 4, flavor: "Total control" },
    { id: 'PG29', name: 'Prison Network Access', category: 'Gear', rarity: 'Legendary', bonus: 4, flavor: "System supremacy" },
    { id: 'PG30', name: 'Emergency Override', category: 'Gear', rarity: 'Legendary', bonus: 4, flavor: "Panic button" }
  ],

  DrugGear: [
    // Common Gear (10)
    { id: 'DG1', name: 'Burner Phone', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Disposable as the conversations it carries" },
    { id: 'DG2', name: 'Digital Scale', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Accuracy means profit" },
    { id: 'DG3', name: 'Vacuum Sealer', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Keeping things fresh and undetectable" },
    { id: 'DG4', name: 'Cash Counter', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Time is money" },
    { id: 'DG5', name: 'Hidden Compartment', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Out of sight, peace of mind" },
    { id: 'DG6', name: 'Fake ID', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "New name, same game" },
    { id: 'DG7', name: 'Scanner Radio', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Knowledge is power" },
    { id: 'DG8', name: 'Packing Supplies', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Professional presentation matters" },
    { id: 'DG9', name: 'UV Light', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Spotting fakes in the dark" },
    { id: 'DG10', name: 'Duffel Bag', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Mobile storage solution" },

    // Rare Gear (10)
    { id: 'DG11', name: 'Lab Equipment', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Professional grade hardware" },
    { id: 'DG12', name: 'Signal Jammer', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Going dark when needed" },
    { id: 'DG13', name: 'Night Vision', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Darkness is no obstacle" },
    { id: 'DG14', name: 'Encrypted Radio', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Secure communications" },
    { id: 'DG15', name: 'Hidden Vehicle Panels', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Customs' worst nightmare" },
    { id: 'DG16', name: 'Industrial Press', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Compression is key" },
    { id: 'DG17', name: 'Safe House Network', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Always somewhere to lay low" },
    { id: 'DG18', name: 'Decoy Cargo', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Hidden in plain sight" },
    { id: 'DG19', name: 'Security System', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Eyes everywhere" },
    { id: 'DG20', name: 'Drone Scout', category: 'Gear', rarity: 'Rare', bonus: 2, flavor: "Bird's eye view" },

    // Epic Gear (7)
    { id: 'DG21', name: 'Submarine Pod', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Below radar, above suspicion" },
    { id: 'DG22', name: 'Shell Company Network', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Legal on paper" },
    { id: 'DG23', name: 'Military Grade Comms', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Unbreakable connection" },
    { id: 'DG24', name: 'Private Jet', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "First class contraband" },
    { id: 'DG25', name: 'Tunnel Network', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Underground railroad" },
    { id: 'DG26', name: 'Satellite Coverage', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Eyes in the sky" },
    { id: 'DG27', name: 'Cargo Ship', category: 'Gear', rarity: 'Epic', bonus: 3, flavor: "Ocean-going enterprise" },

    // Legendary Gear (3)
    { id: 'DG28', name: 'Global Network', category: 'Gear', rarity: 'Legendary', bonus: 4, flavor: "Worldwide reach" },
    { id: 'DG29', name: 'Private Army', category: 'Gear', rarity: 'Legendary', bonus: 4, flavor: "Force multiplier" },
    { id: 'DG30', name: 'Black Site Network', category: 'Gear', rarity: 'Legendary', bonus: 4, flavor: "Off the grid, off the books" }
  ],
  Location: [
    // Common Locations
    { id: 'L1', name: 'Mom & Pop Liquor Store', category: 'Location', rarity: 'Common', difficulty: 3, flavor: "Quick cash, no questions asked" },
    { id: 'L2', name: 'Disco Pawn', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Where hot items go to cool down" },    { id: 'L3', name: 'Graffiti Station', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "Underground activity, literally" },
    { id: 'L4', name: 'Times Square Stand', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Hidden in plain sight" },
    { id: 'L5', name: 'Harlem Brownstone', category: 'Location', difficulty: 1, flavor: "Every brick tells a story" },
    { id: 'L6', name: 'Little Italy Shop', category: 'Location', rarity: 'Common', difficulty: 2, flavor: "Family business, if you know what I mean" },
    { id: 'L7', name: 'Downtown Plaza', category: 'Location', rarity: 'Common', difficulty: 3, flavor: "Where the suits meet the streets" },
    { id: 'L8', name: 'City Museum', category: 'Location', rarity: 'Common', difficulty: 3, flavor: "History's price just went up" },
    { id: 'L9', name: 'Back Alley Dice', category: 'Location', rarity: 'Common', difficulty: 3, flavor: "Roll the dice, pay the price" },
    { id: 'L10', name: 'Corner Store', category: 'Location', rarity: 'Common', difficulty: 1, flavor: "Easy money for those who dare" },

    // Rare Locations
    { id: 'L11', name: 'Art Gallery', category: 'Location', rarity: 'Rare', difficulty: 4 },
    { id: 'L12', name: 'City Bank', category: 'Location', rarity: 'Rare', difficulty: 4 },
    { id: 'L13', name: 'Police Evidence Room', category: 'Location', rarity: 'Rare', difficulty: 5 },
    { id: 'L14', name: 'Corporate Office', category: 'Location', rarity: 'Rare', difficulty: 4 },
    { id: 'L15', name: 'Luxury Yacht', category: 'Location', rarity: 'Rare', difficulty: 5 },
    { id: 'L16', name: 'Private Collection', category: 'Location', rarity: 'Rare', difficulty: 4 },
    { id: 'L17', name: 'Research Facility', category: 'Location', rarity: 'Rare', difficulty: 5 },
    { id: 'L18', name: 'High-Rise Penthouse', category: 'Location', rarity: 'Rare', difficulty: 4 },
    { id: 'L19', name: 'Underground Vault', category: 'Location', rarity: 'Rare', difficulty: 5 },
    { id: 'L20', name: 'Airport Terminal', category: 'Location', rarity: 'Rare', difficulty: 5 },

    // Epic Locations
    { id: 'L21', name: 'Casino Vault', category: 'Location', rarity: 'Epic', difficulty: 6 },
    { id: 'L22', name: 'Military Base', category: 'Location', rarity: 'Epic', difficulty: 7 },
    { id: 'L23', name: 'Government Facility', category: 'Location', rarity: 'Epic', difficulty: 6 },
    { id: 'L24', name: 'Diamond Exchange', category: 'Location', rarity: 'Epic', difficulty: 6 },
    { id: 'L25', name: 'Nuclear Plant', category: 'Location', rarity: 'Epic', difficulty: 7 },
    { id: 'L26', name: 'Space Station', category: 'Location', rarity: 'Epic', difficulty: 7 },
    { id: 'L27', name: 'Royal Palace', category: 'Location', rarity: 'Epic', difficulty: 6 },
    { id: 'L28', name: 'Ancient Temple', category: 'Location', rarity: 'Epic', difficulty: 6 },
    { id: 'L29', name: 'Presidential Train', category: 'Location', rarity: 'Epic', difficulty: 7 },
    { id: 'L30', name: 'Deep Sea Laboratory', category: 'Location', rarity: 'Epic', difficulty: 7 },

    // Legendary Locations
    { id: 'L31', name: 'Federal Reserve', category: 'Location', rarity: 'Legendary', difficulty: 8 },
    { id: 'L32', name: 'Area 51', category: 'Location', rarity: 'Legendary', difficulty: 9 },
    { id: 'L33', name: 'Vatican Secret Archives', category: 'Location', rarity: 'Legendary', difficulty: 8 },
    { id: 'L34', name: 'Fort Knox', category: 'Location', rarity: 'Legendary', difficulty: 9 },
    { id: 'L35', name: 'Time Bank', category: 'Location', rarity: 'Legendary', difficulty: 9 },
    { id: 'L36', name: 'Quantum Vault', category: 'Location', rarity: 'Legendary', difficulty: 8 },
    { id: 'L37', name: 'Galactic Museum', category: 'Location', rarity: 'Legendary', difficulty: 8 },
    { id: 'L38', name: 'Dimensional Rift', category: 'Location', rarity: 'Legendary', difficulty: 9 },
    { id: 'L39', name: 'Ancient Dragon\'s Lair', category: 'Location', rarity: 'Legendary', difficulty: 8 },
    { id: 'L40', name: 'Infinity Vault', category: 'Location', rarity: 'Legendary', difficulty: 9 }
  ],

  Crew: [
    // Common Crew
    { id: 'C1', name: 'Street Hustler', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Fresh to the game but hungry for more" },
    { id: 'C2', name: 'Corner Boy', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Eyes on the street, always watching" },
    { id: 'C3', name: 'Messenger Kid', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Fast feet, faster tongue" },
    { id: 'C4', name: 'Phone Phreaker', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Making the lines sing" },
    { id: 'C5', name: 'Crooked Guard', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Badge for sale, cheap" },
    { id: 'C6', name: 'Muscle Car Driver', category: 'Crew', rarity: 'Common', skill: 2, flavor: "V8 power, no questions asked" },
    { id: 'C7', name: 'Pawn Broker', category: 'Crew', rarity: 'Common', skill: 1, flavor: "Everything's negotiable" },
    { id: 'C8', name: 'Lock Picker', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Old school touch" },
    { id: 'C9', name: 'Street Performer', category: 'Crew', rarity: 'Common', skill: 1, flavor: "The show must go on" },
    { id: 'C10', name: 'Subway Runner', category: 'Crew', rarity: 'Common', skill: 2, flavor: "Knows every tunnel and track" },

    // Rare Crew
    { id: 'C11', name: 'Security Expert', category: 'Crew', rarity: 'Rare', skill: 3 },
    { id: 'C12', name: 'Professional Driver', category: 'Crew', rarity: 'Rare', skill: 3 },
    { id: 'C13', name: 'Tech Specialist', category: 'Crew', rarity: 'Rare', skill: 3 },
    { id: 'C14', name: 'Disguise Artist', category: 'Crew', rarity: 'Rare', skill: 3 },
    { id: 'C15', name: 'Skilled Negotiator', category: 'Crew', rarity: 'Rare', skill: 3 },
    { id: 'C16', name: 'Demolitions Expert', category: 'Crew', rarity: 'Epic', skill: 4 },
    { id: 'C17', name: 'Inside Contact', category: 'Crew', rarity: 'Rare', skill: 3 },
    { id: 'C18', name: 'Elite Locksmith', category: 'Crew', rarity: 'Rare', skill: 4 },
    { id: 'C19', name: 'Stealth Operative', category: 'Crew', rarity: 'Rare', skill: 4 },
    { id: 'C20', name: 'Data Analyst', category: 'Crew', rarity: 'Rare', skill: 3 },

    // Epic Crew
    { id: 'C21', name: 'Master Hacker', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C22', name: 'Elite Infiltrator', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C23', name: 'Neural Specialist', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C24', name: 'Quantum Physicist', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C25', name: 'Military Strategist', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C26', name: 'International Spy', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C27', name: 'AI Whisperer', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C28', name: 'Time Manipulator', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C29', name: 'Ghost Protocol', category: 'Crew', rarity: 'Epic', skill: 5 },
    { id: 'C30', name: 'Mind Reader', category: 'Crew', rarity: 'Epic', skill: 5 },

    // Legendary Crew
    { id: 'C31', name: 'Legendary Mastermind', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C32', name: 'Reality Bender', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C33', name: 'Dragon Tamer', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C34', name: 'Time Lord', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C35', name: 'Dimensional Walker', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C36', name: 'Universe Hacker', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C37', name: 'Cosmic Entity', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C38', name: 'Shadow Master', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C39', name: 'Eternal One', category: 'Crew', rarity: 'Legendary', skill: 6 },
    { id: 'C40', name: 'Infinity Weaver', category: 'Crew', rarity: 'Legendary', skill: 6 }
  ],

  Gear: [
    // Common Gear
    { id: 'G1', name: 'Tire Iron', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Borrowed from the garage" },
    { id: 'G2', name: 'Quarter Phone', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Drop a dime, make a call" },
    { id: 'G3', name: 'Disco Jacket', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Blend in with the night life" },
    { id: 'G4', name: 'Union Card', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Works better than the real thing" },
    { id: 'G5', name: 'Five Fingers', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "For friendly persuasion" },
    { id: 'G6', name: 'Zippo Light', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Always reliable" },
    { id: 'G7', name: 'Fire Escape', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Up or down, your choice" },
    { id: 'G8', name: 'Gym Bag', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Nothing to see here" },
    { id: 'G9', name: 'CB Radio', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "Breaker breaker, coast is clear" },
    { id: 'G10', name: 'Bolt Cutters', category: 'Gear', rarity: 'Common', bonus: 1, flavor: "No chain too tough" },

    // Rare Gear
    { id: 'G11', name: 'Advanced Kit', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G12', name: 'Encrypted Phone', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G13', name: 'Thermal Camera', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G14', name: 'Signal Jammer', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G15', name: 'Grappling Hook', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G16', name: 'EMF Detector', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G17', name: 'Voice Modulator', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G18', name: 'Smoke Bombs', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G19', name: 'Motion Sensors', category: 'Gear', rarity: 'Rare', bonus: 2 },
    { id: 'G20', name: 'Plasma Cutter', category: 'Gear', rarity: 'Rare', bonus: 2 },

    // Epic Gear
    { id: 'G21', name: 'High-Tech Equipment', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G22', name: 'Neural Interface', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G23', name: 'Hologram Generator', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G24', name: 'Gravity Manipulator', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G25', name: 'Phase Shifter', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G26', name: 'AI Assistant', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G27', name: 'Quantum Scanner', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G28', name: 'Energy Shield', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G29', name: 'Time Dilation Device', category: 'Gear', rarity: 'Epic', bonus: 3 },
    { id: 'G30', name: 'Memory Eraser', category: 'Gear', rarity: 'Epic', bonus: 3 },

    // Legendary Gear
    { id: 'G31', name: 'Reality Bender', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G32', name: 'Time Manipulator', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G33', name: 'Dragon Scale Armor', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G34', name: 'Infinity Gauntlet', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G35', name: 'Cosmic Key', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G36', name: 'Universal Translator', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G37', name: 'Dimensional Scissors', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G38', name: 'Soul Extractor', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G39', name: 'Matrix Interface', category: 'Gear', rarity: 'Legendary', bonus: 4 },
    { id: 'G40', name: 'Void Generator', category: 'Gear', rarity: 'Legendary', bonus: 4 }
  ]
};

// Load game state
function loadGame() {
  const saved = localStorage.getItem('crimeGameState');
  if (saved) {
    gameState = JSON.parse(saved);
  }
  if (!gameState.playerLevel) {
    gameState.playerLevel = 1;
    gameState.playerXP = 0;
  }
  updateUI();
  updateXPDisplay();
}

// Save game state
function saveGame() {
  localStorage.setItem('crimeGameState', JSON.stringify(gameState));
}

// Export save to string
function exportSave() {
  const saveData = JSON.stringify(gameState);
  return btoa(saveData);
}

// Import save from string
function importSave(saveString) {
  try {
    const saveData = atob(saveString);
    const parsedData = JSON.parse(saveData);

    // Validate save data has required properties
    if (!parsedData.cash || !Array.isArray(parsedData.collection)) {
      throw new Error('Invalid save data');
    }

    gameState = parsedData;
    saveGame();
    updateUI();
    showCollection();
    return true;
  } catch (e) {
    console.error('Failed to import save:', e);
    return false;
  }
}

// Get random card by rarity and category
function getRandomCard(category, packType) {
  const roll = Math.random();
  let cumulative = 0;
  let targetRarity;

  for (const [rarity, data] of Object.entries(RARITIES)) {
    cumulative += data.chance;
    if (roll <= cumulative) {
      targetRarity = rarity;
      break;
    }
  }

  // Get all cards of the target rarity from both sets
  let possibleCards = [];

  // Add classic cards if classic pack
  if (packType === 'classic') {
    possibleCards = CARDS[category].filter(card => 
      card.rarity === targetRarity && !card.id.startsWith('D')
    );
  } 
  // Add drug expansion cards if drug pack
  else if (packType === 'drug') {
    const drugCards = CARDS[`Drug${category}`].filter(card => 
      card.rarity === targetRarity
    );
    possibleCards = drugCards;
  }
  // Add prison expansion cards if prison pack
  else if (packType === 'prison') {
    const prisonCards = CARDS[`Prison${category}`].filter(card => 
      card.rarity === targetRarity
    );
    possibleCards = prisonCards;
  }

  return possibleCards[Math.floor(Math.random() * possibleCards.length)];
}

// Pack definitions
const PACKS = {
  classic: {
    name: "Classic Pack",
    price: 50,
    description: "Contains cards from the original set. One of each type: Location, Crew, and Gear.",
    cardRange: { min: 1, max: 40 },
    image: "🎴"
  },
  drug: {
    name: "The Drug Expansion",
    price: 150,
    description: "A gritty expansion focused on the dangerous world of narcotics",
    cardRange: { min: 41, max: 130 },
    image: "💊",
    locked: false
  },
  prison: {
    name: "Prison Break",
    price: 500,
    description: "Master the art of prison infiltration, exploitation, and escape",
    cardRange: { min: 131, max: 220 },
    image: "🔒",
    locked: false
  },
  shadow: {
    name: "Shadow Pack",
    price: 50,
    description: "Coming soon - Stealth and espionage focused cards",
    cardRange: { min: 81, max: 120 },
    image: "🌑",
    locked: true
  },
  mythic: {
    name: "Mythic Pack",
    price: 75,
    description: "Coming soon - Legendary and mythical themed cards",
    cardRange: { min: 121, max: 160 },
    image: "✨",
    locked: true
  }
};

function showPackSelection() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <div class="pack-selection">
      <h2>Select a Pack</h2>
      <div class="pack-grid">
        ${Object.entries(PACKS).map(([id, pack]) => `
          <div class="pack-option ${pack.locked ? 'locked' : ''}" ${pack.locked ? '' : `onclick="openPack('${id}')"`}>
            <div class="pack-image">${pack.image}</div>
            <h3>${pack.name}</h3>
            <p class="pack-price">💰 ${pack.price}</p>
            <p class="pack-description">${pack.description}</p>
            ${pack.locked ? '<div class="pack-locked">🔒 LOCKED</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Open pack
async function openPack(packType = 'classic') {
  const pack = PACKS[packType];
  if (gameState.cash < pack.price) {
    alert("Not enough cash!");
    return;
  }

  // Award XP based on pack type
  const xpReward = packType === 'classic' ? 10 : 
                   packType === 'drug' ? 15 :
                   packType === 'prison' ? 20 : 10;
  addXP(xpReward);

  gameState.cash -= pack.price;
  updateCash();
  const drawnCards = [];
  const gameArea = document.getElementById('gameArea');

  gameArea.innerHTML = `
    <div class="pack-opening">
      <div class="pack-buttons">
        <button class="open-another-btn" onclick="openPack('${packType}')">🎴 Open Another Pack</button>
        <button class="continue-btn" onclick="showPackSelection()">← Back to Packs</button>
      </div>
      <div class="horizontal-layout"></div>
    </div>
  `;
  const horizontalLayout = gameArea.querySelector('.horizontal-layout');

  for (const category of CATEGORIES) {
    const card = getRandomCard(category, packType);
    drawnCards.push(card);

    // Check if card is new to collection
    const isNewCard = !gameState.collection.includes(card.id);
    gameState.collection.push(card.id);

    // Create card element
    const cardElement = document.createElement('div');
    cardElement.className = `card card-${card.rarity.toLowerCase()} card-reveal`;
    if (isNewCard) {
      cardElement.dataset.isNew = 'true';
    }
    setTimeout(() => cardElement.classList.add('revealed'), 100);
    cardElement.innerHTML = `
      ${isNewCard ? '<div class="new-badge">NEW!</div>' : ''}
      <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : card.id.startsWith('P') ? 'Prison Break' : 'Classic'}</div>
      <div class="card-id">#${card.id.startsWith('D') || card.id.startsWith('P') ? card.id.substring(2) : card.id.substring(1)}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-rarity">✧ ${card.rarity} ✧</div>
      <div class="card-category">${category}</div>
      <div class="card-stats">
        ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
        ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
        ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
      </div>
      <div class="card-flavor">${getFlavor(card)}</div>
    `;
    horizontalLayout.appendChild(cardElement);
  }

  saveGame();
  updateUI();

  // Check for tutorial after pack opening
  if (!gameState.tutorialComplete && gameState.collection.length === 3) {
    showTutorial();
  }
}

// Attempt heist
function showHeistSetup() {
  const gameArea = document.getElementById('gameArea');
  const ownedCards = {};

  CATEGORIES.forEach(category => {
    // Get classic cards
    const classicCards = CARDS[category].filter(card => 
      gameState.collection.includes(card.id)
    );

    // Get drug expansion cards if they exist
    const drugCards = CARDS[`Drug${category}`] ? 
      CARDS[`Drug${category}`].filter(card => 
        gameState.collection.includes(card.id)
      ) : [];

    // Get prison expansion cards if they exist
    const prisonCards = CARDS[`Prison${category}`] ? 
      CARDS[`Prison${category}`].filter(card => 
        gameState.collection.includes(card.id)
      ) : [];

    // Combine all sets
    ownedCards[category] = [...classicCards, ...drugCards, ...prisonCards];

    // Sort cards by rarity and name
    ownedCards[category].sort((a, b) => {
      const rarityOrder = ['Common', 'Rare', 'Epic', 'Legendary'];
      const rarityDiff = rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
      return rarityDiff || a.name.localeCompare(b.name);
    });
  });

  gameArea.innerHTML = `
    <div class="heist-setup">
      <h2>Plan Your Heist</h2>
      <div class="heist-slots">
        ${CATEGORIES.map(category => `
          <div class="heist-slot" data-category="${category}">
            <h3>${category}</h3>
            ${category === 'Location' ? 
              '<div class="tooltip">🎯 Choose your target - higher difficulty means bigger rewards!</div>' : 
              category === 'Crew' ? 
              '<div class="tooltip">👥 Select crew - their skill affects success chance</div>' :
              '<div class="tooltip">🔧 Pick gear - provides bonus to success rate</div>'
            }
            <div class="slot-cards">
              ${ownedCards[category].map(card => `
                <div class="card card-${card.rarity.toLowerCase()} selectable" onclick="selectHeistCard('${card.id}', '${category}')">
                  <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : card.id.startsWith('P') ? 'Prison Break' : 'Classic'}</div>
                  <div class="card-id">#${card.id.startsWith('D') ? card.id.substring(2) : card.id.substring(1)}</div>
                  <div class="card-name">${card.name}</div>
                  <div class="card-rarity">✧ ${card.rarity} ✧</div>
                  <div class="card-stats">
                    ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
                    ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
                    ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
                  </div>
                  ${category === 'Location' ? 
                    `<div class="reward-info">💰 Potential Reward: $${card.difficulty * 50}</div>` : 
                    ''
                  }
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div id="heist-summary"></div>
      <button id="execute-heist" onclick="executeHeist()" disabled>Execute Heist</button>
    </div>
  `;
}

let selectedCards = {
  Location: null,
  Crew: null,
  Gear: null
};

function selectHeistCard(cardId, category) {
  // Check classic, drug and prison expansion sets for the card
  let card;
  if (cardId.startsWith('D')) {
    card = CARDS[`Drug${category}`].find(c => c.id === cardId);
  } else if (cardId.startsWith('P')) {
    card = CARDS[`Prison${category}`].find(c => c.id === cardId);
  } else {
    card = CARDS[category].find(c => c.id === cardId);
  }

  if (card) {
    selectedCards[category] = card;
    updateHeistSummary();

    // Update visual selection
    document.querySelectorAll(`.heist-slot[data-category="${category}"] .card`).forEach(el => {
      el.classList.remove('selected');
      if (el.querySelector('.card-id').textContent.includes(cardId.substring(1))) {
        el.classList.add('selected');
      }
    });
  }

  // Highlight selected card
  document.querySelectorAll(`.heist-slot[data-category="${category}"] .card`).forEach(el => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
}

function updateHeistSummary() {
  const summary = document.getElementById('heist-summary');
  const executeBtn = document.getElementById('execute-heist');

  // Verify all cards are selected and valid
  if (!selectedCards.Location || !selectedCards.Crew || !selectedCards.Gear || 
      !selectedCards.Location.difficulty || !selectedCards.Crew.skill || !selectedCards.Gear.bonus) {
    summary.innerHTML = '<p>Select one card from each category to begin the heist.</p>';
    executeBtn.disabled = true;
    return;
  }

  const baseChance = 35;

  // Rarity multipliers - higher rarity gives better bonuses
  const rarityValues = {
    'Common': 1,
    'Rare': 1.75,
    'Epic': 2.5,
    'Legendary': 3.5
  };

  // Location difficulty heavily impacts base chance
  const locationDifficultyImpact = (8 - selectedCards.Location.difficulty) * 6;

  // Crew and gear effectiveness scaled by their rarity
  const crewEffectiveness = selectedCards.Crew.skill * 4 * rarityValues[selectedCards.Crew.rarity];
  const gearEffectiveness = selectedCards.Gear.bonus * 3 * rarityValues[selectedCards.Gear.rarity];

  // Significant penalty for attempting high-rarity locations with low-rarity crew/gear
  const rarityPenalty = Math.max(0,
    (rarityValues[selectedCards.Location.rarity] * 2) - 
    (rarityValues[selectedCards.Crew.rarity] + rarityValues[selectedCards.Gear.rarity])
  ) * 12;

  // Location difficulty affects how much crew and gear can help
  const difficultyScaling = Math.max(0.5, 1 - (selectedCards.Location.difficulty / 10));
  const scaledCrewBonus = crewEffectiveness * difficultyScaling;
  const scaledGearBonus = gearEffectiveness * difficultyScaling;

  // Final success chance calculation
  const successChance = Math.min(85, Math.max(5,
    baseChance + 
    locationDifficultyImpact + 
    scaledCrewBonus + 
    scaledGearBonus - 
    rarityPenalty
  ));

  // Higher difficulty locations give better rewards
  const potentialReward = Math.floor(selectedCards.Location.difficulty * 75 * rarityValues[selectedCards.Location.rarity]);

  summary.innerHTML = `
    <div class="heist-summary">
      <h3>Heist Summary</h3>
      <p>Target: ${selectedCards.Location.name}</p>
      <p>Crew: ${selectedCards.Crew.name}</p>
      <p>Gear: ${selectedCards.Gear.name}</p>
      <p class="success-chance">Success Chance: ${successChance.toFixed(1)}%</p>
      <p class="potential-reward">Potential Reward: $${potentialReward}</p>
      <p class="failure-warning">⚠️ Failure will result in a fine of $${Math.floor(potentialReward * 0.1)}</p>
      ${gameState.cigs > 0 ? `
        <div class="reroll-info">
          <p>🚬 You have ${gameState.cigs} cigarettes available for rerolls</p>
          <p class="reroll-note">💡 If the heist fails, you can spend 1 cigarette to try again (max 3 attempts)</p>
        </div>
      ` : ''}
    </div>
  `;

  executeBtn.disabled = false;
}

function executeHeist() {
  const baseChance = 35;

  // Rarity multipliers
  const rarityValues = {
    'Common': 1,
    'Rare': 1.75,
    'Epic': 2.5,
    'Legendary': 3.5
  };

  // Location difficulty heavily impacts base chance
  const locationDifficultyImpact = (8 - selectedCards.Location.difficulty) * 6;
  // Crew and gear effectiveness scaled by their rarity
  const crewEffectiveness = selectedCards.Crew.skill * 4 * rarityValues[selectedCards.Crew.rarity];
  const gearEffectiveness = selectedCards.Gear.bonus * 3 * rarityValues[selectedCards.Gear.rarity];

  // Significant penalty for attempting high-rarity locations with low-rarity crew/gear
  const rarityPenalty = Math.max(0,
    (rarityValues[selectedCards.Location.rarity] * 2) - 
    (rarityValues[selectedCards.Crew.rarity] + rarityValues[selectedCards.Gear.rarity])
  ) * 12;

  // Location difficulty affects how much crew and gear can help
  const difficultyScaling = Math.max(0.5, 1 - (selectedCards.Location.difficulty / 10));
  const scaledCrewBonus = crewEffectiveness * difficultyScaling;
  const scaledGearBonus = gearEffectiveness * difficultyScaling;

  // Final success chance calculation
  const successChance = Math.min(85, Math.max(5,
    baseChance + 
    locationDifficultyImpact + 
    scaledCrewBonus + 
    scaledGearBonus - 
    rarityPenalty
  ));

  const roll = Math.random() * 100;
  const success = roll <= successChance;

  // Higher difficulty locations give better rewards
  let potentialReward = Math.floor(selectedCards.Location.difficulty * 75 * rarityValues[selectedCards.Location.rarity]);
  // Double rewards for prison break locations
  if (selectedCards.Location.id.startsWith('P')) {
    potentialReward *= 2;
  }
  const reward = success ? potentialReward : 0;

  // Create result object without applying changes yet
  const result = {
    success,
    reward,
    roll,
    chance: successChance,
    lostCards: success ? [] : [selectedCards.Crew, selectedCards.Gear],
    earnedDrugs: success && selectedCards.Location.id.startsWith('D') && gameState.ownedProperty ? selectedCards.Location.difficulty : 0,
    earnedCigs: success && gameState.ownedProperty === 'apt2' && selectedCards.Location.id.startsWith('P') ? selectedCards.Location.difficulty : 0,
    selectedCards: {...selectedCards}, // Store selected cards for potential rerolls
    potentialReward,
    rerollCount: 0,
    finalizeHeist: function() {
      if (this.success) {
        // Remove the used location card
        const locationIndex = gameState.collection.indexOf(this.selectedCards.Location.id);
        if (locationIndex !== -1) {
          gameState.collection.splice(locationIndex, 1);
        }
      } else {
        // Remove one copy of crew card
        const crewIndex = gameState.collection.indexOf(this.selectedCards.Crew.id);
        if (crewIndex !== -1) {
          gameState.collection.splice(crewIndex, 1);
        }

        // Remove one copy of gear card
        const gearIndex = gameState.collection.indexOf(this.selectedCards.Gear.id);
        if (gearIndex !== -1) {
          gameState.collection.splice(gearIndex, 1);
        }
      }

      // Apply rewards
      gameState.cash += this.reward;
      
      if (this.success && this.earnedDrugs) {
        if (!gameState.drugs) gameState.drugs = 0;
        gameState.drugs += this.earnedDrugs;
      }
      
      if (this.success && this.earnedCigs) {
        if (!gameState.cigs) gameState.cigs = 0;
        gameState.cigs += this.earnedCigs;
      }

      // Add XP
      let xpReward = 5;
      if (this.success) {
        xpReward += Math.floor(this.selectedCards.Location.difficulty * 1.5);
      }
      addXP(xpReward);

      // Update UI
      updateCash();
      updateDrugs();
      updateCigs();
      saveGame();
    }
  };

  showHeistResult(result);
}

function showHeistResult(result) {
  const gameArea = document.getElementById('gameArea');
  const displayChance = Math.min(95, result.chance);
  const canReroll = !result.success && (gameState.cigs || 0) > 0 && (result.rerollCount || 0) < 3;

  // Only reset selected cards if we're not rerolling
  if (!result.rerollCount) {
    selectedCards = {
      Location: null,
      Crew: null,
      Gear: null
    };
  }

  gameArea.innerHTML = `
    <div class="heist-result ${result.success ? 'success' : 'failure'}">
      <h2>${result.success ? '🎉 Heist Successful!' : '🚨 Heist Failed!'}</h2>
      <p>Success Chance: ${displayChance.toFixed(1)}%</p>
      <p>Roll: ${result.roll.toFixed(1)}</p>
      ${result.rerollCount > 0 ? `<p>Reroll Attempt: ${result.rerollCount}/3</p>` : ''}
      ${result.success ? `
        <p class="reward">Reward: $${result.reward}</p>
        ${result.earnedDrugs ? `<p class="reward">+ 💊 ${result.earnedDrugs} units</p>` : ''}
        ${result.earnedCigs ? `<p class="reward">+ 🚬 ${result.earnedCigs} units</p>` : ''}
      ` : `
        <div class="lost-cards">
          <p class="failure-text">❌ Lost Cards:</p>
          <p class="lost-card">Crew: ${result.lostCards[0].name} (${result.lostCards[0].rarity})</p>
          <p class="lost-card">Gear: ${result.lostCards[1].name} (${result.lostCards[1].rarity})</p>
        </div>
        ${canReroll ? `
          <div class="reroll-options">
            <p>🎲 Want another chance? 🎲</p>
            <p>You have 🚬 ${gameState.cigs} cigarettes available</p>
            <button onclick="rerollHeist()">
              Try Again (Cost: 1 🚬)
            </button>
            ${result.rerollCount > 0 ? `
              <div class="reroll-count">Reroll attempt ${result.rerollCount}/3</div>
            ` : ''}
          </div>
        ` : result.rerollCount > 0 ? '<p class="reroll-count">No more rerolls available!</p>' : ''}
      `}
      <button onclick="finalizeHeistResult()">${result.success ? 'Continue' : 'Accept Failure'}</button>
    </div>
  `;

  // Store the result object in a global variable
  window.currentHeistResult = result;
}

function finalizeHeistResult() {
  const result = window.currentHeistResult;
  if (!result) return;

  if (result.success) {
    // Remove the used location card
    const locationIndex = gameState.collection.indexOf(result.selectedCards.Location.id);
    if (locationIndex !== -1) {
      gameState.collection.splice(locationIndex, 1);
    }
  } else {
    // Remove crew and gear cards on failure
    const crewIndex = gameState.collection.indexOf(result.selectedCards.Crew.id);
    if (crewIndex !== -1) {
      gameState.collection.splice(crewIndex, 1);
    }

    const gearIndex = gameState.collection.indexOf(result.selectedCards.Gear.id);
    if (gearIndex !== -1) {
      gameState.collection.splice(gearIndex, 1);
    }
  }

  // Apply rewards
  gameState.cash += result.reward;
  
  if (result.success && result.earnedDrugs) {
    if (!gameState.drugs) gameState.drugs = 0;
    gameState.drugs += result.earnedDrugs;
  }
  
  if (result.success && result.earnedCigs) {
    if (!gameState.cigs) gameState.cigs = 0;
    gameState.cigs += result.earnedCigs;
  }

  // Add XP
  let xpReward = 5;
  if (result.success) {
    xpReward += Math.floor(result.selectedCards.Location.difficulty * 1.5);
  }
  addXP(xpReward);

  // Update UI
  updateCash();
  updateDrugs();
  updateCigs();
  saveGame();

  // Clear the current result and return to heist setup
  window.currentHeistResult = null;
  showHeistSetup();
}

// XP and Level System
function getLevelRewards(level) {
  return {
    cashBonus: level * 100,
    unlockPack: level === 1 ? 'classic' : 
                level === 2 ? 'drug' :
                level === 3 ? 'prison' : null
  };
}

function addXP(xp) {
  // Create XP popup
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.textContent = `+${xp} XP`;

  // Position near the XP display
  const xpDisplay = document.getElementById('xp-display');
  const rect = xpDisplay.getBoundingClientRect();
  popup.style.left = `${rect.left + rect.width/2}px`;
  popup.style.top = `${rect.top + rect.height}px`;

  document.body.appendChild(popup);

  // Add sparkle effect
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.setProperty('--delay', `${i * 0.1}s`);
    popup.appendChild(sparkle);
  }

  // Remove popup after animation
  setTimeout(() => popup.remove(), 1500);
  gameState.playerXP += xp;
  let levelUp = false;
  while (gameState.playerXP >= getXPRequiredForNextLevel(gameState.playerLevel)) {
    gameState.playerXP -= getXPRequiredForNextLevel(gameState.playerLevel);
    gameState.playerLevel++;
    levelUp = true;
    
    // Award level-up rewards
    const rewards = getLevelRewards(gameState.playerLevel);
    if (rewards.cashBonus) {
      gameState.cash += rewards.cashBonus;
      updateCash();
    }
    
    // Unlock packs based on level
    if (rewards.unlockPack && PACKS[rewards.unlockPack]) {
      PACKS[rewards.unlockPack].locked = false;
    }
    
    showModal(
      'Level Up!',
      `Congratulations! You reached level ${gameState.playerLevel}!\n\nRewards:\n- Cash Bonus: $${rewards.cashBonus}${rewards.unlockPack ? `\n- Unlocked: ${PACKS[rewards.unlockPack].name}` : ''}`,
      [document.createElement('button')]
    );
  }
  updateXPDisplay();
  saveGame();
}

function getXPRequiredForNextLevel(level) {
  return 100 * level;
}

function updateXPDisplay() {
  const xpDisplay = document.getElementById('xp-display');
  if (xpDisplay) {
    const xpRequired = getXPRequiredForNextLevel(gameState.playerLevel);
    const xpProgress = Math.min(100, (gameState.playerXP / xpRequired) * 100);

    xpDisplay.innerHTML = `
      <span>Level ${gameState.playerLevel}</span>
      <div class="xp-bar">
        <div class="xp-progress" style="width: ${xpProgress}%"></div>
      </div>
    `;
  }
}

// Update UI
function updateUI() {
  updateCash();
  updateDrugs();
  updateCigs();
  updateXPDisplay();
  updateBlackMarketVisibility();
}

function updateBlackMarketVisibility() {
  const blackMarketTab = document.getElementById('black-market-tab');
  if (blackMarketTab) {
    blackMarketTab.style.display = (gameState.drugs && gameState.drugs > 0) ? '' : 'none';
  }
}

function updateCigs() {
  const cigsDisplay = document.getElementById('cigs');
  if (gameState.ownedProperty === 'apt2') {
    cigsDisplay.style.display = 'flex';
    cigsDisplay.innerHTML = `🚬<span>${gameState.cigs || 0}</span>`;
  } else {
    cigsDisplay.style.display = 'none';
  }
}

function updateDrugs() {
  const drugsDisplay = document.getElementById('drugs');
  if (gameState.ownedProperty) {
    drugsDisplay.style.display = 'flex';
    drugsDisplay.innerHTML = `💊<span>${gameState.drugs || 0}</span>`;
    
    // Check if Black Market should be unlocked
    const blackMarketTab = document.getElementById('black-market-tab');
    if (gameState.drugs > 0 && !gameState.blackMarketUnlocked) {
      gameState.blackMarketUnlocked = true;
      showBlackMarketUnlock();
    }
    
    // Update Black Market visibility
    if (blackMarketTab) {
      blackMarketTab.style.display = gameState.drugs > 0 ? '' : 'none';
    }
    
    saveGame();
  } else {
    drugsDisplay.style.display = 'none';
  }
}

function showBlackMarketUnlock() {
  const unlockDiv = document.createElement('div');
  unlockDiv.className = 'achievement-notification';
  unlockDiv.innerHTML = `
    <div class="achievement-icon">🦹</div>
    <div class="achievement-text">
      <div class="achievement-title">Black Market Unlocked!</div>
      <div class="achievement-desc">You now have access to exclusive high-tier cards</div>
    </div>
  `;

  document.body.appendChild(unlockDiv);
  setTimeout(() => {
    unlockDiv.classList.add('fade-out');
    setTimeout(() => unlockDiv.remove(), 500);
  }, 3000);
}

// Show settings
function showSettings() {
  const gameArea = document.getElementById('gameArea');
  const currentSize = localStorage.getItem('fontSizePreference') || 'medium';
  
  gameArea.innerHTML = `
    <div class="settings-panel">
      <h2>Settings</h2>
      <div class="font-settings">
        <h3>Font Size</h3>
        <select id="fontSizeSelect" onchange="changeFontSize(this.value)">
          <option value="small" ${currentSize === 'small' ? 'selected' : ''}>Small</option>
          <option value="medium" ${currentSize === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="large" ${currentSize === 'large' ? 'selected' : ''}>Large</option>
        </select>
      </div>
      <div class="save-management">
        <h3>Save Management</h3>
        <button onclick="exportSaveToClipboard()">Export Save</button>
        <div class="import-section">
          <input type="text" id="importInput" placeholder="Paste save string here">
          <button onclick="importSaveFromInput()">Import Save</button>
        </div>
      </div>
      <button onclick="confirmReset()">Reset Game</button>
      <button onclick="gameArea.innerHTML = ''">Back</button>
    </div>
  `;
}

function changeFontSize(size) {
  document.body.className = `font-size-${size}`;
  localStorage.setItem('fontSizePreference', size);
}

function exportSaveToClipboard() {
  const saveString = exportSave();
  navigator.clipboard.writeText(saveString).then(() => {
    alert('Save string copied to clipboard!');
  }).catch(err => {
    alert('Failed to copy save string. Your save string is:\n\n' + saveString);
  });
}

function importSaveFromInput() {
  const input = document.getElementById('importInput');
  const saveString = input.value.trim();

  if (!saveString) {
    alert('Please enter a save string');
    return;
  }

  if (importSave(saveString)) {
    alert('Save imported successfully!');
  } else {
    alert('Failed to import save. Please check the save string and try again.');
  }
}

// Show confirmation modal
function showModal(title, text, buttons) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;

  const buttonContainer = document.getElementById('modal-buttons');
  buttonContainer.innerHTML = '';
  buttons.forEach(btn => buttonContainer.appendChild(btn));

  modal.style.display = 'flex';
}

// Reset game confirmation
function confirmReset() {
  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Reset';
  confirmBtn.onclick = () => {
    resetGame();
    document.getElementById('modal').style.display = 'none';
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => {
    document.getElementById('modal').style.display = 'none';
  };

  showModal(
    'Reset Game',
    'Are you sure? This will delete all progress!',
    [confirmBtn, cancelBtn]
  );
}

// Reset game
function resetGame() {
  gameState = {
    cash: 100,
    collection: [],
    achievements: [],
    tutorialComplete: false,
    playerLevel: 1,
    playerXP: 0
  };
  saveGame();
  updateUI();
  showTutorial();
}

// Update cash display
function updateCash() {
  const cashElement = document.getElementById('cash');
  if (cashElement) {
    cashElement.textContent = `$${gameState.cash}`;
  }
}

// Show collection page
function showCollection() {
  const gameArea = document.getElementById('gameArea');
  const collection = {};

  // Count duplicates
  gameState.collection.forEach(cardId => {
    collection[cardId] = (collection[cardId] || 0) + 1;
  });

  // Create category tabs and filters
  gameArea.innerHTML = `
    <div class="collection-view">
      <div class="collection-filters">
        <div class="filter-group">
          <span class="filter-label">Expansion:</span>
          <select id="expansion-filter" onchange="filterCollection()">
            <option value="all">All Expansions</option>
            <option value="classic">Classic Set</option>
            <option value="drug">Drug Expansion</option>
            <option value="prison">Prison Break</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Rarity:</span>
          <select id="rarity-filter" onchange="filterCollection()">
            <option value="all">All Rarities</option>
            ${Object.keys(RARITIES).map(rarity => 
              `<option value="${rarity.toLowerCase()}">${rarity}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="collection-tabs">
        ${CATEGORIES.map(cat => `
          <button class="tab-button" onclick="showCollectionCategory('${cat}')">${cat}</button>
        `).join('')}
        <button class="tab-button" onclick="showSets()">Sets</button>
      </div>
      <div id="collection-content"></div>
    </div>
  `;

  showCollectionCategory(CATEGORIES[0]);
  setActiveTab('COLLECTION');
}

// Show heist setup page
function showHeistSetup() {
  const gameArea = document.getElementById('gameArea');
  const ownedCards = {};

  CATEGORIES.forEach(category => {
    // Get classic cards
    const classicCards = CARDS[category].filter(card => 
      gameState.collection.includes(card.id)
    );

    // Get drug expansion cards if they exist
    const drugCards = CARDS[`Drug${category}`] ? 
      CARDS[`Drug${category}`].filter(card => 
        gameState.collection.includes(card.id)
      ) : [];

    // Get prison expansion cards if they exist
    const prisonCards = CARDS[`Prison${category}`] ? 
      CARDS[`Prison${category}`].filter(card => 
        gameState.collection.includes(card.id)
      ) : [];

    // Combine all sets
    ownedCards[category] = [...classicCards, ...drugCards, ...prisonCards];

    // Sort cards by rarity and name
    ownedCards[category].sort((a, b) => {
      const rarityOrder = ['Common', 'Rare', 'Epic', 'Legendary'];
      const rarityDiff = rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
      return rarityDiff || a.name.localeCompare(b.name);
    });
  });

  gameArea.innerHTML = `
    <div class="heist-setup">
      <h2>Plan Your Heist</h2>
      <div class="heist-slots">
        ${CATEGORIES.map(category => `
          <div class="heist-slot" data-category="${category}">
            <h3>${category}</h3>
            <div class="slot-cards">
              ${ownedCards[category].map(card => `
                <div class="card card-${card.rarity.toLowerCase()} selectable" onclick="selectHeistCard('${card.id}', '${category}')">
                  <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : card.id.startsWith('P') ? 'Prison Break' : 'Classic'}</div>
                  <div class="card-id">#${card.id.startsWith('D') ? card.id.substring(2) : card.id.substring(1)}</div>
                  <div class="card-name">${card.name}</div>
                  <div class="card-rarity">✧ ${card.rarity} ✧</div>
                  <div class="card-stats">
                    ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
                    ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div id="heist-summary"></div>
      <button id="execute-heist" onclick="executeHeist()" disabled>Execute Heist</button>
    </div>
  `;
  setActiveTab('HEIST');
}

// Show pack selection page
function showPackSelection() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <div class="pack-selection">
      <h2>Select a Pack</h2>
      <div class="pack-grid">
        ${Object.entries(PACKS).map(([id, pack]) => {
          // Show packs based on level requirements
          if ((id === 'drug' && gameState.playerLevel < 2) ||
              (id === 'prison' && gameState.playerLevel < 3) ||
              (id === 'shadow' && gameState.playerLevel < 4) ||
              (id === 'mythic' && gameState.playerLevel < 5)) {
            return '';
          }

          // Add level requirement message if pack is locked
          let lockMessage = '';
          if (id === 'drug') lockMessage = 'Unlocks at Level 2';
          else if (id === 'prison') lockMessage = 'Unlocks at Level 3';
          else if (id === 'shadow') lockMessage = 'Unlocks at Level 4';
          else if (id === 'mythic') lockMessage = 'Unlocks at Level 5';

          return `
            <div class="pack-option ${pack.locked ? 'locked' : ''}" ${pack.locked ? '' : `onclick="openPack('${id}')"`}>
              <div class="pack-image">${pack.image}</div>
              <h3>${pack.name}</h3>
              <p class="pack-price">💰 ${pack.price}</p>
              <p class="pack-description">${pack.description}</p>
              ${pack.locked ? `<div class="pack-locked">🔒 ${lockMessage}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  setActiveTab('PACKS');
}

function showHelp() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <div class="help-page">
      <div class="help-sidebar">
        <button class="help-tab active" onclick="showHelpSection('basics')">Basics</button>
        <button class="help-tab" onclick="showHelpSection('packs')">Card Packs</button>
        <button class="help-tab" onclick="showHelpSection('heists')">Heists</button>
        <button class="help-tab" onclick="showHelpSection('property')">Property</button>
        <button class="help-tab" onclick="showHelpSection('tips')">Tips</button>
      </div>
      <div class="help-content">
        <h1>Game Guide</h1>

      <section class="help-section">
        <h2>🎮 Basic Gameplay</h2>
        <p>Build your criminal empire by collecting cards, planning heists, and earning cash. Start with $100 and grow your operation through strategic planning.</p>
      </section>

      <section class="help-section">
        <h2>📦 Card Packs</h2>
        <p>Purchase card packs to build your collection:</p>
        <ul>
          <li>Classic Pack ($20) - Basic heist cards</li>
          <li>Drug Expansion ($35) - Specialized narcotics operation cards</li>
        </ul>
        <p>Each pack contains 3 cards: Location, Crew, and Gear</p>
      </section>

      <section class="help-section">
        <h2>🎯 Planning Heists</h2>
        <p>To execute a heist:</p>
        <ol>
          <li>Select a target Location - Higher difficulty means bigger rewards</li>
          <li>Choose your Crew - Their skill affects success chance</li>
          <li>Pick your Gear - Provides bonus to success rate</li>
        </ol>
        <p>⚠️ Failed heists result in lost crew and gear cards!</p>
      </section>

      <section class="help-section">
        <h2>💎 Card Sets</h2>
        <p>Collect matching sets of cards to unlock special Legendary rewards. View your collection and track set progress in the Collection tab.</p>
      </section>

      <section class="help-section">
        <h2>🏠 Property System</h2>
        <p>Purchase properties to expand your empire:</p>
        <ul>
          <li>Start with affordable properties and work your way up</li>
          <li>Each property unlocks new gameplay opportunities</li>
          <li>Owning property enables drug rewards from Drug Expansion heists</li>
        </ul>
      </section>

      <section class="help-section">
        <h2>💊 Drug Expansion</h2>
        <p>After purchasing your first property:</p>
        <ul>
          <li>Drug location heists will reward both cash and drug units</li>
          <li>Drug units are tracked in your HUD next to cash</li>
          <li>Higher difficulty drug locations yield more units</li>
        </ul>
      </section>

      <section class="help-section">
        <h2>💰 Success Tips</h2>
        <ul>
          <li>Match crew and gear rarity to your target location</li>
          <li>Start with easier locations to build your collection</li>
          <li>Save high-rarity cards for challenging heists</li>
          <li>Complete card sets for powerful legendary rewards</li>
          <li>Invest in property to unlock drug rewards</li>
        </ul>
      </section>
    </div>
  `;
  setActiveTab('HELP');
  showHelpSection('basics');
}

function showSupport() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <div class="support-page">
      <h1>Support the Developer</h1>
      <div class="support-content">
        <p>If you're enjoying HeistPacks and want to support its development, consider making a donation!</p>
        <div class="donation-links">
          <a href="https://ko-fi.com/bigclockgames" class="donation-button" target="_blank">
            <span class="donation-icon">☕</span>
            Support on Ko-fi
          </a>
        </div>
      </div>
    </div>
  `;
  setActiveTab('SUPPORT');
}

function showHelpSection(section) {
  // Update active tab
  document.querySelectorAll('.help-tab').forEach(tab => {
    tab.classList.remove('active');
    if(tab.textContent.toLowerCase().includes(section)) {
      tab.classList.add('active');
    }
  });

  // Get content container
  const content = document.querySelector('.help-content');

  const sections = {
    basics: `
      <h2>🎮 Basic Gameplay</h2>
      <p>Build your criminal empire by collecting cards, planning heists, and earning cash. Start with $100 and grow your operation through strategic planning.</p>
    `,
    packs: `
      <h2>📦 Card Packs</h2>
      <p>Purchase card packs to build your collection:</p>
      <ul>
        <li>Classic Pack ($20) - Basic heist cards</li>
        <li>Drug Expansion ($35) - Specialized narcotics operation cards</li>
      </ul>
      <p>Each pack contains 3 cards: Location, Crew, and Gear</p>
    `,
    heists: `
      <h2>🎯 Planning Heists</h2>
      <p>To execute a heist:</p>
      <ol>
        <li>Select a target Location - Higher difficulty means bigger rewards</li>
        <li>Choose your Crew - Their skill affects success chance</li>
        <li>Pick your Gear - Provides bonus to success rate</li>
      </ol>
      <p>⚠️ Important Notes:</p>
      <ul>
        <li>Location cards are consumed after a successful heist</li>
        <li>Failed heists result in lost crew and gear cards</li>
      </ul>
        `,
    sets: `
      <h2>💎 Card Sets</h2>
      <p>Collect matching sets of cards to unlock special Legendary rewards. View your collection and track set progress in the Collection tab.</p>
    `,
    property: `
      <h2>🏠 Property System</h2>
      <p>Purchase properties to expand your empire:</p>
      <ul>
        <li>Start with affordable properties and work your way up</li>
        <li>Each property unlocks new gameplay opportunities</li>
        <li>Owning property enables drug rewards from Drug Expansion heists</li>
      </ul>
    `,
    drugs: `
      <h2>💊 Drug Expansion</h2>
      <p>After purchasing your first property:</p>
      <ul>
        <li>Drug location heists will reward both cash and drug units</li>
          <li>Drug units are tracked in your HUD next to cash</li>
          <li>Higher difficulty drug locations yield more units</li>
        </ul>
      `,
    tips: `
      <h2>💰 Success Tips</h2>
      <ul>
        <li>Match crew and gear rarity to your target location</li>
        <li>Start with easier locations to build your collection</li>
        <li>Save high-rarity cards for challenging heists</li>
        <li>Invest in property to unlock drug rewards</li>
      </ul>
    `
  };

  content.innerHTML = `<h1>Game Guide</h1>${sections[section]}`;
}

function showHome() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <div class="home-page">
      <h1>Property Ladder</h1>
      <div class="property-grid">
        ${PROPERTIES.map(property => {
          const isOwned = gameState.ownedProperty === property.id;
          const canAfford = gameState.cash >= property.price;
          const isLocked = gameState.ownedProperty ? 
            PROPERTIES.findIndex(p => p.id === gameState.ownedProperty) >= 
            PROPERTIES.findIndex(p => p.id === property.id) : false;

          return `
            <div class="property-card ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}">
              <div class="property-image">${property.image}</div>
              <h3>${property.name}</h3>
              <p>${property.description}</p>
              <div class="property-perks">
                ${property.perks.map(perk => `<span class="perk-tag">✨ ${perk}</span>`).join('')}
              </div>
              <div class="property-price">💰 $${property.price.toLocaleString()}</div>
              ${isOwned ? 
                '<div class="owned-badge">Current Residence</div>' :
                `<button 
                  onclick="buyProperty('${property.id}')" 
                  class="buy-property-btn"
                  ${(!canAfford || isLocked) ? 'disabled' : ''}>
                  ${isLocked ? 'Locked' : canAfford ? 'Purchase' : 'Cannot Afford'}
                </button>`
              }
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  setActiveTab('HOME');
}

function buyProperty(propertyId) {
  const property = PROPERTIES.find(p => p.id === propertyId);
  if (!property || gameState.cash < property.price) return;

  gameState.cash -= property.price;
  gameState.ownedProperty = propertyId;
  updateCash();
  saveGame();
  showHome();
}

// Black Market state
let blackMarketCards = [];
let blackMarketRefreshTime = 0;
let blackMarketInterval;

function generateBlackMarketCards() {
  blackMarketCards = [];
  const allCards = [...CARDS.Location, ...CARDS.Crew, ...CARDS.Gear, 
                    ...CARDS.DrugLocation, ...CARDS.DrugCrew, ...CARDS.DrugGear]
                   .filter(card => card.rarity === 'Epic' || card.rarity === 'Legendary');

  while (blackMarketCards.length < 3) {
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    if (!blackMarketCards.find(c => c.id === randomCard.id)) {
      blackMarketCards.push({
        ...randomCard,
        soldOut: false
      });
    }
  }
  blackMarketRefreshTime = Date.now() + (5 * 60 * 1000); // 5 minutes
}

function showBlackMarket() {
  if (blackMarketCards.length === 0) {
    generateBlackMarketCards();
  }

  const gameArea = document.getElementById('gameArea');
  const timeLeft = Math.max(0, Math.ceil((blackMarketRefreshTime - Date.now()) / 1000));

  gameArea.innerHTML = `
    <div class="black-market">
      <h2>Black Market</h2>
      <div class="refresh-timer">Next refresh in: ${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2, '0')}</div>
      <div class="black-market-grid">
        ${blackMarketCards.map(card => `
          <div class="black-market-item">
            <div class="card card-${card.rarity.toLowerCase()}">
              <div class="expansion-tag">${card.id.startsWith('D') ? 'Drug' : 'Classic'}</div>
              <div class="card-id">#${card.id.startsWith('D') ? card.id.substring(2) : card.id.substring(1)}</div>
              <div class="card-name">${card.name}</div>
              <div class="card-rarity">✧ ${card.rarity} ✧</div>
              <div class="card-category">${card.category}</div>
              <div class="card-stats">
                ${card.difficulty ? `💀 Difficulty: ${card.difficulty}` : ''}
                ${card.skill ? `⚔️ Skill: ${card.skill}` : ''}
                ${card.bonus ? `🎯 Bonus: ${card.bonus}` : ''}
              </div>
            </div>
            <button onclick="purchaseBlackMarketCard('${card.id}')" 
                    class="purchase-btn ${card.soldOut ? 'sold-out' : ''}" 
                    ${(!gameState.ownedProperty || (gameState.drugs || 0) < (card.rarity === 'Legendary' ? 25 : 10) || card.soldOut) ? 'disabled' : ''}>
              ${card.soldOut ? 'SOLD OUT' : `Purchase for 💊 ${card.rarity === 'Legendary' ? '25' : '10'} units`}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  setActiveTab('BLACK MARKET');

  // Update timer
  if (blackMarketInterval) clearInterval(blackMarketInterval);
  blackMarketInterval = setInterval(() => {
    const timeLeft = Math.max(0, Math.ceil((blackMarketRefreshTime - Date.now()) / 1000));
    const timerDisplay = document.querySelector('.refresh-timer');
    if (timerDisplay) {
      timerDisplay.textContent = `Next refresh in: ${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2, '0')}`;
    }
    if (timeLeft === 0) {
      generateBlackMarketCards();
      showBlackMarket();
    }
  }, 1000);
}

function purchaseBlackMarketCard(cardId) {
  const card = blackMarketCards.find(c => c.id === cardId);
  const cost = card.rarity === 'Legendary' ? 25 : 10;

  if (gameState.drugs >= cost && !card.soldOut) {
    gameState.drugs -= cost;
    gameState.collection.push(cardId);
    card.soldOut = true;
    updateDrugs();
    saveGame();
    showBlackMarket();
  }
}

// Initialize
window.onload = () => {
  gameState.isMobile = checkMobile();
  loadGame();
  showPackSelection(); // Show pack screen on load
  updateNavigation(); // Set up navigation based on device
  setActiveTab('PACKS'); // Set initial active tab

  // Close modal when clicking outside
  window.onclick = (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Update mobile status on resize
  window.onresize = () => {
    const wasMobile = gameState.isMobile;
    gameState.isMobile = checkMobile();
    if (wasMobile !== gameState.isMobile) {
      updateUI(); // Refresh UI when switching between mobile/desktop
    }
  };
};
function filterSets(expansion) {
  const content = document.getElementById('collection-content');
  showSets();
  document.getElementById('expansion-filter').value = expansion;
}
function rerollHeist() {
  const previousResult = window.currentHeistResult;
  if (!previousResult || (gameState.cigs || 0) <= 0 || previousResult.rerollCount >= 3) {
    console.log("Cannot reroll:", { hasPreviousResult: !!previousResult, cigs: gameState.cigs, rerollCount: previousResult?.rerollCount });
    return;
  }
  
  // Spend a cig
  gameState.cigs--;
  updateCigs();
  saveGame();

  // Keep the same cards
  const location = previousResult.selectedCards.Location;
  const crew = previousResult.selectedCards.Crew;
  const gear = previousResult.selectedCards.Gear;

  // Calculate new outcome
  const baseChance = 35;
  const rarityValues = {
    'Common': 1,
    'Rare': 1.75,
    'Epic': 2.5,
    'Legendary': 3.5
  };

  const locationDifficultyImpact = (8 - location.difficulty) * 6;
  const crewEffectiveness = crew.skill * 4 * rarityValues[crew.rarity];
  const gearEffectiveness = gear.bonus * 3 * rarityValues[gear.rarity];
  const rarityPenalty = Math.max(0,
    (rarityValues[location.rarity] * 2) - 
    (rarityValues[crew.rarity] + rarityValues[gear.rarity])
  ) * 12;

  const difficultyScaling = Math.max(0.5, 1 - (location.difficulty / 10));
  const scaledCrewBonus = crewEffectiveness * difficultyScaling;
  const scaledGearBonus = gearEffectiveness * difficultyScaling;

  const successChance = Math.min(85, Math.max(5,
    baseChance + 
    locationDifficultyImpact + 
    scaledCrewBonus + 
    scaledGearBonus - 
    rarityPenalty
  ));

  const roll = Math.random() * 100;
  const success = roll <= successChance;
  let potentialReward = Math.floor(location.difficulty * 75 * rarityValues[location.rarity]);
  if (location.id.startsWith('P')) {
    potentialReward *= 2;
  }
  const reward = success ? potentialReward : 0;

  // Create new result object
  const newResult = {
    success,
    reward,
    roll,
    chance: successChance,
    selectedCards: previousResult.selectedCards,
    lostCards: success ? [] : [previousResult.selectedCards.Crew, previousResult.selectedCards.Gear],
    earnedDrugs: success && location.id.startsWith('D') && gameState.ownedProperty ? location.difficulty : 0,
    earnedCigs: success && gameState.ownedProperty === 'apt2' && location.id.startsWith('P') ? location.difficulty : 0,
    rerollCount: (previousResult.rerollCount || 0) + 1,
    potentialReward
  };

  // Show new result
  window.currentHeistResult = newResult;
  showHeistResult(newResult);
}

function finalizeHeistResult() {
  const result = window.currentHeistResult;
  if (!result) return;

  if (result.success) {
    // Remove the used location card
    const locationIndex = gameState.collection.indexOf(result.selectedCards.Location.id);
    if (locationIndex !== -1) {
      gameState.collection.splice(locationIndex, 1);
    }
  } else {
    // Remove crew and gear cards on failure
    const crewIndex = gameState.collection.indexOf(result.selectedCards.Crew.id);
    if (crewIndex !== -1) {
      gameState.collection.splice(crewIndex, 1);
    }

    const gearIndex = gameState.collection.indexOf(result.selectedCards.Gear.id);
    if (gearIndex !== -1) {
      gameState.collection.splice(gearIndex, 1);
    }
  }

  // Apply rewards
  gameState.cash += result.reward;
  
  if (result.success && result.earnedDrugs) {
    if (!gameState.drugs) gameState.drugs = 0;
    gameState.drugs += result.earnedDrugs;
  }
  
  if (result.success && result.earnedCigs) {
    if (!gameState.cigs) gameState.cigs = 0;
    gameState.cigs += result.earnedCigs;
  }

  // Add XP
  let xpReward = 5;
  if (result.success) {
    xpReward += Math.floor(result.selectedCards.Location.difficulty * 1.5);
  }
  addXP(xpReward);

  // Update UI
  updateCash();
  updateDrugs();
  updateCigs();
  saveGame();

  // Clear the current result and return to heist setup
  window.currentHeistResult = null;
  showHeistSetup();
}