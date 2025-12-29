import { describe, it, expect, beforeEach } from 'vitest';
import { FixtureHelper, createStateSnapshot } from './helpers/fixture-helper.js';

// Import required modules
import '../src/cards/suits.js';
import '../src/cards/values.js';
import '../src/cards/card.js';
import '../src/cards/dungeon-cards.js';
import '../src/core/cell.js';
import '../src/utils/card-utils.js';
import '../src/utils/style-generator.js';
import '../src/state/url-state.js';
import '../src/core/game.js';
import '../src/core/game-renderer.js';

// Access globals from window
const { Game, createStyleSheet } = window;

// Initialize stylesheet for rendering
createStyleSheet();

describe('Dragon Queen Victory Fixture', () => {
  let fixtureHelper;
  let game;

  beforeEach(() => {
    fixtureHelper = new FixtureHelper();

    // Clear dynamic content
    const matrixElement = document.querySelector('#dungeon .matrix');
    if (matrixElement) matrixElement.innerHTML = '';

    const debugLog = document.querySelector('#debug-log');
    if (debugLog) debugLog.innerHTML = '';

    const testDebug = document.getElementById('test-debug-state');
    if (testDebug) testDebug.remove();
  });

  it('generates fixture: one move from Dragon Queen victory', () => {
    // Create game with seed for reproducibility
    game = new window.Game({ seed: 12345 });

    // Mock display functions to bypass UI
    game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
      callback();
    };
    game.displayMessage = () => {};
    game.render = () => {};
    game.render = () => {}; // Mock render to bypass UI

    // Ensure player has full health (5) to survive potential damage
    // Dragon Queen does 3 damage on failure, so we're safe
    console.log(`Player health: ${game.health.available.length}/5`);

    // First, manipulate the dungeon deck BEFORE placing any cards
    // Remove Dragon Queen and Exit card from stock
    const queenIndex = game.dungeon.stock.findIndex(
      card => card.suitKey === 'SPADES' && card.valueKey === 'QUEEN'
    );
    const dragonQueen = queenIndex !== -1 ? game.dungeon.stock.splice(queenIndex, 1)[0] : null;

    const exitIndex = game.dungeon.stock.findIndex(
      card => card.suitKey === 'SPADES' && card.valueKey === 'ACE'
    );
    const exitCard = exitIndex !== -1 ? game.dungeon.stock.splice(exitIndex, 1)[0] : null;

    // Place a few cards to set up the dungeon (but not Dragon Queen)
    // Start with the initial face-down card at [0,0]
    // Place cards to create an available spot for the next card

    // Place first card (this will expand the grid)
    const firstAvailable = game.dungeon.matrix[0].find((cell, col) =>
      cell.available && !cell.card
    );
    if (firstAvailable) {
      const row = 0;
      const col = game.dungeon.matrix[0].indexOf(firstAvailable);
      game.addCardToDungeon({ row, col });
    }

    // Find and place a few more cards to progress the game
    for (let i = 0; i < 3; i++) {
      let placed = false;
      for (let row = 0; row < game.dungeon.matrix.length && !placed; row++) {
        for (let col = 0; col < game.dungeon.matrix[row].length && !placed; col++) {
          const cell = game.dungeon.matrix[row][col];
          if (cell.available && !cell.card) {
            game.addCardToDungeon({ row, col });
            placed = true;
          }
        }
      }
    }

    // NOW put Dragon Queen and Exit card back on top of the deck
    if (dragonQueen) {
      game.dungeon.stock.push(dragonQueen);
      console.log('✅ Dragon Queen (Q♠) is now on top of dungeon deck (next to draw)');
    }

    if (exitCard) {
      // Put Exit card second from top
      game.dungeon.stock.splice(game.dungeon.stock.length - 1, 0, exitCard);
      console.log('✅ Exit card (A♠) is second in dungeon deck');
    }

    // Give player some gems to help with survival
    game._gainCard('gems', 3);
    console.log(`Player gems: ${game.gems.available.length}`);

    console.log(`\n📊 Game State:`);
    console.log(`   Health: ${game.health.available.length}/5`);
    console.log(`   Gems: ${game.gems.available.length}`);
    console.log(`   Dungeon cards remaining: ${game.dungeon.stock.length}`);
    console.log(`   Next card to draw: Queen of Spades (Dragon Queen)`);
    console.log(`\n🎮 To win:`);
    console.log(`   1. Click an available cell to draw Dragon Queen`);
    console.log(`   2. Click Dragon Queen to fight (need fate 9+ to win, 10 for critical)`);
    console.log(`   3. On critical success (fate 10), dragonQueenDefeated flag is set`);
    console.log(`   4. Find and click Exit card (A♠) to claim victory!`);
    console.log(`\n⚠️  Note: Dragon Queen requires fate 9+ to defeat`);
    console.log(`   - Success (9): No damage, Dragon Queen defeated`);
    console.log(`   - Critical (10): Dragon Queen defeated + victory flag set`);
    console.log(`   - Failure (6-8): Take 3 damage`);

    // Save the fixture
    const state = createStateSnapshot(game);
    const fixturePath = fixtureHelper.saveFixture({
      name: 'dragon-queen-one-move-victory',
      description: 'Dragon Queen is next card to draw - one move from potential victory',
      state,
      metadata: {
        seed: 12345,
        health: game.health.available.length,
        gems: game.gems.available.length,
        dragonQueenDefeated: false,
        nextCard: 'Queen of Spades (Dragon Queen)',
        testInstructions: [
          '1. Click an available cell to draw Dragon Queen',
          '2. Click Dragon Queen to fight (need fate 9+ to defeat, 10 for critical)',
          '3. On critical success (fate 10), Dragon Queen is defeated',
          '4. Find and click Exit card (A♠) to win!'
        ]
      }
    });

    expect(fixturePath).toBeTruthy();
  });

  it('generates fixture: Dragon Queen defeated, ready to exit and win', () => {
    // Create a second fixture where Dragon Queen is already defeated
    const game = new window.Game({ seed: 54321 });

    game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
      callback();
    };
    game.displayMessage = () => {};
    game.render = () => {};

    // Place some dungeon cards
    for (let i = 0; i < 5; i++) {
      let placed = false;
      for (let row = 0; row < game.dungeon.matrix.length && !placed; row++) {
        for (let col = 0; col < game.dungeon.matrix[row].length && !placed; col++) {
          const cell = game.dungeon.matrix[row][col];
          if (cell.available && !cell.card) {
            game.addCardToDungeon({ row, col });
            placed = true;
          }
        }
      }
    }

    // Set the Dragon Queen defeated flag
    game.dragonQueenDefeated = true;
    console.log('✅ Dragon Queen has been defeated!');

    // Put Exit card on top of deck
    const exitIndex = game.dungeon.stock.findIndex(
      card => card.suitKey === 'SPADES' && card.valueKey === 'ACE'
    );

    if (exitIndex !== -1) {
      const exitCard = game.dungeon.stock.splice(exitIndex, 1)[0];
      game.dungeon.stock.push(exitCard);
      console.log('✅ Exit card (A♠) is on top of dungeon deck');
    }

    // Ensure good stats
    game._gainCard('gems', 5);

    console.log(`\n📊 Game State:`);
    console.log(`   Health: ${game.health.available.length}/5`);
    console.log(`   Gems: ${game.gems.available.length}`);
    console.log(`   Dragon Queen defeated: ${game.dragonQueenDefeated ? 'YES ✅' : 'NO'}`);
    console.log(`   Next card to draw: Ace of Spades (Exit)`);
    console.log(`\n🎮 To win:`);
    console.log(`   1. Click an available cell to draw Exit card`);
    console.log(`   2. Click Exit card to trigger VICTORY! 🎉`);

    // Save the fixture
    const state = createStateSnapshot(game);
    const fixturePath = fixtureHelper.saveFixture({
      name: 'dragon-queen-ready-to-exit',
      description: 'Dragon Queen defeated - Exit card ready - one click to victory',
      state,
      metadata: {
        seed: 54321,
        health: game.health.available.length,
        gems: game.gems.available.length,
        dragonQueenDefeated: true,
        nextCard: 'Ace of Spades (Exit)',
        testInstructions: [
          '1. Click an available cell to draw Exit card',
          '2. Click Exit card to trigger VICTORY screen! 🎉'
        ]
      }
    });

    expect(fixturePath).toBeTruthy();
  });
});
