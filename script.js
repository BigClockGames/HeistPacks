import { openPack as openPackOriginal, RARITY_CONFIG } from './js/packs.js';

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
  }
};

// Create and configure audio element
const backgroundMusic = new Audio('Untitled.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // Set default volume to 50%
backgroundMusic.autoplay = true;

// Add event listener for user interaction
document.addEventListener('click', () => {
  if (gameState.settings.musicEnabled) {
    backgroundMusic.play().catch(e => console.log('Audio playback failed:', e));
  }
}, { once: true });

export const gameState = { ...defaultGameState };

export function saveGame() {
  localStorage.setItem('survivorPacksGame', JSON.stringify(gameState));
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
    cardSets: expansion.cardSets // Save the full card data
  });

  // Merge card sets from expansion into existing CARD_SETS
  Object.keys(expansion.cardSets).forEach(setName => {
    const expansionSet = expansion.cardSets[setName];

    // Create new set or merge with existing
    if (!window.CARD_SETS) {
      window.CARD_SETS = {};
    }

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
  displayCollection(); // Refresh display
  displayImportedExpansions(); // Update expansion list
  displayAvailablePacks(); // Update packs display
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
    // Clear imported expansions
    gameState.importedExpansions = [];

    // Clear expansion card sets from global CARD_SETS
    if (window.CARD_SETS) {
      // Keep only the classic set if it exists
      const classicSet = window.CARD_SETS.classic;
      window.CARD_SETS = classicSet ? { classic: classicSet } : {};
    }

    // Remove expansion cards from collection
    gameState.collection = gameState.collection.filter(card => {
      // Keep cards that are from the original game (not from expansions)
      // This is a simple check - you might need to adjust based on your card identification system
      return !card.isExpansionCard;
    });

    saveGame();
    displayImportedExpansions(); // Update expansion display
    displayAvailablePacks(); // Update packs display
    displayCollection(); // Update collection display
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
            // Remove dead survivor from collection
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
        } else if (card.category === 'items') {
          // Use item immediately without showing modal
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
        } else if (card.category === 'locations') {
          // Get unique available survivors by name
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

          // Handle survivor selection
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

              // Calculate total EP directly from selected cards
              totalEP = Array.from(document.querySelectorAll('.survivor-card.selected')).reduce((sum, card) => {
                const epText = Array.from(card.querySelectorAll('p')).find(p => p.textContent.includes('EP: ')).textContent;
                const ep = parseInt(epText.split('EP: ')[1], 10);
                return sum + ep;
              }, 0);

              // Update EP display and expedition button
              const totalEpDisplay = document.getElementById('total-ep');
              const startExpeditionBtn = document.getElementById('start-expedition');

              totalEpDisplay.textContent = totalEP;
              startExpeditionBtn.disabled = totalEP < parseInt(card.requirements.ep);
              console.log('EP Check:', { totalEP, required: card.requirements.ep, isDisabled: startExpeditionBtn.disabled });
            });
          });

          // Handle expedition start
          const startExpeditionBtn = document.getElementById('start-expedition');
          startExpeditionBtn.addEventListener('click', () => {
            // Define base HP loss by survivor rarity
            const baseHpLoss = {
              common: 60,
              rare: 40,
              epic: 30,
              legendary: 20,
              mythic: 10,
              unique: 5
            };

            // Define location difficulty multiplier
            const locationMultiplier = {
              common: 1,
              rare: 1.5,
              epic: 2,
              legendary: 2.5,
              mythic: 3,
              unique: 4
            };

            // Process HP loss for selected survivors
            const survivorResults = [];
            let hpLossApplied = false;

            Array.from(selectedSurvivors).forEach(survivorId => {
              console.log("Processing survivor:", survivorId);
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
                console.log('HP Loss calculation:', { 
                  survivor: survivorData.name,
                  rarity: survivorData.rarity,
                  baseLoss,
                  multiplier,
                  totalLoss,
                  originalHealth,
                  newHealth: survivorData.stats.health
                });

                survivorResults.push({
                  name: survivorData.name,
                  rarity: survivorData.rarity,
                  loss: totalLoss,
                  remainingHealth: survivorData.stats.health
                });
              }
            });

            // Verify HP loss was applied before giving rewards
            if (!hpLossApplied) {
              throw new Error('Expedition failed - no valid HP loss recorded');
            }

            // Add rewards to resources
            Object.entries(card.rewards).forEach(([resource, amount]) => {
              gameState.resources[resource] += amount;
            });

            // Remove the used location card from collection
            const cardIndex = gameState.collection.findIndex(c => 
              c.name === card.name && c.category === card.category && c.rarity === card.rarity
            );
            if (cardIndex > -1) {
              gameState.collection.splice(cardIndex, 1);
              saveGame();
              displayCollection(); // Update the UI to reflect the removed card
            }

            // Create and show results modal with survivor health changes
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

            // Handle closing of results modal
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
      });

      container.appendChild(cardElement);
    });
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
  // Apply font settings to body
  document.body.style.fontSize = `${gameState.settings.fontSize}px`;
  document.body.style.fontFamily = gameState.settings.fontFamily;

  // Update UI elements to reflect current settings
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

// Resource depletion timer
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

  // Countdown timer that updates every second for display
  const countdownTimer = setInterval(() => {
    const survivors = gameState.collection.filter(card => card.category === 'survivors');
    const survivorCount = survivors.length;
    secondsLeft--;

    // Only update the timer display
    updateTimer(secondsLeft, survivorCount);

    // Reset countdown when it reaches 0
    if (secondsLeft <= 0) {
      secondsLeft = 60;
    }
  }, 1000);

  // Game update timer that runs every 60 seconds
  const gameUpdateTimer = setInterval(() => {
    const survivors = gameState.collection.filter(card => card.category === 'survivors');
    const survivorCount = survivors.length;

    if (survivorCount > 0) {
      gameState.resources.food = Math.max(0, gameState.resources.food - survivorCount);
      gameState.resources.water = Math.max(0, gameState.resources.water - survivorCount);

      // Only apply health loss if both food and water are at 0
      if (gameState.resources.food === 0 && gameState.resources.water === 0) {
        survivors.forEach(survivor => {
          survivor.stats.health = Math.max(0, survivor.stats.health - healthLoss[survivor.rarity]);
        });
      }

      // Apply damage to outermost base grid squares
      applyBaseDamage();

      updateResourceDisplay();
      displayCollection(); // Update UI to show new health values
      updatePowerupGrid(); // Update base grid to show new health values
      saveGame();
    }
  }, 60000); // 60 seconds = 60000ms

  return { countdownTimer, gameUpdateTimer };
}

function applyBaseDamage() {
  // Apply damage to only owned outermost grid squares
  for (let i = 0; i < 25; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const isOutermost = row === 0 || row === 4 || col === 0 || col === 4;
    const cell = document.querySelector(`.powerup-cell[data-index="${i}"]`);
    const isOwned = cell && (cell.classList.contains('unlocked') || cell.classList.contains('center'));

    if (isOutermost && isOwned) {
      gameState.gridHealth[i] = Math.max(0, gameState.gridHealth[i] - gameState.baseSettings.outermostDamage);

      // If an outermost cell reaches 0 health, damage the core
      if (gameState.gridHealth[i] === 0) {
        gameState.baseSettings.coreHealth = Math.max(0, gameState.baseSettings.coreHealth - 5);
      }
    }
  }
}

function updatePowerupGrid() {
  // Update all cell health bars
  for (let i = 0; i < 25; i++) {
    const cell = document.querySelector(`.powerup-cell[data-index="${i}"]`);
    if (cell) {
      const healthFill = cell.querySelector('.health-fill');
      if (healthFill) {
        if (i === 12) {
          // Update core health display
          const coreHealthPercent = (gameState.baseSettings.coreHealth / gameState.baseSettings.maxCoreHealth) * 100;
          healthFill.style.width = `${coreHealthPercent}%`;

          const coreHealthDisplay = cell.querySelector('.core-health');
          if (coreHealthDisplay) {
            coreHealthDisplay.textContent = `HP: ${gameState.baseSettings.coreHealth}/${gameState.baseSettings.maxCoreHealth}`;
          }
        } else {
          // Update regular cell health
          healthFill.style.width = `${gameState.gridHealth[i]}%`;
        }
      }
    }
  }
}

function healAllSurvivors() {
  // Only get living survivors (health > 0)
  const survivors = gameState.collection.filter(card => card.category === 'survivors' && card.stats.health > 0);
  let totalMedsNeeded = 0;

  // Calculate total meds needed for living survivors only
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

  // Heal all living survivors
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
  alert(`Healed all survivors using ${totalMedsNeeded} meds!`);
}

// Define global functions before DOMContentLoaded
window.addUpgradeButtons = function() {
  for (let i = 0; i < 25; i++) {
    const cell = document.querySelector(`.powerup-cell[data-index="${i}"]`);
    if (cell && (cell.classList.contains('unlocked') || cell.classList.contains('center'))) {
        // Remove existing upgrade container if it exists
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

        // Add event listeners for repair and upgrade buttons
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
                window.addUpgradeButtons(); // Refresh buttons
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
              gameState.gridHealth[index] += 25; // Also increase current health
              updateResourceDisplay();
              window.addUpgradeButtons(); // Refresh buttons
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
};

window.makeAdjacentCellsAvailable = function(index) {
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

  // Add upgrade buttons to the newly unlocked cell
  window.addUpgradeButtons();
};

document.addEventListener('DOMContentLoaded', () => {
  // Start resource depletion timer
  const depletionTimers = startResourceDepletion();

  // Initialize Heal All button
  const healAllBtn = document.getElementById('healAllBtn');
  if (healAllBtn) {
    healAllBtn.addEventListener('click', healAllSurvivors);
  }

  // Initialize game
  if (!localStorage.getItem('survivorPacksGame')) {
    saveGame();
  }

  const saved = localStorage.getItem('survivorPacksGame');
  if (saved) {
    try {
      const savedData = JSON.parse(saved);
      Object.assign(gameState, savedData);

      // Ensure all required settings exist with defaults
      if (!gameState.settings.fontSize) gameState.settings.fontSize = 16;
      if (!gameState.settings.fontFamily) gameState.settings.fontFamily = 'Segoe UI';
      if (gameState.settings.musicEnabled === undefined) gameState.settings.musicEnabled = true;
      if (!gameState.settings.musicVolume || isNaN(gameState.settings.musicVolume)) gameState.settings.musicVolume = 50;

      // Restore expansion card sets to global CARD_SETS
      if (gameState.importedExpansions && gameState.importedExpansions.length > 0) {
        if (!window.CARD_SETS) {
          window.CARD_SETS = {};
        }
        
        // Re-import each expansion's card data
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
      // Reset to defaults if save is corrupted
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

  // Pack opening is now handled by displayAvailablePacks()

  // Initialize audio
  const musicToggle = document.getElementById('musicToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');

  // Ensure valid volume value
  if (!gameState.settings.musicVolume || isNaN(gameState.settings.musicVolume)) {
    gameState.settings.musicVolume = 50;
  }

  // Set initial audio states
  if (musicToggle) {
    musicToggle.checked = gameState.settings.musicEnabled;
  }

  if (volumeSlider && volumeValue) {
    volumeSlider.value = gameState.settings.musicVolume;
    volumeValue.textContent = `${gameState.settings.musicVolume}%`;

    // Set initial volume safely
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

  // Update font size display and apply settings
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

  

  // Initialize powerup grid function (moved outside DOMContentLoaded)
function initializePowerupGrid() {
  const grid = document.querySelector('.powerup-grid');
  if (!grid) return;

    // Add health property to gameState if it doesn't exist
    if (!gameState.gridHealth) {
      gameState.gridHealth = Array(25).fill(100);
    }

    // Add max health property to gameState if it doesn't exist
    if (!gameState.gridMaxHealth) {
      gameState.gridMaxHealth = Array(25).fill(100);
    }

    // Add core health and damage settings to gameState if they don't exist
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

      // Create health bar
      const healthBar = document.createElement('div');
      healthBar.className = 'health-bar';
      const healthFill = document.createElement('div');
      healthFill.className = 'health-fill';
      healthFill.style.width = `${gameState.gridHealth[i]}%`;
      healthBar.appendChild(healthFill);
      cell.appendChild(healthBar);

      // Center cell (index 12) is special - the Core
      if (i === 12) {
        cell.classList.add('center', 'unlocked');
        cell.innerHTML = `
          <div class="core-label">Core</div>
          <div class="core-health">HP: ${gameState.baseSettings.coreHealth}/${gameState.baseSettings.maxCoreHealth}</div>
        `;

        // Update health bar for core
        healthFill.style.width = `${(gameState.baseSettings.coreHealth / gameState.baseSettings.maxCoreHealth) * 100}%`;
      } else {
        // Calculate Manhattan distance from center
        const row = Math.floor(i / 5);
        const col = i % 5;
        const centerRow = 2;
        const centerCol = 2;
        const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);

        // Calculate cost based on distance
        const cost = Math.floor(100 * Math.pow(2, distance - 1));
        cell.dataset.cost = cost;

        // Check if this is an outermost cell (on the edge of the grid)
        const isOutermost = row === 0 || row === 4 || col === 0 || col === 4;
        if (isOutermost) {
          cell.classList.add('outermost');
          // Set outermost cells to starting health if not already set
          if (gameState.gridHealth[i] === 100) {
            gameState.gridHealth[i] = gameState.baseSettings.outermostStartingHealth;
          }
        }

        // Make adjacent cells to unlocked ones available
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

          // Make adjacent cells available
          window.makeAdjacentCellsAvailable(i);

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

    // Add upgrade buttons to unlocked cells after all cells are created
  window.addUpgradeButtons();
}

  // Check for URL parameters to open specific tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');

  if (tabParam && document.querySelector(`[data-tab="${tabParam}"]`)) {
    // Open the specified tab
    const targetTab = document.querySelector(`[data-tab="${tabParam}"]`);
    targetTab.click();
  } else {
    // Initialize first tab and subtab
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) firstTab.click();
  }

  const firstCardSubtab = document.querySelector('.subtab-btn');
  if (firstCardSubtab) firstCardSubtab.click();

  // Initialize powerup grid
  initializePowerupGrid();

  // Update powerup grid display
  updatePowerupGrid();

  // Display imported expansions
  displayImportedExpansions();

  // Display available packs
  displayAvailablePacks();
});

function displayAvailablePacks() {
  const packGrid = document.querySelector('#packs .pack-grid');
  if (!packGrid) return;

  // Clear existing content
  packGrid.innerHTML = '';

  // Add classic pack
  const classicPack = document.createElement('div');
  classicPack.className = 'pack';
  classicPack.innerHTML = `
    <h3>Classic Pack</h3>
    <p>The original survivor pack set</p>
    <p class="pack-cost">10 Scraps</p>
  `;

  classicPack.addEventListener('click', () => {
    try {
      const cards = openPackOriginal();
      showPackResults(cards, 'Classic Pack');
    } catch (error) {
      alert(error.message);
    }
  });

  packGrid.appendChild(classicPack);

  // Add imported expansion packs
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
          // Get the expansion set name (first key in cardSets)
          const expansionData = JSON.parse(localStorage.getItem('survivorPacksGame')) || {};
          if (window.CARD_SETS) {
            const expansionSetNames = Object.keys(window.CARD_SETS);
            const setName = expansionSetNames.find(name => name.includes(expansion.name.toLowerCase().replace(/\s+/g, '_'))) || expansionSetNames[0];

            if (setName) {
              const cards = openPackOriginal(3, setName);
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

        // Determine which pack type to open based on pack name
        let setName = 'classic';
        if (packName !== 'Classic Pack') {
          const expansionName = packName.replace(' Pack', '');
          if (window.CARD_SETS) {
            const expansionSetNames = Object.keys(window.CARD_SETS);
            setName = expansionSetNames.find(name => name.includes(expansionName.toLowerCase().replace(/\s+/g, '_'))) || expansionSetNames[0] || 'classic';
          }
        }

        const newCards = openPackOriginal(3, setName);

        // Update the cards display in the current modal
        const pullResults = modalDiv.querySelector('.pull-results');
        if (pullResults) {
          pullResults.innerHTML = newCards.map(card => `
            <div class="pulled-card" style="border-color: ${card.color}">
              ${createCardHTML(card)}
            </div>
          `).join('');
        }

        // Update the Open Another Pack button state
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

function initializeGame() {
  const survivors = [
    { name: 'Sarah Chen', occupation: 'Doctor', stats: { health: 100, str: 40, dex: 60, int: 80, ep: 5 }, rarity: 'common' },
    { name: 'Jackson Williams', occupation: 'Engineer', stats: { health: 100, str: 70, dex: 50, int: 60, ep: 6 }, rarity: 'common' },
    { name: 'Emily Davis', occupation: 'Teacher', stats: { health: 100, str: 50, dex: 70, int: 70, ep: 7 }, rarity: 'common' },
    { name: 'David Rodriguez', occupation: 'Farmer', stats: { health: 100, str: 80, dex: 40, int: 50, ep: 5 }, rarity: 'common' },
    { name: 'Olivia Brown', occupation: 'Nurse', stats: { health: 100, str: 45, dex: 65, int: 85, ep: 8 }, rarity: 'rare' },
    { name: 'Ethan Garcia', occupation: 'Electrician', stats: { health: 100, str: 75, dex: 55, int: 65, ep: 7 }, rarity: 'rare' },
    { name: 'Sophia Martinez', occupation: 'Librarian', stats: { health: 100, str: 55, dex: 75, int: 75, ep: 9 }, rarity: 'rare' },
    { name: 'Noah Anderson', occupation: 'Construction Worker', stats: { health: 100, str: 85, dex: 45, int: 55, ep: 6 }, rarity: 'rare' },
    { name: 'Isabella Thomas', occupation: 'Paramedic', stats: { health: 100, str: 50, dex: 70, int: 90, ep: 10 }, rarity: 'epic' },
    { name: 'Liam Jackson', occupation: 'Mechanic', stats: { health: 100, str: 80, dex: 50, int: 60, ep: 8 }, rarity: 'epic' },
    { name: 'Mia White', occupation: 'Journalist', stats: { health: 100, str: 60, dex: 80, int: 80, ep: 10 }, rarity: 'epic' },
    { name: 'Aiden Harris', occupation: 'Security Guard', stats: { health: 100, str: 90, dex: 50, int: 60, ep: 7 }, rarity: 'epic' },
    { name: 'Abigail Martin', occupation: 'Scientist', stats: { health: 100, str: 55, dex: 75, int: 95, ep: 12 }, rarity: 'legendary' },
    { name: 'Carter Thompson', occupation: 'Detective', stats: { health: 100, str: 85, dex: 65, int: 75, ep: 10 }, rarity: 'legendary' },
    { name: 'Chloe Garcia', occupation: 'Chef', stats: { health: 100, str: 65, dex: 85, int: 85, ep: 12 }, rarity: 'legendary' },
    { name: 'JamesWilson', occupation: 'Firefighter', stats: { health: 100, str: 95, dex: 55, int: 65, ep: 9 }, rarity: 'legendary' },
    { name: 'Madison Moore', occupation: 'Astronaut', stats: { health: 100, str: 60, dex: 80, int: 100, ep: 15 }, rarity: 'mythic' },
    { name: 'Lucas Taylor', occupation: 'Pilot', stats: { health: 100, str: 90, dex: 70, int: 80, ep: 13 }, rarity: 'mythic' },
    { name: 'Ella Anderson', occupation: 'President', stats: { health: 100, str: 70, dex: 90, int: 90, ep: 15 }, rarity: 'mythic' },
    { name: 'Owen Wright', occupation: 'General', stats: { health: 100, str: 100, dex: 60, int: 70, ep: 12 }, rarity: 'mythic' },
    { name: 'Scarlett Green', occupation: 'God', stats: { health: 100, str: 100, dex: 100, int: 100, ep: 20 }, rarity: 'unique' },
  ];

  const items = [
    { name: 'First Aid Kit', resourceType: 'meds', resourceValue: 10, rarity: 'common' },
    { name: 'Canned Food', resourceType: 'food', resourceValue: 10, rarity: 'common' },
    { name: 'Bottled Water', resourceType: 'water', resourceValue: 10, rarity: 'common' },
    { name: 'Scrap Metal', resourceType: 'scraps', resourceValue: 10, rarity: 'common' },
    { name: 'Medical Supplies', resourceType: 'meds', resourceValue: 25, rarity: 'rare' },
    { name: 'Survival Ration', resourceType: 'food', resourceValue: 25, rarity: 'rare' },
    { name: 'Purified Water', resourceType: 'water', resourceValue: 25, rarity: 'rare' },
    { name: 'Tool Set', resourceType: 'scraps', resourceValue: 25, rarity: 'rare' },
    { name: 'Advanced Medkit', resourceType: 'meds', resourceValue: 50, rarity: 'epic' },
    { name: 'Emergency Food', resourceType: 'food', resourceValue: 50, rarity: 'epic' },
    { name: 'Water Filter', resourceType: 'water', resourceValue: 50, rarity: 'epic' },
    { name: 'Material Cache', resourceType: 'materials', resourceValue: 50, rarity: 'epic' },
    { name: 'Miracle Drug', resourceType: 'meds', resourceValue: 100, rarity: 'legendary' },
    { name: 'Nutrient Paste', resourceType: 'food', resourceValue: 100, rarity: 'legendary' },
    { name: 'Endless Spring', resourceType: 'water', resourceValue: 100, rarity: 'legendary' },
    { name: 'Unobtanium', resourceType: 'materials', resourceValue: 100, rarity: 'legendary' },
  ];

  const locations = [
    { name: 'Abandoned Hospital', requirements: { ep: 15 }, rewards: { meds: 50, scraps: 25 }, rarity: 'common' },
    { name: 'Desolate Supermarket', requirements: { ep: 15 }, rewards: { food: 50, water: 25 }, rarity: 'common' },
    { name: 'Ruined Factory', requirements: { ep: 15 }, rewards: { scraps: 50, materials: 25 }, rarity: 'common' },
    { name: 'Hidden Clinic', requirements: { ep: 20 }, rewards: { meds: 75, scraps: 40 }, rarity: 'rare' },
    { name: 'Fortified Farm', requirements: { ep: 20 }, rewards: { food: 75, water: 40 }, rarity: 'rare' },
    { name: 'Secret Workshop', requirements: { ep: 20 }, rewards: { scraps: 75, materials: 40 }, rarity: 'rare' },
    { name: 'Underground Lab', requirements: { ep: 25 }, rewards: { meds: 100, scraps: 60, materials: 30 }, rarity: 'epic' },
    { name: 'Secluded Oasis', requirements: { ep: 25 }, rewards: { food: 60, water: 100, scraps: 30 }, rarity: 'epic' },
    { name: 'Government Bunker', requirements: { ep: 30 }, rewards: { meds: 125, food: 125, water: 125, scraps: 75, materials: 50 }, rarity: 'legendary' },
    { name: 'Atlantis', requirements: { ep: 35 }, rewards: { meds: 200, food: 200, water: 200, scraps: 100, materials: 100 }, rarity: 'mythic' },
  ];

  const pack = {
    unique: 0.1,
    mythic: 0.4,
    legendary: 1.5,
    epic: 5,
    rare: 13,
    common: 80
  };

  const weightedCategories = [];
  for (let i = 0; i < 60; i++) weightedCategories.push('survivors');
  for (let i = 0; i < 30; i++) weightedCategories.push('items');
  for (let i = 0; i < 10; i++) weightedCategories.push('locations');

  const pulled = [];

  for (let i = 0; i < 5; i++) {
    let rarityRoll = Math.random() * 100;
    let rarity;
    for (const [packRarity, threshold] of Object.entries(pack)) {
      if (rarityRoll <= threshold) {
        rarity = packRarity;
        break;
      }
      rarityRoll -= threshold;
    }

    const category = weightedCategories[Math.floor(Math.random() * weightedCategories.length)];

    let cardName;
    let card;
    switch (category) {
      case 'survivors':
        const weightedSurvivors = survivors.filter(survivor => survivor.rarity === rarity);
        cardName = weightedSurvivors[Math.floor(Math.random() * weightedSurvivors.length)].name;
        card = {
          id: generateUniqueId(),
          name: cardName,
          category,
          rarity,
          color: RARITY_CONFIG[rarity].color
        };
        Object.assign(card, survivors.find(survivor => survivor.name === cardName));
        break;
      case 'items':
        const weightedItems = items.filter(item => item.rarity === rarity);
        cardName = weightedItems[Math.floor(Math.random() * weightedItems.length)].name;
        card = {
          id: generateUniqueId(),
          name: cardName,
          category,
          rarity,
          color: RARITY_CONFIG[rarity].color
        };
        Object.assign(card, items.find(item => item.name === cardName));
        break;
      case 'locations':
        const weightedLocations = locations.filter(location => location.rarity === rarity);
        cardName = weightedLocations[Math.floor(Math.random() * weightedLocations.length)].name;
        card = {
          id: generateUniqueId(),
          name: cardName,
          category,
          rarity,
          color: RARITY_CONFIG[rarity].color
        };
        Object.assign(card, locations.find(location => location.name === cardName));
        break;
    }

    pulled.push(card);
  }

  gameState.resources.scraps = Math.max(0, gameState.resources.scraps - 10);
  return pulled;
}

const openPack = () => {
  return initializeGame();
};