import { describe, it, expect, beforeEach } from 'vitest';

// Import required modules (sets window globals)
import '../src/cards/suits.js';
import '../src/cards/values.js';
import '../src/cards/card.js';
import '../src/core/cell.js';
import '../src/core/game.js';
import '../src/core/game-renderer.js';

/**
 * Bug #AAJ - Young Dragon Critical Success Gives Wrong Amount
 *
 * Description says "gain 3 gems" but implementation only gives 1.
 * Location: dungeon-cards.js:162-170
 *
 * Expected: game.gainGem(this, 3) - gives 3 gems
 * Actual: game.gainGem(this) - gives 1 gem (default)
 */

// Mock the display layer to bypass UI interactions in tests
function setupTestGame() {
  const game = new window.Game();

  // Mock displayResolution to immediately execute the callback
  game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
    callback();
  };

  // Mock displayMessage to do nothing
  game.displayMessage = () => {};

  return game;
}

// Helper to place a specific card in the dungeon for testing
function placeCard(game, suitKey, valueKey, row = 1, col = 1) {
  // Ensure the grid is big enough
  while (game.dungeon.matrix.length <= row) {
    game.dungeon.matrix.push([]);
  }
  while (game.dungeon.matrix[row].length <= col) {
    game.dungeon.matrix[row].push(new window.Cell());
  }

  // Place the card
  const cell = game.dungeon.matrix[row][col];
  cell.card = new window.Card(suitKey, valueKey);
  cell.cardFaceDown = false;
  cell.available = true;
}

describe('Bug #AAJ - Young Dragon Critical Success', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    // Place Young Dragon (Queen of Clubs) in the dungeon
    placeCard(game, window.CLUBS, window.QUEEN, 1, 1);
  });

  it('should give 3 gems on critical success (fate 10)', () => {
    // Setup: Mock fate check to return critical success
    game.fateCheck = () => 10;

    // Track initial gem count
    const gemsBefore = game.gems.available.length;

    // Action: Player attacks Young Dragon with critical success
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player should gain 3 gems (not 1)
    // The description says "You will gain 3 gems"
    expect(game.gems.available.length).toBe(gemsBefore + 3);
  });

  it('should defeat Young Dragon with fate 10', () => {
    game.fateCheck = () => 10;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    // Should not take damage on success
    expect(game.health.available.length).toBe(healthBefore);
  });

  it('should take 1 damage with fate below 10', () => {
    game.fateCheck = () => 9;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    // Should take 1 damage on failure
    expect(game.health.available.length).toBe(healthBefore - 1);
  });
});
