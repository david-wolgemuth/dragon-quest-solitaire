/**
 * Rules Modal
 *
 * Displays game rules and card reference in a modal overlay.
 * Features:
 * - Hash-based URL routing (#rules)
 * - Tab navigation between Overview and Card Reference
 * - HTML-formatted card descriptions
 * - Keyboard accessibility (ESC to close)
 */

import { DUNGEON_CARDS } from '../cards/dungeon-cards.js';
import { SPADES, CLUBS, BLACK } from '../cards/suits.js';
import { ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER } from '../cards/values.js';

/**
 * Initialize the rules modal system
 */
export function initRulesModal() {
  const modal = document.getElementById('rules-modal');
  const openButton = document.getElementById('open-rules');
  const closeButton = modal.querySelector('.rules-modal-close');
  const overlay = modal.querySelector('.rules-modal-overlay');

  // Populate card reference content
  populateCardReference();

  // Set up tab switching
  setupTabs();

  // Open modal when button is clicked
  openButton.addEventListener('click', () => {
    openModal();
  });

  // Close modal when close button is clicked
  closeButton.addEventListener('click', () => {
    closeModal();
  });

  // Close modal when overlay is clicked
  overlay.addEventListener('click', () => {
    closeModal();
  });

  // Close modal when ESC key is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('visible')) {
      closeModal();
    }
  });

  // Handle hash changes (for direct navigation to #rules)
  window.addEventListener('hashchange', handleHashChange);

  // Check initial hash on load
  handleHashChange();
}

/**
 * Open the rules modal
 */
function openModal() {
  const modal = document.getElementById('rules-modal');
  modal.classList.add('visible');

  // Update URL hash
  if (window.location.hash !== '#rules') {
    window.location.hash = 'rules';
  }

  // Focus on close button for accessibility
  const closeButton = modal.querySelector('.rules-modal-close');
  closeButton.focus();
}

/**
 * Close the rules modal
 */
function closeModal() {
  const modal = document.getElementById('rules-modal');
  modal.classList.remove('visible');

  // Remove hash from URL
  if (window.location.hash === '#rules') {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
}

/**
 * Handle hash changes (for direct navigation)
 */
function handleHashChange() {
  const modal = document.getElementById('rules-modal');

  if (window.location.hash === '#rules') {
    if (!modal.classList.contains('visible')) {
      modal.classList.add('visible');
      const closeButton = modal.querySelector('.rules-modal-close');
      closeButton.focus();
    }
  } else {
    if (modal.classList.contains('visible')) {
      modal.classList.remove('visible');
    }
  }
}

/**
 * Set up tab switching functionality
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.rules-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Remove active class from all tabs and sections
      document.querySelectorAll('.rules-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.rules-section').forEach(s => s.classList.remove('active'));

      // Add active class to clicked tab and corresponding section
      tab.classList.add('active');
      document.getElementById(`rules-${targetTab}`).classList.add('active');
    });
  });
}

/**
 * Populate the card reference section with all dungeon cards
 */
function populateCardReference() {
  const container = document.getElementById('card-reference-content');

  // Helper to get card display name
  const getValueName = (value) => {
    const names = {
      [ACE]: 'Ace',
      [TWO]: '2',
      [THREE]: '3',
      [FOUR]: '4',
      [FIVE]: '5',
      [SIX]: '6',
      [SEVEN]: '7',
      [EIGHT]: '8',
      [NINE]: '9',
      [TEN]: '10',
      [JACK]: 'Jack',
      [QUEEN]: 'Queen',
      [KING]: 'King',
      [JOKER]: 'Joker'
    };
    return names[value] || value;
  };

  const getSuitName = (suit) => {
    const names = {
      [SPADES]: 'Spades',
      [CLUBS]: 'Clubs',
      [BLACK]: 'Joker'
    };
    return names[suit] || suit;
  };

  // Build card reference HTML
  let html = '';

  // Spades cards
  html += '<div class="card-category">';
  html += '<h3>♠ Spades Cards</h3>';
  html += '<div class="card-list">';

  for (const [value, card] of Object.entries(DUNGEON_CARDS[SPADES])) {
    html += createCardItem(card, SPADES, value, getValueName, getSuitName);
  }

  html += '</div></div>';

  // Clubs cards (only unique ones, not copied from Spades)
  html += '<div class="card-category">';
  html += '<h3>♣ Clubs Cards</h3>';
  html += '<div class="card-list">';

  // Only show Clubs-specific cards (Ace, 2, 3, 4, 5, 6, Queen, King)
  const clubsUniqueValues = [ACE, TWO, THREE, FOUR, FIVE, SIX, QUEEN, KING];
  for (const value of clubsUniqueValues) {
    const card = DUNGEON_CARDS[CLUBS][value];
    if (card) {
      html += createCardItem(card, CLUBS, value, getValueName, getSuitName);
    }
  }

  html += '</div>';
  html += '<p><em>Note: Clubs 7-J (Gem, Healing, Treasure Chest, Slime, Skeleton) are identical to their Spades counterparts.</em></p>';
  html += '</div>';

  // Black Joker
  html += '<div class="card-category">';
  html += '<h3>🃏 Special Cards</h3>';
  html += '<div class="card-list">';

  const joker = DUNGEON_CARDS[BLACK][JOKER];
  if (joker) {
    html += createCardItem(joker, BLACK, JOKER, getValueName, getSuitName);
  }

  html += '</div></div>';

  container.innerHTML = html;
}

/**
 * Create HTML for a single card item
 */
function createCardItem(card, suit, value, getValueName, getSuitName) {
  const suitSymbols = {
    [SPADES]: '♠',
    [CLUBS]: '♣',
    [BLACK]: '🃏'
  };

  const suitName = getSuitName(suit);
  const valueName = getValueName(value);
  const suitSymbol = suitSymbols[suit] || '';

  // Use HTML description if available, otherwise fall back to plain text
  const description = card.descriptionHtml || `<p>${card.description}</p>`;

  return `
    <div class="card-item">
      <div class="card-item-header">
        <div class="card-item-name">${card.name}</div>
        <div class="card-item-suit">${suitSymbol} ${valueName} of ${suitName}</div>
      </div>
      <div class="card-item-description">
        ${description}
      </div>
    </div>
  `;
}

// Make globally available for browser
if (typeof window !== 'undefined') {
  window.initRulesModal = initRulesModal;
}
