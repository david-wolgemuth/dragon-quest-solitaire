/**
 * Card Class
 *
 * Represents a single playing card with a suit and value.
 * Works in both browser and Node.js environments.
 */

/**
 * Playing card with suit and value
 */
export class Card {
  /**
   * Create a new card
   * @param {string} suitKey - The suit key (e.g., 'HEARTS', 'SPADES')
   * @param {string} valueKey - The value key (e.g., 'ACE', 'KING')
   */
  constructor(suitKey, valueKey) {
    this.suitKey = suitKey;
    this.valueKey = valueKey;
  }

  /**
   * Get the full suit object
   * @returns {{key: string, code: string, display: string, isColor?: boolean}}
   */
  get suit() {
    // In browser, window.SUITS is available
    // In Node, this will be undefined but that's OK for serialization
    return (typeof window !== 'undefined' && window.SUITS)
      ? window.SUITS[this.suitKey]
      : { key: this.suitKey };
  }

  /**
   * Get the full value object
   * @returns {{key: string, code: string, display: string, order?: number, isJoker?: boolean}}
   */
  get value() {
    return (typeof window !== 'undefined' && window.VALUES)
      ? window.VALUES[this.valueKey]
      : { key: this.valueKey };
  }
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.Card = Card;
}
