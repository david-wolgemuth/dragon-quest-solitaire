import { describe, it, expect, beforeEach } from 'vitest';

// Access globals from window (loaded by setup.js)
const { Game, serializeGameState, deserializeGameState } = window;

describe('Game Integration Tests', () => {
  beforeEach(() => {
    // Clear just the dynamic content, keep the structure from setup.js
    const matrixElement = document.querySelector('#dungeon .matrix');
    if (matrixElement) matrixElement.innerHTML = '';

    const debugLog = document.querySelector('#debug-log');
    if (debugLog) debugLog.innerHTML = '';
  });

  it('renders fresh game correctly', () => {
    const game = new Game();
    game.render();

    // Check that dungeon matrix is rendered
    const matrix = document.querySelector('#dungeon .matrix');
    expect(matrix).toBeTruthy();
    expect(matrix.children.length).toBeGreaterThan(0);

    // Check health cards - game starts with 5 available health
    expect(game.health.available.length).toBe(5);
    // The renderer only shows the top card, so there should be 1 card element
    const healthCard = document.querySelector('#health-available .card');
    expect(healthCard).toBeTruthy();

    // Check dungeon has cards
    expect(game.dungeon.stock.length).toBeGreaterThan(0);
    // Fresh game starts with 3x3 matrix (expanded from initial 1x1)
    expect(game.dungeon.matrix.length).toBe(3);
    expect(game.dungeon.matrix[0].length).toBe(3);
    // Should have 1 card in the matrix (the initial card at center)
    let cardsInMatrix = 0;
    for (let row of game.dungeon.matrix) {
      for (let cell of row) {
        if (cell.card) cardsInMatrix++;
      }
    }
    expect(cardsInMatrix).toBe(1);
  });

  it('loads game state from serialized string and renders correct matrix', () => {
    // Create a game state with known values
    const seedGame = new Game({ seed: 12345 });
    const stateString = serializeGameState(seedGame);

    // Deserialize and create game from state
    const state = deserializeGameState(stateString);
    const game = new Game({ state });
    game.render();

    // Verify state was applied correctly
    expect(game.health.available.length).toBe(seedGame.health.available.length);
    expect(game.health.stock.length).toBe(seedGame.health.stock.length);
    expect(game.inventory.stock.length).toBe(seedGame.inventory.stock.length);
    expect(game.gems.stock.length).toBe(seedGame.gems.stock.length);
    expect(game.fate.stock.length).toBe(seedGame.fate.stock.length);
    expect(game.dungeon.stock.length).toBe(seedGame.dungeon.stock.length);

    // Verify matrix dimensions match
    expect(game.dungeon.matrix.length).toBe(seedGame.dungeon.matrix.length);
    expect(game.dungeon.matrix[0].length).toBe(seedGame.dungeon.matrix[0].length);

    // Verify cards in matrix match
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[0].length; c++) {
        const cell = game.dungeon.matrix[r][c];
        const seedCell = seedGame.dungeon.matrix[r][c];

        if (seedCell.card) {
          expect(cell.card, `Cell (${r},${c}) should have card`).toBeTruthy();
          expect(cell.card.suitKey).toBe(seedCell.card.suitKey);
          expect(cell.card.valueKey).toBe(seedCell.card.valueKey);
          expect(cell.cardFaceDown).toBe(seedCell.cardFaceDown);
        } else {
          expect(cell.card, `Cell (${r},${c}) should not have card`).toBeFalsy();
        }
      }
    }
  });

  it('can click available dungeon cells to add cards', () => {
    const game = new Game({ seed: 12345 });
    game.render();

    const initialStockCount = game.dungeon.stock.length;

    // Find an available cell button
    const availableCells = document.querySelectorAll('#dungeon .matrix .cell.available');
    expect(availableCells.length).toBeGreaterThan(0);

    // Click the first available cell
    const firstAvailable = availableCells[0];
    firstAvailable.click();

    // After clicking, a card should be added from stock
    expect(game.dungeon.stock.length).toBe(initialStockCount - 1);
  });

  it('preserves state through serialize/deserialize cycle', () => {
    // Create a game and play a few moves
    const game = new Game({ seed: 99999 });

    // Add a card to the dungeon
    const availableCell = game.dungeon.matrix.find(row =>
      row.find(cell => cell.available && !cell.card)
    )?.find(cell => cell.available && !cell.card);

    if (availableCell) {
      const row = game.dungeon.matrix.findIndex(r => r.includes(availableCell));
      const col = game.dungeon.matrix[row].indexOf(availableCell);
      game.addCardToDungeon({ row, col });
    }

    // Serialize the game state
    const stateString = serializeGameState(game);

    // Deserialize and create new game
    const state = deserializeGameState(stateString);
    const restoredGame = new Game({ state });

    // Verify all state matches
    expect(restoredGame.health.available.length).toBe(game.health.available.length);
    expect(restoredGame.health.stock.length).toBe(game.health.stock.length);
    expect(restoredGame.inventory.stock.length).toBe(game.inventory.stock.length);
    expect(restoredGame.dungeon.stock.length).toBe(game.dungeon.stock.length);

    // Verify matrix matches exactly
    expect(restoredGame.dungeon.matrix.length).toBe(game.dungeon.matrix.length);
    expect(restoredGame.dungeon.matrix[0].length).toBe(game.dungeon.matrix[0].length);

    // Check each cell
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[0].length; c++) {
        const original = game.dungeon.matrix[r][c];
        const restored = restoredGame.dungeon.matrix[r][c];

        if (original.card) {
          expect(restored.card, `Cell (${r},${c}) should have card`).toBeTruthy();
          expect(restored.card.suitKey).toBe(original.card.suitKey);
          expect(restored.card.valueKey).toBe(original.card.valueKey);
          expect(restored.cardFaceDown).toBe(original.cardFaceDown);
        } else {
          expect(restored.card, `Cell (${r},${c}) should not have card`).toBeFalsy();
        }
      }
    }
  });

  it('generated preview URLs create games with correct initial state', () => {
    // This simulates what generate-preview-url.js does
    const seed = 12345;
    const generatedGame = new Game({ seed });

    console.log('Generated game center cell:', generatedGame.dungeon.matrix[0][0]);
    console.log('  has card:', !!generatedGame.dungeon.matrix[0][0].card);
    console.log('  matrix size:', generatedGame.dungeon.matrix.length, 'x', generatedGame.dungeon.matrix[0].length);

    const stateString = serializeGameState(generatedGame);
    console.log('State string length:', stateString.length);

    // Now simulate loading that URL in the browser
    const state = deserializeGameState(stateString);
    console.log('Deserialized state dungeonMatrix length:', state.dungeonMatrix.length);
    console.log('Deserialized dungeonMatrix cells:', state.dungeonMatrix);

    const loadedGame = new Game({ state });
    console.log('Loaded game center cell:', loadedGame.dungeon.matrix[0][0]);
    console.log('  has card:', !!loadedGame.dungeon.matrix[0][0].card);
    console.log('  matrix size:', loadedGame.dungeon.matrix.length, 'x', loadedGame.dungeon.matrix[0].length);

    // The loaded game should match the generated game exactly
    expect(loadedGame.dungeon.matrix.length).toBe(generatedGame.dungeon.matrix.length);
    expect(loadedGame.dungeon.matrix[0].length).toBe(generatedGame.dungeon.matrix[0].length);
    expect(loadedGame.dungeon.stock.length).toBe(generatedGame.dungeon.stock.length);

    // Check that cells with cards match
    // Find all cells with cards in the generated game
    const generatedCells = [];
    for (let r = 0; r < generatedGame.dungeon.matrix.length; r++) {
      for (let c = 0; c < generatedGame.dungeon.matrix[0].length; c++) {
        if (generatedGame.dungeon.matrix[r][c].card) {
          generatedCells.push({ r, c, cell: generatedGame.dungeon.matrix[r][c] });
        }
      }
    }

    const loadedCells = [];
    for (let r = 0; r < loadedGame.dungeon.matrix.length; r++) {
      for (let c = 0; c < loadedGame.dungeon.matrix[0].length; c++) {
        if (loadedGame.dungeon.matrix[r][c].card) {
          loadedCells.push({ r, c, cell: loadedGame.dungeon.matrix[r][c] });
        }
      }
    }

    console.log('Generated cells with cards:', generatedCells.length);
    console.log('Loaded cells with cards:', loadedCells.length);

    // Should have same number of cells with cards
    expect(loadedCells.length).toBe(generatedCells.length);

    // Check each cell matches
    for (let i = 0; i < generatedCells.length; i++) {
      const gen = generatedCells[i];
      const loaded = loadedCells[i];

      expect(loaded.r).toBe(gen.r);
      expect(loaded.c).toBe(gen.c);
      expect(loaded.cell.card.suitKey).toBe(gen.cell.card.suitKey);
      expect(loaded.cell.card.valueKey).toBe(gen.cell.card.valueKey);
      expect(loaded.cell.cardFaceDown).toBe(gen.cell.cardFaceDown);
    }
  });

  it('matrix cells render with correct card classes', () => {
    const game = new Game({ seed: 12345 });
    game.render();

    const matrix = document.querySelector('#dungeon .matrix');
    const cells = matrix.querySelectorAll('.cell');

    // Should have matrix.length * matrix[0].length cells
    const expectedCellCount = game.dungeon.matrix.length * game.dungeon.matrix[0].length;
    expect(cells.length).toBe(expectedCellCount);

    // Check that cells with cards have the card class
    let cardsRendered = 0;
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[0].length; c++) {
        const cell = game.dungeon.matrix[r][c];
        if (cell.card) {
          cardsRendered++;
        }
      }
    }

    const cardElements = matrix.querySelectorAll('.cell.card');
    expect(cardElements.length).toBe(cardsRendered);
  });
});
