import { describe, it, expect, beforeEach } from 'vitest';
import { FixtureHelper, getCurrentStateString } from './helpers/fixture-helper.js';

// Access globals from window (loaded by setup.js)
const { Game, serializeGameState, deserializeGameState } = window;

describe('Fixture Generation from Gameplay', () => {
  let fixtureHelper;

  beforeEach(() => {
    // Initialize fixture helper
    fixtureHelper = new FixtureHelper();

    // Clear just the dynamic content, keep the structure from setup.js
    const matrixElement = document.querySelector('#dungeon .matrix');
    if (matrixElement) matrixElement.innerHTML = '';

    const debugLog = document.querySelector('#debug-log');
    if (debugLog) debugLog.innerHTML = '';

    const testDebug = document.getElementById('test-debug-state');
    if (testDebug) testDebug.remove();
  });

  /**
   * Helper function to get all available dungeon cells (buttons)
   */
  function getAvailableCells() {
    return Array.from(document.querySelectorAll('#dungeon .matrix .cell.available'));
  }

  /**
   * Helper function to get all face-up cards in the dungeon (clickable to resolve)
   */
  function getFaceUpCards() {
    return Array.from(document.querySelectorAll('#dungeon .matrix .cell.card:not(.card-back)'));
  }

  /**
   * Helper function to play through N turns of adding cards to the dungeon
   */
  function playTurns(game, numTurns) {
    const actions = [];

    for (let i = 0; i < numTurns; i++) {
      // Get available cells
      const availableCells = getAvailableCells();

      if (availableCells.length === 0) {
        console.log(`⚠️ No available cells after ${i} turns`);
        break;
      }

      // Click the first available cell to add a card
      const cell = availableCells[0];
      const beforeStock = game.dungeon.stock.length;

      cell.click();

      const afterStock = game.dungeon.stock.length;
      actions.push({
        turn: i + 1,
        action: 'add-card',
        stockBefore: beforeStock,
        stockAfter: afterStock
      });

      console.log(`Turn ${i + 1}: Added card to dungeon (stock: ${beforeStock} → ${afterStock})`);
    }

    return actions;
  }

  it('generates mid-game fixture from seeded gameplay', () => {
    const seed = 42;
    const game = new Game({ seed });
    game.render();

    console.log('🎮 Starting game with seed:', seed);
    console.log('Initial dungeon stock:', game.dungeon.stock.length);

    // Play through 5 turns (add 5 cards to dungeon)
    const actions = playTurns(game, 5);

    console.log('🎯 Actions taken:', actions.length);
    console.log('Final dungeon stock:', game.dungeon.stock.length);

    // Get the final state and save fixture
    const finalStateString = getCurrentStateString();
    expect(finalStateString).toBeTruthy();
    expect(finalStateString.length).toBeGreaterThan(0);

    const finalState = deserializeGameState(finalStateString);

    // Save fixture using helper
    fixtureHelper.saveFixture({
      name: 'mid-game-seed42',
      description: 'Mid-game state after 5 card additions',
      state: finalState,
      metadata: { seed, turnCount: 5 }
    });

    // Verify the fixture can be loaded
    const loadedFixture = fixtureHelper.loadFixture('mid-game-seed42');
    expect(loadedFixture.state).toBeTruthy();
    expect(loadedFixture.state.dungeonStock.length).toBe(game.dungeon.stock.length);
    expect(loadedFixture.state.health.available.length).toBe(game.health.available.length);
    expect(loadedFixture.metadata.seed).toBe(seed);
  });

  it('generates late-game fixture with card resolutions', () => {
    const seed = 99;
    const game = new Game({ seed });
    game.render();

    console.log('🎮 Starting late-game scenario with seed:', seed);

    // Add several cards to the dungeon
    playTurns(game, 8);

    console.log('🎯 Dungeon matrix size:', game.dungeon.matrix.length, 'x', game.dungeon.matrix[0].length);
    console.log('Cards in dungeon stock:', game.dungeon.stock.length);

    // Try to resolve some cards
    let resolved = 0;
    for (let attempt = 0; attempt < 5; attempt++) {
      const faceUpCards = getFaceUpCards();
      if (faceUpCards.length === 0) break;

      const card = faceUpCards[0];
      const beforeHealth = game.health.available.length;

      card.click();

      const afterHealth = game.health.available.length;
      if (beforeHealth !== afterHealth) {
        console.log(`⚔️ Resolved card - health changed: ${beforeHealth} → ${afterHealth}`);
        resolved++;
      }
    }

    console.log(`✅ Resolved ${resolved} cards`);

    // Get the final state and save fixture
    const finalStateString = getCurrentStateString();
    const finalState = deserializeGameState(finalStateString);

    fixtureHelper.saveFixture({
      name: 'late-game-seed99',
      description: `Late-game state after 8 additions and ${resolved} resolutions`,
      state: finalState,
      metadata: { seed, turnCount: 8, resolvedCount: resolved }
    });

    // Verify fixture exists
    const loadedFixture = fixtureHelper.loadFixture('late-game-seed99');
    expect(loadedFixture.state).toBeTruthy();
  });

  it('generates early-game fixture (just started)', () => {
    const seed = 1000;
    const game = new Game({ seed });
    game.render();

    console.log('🎮 Starting early-game scenario with seed:', seed);
    console.log('Initial state - just first card revealed');

    // Get the initial state (no additional moves)
    const initialStateString = getCurrentStateString();
    const initialState = deserializeGameState(initialStateString);

    // Save as early-game fixture
    fixtureHelper.saveFixture({
      name: 'early-game-seed1000',
      description: 'Early-game state - just started',
      state: initialState,
      metadata: { seed, turnCount: 0 }
    });

    // Verify it's actually early game
    const loadedFixture = fixtureHelper.loadFixture('early-game-seed1000');
    expect(loadedFixture.state.health.available.length).toBe(5); // Full health
    expect(loadedFixture.state.inventory.available.length).toBe(0); // No items used
    expect(loadedFixture.state.fate.available.length).toBe(0); // No fate cards drawn
    expect(loadedFixture.metadata.seed).toBe(seed);
  });

  it('fixture produces identical game state when loaded', () => {
    const seed = 12345;
    const originalGame = new Game({ seed });
    originalGame.render();

    // Play a few turns
    playTurns(originalGame, 3);

    // Get the state and save fixture
    const stateString = getCurrentStateString();
    const state = deserializeGameState(stateString);

    fixtureHelper.saveFixture({
      name: 'verify-load-seed12345',
      description: 'Fixture for verifying load correctness',
      state,
      metadata: { seed, turnCount: 3 }
    });

    // Load the state into a new game
    const loadedGame = new Game({ state });
    loadedGame.render();

    // Verify they match
    expect(loadedGame.dungeon.stock.length).toBe(originalGame.dungeon.stock.length);
    expect(loadedGame.health.available.length).toBe(originalGame.health.available.length);
    expect(loadedGame.dungeon.matrix.length).toBe(originalGame.dungeon.matrix.length);
    expect(loadedGame.dungeon.matrix[0].length).toBe(originalGame.dungeon.matrix[0].length);

    // Verify matrix cells match
    for (let r = 0; r < originalGame.dungeon.matrix.length; r++) {
      for (let c = 0; c < originalGame.dungeon.matrix[0].length; c++) {
        const originalCell = originalGame.dungeon.matrix[r][c];
        const loadedCell = loadedGame.dungeon.matrix[r][c];

        if (originalCell.card) {
          expect(loadedCell.card, `Cell (${r},${c}) should have card`).toBeTruthy();
          expect(loadedCell.card.suitKey).toBe(originalCell.card.suitKey);
          expect(loadedCell.card.valueKey).toBe(originalCell.card.valueKey);
          expect(loadedCell.cardFaceDown).toBe(originalCell.cardFaceDown);
        } else {
          expect(loadedCell.card, `Cell (${r},${c}) should not have card`).toBeFalsy();
        }
      }
    }

    console.log('✅ Loaded game matches original game exactly');
  });

  it('deterministic gameplay - same seed produces same fixture every time', () => {
    const seed = 777;
    const numTurns = 6;

    // First playthrough
    const game1 = new Game({ seed });
    game1.render();
    playTurns(game1, numTurns);
    const state1String = getCurrentStateString();
    const state1 = deserializeGameState(state1String);

    // Clear DOM
    document.querySelector('#dungeon .matrix').innerHTML = '';
    document.getElementById('test-debug-state')?.remove();

    // Second playthrough with same seed
    const game2 = new Game({ seed });
    game2.render();
    playTurns(game2, numTurns);
    const state2String = getCurrentStateString();
    const state2 = deserializeGameState(state2String);

    // States should be identical
    expect(state2String).toBe(state1String);

    // Save one fixture for this deterministic test
    fixtureHelper.saveFixture({
      name: 'deterministic-seed777',
      description: 'Fixture for verifying deterministic gameplay',
      state: state1,
      metadata: { seed, turnCount: numTurns }
    });

    console.log('✅ Deterministic gameplay verified - same seed produces same state');
  });
});
