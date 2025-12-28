/**
 * Card Utility Functions
 *
 * Helper functions for working with card collections and decks.
 */

import { Card } from '../cards/card.js';
import { SUITS, BLACK, RED, JOKER } from '../cards/suits.js';
import { VALUES } from '../cards/values.js';

/**
 * Build a pile of cards from key pairs
 * @param {Array<[string, string]>} keyPairs - Array of [suitKey, valueKey] tuples
 * @returns {Array<Card>} Array of Card instances
 */
export function buildPile(keyPairs) {
  return keyPairs.map(([suitKey, valueKey]) => new Card(suitKey, valueKey));
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @param {Function} [rng=Math.random] - Random number generator function
 * @returns {Array} New shuffled array (does not mutate original)
 */
export function shuffle(array, rng = Math.random) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate all cards in a standard deck (including Jokers)
 * @returns {Array<Card>} All possible cards
 */
export function allCards() {
  const cards = [];
  for (const suitKey of Object.keys(SUITS)) {
    for (const valueKey of Object.keys(VALUES)) {
      // Jokers only come in BLACK and RED suits
      if (valueKey === JOKER && suitKey !== BLACK && suitKey !== RED) {
        continue;
      }
      // Non-Jokers don't come in BLACK or RED suits
      if (valueKey !== JOKER && (suitKey === BLACK || suitKey === RED)) {
        continue;
      }
      cards.push(new Card(suitKey, valueKey));
    }
  }
  return cards;
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.buildPile = buildPile;
  window.shuffle = shuffle;
  window.allCards = allCards;
}
