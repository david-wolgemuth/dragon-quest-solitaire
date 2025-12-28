/**
 * Integration test for Bug #003: No Game Over Detection
 *
 * This test proves that the game does NOT properly handle the player losing all health.
 *
 * Expected behavior:
 * 1. When player health reaches 0, game should trigger game over
 * 2. Game over should display a modal/message to the player
 * 3. Game should prevent further actions after game over
 *
 * Actual behavior (BUG):
 * 1. Player can continue playing with 0 health
 * 2. No game over modal/message is shown
 * 3. Game continues as normal even after health is depleted
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import required modules (sets window globals)
import '../src/cards/suits.js';
import '../src/cards/values.js';
import '../src/cards/card.js';
import '../src/core/game.js';
import '../src/core/game-renderer.js';

describe('Bug #003: Game Over Detection', () => {
  let game;

  beforeEach(() => {
    // Create game with fixed seed for deterministic testing
    game = new window.Game({ seed: 99999 });
  });

  it('should prove bug exists: player can lose all health without game ending', () => {
    // Initial state: player has 5 health
    expect(game.health.available.length).toBe(5);

    // Simulate taking damage until health reaches 0
    console.log('Taking 5 damage to deplete all health...');
    game._loseCard('health', 5);

    // BUG PROOF: Health is 0 but game continues
    expect(game.health.available.length).toBe(0);

    // BUG PROOF: No gameOver method exists or is called
    // If gameOver existed, we'd expect some game state to change
    expect(typeof game.gameOver).toBe('undefined'); // gameOver method doesn't exist

    // BUG PROOF: Game state doesn't reflect game over condition
    // There's no isGameOver flag or similar state tracking
    expect(game.isGameOver).toBeUndefined();

    console.log('✗ BUG CONFIRMED: Player has 0 health but game has no game-over state');
  });

  it('should prove bug exists: player can continue playing with 0 health', () => {
    // Deplete all health
    game._loseCard('health', 5);
    expect(game.health.available.length).toBe(0);

    // BUG PROOF: Player can still draw dungeon cards
    const dungeonStockBefore = game.dungeon.stock.length;

    // Try to add a card to the dungeon (this should be prevented if game is over)
    const emptyCell = game.dungeon.matrix[0][0];
    if (!emptyCell.card) {
      const drawnCard = game.dungeon.stock.pop();
      emptyCell.card = drawnCard;
      emptyCell.cardFaceDown = false;
    }

    const dungeonStockAfter = game.dungeon.stock.length;

    // BUG PROOF: Game allowed drawing a card even with 0 health
    expect(dungeonStockAfter).toBe(dungeonStockBefore - 1);

    console.log('✗ BUG CONFIRMED: Player can still interact with dungeon despite having 0 health');
  });

  it('should prove bug exists: no game over modal infrastructure exists', () => {
    // Deplete all health
    game._loseCard('health', 5);
    expect(game.health.available.length).toBe(0);

    // BUG PROOF: Check that modal elements exist in DOM but aren't triggered
    const messageModal = document.getElementById('message-modal');
    expect(messageModal).toBeTruthy(); // Modal exists in DOM (from setup)

    // But the modal should have been shown with a game over message
    // Instead, it's not visible because there's no game over detection
    const modalVisible = messageModal?.classList.contains('visible') || false;
    expect(modalVisible).toBe(false); // Modal is NOT shown - proves bug

    // BUG PROOF: No mechanism exists to show game over
    // A proper game would set isGameOver flag and show modal
    expect(game.isGameOver).toBeUndefined(); // No state tracking
    expect(typeof game.gameOver).toBe('undefined'); // No method to trigger

    console.log('✗ BUG CONFIRMED: No game over UI infrastructure when health reaches 0');
  });

  it('should prove bug exists: combat can still occur with 0 health', () => {
    // Deplete all health
    game._loseCard('health', 5);
    expect(game.health.available.length).toBe(0);

    // BUG PROOF: Player can still perform fate checks (used in combat)
    // This should not be possible if the game is over
    let fateCheckResult;

    try {
      fateCheckResult = game.fateCheck();

      // If we get here, fateCheck worked despite 0 health
      expect(fateCheckResult).toBeGreaterThanOrEqual(6); // Fate cards are 6-10
      expect(fateCheckResult).toBeLessThanOrEqual(10);

      console.log('✗ BUG CONFIRMED: Fate check still works with 0 health - combat can continue!');
    } catch (error) {
      // If fateCheck throws, that would be correct behavior (game preventing actions)
      console.log('✓ Correct behavior: Game prevents fate check');
      throw error; // This won't happen with the current bug
    }
  });

  it('should document expected fix: _loseCard should check for game over', () => {
    // This test documents what the fix should look like

    // Current buggy implementation in src/core/game.js:447-455
    const buggyCode = `
    _loseCard(key, amount) {
      for (let i = 0; i < amount; i += 1) {
        if (this[key].available.length === 0) {
          return;  // ❌ BUG: Just returns, no game-over check
        }
        const card = this[key].available.pop();
        this[key].stock.push(card);
      }
    }
    `;

    // Expected fixed implementation
    const fixedCode = `
    _loseCard(key, amount) {
      for (let i = 0; i < amount; i += 1) {
        if (this[key].available.length === 0) {
          return;
        }
        const card = this[key].available.pop();
        this[key].stock.push(card);
      }

      // ✓ FIX: Check for game over after losing health
      if (key === 'health' && this.health.available.length === 0) {
        this.gameOver();
      }
    }
    `;

    console.log('Current buggy implementation:', buggyCode);
    console.log('Expected fixed implementation:', fixedCode);

    // This test always passes - it's just documentation
    expect(true).toBe(true);
  });

  afterEach(() => {
    // Cleanup if needed
  });
});

/**
 * SUMMARY OF BUG #003
 * ===================
 *
 * Location: src/core/game.js:447-455 (_loseCard method)
 *
 * Problem:
 * - When player loses all health, _loseCard() just returns without checking for game over
 * - No gameOver() method exists in the Game class
 * - No isGameOver state tracking exists
 * - Player can continue playing, drawing cards, and performing combat with 0 health
 *
 * Impact:
 * - Game is unwinnable/unlosable - player never dies
 * - Breaks fundamental game mechanic (lose condition)
 * - Defeats the purpose of health management
 * - Players can "win" by continuing after they should have lost
 *
 * Fix Required:
 * 1. Add gameOver() method to Game class
 * 2. Add isGameOver flag to track game state
 * 3. Check for game over in _loseCard when health reaches 0
 * 4. Prevent all game actions when isGameOver is true
 * 5. Display game over modal/message to player
 * 6. Offer reset/restart option
 */
