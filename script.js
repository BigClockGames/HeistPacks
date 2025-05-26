
// Remove import and make everything work with vanilla JS
const RARITY_CONFIG = {
  common: { name: 'Common', color: '#8D8D8D', weight: 80 },
  rare: { name: 'Rare', color: '#4A90E2', weight: 13 },
  epic: { name: 'Epic', color: '#9B59B6', weight: 5 },
  legendary: { name: 'Legendary', color: '#F39C12', weight: 1.5 },
  mythic: { name: 'Mythic', color: '#E74C3C', weight: 0.4 },
  unique: { name: 'Unique', color: '#FFD700', weight: 0.1 }
};

// Classic card sets
const CLASSIC_CARD_SETS = {
  classic: {
    name: "Classic Set",
    description: "The original survivor pack set",
    items: {
      common: ["First Aid Kit", "Canned Food", "Bottled Water", "Scrap Metal"],
      rare: ["Medical Supplies", "Survival Ration", "Purified Water", "Tool Set"],
      epic: ["Advanced Medkit", "Emergency Food", "Water Filter", "Material Cache"],
      legendary: ["Miracle Drug", "Nutrient Paste", "Endless Spring", "Unobtanium"],
      mythic: [],
      unique: []
    },
    survivors: {
      common: [
        { name: 'Sarah Chen', occupation: 'Doctor', str: 4, dex: 6, int: 8, health: 100 },
        { name: 'Jackson Williams', occupation: 'Engineer', str: 7, dex: 5, int: 6, health: 100 },
        { name: 'Emily Davis', occupation: 'Teacher', str: 5, dex: 7, int: 7, health: 100 },
        { name: 'David Rodriguez', occupation: 'Farmer', str: 8, dex: 4, int: 5, health: 100 }
      ],
      rare: [
        { name: 'Olivia Brown', occupation: 'Nurse', str: 4, dex: 6, int: 8, health: 100 },
        { name: 'Ethan Garcia', occupation: 'Electrician', str: 7, dex: 5, int: 6, health: 100 },
        { name: 'Sophia Martinez', occupation: 'Librarian', str: 5, dex: 7, int: 7, health: 100 },
        { name: 'Noah Anderson', occupation: 'Construction Worker', str: 8, dex: 4, int: 5, health: 100 }
      ],
      epic: [
        { name: 'Isabella Thomas', occupation: 'Paramedic', str: 5, dex: 7, int: 9, health: 100 },
        { name: 'Liam Jackson', occupation: 'Mechanic', str: 8, dex: 5, int: 6, health: 100 },
        { name: 'Mia White', occupation: 'Journalist', str: 6, dex: 8, int: 8, health: 100 },
        { name: 'Aiden Harris', occupation: 'Security Guard', str: 9, dex: 5, int: 6, health: 100 }
      ],
      legendary: [
        { name: 'Abigail Martin', occupation: 'Scientist', str: 5, dex: 7, int: 9, health: 100 },
        { name: 'Carter Thompson', occupation: 'Detective', str: 8, dex: 6, int: 7, health: 100 },
        { name: 'Chloe Garcia', occupation: 'Chef', str: 6, dex: 8, int: 8, health: 100 },
        { name: 'James Wilson', occupation: 'Firefighter', str: 9, dex: 5, int: 6, health: 100 }
      ],
      mythic: [
        { name: 'Madison Moore', occupation: 'Astronaut', str: 6, dex: 8, int: 10, health: 100 },
        { name: 'Lucas Taylor', occupation: 'Pilot', str: 9, dex: 7, int: 8, health: 100 },
        { name: 'Ella Anderson', occupation: 'President', str: 7, dex: 9, int: 9, health: 100 },
        { name: 'Owen Wright', occupation: 'General', str: 10, dex: 6, int: 7, health: 100 }
      ],
      unique: [
        { name: 'Scarlett Green', occupation: 'God', str: 10, dex: 10, int: 10, health: 100 }
      ]
    },
    locations: {
      common: [
        { name: 'Abandoned Hospital', requirements: { ep: 5, food: 3, water: 3 }, rewards: { meds: 15, scraps: 10 } },
        { name: 'Desolate Supermarket', requirements: { ep: 5, food: 2, water: 2 }, rewards: { food: 20, water: 15 } },
        { name: 'Ruined Factory', requirements: { ep: 6, food: 3, water: 3 }, rewards: { scraps: 20, materials: 10 } }
      ],
      rare: [
        { name: 'Hidden Clinic', requirements: { ep: 8, food: 4, water: 4 }, rewards: { meds: 30, scraps: 15 } },
        { name: 'Fortified Farm', requirements: { ep: 8, food: 3, water: 5 }, rewards: { food: 35, water: 25 } },
        { name: 'Secret Workshop', requirements: { ep: 9, food: 4, water: 4 }, rewards: { scraps: 30, materials: 20 } }
      ],
      epic: [
        { name: 'Underground Lab', requirements: { ep: 12, food: 6, water: 6 }, rewards: { meds: 50, scraps: 25, materials: 15 } },
        { name: 'Secluded Oasis', requirements: { ep: 12, food: 5, water: 8 }, rewards: { food: 40, water: 60, scraps: 20 } }
      ],
      legendary: [
        { name: 'Government Bunker', requirements: { ep: 15, food: 8, water: 8 }, rewards: { meds: 75, food: 50, water: 50, scraps: 40, materials: 30 } }
      ],
      mythic: [
        { name: 'Atlantis', requirements: { ep: 20, food: 10, water: 10 }, rewards: { meds: 100, food: 100, water: 100, scraps: 60, materials: 50 } }
      ],
      unique: []
    }
  }
};

// Initialize global CARD_SETS with classic set
window.CARD_SETS = CLASSIC_CARD_SETS;

const defaultGameState = {
  resources: {
    scraps: 50,
    food: 50,
    water: 50,
    meds: 50,
    materials: 50
  },
  collection: [],
  settings: {
    fontSize: 16,
    fontFamily: 'Segoe UI',
    musicEnabled: true,
    musicVolume: 50
  },
  importedExpansions: [],
  gridHealth: Array(25).fill(100),
  gridMaxHealth: Array(25).fill(100),
  baseSettings: {
    coreHealth: 100,
    maxCoreHealth: 100,
    outermostDamage: 10,
    outermostStartingHealth: 100
  }
};

// Create and configure audio element
const backgroundMusic = new Audio('Untitled.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.autoplay = true;

let gameState = { ...defaultGameState };

// Add event listener for user interaction
document.addEventListener('click', () => {
  if (gameState.settings.musicEnabled) {
    backgroundMusic.play().catch(e => console.log('Audio playback failed:', e));
  }
}, { once: true });

function saveGame() {
  localStorage.setItem('survivorPacksGame', JSON.stringify(gameState));
}

function openPack(cardCount = 3, setName = 'classic') {
  if (gameState.resources.scraps < 10) {
    throw new Error('Not enough scraps to open pack');
  }

  const cardSet = window.CARD_SETS[setName];
  if (!cardSet) {
    throw new Error(`Card set "${setName}" not found`);
  }

  const pulled = [];
  const weightedCategories = [];
  
  // Build weighted category array
  for (let i = 0; i < 60; i++) weightedCategories.push('survivors');
  for (let i = 0; i < 30; i++) weightedCategories.push('items');
  for (let i = 0; i < 10; i++) weightedCategories.push('locations');

  for (let i = 0; i < cardCount; i++) {
    // Determine rarity
    let rarityRoll = Math.random() * 100;
    let rarity = 'common';
    
    const rarityThresholds = [
      { name: 'unique', threshold: RARITY_CONFIG.unique.weight },
      { name: 'mythic', threshold: RARITY_CONFIG.mythic.weight },
      { name: 'legendary', threshold: RARITY_CONFIG.legendary.weight },
      { name: 'epic', threshold: RARITY_CONFIG.epic.weight },
      { name: 'rare', threshold: RARITY_CONFIG.rare.weight }
    ];

    for (const rarityData of rarityThresholds) {
      if (rarityRoll <= rarityData.threshold) {
        rarity = rarityData.name;
        break;
      }
      rarityRoll -= rarityData.threshold;
    }

    // Determine category
    const category = weightedCategories[Math.floor(Math.random() * weightedCategories.length)];
    
    let card = null;
    
    if (category === 'survivors') {
      const availableSurvivors = cardSet.survivors[rarity] || [];
      if (availableSurvivors.length > 0) {
        const survivorData = availableSurvivors[Math.floor(Math.random() * availableSurvivors.length)];
        card = {
          id: generateUniqueId(),
          name: survivorData.name,
          occupation: survivorData.occupation,
          category: 'survivors',
          rarity: rarity,
          color: RARITY_CONFIG[rarity].color,
          stats: {
            health: survivorData.health,
            str: survivorData.str,
            dex: survivorData.dex,
            int: survivorData.int,
            ep: survivorData.str + survivorData.dex + survivorData.int
          }
        };
      }
    } else if (category === 'items') {
      const availableItems = cardSet.items[rarity] || [];
      if (availableItems.length > 0) {
        const itemName = availableItems[Math.floor(Math.random() * availableItems.length)];
        const itemValues = {
          'First Aid Kit': { type: 'meds', value: 10 },
          'Canned Food': { type: 'food', value: 10 },
          'Bottled Water': { type: 'water', value: 10 },
          'Scrap Metal': { type: 'scraps', value: 10 },
          'Medical Supplies': { type: 'meds', value: 25 },
          'Survival Ration': { type: 'food', value: 25 },
          'Purified Water': { type: 'water', value: 25 },
          'Tool Set': { type: 'scraps', value: 25 },
          'Advanced Medkit': { type: 'meds', value: 50 },
          'Emergency Food': { type: 'food', value: 50 },
          'Water Filter': { type: 'water', value: 50 },
          'Material Cache': { type: 'materials', value: 50 },
          'Miracle Drug': { type: 'meds', value: 100 },
          'Nutrient Paste': { type: 'food', value: 100 },
          'Endless Spring': { type: 'water', value: 100 },
          'Unobtanium': { type: 'materials', value: 100 }
        };
        
        const itemData = itemValues[itemName] || { type: 'scraps', value: 10 };
        card = {
          id: generateUniqueId(),
          name: itemName,
          category: 'items',
          rarity: rarity,
          color: RARITY_CONFIG[rarity].color,
          resourceType: itemData.type,
          resourceValue: itemData.value
        };
      }
    } else if (category === 'locations') {
      const availableLocations = cardSet.locations[rarity] || [];
      if (availableLocations.length > 0) {
        const locationData = availableLocations[Math.floor(Math.random() * availableLocations.length)];
        card = {
          id: generateUniqueId(),
          name: locationData.name,
          category: 'locations',
          rarity: rarity,
          color: RARITY_CONFIG[rarity].color,
          requirements: locationData.requirements,
          rewards: locationData.rewards
        };
      }
    }

    if (card) {
      pulled.push(card);
      gameState.collection.push(card);
    }
  }

  gameState.resources.scraps -= 10;
  saveGame();
  return pulled;
}

function importExpansionPack(expansion) {
  // Validate expansion format
  if (!expansion.name || !expansion.version || !expansion.cardSets) {
    throw new Error('Invalid expansion format');
  }

  // Check if expansion is already imported
  if (!gameState.importedExpansions) {
    gameState.importedExpansions = [];
  }

  const existingExpansion = gameState.importedExpansions.find(exp => exp.name === expansion.name);
  if (existingExpansion) {
    throw new Error(`Expansion "${expansion.name}" is already imported`);
  }

  // Add expansion to imported list with full card data
  gameState.importedExpansions.push({
    name: expansion.name,
    version: expansion.version,
    description: expansion.description,
    importedAt: new Date().toISOString(),
    cardSets: expansion.cardSets
  });

  // Merge card sets from expansion into existing CARD_SETS
  Object.keys(expansion.cardSets).forEach(setName => {
    const expansionSet = expansion.cardSets[setName];

    if (!window.CARD_SETS[setName]) {
      window.CARD_SETS[setName] = {
        name: expansionSet.name,
        description: expansionSet.description,
        items: { common: [], rare: [], epic: [], legendary: [], mythic: [], unique: [] },
        survivors: { common: [], rare: [], epic: [], legendary: [], mythic: [], unique: [] },
        locations: { common: [], rare: [], epic: [], legendary: [], mythic: [], unique: [] }
      };
    }

    // Merge items, survivors, and locations
    ['items', 'survivors', 'locations'].forEach(category => {
      if (expansionSet[category]) {
        Object.keys(expansionSet[category]).forEach(rarity => {
          if (expansionSet[category][rarity]) {
            window.CARD_SETS[setName][category][rarity] = 
              (window.CARD_SETS[setName][category][rarity] || []).concat(expansionSet[category][rarity]);
          }
        });
      }
    });
  });

  saveGame();
  displayCollection();
  displayImportedExpansions();
  displayAvailablePacks();
}

function displayImportedExpansions() {
  const container = document.getElementById('importedExpansions');
  if (!container) return;

  if (!gameState.importedExpansions || gameState.importedExpansions.length === 0) {
    container.innerHTML = '<p style="color: var(--secondary-beige); font-style: italic;">No expansion packs imported</p>';
    return;
  }

  container.innerHTML = gameState.importedExpansions.map(expansion => `
    <div class="expansion-item">
      <div class="expansion-name">${expansion.name} v${expansion.version}</div>
      <div class="expansion-details">
        ${expansion.description || 'No description available'}
        <br><small>Imported: ${new Date(expansion.importedAt).toLocaleDateString()}</small>
      </div>
    </div>
  `).join('');
}

function resetAllExpansions() {
  if (!gameState.importedExpansions || gameState.importedExpansions.length === 0) {
    alert('No expansion packs to reset!');
    return;
  }

  if (confirm('Are you sure you want to reset all expansion packs? This will remove all imported expansions and any expansion cards from your collection. This cannot be undone!')) {
    gameState.importedExpansions = [];
    window.CARD_SETS = CLASSIC_CARD_SETS;
    gameState.collection = gameState.collection.filter(card => !card.isExpansionCard);

    saveGame();
    displayImportedExpansions();
    displayAvailablePacks();
    displayCollection();
    alert('All expansion packs have been reset!');
  }
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createCardHTML(card) {
  return `
    <h3>${card.name}</h3>
    <p class="rarity" style="color: ${card.color}">${RARITY_CONFIG[card.rarity].name}</p>
    ${card.name === 'Lisa Park' ? '<div class="survivor-portrait"><img src="attached_assets/LisaPark.jpg" alt="Lisa Park" /></div>' : ''}
    <p class="category">${card.category}</p>
    ${card.category === 'survivors' 
      ? `<p class="occupation">${card.occupation}</p>
         <div class="stats-info">
           <div class="health-status">
             <span>HP: ${card.stats.health}/100</span>
             <div class="health-bar">
               <div class="health-fill" style="width: ${card.stats.health}%"></div>
             </div>
           </div>
           <span>STR: ${card.stats.str}</span>
           <span>DEX: ${card.stats.dex}</span>
           <span>INT: ${card.stats.int}</span>
           <span>EP: ${card.stats.ep}</span>
         </div>`
      : card.category === 'items'
      ? `<p class="resource-info">Provides ${card.resourceValue} ${card.resourceType}</p>`
      : card.category === 'locations' 
      ? `<div class="expedition-info">
          <p class="requirements">Requirements:</p>
          <ul>
            ${Object.entries(card.requirements).map(([key, value]) => 
              `<li>${key}: ${value}</li>`).join('')}
          </ul>
          <p class="rewards">Rewards:</p>
          <ul>
            ${Object.entries(card.rewards).map(([key, value]) => 
              `<li>${key}: ${value}</li>`).join('')}
          </ul>
        </div>`
      : ''}
  `;
}

function displayCollection() {
  const categories = ['survivors', 'items', 'locations'];

  // Update timer display with new survivor count
  const survivors = gameState.collection.filter(card => card.category === 'survivors' && card.stats.health > 0);
  const survivorCount = survivors.length;
  const timerDisplay = document.getElementById('timer-countdown');
  const depletionPreview = document.getElementById('depletion-preview');
  if (timerDisplay && depletionPreview) {
    const secondsLeft = timerDisplay.textContent ? parseInt(timerDisplay.textContent) : 60;
    updateTimer(secondsLeft, survivorCount);
  }

  categories.forEach(category => {
    const container = document.querySelector(`#${category} .card-grid`);
    if (!container) return;

    container.innerHTML = '';
    let categoryCards = gameState.collection.filter(card => card.category === category);

    // Sort cards by rarity (using RARITY_CONFIG order)
    const rarityOrder = ['unique', 'mythic', 'legendary', 'epic', 'rare', 'common'];
    categoryCards.sort((a, b) => {
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });

    // Filter out dead survivors
    if (category === 'survivors') {
      categoryCards = categoryCards.filter(card => card.stats.health > 0);
    }

    // Group identical cards and count them
    const cardGroups = categoryCards.reduce((groups, card) => {
      const key = `${card.name}-${card.rarity}-${card.category}`;
      if (!groups[key]) {
        groups[key] = {
          card: card,
          count: 1
        };
      } else {
        groups[key].count++;
      }
      return groups;
    }, {});

    Object.values(cardGroups).forEach(({card, count}) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'pulled-card clickable';
      cardElement.style.borderColor = card.color;
      cardElement.innerHTML = createCardHTML(card) + (count > 1 ? `<div class="card-count">x${count}</div>` : '');

      cardElement.addEventListener('click', () => {
        handleCardClick(card);
      });

      container.appendChild(cardElement);
    });
  });
}

function handleCardClick(card) {
  // For items, handle immediately without modal
  if (card.category === 'items') {
    gameState.resources[card.resourceType] += card.resourceValue;
    const cardIndex = gameState.collection.findIndex(c => 
      c.name === card.name && c.category === card.category && c.rarity === card.rarity
    );
    if (cardIndex > -1) {
      gameState.collection.splice(cardIndex, 1);
    }
    saveGame();
    updateResourceDisplay();
    displayCollection();
    return;
  }

  // For other categories, create modal
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'card-details-modal';
  document.body.appendChild(detailsContainer);

  if (card.category === 'survivors') {
    handleSurvivorClick(card, detailsContainer);
  } else if (card.category === 'locations') {
    handleLocationClick(card, detailsContainer);
  } else {
    detailsContainer.innerHTML = `
      <div class="modal-content">
        <div class="pulled-card" style="border-color: ${card.color}">
          ${createCardHTML(card)}
        </div>
        <div class="modal-buttons">
          <button class="close-modal">Close</button>
        </div>
      </div>
    `;
  }

  const closeButton = detailsContainer.querySelector('.close-modal');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      document.body.removeChild(detailsContainer);
    });
  }

  detailsContainer.addEventListener('click', (e) => {
    if (e.target === detailsContainer) {
      document.body.removeChild(detailsContainer);
    }
  });
}

function handleSurvivorClick(card, detailsContainer) {
  const healthCosts = {
    common: 25,
    rare: 20,
    epic: 15,
    legendary: 10,
    mythic: 5,
    unique: 3
  };

  const isDead = card.stats.health <= 0;

  if (isDead) {
    const cardIndex = gameState.collection.findIndex(c => 
      c.name === card.name && c.category === card.category && c.rarity === card.rarity
    );
    if (cardIndex > -1) {
      gameState.collection.splice(cardIndex, 1);
      saveGame();
      displayCollection();
    }
  }

  detailsContainer.innerHTML = `
    <div class="modal-content">
      <div class="pulled-card" style="border-color: ${isDead ? '#000000' : card.color}">
        ${createCardHTML(card)}
      </div>
      ${isDead ? `
        <p class="death-notice">This survivor has died and has been removed from your collection.</p>
      ` : `
      <div class="modal-buttons">
        <button class="action-btn" data-action="scavenge">Scavenge (STR) [-${healthCosts[card.rarity]} HP]</button>
        <button class="action-btn" data-action="forage">Forage (DEX) [-${healthCosts[card.rarity]} HP]</button>
        <button class="action-btn" data-action="engineer">Engineer (INT) [-${healthCosts[card.rarity]} HP]</button>
        ${gameState.resources.meds > 0 ? `
        <button class="heal-btn">Heal (+10 HP) [-1 Med]</button>
        ` : ''}
        <button class="close-modal">Close</button>
      </div>
      `}
    </div>
  `;

  if (!isDead) {
    const healBtn = detailsContainer.querySelector('.heal-btn');
    if (healBtn) {
      healBtn.addEventListener('click', () => {
        gameState.resources.meds--;
        card.stats.health = Math.min(100, card.stats.health + 10);

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'card-details-modal';
        summaryDiv.innerHTML = `
          <div class="modal-content">
            <h3>Healing Results</h3>
            <div class="action-summary">
              <p>Used 1 Med</p>
              <p>Survivor Health: +10 (${card.stats.health} total)</p>
            </div>
            <button class="close-modal">Close</button>
          </div>
        `;

        saveGame();
        updateResourceDisplay();
        displayCollection();
        document.body.removeChild(detailsContainer);

        document.body.appendChild(summaryDiv);
        summaryDiv.querySelector('.close-modal').addEventListener('click', () => {
          document.body.removeChild(summaryDiv);
        });

        summaryDiv.addEventListener('click', (e) => {
          if (e.target === summaryDiv) {
            document.body.removeChild(summaryDiv);
          }
        });
      });
    }

    detailsContainer.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const stat = action === 'scavenge' ? card.stats.str : 
                   action === 'forage' ? card.stats.dex : 
                   card.stats.int;

        const baseAmount = Math.floor(stat * 2);

        if (action === 'scavenge') {
          gameState.resources.scraps += baseAmount;
          gameState.resources.meds += Math.floor(baseAmount / 2);
        } else if (action === 'forage') {
          gameState.resources.food += baseAmount;
          gameState.resources.water += baseAmount;
        } else if (action === 'engineer') {
          gameState.resources.scraps += Math.floor(baseAmount / 2);
          gameState.resources.materials += baseAmount;
        }

        card.stats.health -= healthCosts[card.rarity];

        if (card.stats.health <= 0) {
          const cardIndex = gameState.collection.findIndex(c => 
            c.name === card.name && c.category === card.category && c.rarity === card.rarity
          );
          if (cardIndex > -1) {
            gameState.collection.splice(cardIndex, 1);
          }
        }

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'card-details-modal';
        summaryDiv.innerHTML = `
          <div class="modal-content">
            <h3>Action Results</h3>
            <div class="action-summary">
              <p>Survivor Health: -${healthCosts[card.rarity]} (${card.stats.health} remaining)</p>
              ${action === 'scavenge' 
                ? `<p>Gained Scraps: +${baseAmount}</p>
                   <p>Gained Meds: +${Math.floor(baseAmount / 2)}</p>`
                : action === 'forage'
                ? `<p>Gained Food: +${baseAmount}</p>
                   <p>Gained Water: +${baseAmount}</p>`
                : `<p>Gained Scraps: +${Math.floor(baseAmount / 2)}</p>
                   <p>Gained Materials: +${baseAmount}</p>`
              }
            </div>
            <button class="close-modal">Close</button>
          </div>
        `;

        saveGame();
        updateResourceDisplay();
        displayCollection();
        document.body.removeChild(detailsContainer);

        document.body.appendChild(summaryDiv);
        summaryDiv.querySelector('.close-modal').addEventListener('click', () => {
          document.body.removeChild(summaryDiv);
        });

        summaryDiv.addEventListener('click', (e) => {
          if (e.target === summaryDiv) {
            document.body.removeChild(summaryDiv);
          }
        });
      });
    });
  }
}

function handleLocationClick(card, detailsContainer) {
  const availableSurvivors = gameState.collection
    .filter(s => s.category === 'survivors' && s.stats.health > 0)
    .filter((survivor, index, self) => 
      index === self.findIndex(s => s.name === survivor.name)
    );

  detailsContainer.innerHTML = `
    <div class="modal-content">
      <div class="pulled-card" style="border-color: ${card.color}">
        ${createCardHTML(card)}
      </div>
      <div class="survivor-selection">
        <h3>Select Survivors (Required EP: ${card.requirements.ep})</h3>
        <div class="survivors-grid">
          ${availableSurvivors.map(survivor => `
            <div class="survivor-card" data-survivor-id="${survivor.name}" style="border-color: ${survivor.color}">
              <h4>${survivor.name}</h4>
              <p>EP: ${survivor.stats.ep}</p>
              <p>HP: ${survivor.stats.health}</p>
            </div>
          `).join('')}
        </div>
        <div class="assignment-summary">
          <p>Total EP: <span id="total-ep">0</span></p>
        </div>
        <div class="modal-buttons">
          <button class="close-modal">Close</button>
          <button id="start-expedition" disabled>Start Expedition</button>
        </div>
      </div>
    </div>
  `;

  const selectedSurvivors = new Set();
  let totalEP = 0;

  detailsContainer.querySelectorAll('.survivor-card').forEach(survivorCard => {
    survivorCard.addEventListener('click', () => {
      const survivorId = survivorCard.dataset.survivorId;

      if (selectedSurvivors.has(survivorId)) {
        selectedSurvivors.delete(survivorId);
        survivorCard.classList.remove('selected');
      } else {
        selectedSurvivors.add(survivorId);
        survivorCard.classList.add('selected');
      }

      totalEP = Array.from(document.querySelectorAll('.survivor-card.selected')).reduce((sum, cardEl) => {
        const epText = Array.from(cardEl.querySelectorAll('p')).find(p => p.textContent.includes('EP: ')).textContent;
        const ep = parseInt(epText.split('EP: ')[1], 10);
        return sum + ep;
      }, 0);

      const totalEpDisplay = document.getElementById('total-ep');
      const startExpeditionBtn = document.getElementById('start-expedition');

      totalEpDisplay.textContent = totalEP;
      startExpeditionBtn.disabled = totalEP < parseInt(card.requirements.ep);
    });
  });

  const startExpeditionBtn = document.getElementById('start-expedition');
  startExpeditionBtn.addEventListener('click', () => {
    const baseHpLoss = {
      common: 60,
      rare: 40,
      epic: 30,
      legendary: 20,
      mythic: 10,
      unique: 5
    };

    const locationMultiplier = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 2.5,
      mythic: 3,
      unique: 4
    };

    const survivorResults = [];
    let hpLossApplied = false;

    Array.from(selectedSurvivors).forEach(survivorId => {
      const survivorData = gameState.collection.find(s => 
        s.name === survivorId && s.category === 'survivors' && s.stats.health > 0
      );

      if (survivorData) {
        const baseLoss = baseHpLoss[survivorData.rarity.toLowerCase()];
        const multiplier = locationMultiplier[card.rarity.toLowerCase()];
        const totalLoss = Math.floor(baseLoss * multiplier);

        const originalHealth = survivorData.stats.health;
        survivorData.stats.health = Math.max(0, originalHealth - totalLoss);

        if (survivorData.stats.health < originalHealth) {
          hpLossApplied = true;
        }

        survivorResults.push({
          name: survivorData.name,
          rarity: survivorData.rarity,
          loss: totalLoss,
          remainingHealth: survivorData.stats.health
        });
      }
    });

    if (!hpLossApplied) {
      throw new Error('Expedition failed - no valid HP loss recorded');
    }

    Object.entries(card.rewards).forEach(([resource, amount]) => {
      gameState.resources[resource] += amount;
    });

    const cardIndex = gameState.collection.findIndex(c => 
      c.name === card.name && c.category === card.category && c.rarity === card.rarity
    );
    if (cardIndex > -1) {
      gameState.collection.splice(cardIndex, 1);
      saveGame();
      displayCollection();
    }

    const resultsModal = document.createElement('div');
    resultsModal.className = 'card-details-modal';
    resultsModal.innerHTML = `
      <div class="modal-content">
        <h3>EXPEDITION RESULTS</h3>
        <div class="action-summary">
          <h4>Location: ${card.name} (${card.rarity})</h4>

          <h4>Resources Gained:</h4>
          ${Object.entries(card.rewards).map(([resource, amount]) => 
            `<p>Gained ${resource}: +${amount}</p>`
          ).join('')}

          <h4>Expedition Team Status:</h4>
          <div class="survivor-status">
            ${survivorResults.map(result => `
              <div class="survivor-status-entry">
                <p class="survivor-name">${result.name} (${result.rarity})</p>
                <p class="hp-loss">Health Lost: -${result.loss}</p>
                <p class="hp-remaining">Remaining HP: ${result.remainingHealth}/100</p>
                <div class="health-bar">
                  <div class="health-fill" style="width: ${result.remainingHealth}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <button class="close-modal">Continue</button>
      </div>
    `;

    document.body.removeChild(detailsContainer);
    document.body.appendChild(resultsModal);

    const closeBtn = resultsModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(resultsModal);
    });

    resultsModal.addEventListener('click', (e) => {
      if (e.target === resultsModal) {
        document.body.removeChild(resultsModal);
      }
    });

    updateResourceDisplay();
  });
}

function updateResourceDisplay() {
  Object.entries(gameState.resources).forEach(([resource, amount]) => {
    const resourceElements = document.querySelectorAll('.resource');
    const element = Array.from(resourceElements).find(el => 
      el.querySelector('span').textContent === resource.charAt(0).toUpperCase() + resource.slice(1) + ':'
    );
    if (element) {
      element.innerHTML = `<span>${resource.charAt(0).toUpperCase() + resource.slice(1)}:</span> ${amount}`;
    }
  });

  const packElements = document.querySelectorAll('.pack');
  packElements.forEach(pack => {
    pack.classList.toggle('disabled', gameState.resources.scraps < 10);
  });
}

function applySettings() {
  document.body.style.fontSize = `${gameState.settings.fontSize}px`;
  document.body.style.fontFamily = gameState.settings.fontFamily;

  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const fontSelect = document.getElementById('fontSelect');
  const musicToggle = document.getElementById('musicToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');

  if (fontSizeSlider) fontSizeSlider.value = gameState.settings.fontSize;
  if (fontSizeValue) fontSizeValue.textContent = `${gameState.settings.fontSize}px`;
  if (fontSelect) fontSelect.value = gameState.settings.fontFamily;
  if (musicToggle) musicToggle.checked = gameState.settings.musicEnabled;
  if (volumeSlider) volumeSlider.value = gameState.settings.musicVolume;
  if (volumeValue) volumeValue.textContent = `${gameState.settings.musicVolume}%`;
}

function updateTimer(secondsLeft, survivorCount) {
  const timerDisplay = document.getElementById('timer-countdown');
  const depletionPreview = document.getElementById('depletion-preview');
  if (timerDisplay && depletionPreview) {
    timerDisplay.textContent = `${secondsLeft}s`;
    if (survivorCount > 0) {
      depletionPreview.textContent = `(-${survivorCount} Food/Water)`;
    } else {
      depletionPreview.textContent = '';
    }
  }
}

function startResourceDepletion() {
  let secondsLeft = 60;

  const healthLoss = {
    common: 15,
    rare: 12,
    epic: 8,
    legendary: 5,
    mythic: 3,
    unique: 1
  };

  const countdownTimer = setInterval(() => {
    const survivors = gameState.collection.filter(card => card.category === 'survivors');
    const survivorCount = survivors.length;
    secondsLeft--;

    updateTimer(secondsLeft, survivorCount);

    if (secondsLeft <= 0) {
      secondsLeft = 60;
    }
  }, 1000);

  const gameUpdateTimer = setInterval(() => {
    const survivors = gameState.collection.filter(card => card.category === 'survivors');
    const survivorCount = survivors.length;

    if (survivorCount > 0) {
      gameState.resources.food = Math.max(0, gameState.resources.food - survivorCount);
      gameState.resources.water = Math.max(0, gameState.resources.water - survivorCount);

      if (gameState.resources.food === 0 && gameState.resources.water === 0) {
        survivors.forEach(survivor => {
          survivor.stats.health = Math.max(0, survivor.stats.health - healthLoss[survivor.rarity]);
        });
      }

      applyBaseDamage();

      updateResourceDisplay();
      displayCollection();
      updatePowerupGrid();
      saveGame();
    }
  }, 60000);

  return { countdownTimer, gameUpdateTimer };
}

function applyBaseDamage() {
  for (let i = 0; i < 25; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const isOutermost = row === 0 || row === 4 || col === 0 || col === 4;
    const cell = document.querySelector(`.powerup-cell[data-index="${i}"]`);
    const isOwned = cell && (cell.classList.contains('unlocked') || cell.classList.contains('center'));

    if (isOutermost && isOwned) {
      gameState.gridHealth[i] = Math.max(0, gameState.gridHealth[i] - gameState.baseSettings.outermostDamage);

      if (gameState.gridHealth[i] === 0) {
        gameState.baseSettings.coreHealth = Math.max(0, gameState.baseSettings.coreHealth - 5);
      }
    }
  }
}

function updatePowerupGrid() {
  for (let i = 0; i < 25; i++) {
    const cell = document.querySelector(`.powerup-cell[data-index="${i}"]`);
    if (cell) {
      const healthFill = cell.querySelector('.health-fill');
      if (healthFill) {
        if (i === 12) {
          const coreHealthPercent = (gameState.baseSettings.coreHealth / gameState.baseSettings.maxCoreHealth) * 100;
          healthFill.style.width = `${coreHealthPercent}%`;

          const coreHealthDisplay = cell.querySelector('.core-health');
          if (coreHealthDisplay) {
            coreHealthDisplay.textContent = `HP: ${gameState.baseSettings.coreHealth}/${gameState.baseSettings.maxCoreHealth}`;
          }
        } else {
          healthFill.style.width = `${gameState.gridHealth[i]}%`;
        }
      }
    }
  }
}

function healAllSurvivors() {
  const survivors = gameState.collection.filter(card => card.category === 'survivors' && card.stats.health > 0);
  let totalMedsNeeded = 0;

  survivors.forEach(survivor => {
    if (survivor.stats.health < 100) {
      const healthNeeded = 100 - survivor.stats.health;
      totalMedsNeeded += Math.ceil(healthNeeded / 10);
    }
  });

  if (totalMedsNeeded === 0) {
    alert('All survivors are at full health!');
    return;
  }

  if (gameState.resources.meds < totalMedsNeeded) {
    alert(`Not enough meds! Need ${totalMedsNeeded} but have ${gameState.resources.meds}`);
    return;
  }

  survivors.forEach(survivor => {
    if (survivor.stats.health < 100) {
      const healthNeeded = 100 - survivor.stats.health;
      const medsNeeded = Math.ceil(healthNeeded / 10);
      survivor.stats.health = 100;
      gameState.resources.meds -= medsNeeded;
    }
  });

  saveGame();
  updateResourceDisplay();
  displayCollection();
  alert(`All survivors healed using ${totalMedsNeeded} meds!`);
}

// Global functions for powerup grid
function addUpgradeButtons() {
  for (let i = 0; i < 25; i++) {
    const cell = document.querySelector(`.powerup-cell[data-index="${i}"]`);
    if (cell && (cell.classList.contains('unlocked') || cell.classList.contains('center'))) {
      const existingContainer = cell.querySelector('.upgrade-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      const upgradeContainer = document.createElement('div');
      upgradeContainer.className = 'upgrade-container';

      const currentHealth = gameState.gridHealth[i];
      const maxHealth = gameState.gridMaxHealth[i];

      upgradeContainer.innerHTML = `
        ${currentHealth < maxHealth ? '<button class="repair-btn" data-index="' + i + '">R</button>' : ''}
        <button class="upgrade-btn" data-index="' + i + '">+</button>
      `;

      const repairBtn = upgradeContainer.querySelector('.repair-btn');
      const upgradeBtn = upgradeContainer.querySelector('.upgrade-btn');

      if (repairBtn) {
        repairBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(repairBtn.dataset.index);
          const repairCost = 25;

          if (gameState.resources.materials >= repairCost) {
            const currentHealth = gameState.gridHealth[index];
            const maxHealth = gameState.gridMaxHealth[index];
            const repairAmount = Math.min(25, maxHealth - currentHealth);

            if (repairAmount > 0) {
              gameState.resources.materials -= repairCost;
              gameState.gridHealth[index] = Math.min(maxHealth, currentHealth + repairAmount);
              updateResourceDisplay();
              addUpgradeButtons();
              updatePowerupGrid();
              saveGame();
            } else {
              alert('Cell is already at full health!');
            }
          } else {
            alert(`Not enough materials! Need ${repairCost} materials to repair.`);
          }
        });
      }

      if (upgradeBtn) {
        upgradeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(upgradeBtn.dataset.index);
          const upgradeCost = 50;

          if (gameState.resources.materials >= upgradeCost) {
            gameState.resources.materials -= upgradeCost;
            gameState.gridMaxHealth[index] += 25;
            gameState.gridHealth[index] += 25;
            updateResourceDisplay();
            addUpgradeButtons();
            updatePowerupGrid();
            saveGame();
          } else {
            alert(`Not enough materials! Need ${upgradeCost} materials to upgrade.`);
          }
        });
      }

      cell.appendChild(upgradeContainer);
    }
  }
}

function makeAdjacentCellsAvailable(index) {
  const row = Math.floor(index / 5);
  const col = index % 5;
  const adjacentPositions = [
    [row-1, col], // up
    [row+1, col], // down
    [row, col-1], // left
    [row, col+1]  // right
  ];

  adjacentPositions.forEach(([r, c]) => {
    if (r >= 0 && r < 5 && c >= 0 && c < 5) {
      const adjacentIndex = r * 5 + c;
      const cell = document.querySelector(`.powerup-cell[data-index="${adjacentIndex}"]`);
      if (cell && !cell.classList.contains('unlocked')) {
        cell.classList.add('available');
      }
    }
  });

  addUpgradeButtons();
}

function initializePowerupGrid() {
  const grid = document.querySelector('.powerup-grid');
  if (!grid) return;

  if (!gameState.gridHealth) {
    gameState.gridHealth = Array(25).fill(100);
  }

  if (!gameState.gridMaxHealth) {
    gameState.gridMaxHealth = Array(25).fill(100);
  }

  if (!gameState.baseSettings) {
    gameState.baseSettings = {
      coreHealth: 100,
      maxCoreHealth: 100,
      outermostDamage: 10,
      outermostStartingHealth: 100
    };
  }

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'powerup-cell';
    cell.dataset.index = i;

    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'health-fill';
    healthFill.style.width = `${gameState.gridHealth[i]}%`;
    healthBar.appendChild(healthFill);
    cell.appendChild(healthBar);

    if (i === 12) {
      cell.classList.add('center', 'unlocked');
      cell.innerHTML = `
        <div class="core-label">Core</div>
        <div class="core-health">HP: ${gameState.baseSettings.coreHealth}/${gameState.baseSettings.maxCoreHealth}</div>
      `;

      healthFill.style.width = `${(gameState.baseSettings.coreHealth / gameState.baseSettings.maxCoreHealth) * 100}%`;
    } else {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const centerRow = 2;
      const centerCol = 2;
      const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);

      const cost = Math.floor(100 * Math.pow(2, distance - 1));
      cell.dataset.cost = cost;

      const isOutermost = row === 0 || row === 4 || col === 0 || col === 4;
      if (isOutermost) {
        cell.classList.add('outermost');
        if (gameState.gridHealth[i] === 100) {
          gameState.gridHealth[i] = gameState.baseSettings.outermostStartingHealth;
        }
      }

      if (distance === 1) {
        cell.classList.add('available');
      }
    }

    cell.addEventListener('click', () => {
      if (!cell.classList.contains('available')) return;

      const cost = parseInt(cell.dataset.cost);
      if (gameState.resources.materials >= cost) {
        gameState.resources.materials -= cost;
        cell.classList.remove('available');
        cell.classList.add('unlocked');

        makeAdjacentCellsAvailable(i);

        updateResourceDisplay();
        saveGame();
      } else {
        alert(`Not enough materials! Need ${cost} materials.`);
      }
    });

    cell.addEventListener('mouseover', () => {
      if (cell.classList.contains('available')) {
        const costDisplay = document.querySelector('.cost-display');
        costDisplay.textContent = `Cost: ${cell.dataset.cost} Materials`;
      }
    });

    grid.appendChild(cell);
  }

  addUpgradeButtons();
}

function displayAvailablePacks() {
  const packGrid = document.querySelector('#packs .pack-grid');
  if (!packGrid) return;

  packGrid.innerHTML = '';

  const classicPack = document.createElement('div');
  classicPack.className = 'pack';
  classicPack.innerHTML = `
    <h3>Classic Pack</h3>
    <p>The original survivor pack set</p>
    <p class="pack-cost">10 Scraps</p>
  `;

  classicPack.addEventListener('click', () => {
    try {
      const cards = openPack();
      showPackResults(cards, 'Classic Pack');
    } catch (error) {
      alert(error.message);
    }
  });

  packGrid.appendChild(classicPack);

  if (gameState.importedExpansions && gameState.importedExpansions.length > 0) {
    gameState.importedExpansions.forEach(expansion => {
      const expansionPack = document.createElement('div');
      expansionPack.className = 'pack expansion-pack';
      expansionPack.innerHTML = `
        <h3>${expansion.name} Pack</h3>
        <p>${expansion.description || 'Expansion pack content'}</p>
        <p class="pack-cost">10 Scraps</p>
        <p class="expansion-version">v${expansion.version}</p>
      `;

      expansionPack.addEventListener('click', () => {
        try {
          if (window.CARD_SETS) {
            const expansionSetNames = Object.keys(window.CARD_SETS);
            const setName = expansionSetNames.find(name => name.includes(expansion.name.toLowerCase().replace(/\s+/g, '_'))) || expansionSetNames[0];

            if (setName) {
              const cards = openPack(3, setName);
              showPackResults(cards, `${expansion.name} Pack`);
            } else {
              alert('Expansion pack data not found. Try re-importing the expansion.');
            }
          } else {
            alert('No expansion packs are currently loaded.');
          }
        } catch (error) {
          alert(error.message);
        }
      });

      packGrid.appendChild(expansionPack);
    });
  }
}

function showPackResults(cards, packName) {
  const modalDiv = document.createElement('div');
  modalDiv.className = 'card-details-modal';

  modalDiv.innerHTML = `
    <div class="modal-content pack-results">
      <h3>${packName} Opening Results</h3>
      <div class="pull-results">
        ${cards.map(card => `
          <div class="pulled-card" style="border-color: ${card.color}">
            ${createCardHTML(card)}
          </div>
        `).join('')}
      </div>
      <div class="modal-buttons">
        <button class="open-another-pack" ${gameState.resources.scraps < 10 ? 'disabled' : ''}>Open Another Pack (10 Scraps)</button>
        <button class="close-modal">Continue</button>
      </div>
    </div>
  `;

  const openAnotherBtn = modalDiv.querySelector('.open-another-pack');
  if (openAnotherBtn) {
    openAnotherBtn.addEventListener('click', () => {
      try {
        if (gameState.resources.scraps < 10) {
          alert('Not enough scraps to open pack');
          return;
        }

        let setName = 'classic';
        if (packName !== 'Classic Pack') {
          const expansionName = packName.replace(' Pack', '');
          if (window.CARD_SETS) {
            const expansionSetNames = Object.keys(window.CARD_SETS);
            setName = expansionSetNames.find(name => name.includes(expansionName.toLowerCase().replace(/\s+/g, '_'))) || expansionSetNames[0] || 'classic';
          }
        }

        const newCards = openPack(3, setName);

        const pullResults = modalDiv.querySelector('.pull-results');
        if (pullResults) {
          pullResults.innerHTML = newCards.map(card => `
            <div class="pulled-card" style="border-color: ${card.color}">
              ${createCardHTML(card)}
            </div>
          `).join('');
        }

        openAnotherBtn.disabled = gameState.resources.scraps < 10;

        updateResourceDisplay();
        displayCollection();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  document.body.appendChild(modalDiv);

  const closeButton = modalDiv.querySelector('.close-modal');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalDiv);
  });

  modalDiv.addEventListener('click', (e) => {
    if (e.target === modalDiv) {
      document.body.removeChild(modalDiv);
    }
  });

  updateResourceDisplay();
  displayCollection();
}

// DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
  const depletionTimers = startResourceDepletion();

  const healAllBtn = document.getElementById('healAllBtn');
  if (healAllBtn) {
    healAllBtn.addEventListener('click', healAllSurvivors);
  }

  if (!localStorage.getItem('survivorPacksGame')) {
    saveGame();
  }

  const saved = localStorage.getItem('survivorPacksGame');
  if (saved) {
    try {
      const savedData = JSON.parse(saved);
      Object.assign(gameState, savedData);

      if (!gameState.settings.fontSize) gameState.settings.fontSize = 16;
      if (!gameState.settings.fontFamily) gameState.settings.fontFamily = 'Segoe UI';
      if (gameState.settings.musicEnabled === undefined) gameState.settings.musicEnabled = true;
      if (!gameState.settings.musicVolume || isNaN(gameState.settings.musicVolume)) gameState.settings.musicVolume = 50;

      if (gameState.importedExpansions && gameState.importedExpansions.length > 0) {
        if (!window.CARD_SETS) {
          window.CARD_SETS = {};
        }
        
        gameState.importedExpansions.forEach(expansion => {
          if (expansion.cardSets) {
            Object.keys(expansion.cardSets).forEach(setName => {
              window.CARD_SETS[setName] = expansion.cardSets[setName];
            });
          }
        });
      }

      updateResourceDisplay();
      applySettings();
      displayCollection();
    } catch (error) {
      console.error('Error loading save data:', error);
      Object.assign(gameState, defaultGameState);
      saveGame();
    }
  }

  // Initialize tabs
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const contentId = tab.getAttribute('data-tab');
      document.getElementById(contentId).classList.add('active');
    });
  });

  // Initialize card subtabs
  const cardSubtabs = document.querySelectorAll('.subtab-btn');
  const subtabContents = document.querySelectorAll('.subtab-content');

  cardSubtabs.forEach(subtab => {
    subtab.addEventListener('click', () => {
      cardSubtabs.forEach(t => t.classList.remove('active'));
      subtabContents.forEach(c => c.classList.remove('active'));

      subtab.classList.add('active');
      const subtabId = subtab.getAttribute('data-subtab');
      document.getElementById(subtabId).classList.add('active');
    });
  });

  // Initialize audio
  const musicToggle = document.getElementById('musicToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');

  if (!gameState.settings.musicVolume || isNaN(gameState.settings.musicVolume)) {
    gameState.settings.musicVolume = 50;
  }

  if (musicToggle) {
    musicToggle.checked = gameState.settings.musicEnabled;
  }

  if (volumeSlider && volumeValue) {
    volumeSlider.value = gameState.settings.musicVolume;
    volumeValue.textContent = `${gameState.settings.musicVolume}%`;

    const initialVolume = Math.max(0, Math.min(100, gameState.settings.musicVolume)) / 100;
    backgroundMusic.volume = initialVolume;
  }

  if (gameState.settings.musicEnabled) {
    backgroundMusic.play().catch(e => console.log('Audio playback failed:', e));
  }

  if (musicToggle) {
    musicToggle.addEventListener('change', () => {
      gameState.settings.musicEnabled = musicToggle.checked;
      if (musicToggle.checked) {
        backgroundMusic.play().catch(e => console.log('Audio playback failed:', e));
      } else {
        backgroundMusic.pause();
      }
      saveGame();
    });
  }

  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', () => {
      const volume = parseInt(volumeSlider.value);
      if (!isNaN(volume) && volume >= 0 && volume <= 100) {
        gameState.settings.musicVolume = volume;
        backgroundMusic.volume = volume / 100;
        volumeValue.textContent = `${volume}%`;
        saveGame();
      }
    });
  }

  // Initialize settings handlers
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const fontSelect = document.getElementById('fontSelect');
  const exportSave = document.getElementById('exportSave');
  const importSave = document.getElementById('importSave');
  const importInput = document.getElementById('importInput');
  const importExpansion = document.getElementById('importExpansion');
  const expansionInput = document.getElementById('expansionInput');
  const resetExpansions = document.getElementById('resetExpansions');
  const resetGame = document.getElementById('resetGame');

  if (fontSizeSlider && fontSizeValue) {
    fontSizeSlider.value = gameState.settings.fontSize;
    fontSizeValue.textContent = `${gameState.settings.fontSize}px`;

    fontSizeSlider.addEventListener('input', (e) => {
      const newSize = parseInt(e.target.value);
      if (!isNaN(newSize) && newSize >= 12 && newSize <= 24) {
        gameState.settings.fontSize = newSize;
        fontSizeValue.textContent = `${newSize}px`;
        document.body.style.fontSize = `${newSize}px`;
        saveGame();
      }
    });
  }

  if (fontSelect) {
    fontSelect.value = gameState.settings.fontFamily;
    fontSelect.addEventListener('change', (e) => {
      gameState.settings.fontFamily = e.target.value;
      document.body.style.fontFamily = e.target.value;
      saveGame();
    });
  }

  exportSave?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(gameState)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survivorpacks-save.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  importSave?.addEventListener('click', () => {
    importInput?.click();
  });

  resetExpansions?.addEventListener('click', () => {
    resetAllExpansions();
  });

  resetGame?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game? This cannot be undone!')) {
      Object.assign(gameState, defaultGameState);
      saveGame();
      updateResourceDisplay();
      displayCollection();
      alert('Game has been reset!');
    }
  });

  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          Object.assign(gameState, imported);
          updateResourceDisplay();
          applySettings();
          saveGame();
          alert('Save imported successfully!');
        } catch (err) {
          alert('Error importing save file!');
        }
      };
      reader.readAsText(file);
    }
  });

  importExpansion?.addEventListener('click', () => {
    expansionInput?.click();
  });

  expansionInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const expansion = JSON.parse(e.target.result);
          importExpansionPack(expansion);
          alert(`Expansion "${expansion.name}" imported successfully!`);
        } catch (err) {
          alert('Error importing expansion pack! Please check the file format.');
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  });

  // Check for URL parameters to open specific tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');

  if (tabParam && document.querySelector(`[data-tab="${tabParam}"]`)) {
    const targetTab = document.querySelector(`[data-tab="${tabParam}"]`);
    targetTab.click();
  } else {
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) firstTab.click();
  }

  const firstCardSubtab = document.querySelector('.subtab-btn');
  if (firstCardSubtab) firstCardSubtab.click();

  initializePowerupGrid();
  updatePowerupGrid();
  displayImportedExpansions();
  displayAvailablePacks();
});
