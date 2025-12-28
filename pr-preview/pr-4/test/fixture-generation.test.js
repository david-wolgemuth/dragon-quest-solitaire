import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Access globals from window (loaded by setup.js)
const { Game, serializeGameState, deserializeGameState } = window;

describe('Fixture Generation from Gameplay', () => {
  beforeEach(() => {
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
   * Helper function to get the current serialized state from the test debug div
   */
  function getCurrentState() {
    const debugDiv = document.getElementById('test-debug-state');
    if (!debugDiv) {
      throw new Error('Test debug div not found - game.render() may not have been called');
    }
    return debugDiv.dataset.state;
  }

  /**
   * Helper function to save a fixture to a JSON file
   */
  function saveFixture(name, description, stateString) {
    const state = deserializeGameState(stateString);
    const fixture = {
      name,
      description,
      createdAt: new Date().toISOString(),
      state
    };

    const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    const fixturePath = path.join(fixturesDir, `${name}.json`);
    fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));

    console.log(`💾 Saved fixture: ${fixturePath}`);
    return fixturePath;
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

    // Get the final state
    const finalState = getCurrentState();
    expect(finalState).toBeTruthy();
    expect(finalState.length).toBeGreaterThan(0);

    // Save as mid-game fixture
    const fixturePath = saveFixture(
      'mid-game-seed42',
      'Mid-game state after 5 card additions (seed: 42)',
      finalState
    );

    expect(fs.existsSync(fixturePath)).toBe(true);

    // Verify the fixture can be loaded
    const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    expect(fixtureData.state).toBeTruthy();
    expect(fixtureData.state.dungeonStock.length).toBe(game.dungeon.stock.length);
    expect(fixtureData.state.health.available.length).toBe(game.health.available.length);
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

    // Get the final state
    const finalState = getCurrentState();

    // Save as late-game fixture
    const fixturePath = saveFixture(
      'late-game-seed99',
      `Late-game state after 8 additions and ${resolved} resolutions (seed: 99)`,
      finalState
    );

    expect(fs.existsSync(fixturePath)).toBe(true);
  });

  it('generates early-game fixture (just started)', () => {
    const seed = 1000;
    const game = new Game({ seed });
    game.render();

    console.log('🎮 Starting early-game scenario with seed:', seed);
    console.log('Initial state - just first card revealed');

    // Get the initial state (no additional moves)
    const initialState = getCurrentState();

    // Save as early-game fixture
    const fixturePath = saveFixture(
      'early-game-seed1000',
      'Early-game state - just started (seed: 1000)',
      initialState
    );

    expect(fs.existsSync(fixturePath)).toBe(true);

    // Verify it's actually early game
    const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    expect(fixtureData.state.health.available.length).toBe(5); // Full health
    expect(fixtureData.state.inventory.available.length).toBe(0); // No items used
    expect(fixtureData.state.fate.available.length).toBe(0); // No fate cards drawn
  });

  it('fixture produces identical game state when loaded', () => {
    const seed = 12345;
    const originalGame = new Game({ seed });
    originalGame.render();

    // Play a few turns
    playTurns(originalGame, 3);

    // Get the state
    const stateString = getCurrentState();

    // Load the state into a new game
    const state = deserializeGameState(stateString);
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
    const state1 = getCurrentState();

    // Clear DOM
    document.querySelector('#dungeon .matrix').innerHTML = '';
    document.getElementById('test-debug-state')?.remove();

    // Second playthrough with same seed
    const game2 = new Game({ seed });
    game2.render();
    playTurns(game2, numTurns);
    const state2 = getCurrentState();

    // States should be identical
    expect(state2).toBe(state1);

    console.log('✅ Deterministic gameplay verified - same seed produces same state');
  });
});
