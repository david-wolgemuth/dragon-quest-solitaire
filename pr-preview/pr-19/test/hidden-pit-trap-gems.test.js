/**
 * Tests for Hidden Pit Trap Gem Reduction (#AAH)
 *
 * Hidden pit traps should automatically use gems to reduce damage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../src/core/game.js';
import { Card } from '../src/cards/card.js';
import { CLUBS } from '../src/cards/suits.js';
import { TWO, THREE, FOUR } from '../src/cards/values.js';

// Mock display resolution to bypass UI in tests
function setupTestGame() {
  const game = new Game();

  // Mock displayResolution to immediately execute the callback
  game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
    callback();
  };

  // Mock displayMessage to do nothing
  game.displayMessage = () => {};

  // Mock render to do nothing (no UI in tests)
  game.render = () => {};

  return game;
}

describe('#AAH - Hidden Pit Trap Gem Reduction', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  describe('Automatic gem usage on hidden traps', () => {
    it('should use gems to fully negate damage when enough gems available', () => {
      // Arrange: Set up game with gems
      game._gainCard('gems', 3); // 3 gems in available
      const initialHealth = game.health.available.length;
      const initialGems = game.gems.available.length;

      // Act: Trigger hidden pit trap with 2 damage
      game.loseHealth({ name: 'Test' }, 2, { gems: true });

      // Assert: 2 gems used, no health lost
      expect(game.gems.available.length).toBe(initialGems - 2);
      expect(game.health.available.length).toBe(initialHealth);
    });

    it('should use gems to partially reduce damage', () => {
      // Arrange: Set up game with insufficient gems
      game._gainCard('gems', 1); // Only 1 gem
      const initialHealth = game.health.available.length;
      const initialGems = game.gems.available.length;

      // Act: Trigger hidden pit trap with 3 damage
      game.loseHealth({ name: 'Test' }, 3, { gems: true });

      // Assert: 1 gem used, 2 health lost
      expect(game.gems.available.length).toBe(0);
      expect(game.health.available.length).toBe(initialHealth - 2);
    });

    it('should take full damage when no gems available', () => {
      // Arrange: No gems available
      const initialHealth = game.health.available.length;

      // Act: Trigger hidden pit trap with 2 damage
      game.loseHealth({ name: 'Test' }, 2, { gems: true });

      // Assert: No gems used, full damage taken
      expect(game.gems.available.length).toBe(0);
      expect(game.health.available.length).toBe(initialHealth - 2);
    });

    it('should work with buildPitTrapCard hidden trap', async () => {
      // Arrange: Import card builder and create hidden pit trap
      const { buildPitTrapCard } = await import('../src/cards/card-builders.js');
      const hiddenTrap = buildPitTrapCard({ hidden: true, damage: 2 });

      // Give player some gems
      game._gainCard('gems', 2);
      const initialHealth = game.health.available.length;
      const initialGems = game.gems.available.length;

      // Act: Execute the hidden trap resolver
      hiddenTrap.resolver.call({ name: 'Hidden Pit Trap (2 damage)' }, game);

      // Assert: Gems were used to reduce damage (2 damage, 2 gems available)
      expect(game.gems.available.length).toBe(initialGems - 2);
      expect(game.health.available.length).toBe(initialHealth); // No health lost
    });
  });

  describe('Regular damage without gem option', () => {
    it('should not use gems when gems option is not set', () => {
      // Arrange
      game._gainCard('gems', 3);
      const initialHealth = game.health.available.length;
      const initialGems = game.gems.available.length;

      // Act: Lose health without gems option
      game.loseHealth({ name: 'Test' }, 2);

      // Assert: No gems used, health lost
      expect(game.gems.available.length).toBe(initialGems);
      expect(game.health.available.length).toBe(initialHealth - 2);
    });

    it('should not use gems when gems option is explicitly false', () => {
      // Arrange
      game._gainCard('gems', 3);
      const initialHealth = game.health.available.length;
      const initialGems = game.gems.available.length;

      // Act: Lose health with gems: false
      game.loseHealth({ name: 'Test' }, 2, { gems: false });

      // Assert: No gems used, health lost
      expect(game.gems.available.length).toBe(initialGems);
      expect(game.health.available.length).toBe(initialHealth - 2);
    });
  });
});
