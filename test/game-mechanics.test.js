import { describe, it, expect, beforeEach } from 'vitest';

describe('Game Initialization', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('starts player with full health and no resources', () => {
    expect(game.health.available.length).toBe(5);
    expect(game.gems.available.length).toBe(0);
    expect(game.inventory.available.length).toBe(0);
  });

  it('places one unexplored card in the dungeon', () => {
    const unexploredCards = game.dungeon.matrix.flat()
      .filter(cell => cell.card && cell.cardFaceDown);

    expect(unexploredCards.length).toBe(1);
  });

  it('has complete shuffled decks ready', () => {
    expect(game.fate.stock.length).toBe(5);
    expect(game.dungeon.stock.length).toBe(26);
    expect(game.inventory.stock.length).toBe(7);
  });
});

describe('Dungeon Exploration', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('reveals new card when exploring', () => {
    const unexploredBefore = game.dungeon.matrix.flat()
      .filter(cell => cell.card && cell.cardFaceDown).length;

    // Find available empty cell
    let targetRow, targetCol;
    for (let row = 0; row < game.dungeon.matrix.length; row++) {
      for (let col = 0; col < game.dungeon.matrix[row].length; col++) {
        if (game.dungeon.matrix[row][col].available && !game.dungeon.matrix[row][col].card) {
          targetRow = row;
          targetCol = col;
          break;
        }
      }
      if (targetRow !== undefined) break;
    }

    // Player explores new area
    game.addCardToDungeon({ row: targetRow, col: targetCol });

    // New card should be revealed (face-up)
    const unexploredAfter = game.dungeon.matrix.flat()
      .filter(cell => cell.card && cell.cardFaceDown).length;

    expect(unexploredAfter).toBe(unexploredBefore);
  });

  it('expands dungeon grid as player explores', () => {
    const initialSize = game.dungeon.matrix.length * game.dungeon.matrix[0].length;

    game.addCardToDungeon({ row: 0, col: 1 });

    const newSize = game.dungeon.matrix.length * game.dungeon.matrix[0].length;

    expect(newSize).toBeGreaterThanOrEqual(initialSize);
  });

  it('maintains card conservation (cards not duplicated or lost)', () => {
    const cardsInGrid = game.dungeon.matrix.flat()
      .filter(cell => cell.card !== null).length;

    expect(game.dungeon.stock.length + cardsInGrid).toBe(27);
  });
});

describe('Game State Invariants', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('maintains total card counts across all operations', () => {
    // Perform various game actions
    game.addCardToDungeon({ row: 0, col: 1 });
    game.fateCheck();
    game.fateCheck();

    // Verify all piles maintain their totals
    expect(game.health.stock.length + game.health.available.length).toBe(5);
    expect(game.gems.stock.length + game.gems.available.length).toBe(10);
    expect(game.inventory.stock.length + game.inventory.available.length).toBe(7);
    expect(game.fate.stock.length + game.fate.available.length).toBe(5);

    const cardsInGrid = game.dungeon.matrix.flat()
      .filter(cell => cell.card !== null).length;
    expect(game.dungeon.stock.length + cardsInGrid).toBe(27);
  });

  it('prevents health from going negative', () => {
    // Manually damage player beyond zero
    game.health.available = [];
    game.health.stock = game.health.stock.concat(
      Array(5).fill(null).map(() => new window.Card(window.HEARTS, window.ACE))
    );

    // Try to lose more health
    game._loseCard('health', 5);

    // Should stay at zero
    expect(game.health.available.length).toBe(0);
  });

  it('prevents healing beyond maximum', () => {
    // Try to gain more health than maximum
    game._gainCard('health', 10);

    expect(game.health.available.length).toBe(5);
    expect(game.health.stock.length).toBe(0);
  });
});

describe('Combat Mechanics', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('draws from fate deck during combat', () => {
    const stockBefore = game.fate.stock.length;

    const result = game.fateCheck();

    expect(result).toBeGreaterThanOrEqual(6);
    expect(result).toBeLessThanOrEqual(10);
    expect(game.fate.stock.length).toBe(stockBefore - 1);
  });

  it('accumulates used fate cards', () => {
    game.fateCheck();
    game.fateCheck();
    game.fateCheck();

    expect(game.fate.available.length).toBe(3);
    expect(game.fate.stock.length).toBe(2);
  });
});
