/**
 * Dungeon Cell Class
 *
 * Represents a single cell in the dungeon matrix grid.
 * Each cell can contain a card (face-up or face-down) and has availability state.
 */

/**
 * A single cell in the dungeon grid
 */
export class Cell {
  /**
   * Create a new empty cell
   */
  constructor() {
    /** @type {Card|null} The card in this cell, or null if empty */
    this.card = null;
    /** @type {boolean} Whether the card is face-down (hidden) */
    this.cardFaceDown = false;
    /** @type {boolean} Whether this cell is available for player interaction */
    this.available = false;
  }
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.Cell = Cell;
}
