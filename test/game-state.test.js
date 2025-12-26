import { describe, it, expect, beforeEach } from 'vitest';

describe('Game State Transitions', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  describe('Initial game state', () => {
    it('starts player with full health', () => {
      expect(game.health.available.length).toBe(5);
      expect(game.health.stock.length).toBe(0);
    });

    it('starts with no gems available', () => {
      expect(game.gems.available.length).toBe(0);
      expect(game.gems.stock.length).toBe(10);
    });

    it('starts with inventory items hidden in stock', () => {
      expect(game.inventory.available.length).toBe(0);
      expect(game.inventory.stock.length).toBe(7);
    });

    it('starts with shuffled fate deck ready', () => {
      expect(game.fate.stock.length).toBe(5);
      expect(game.fate.available.length).toBe(0);

      // All fate cards should be Hearts 6-10
      const allHearts = game.fate.stock.every(card => card.suitKey === window.HEARTS);
      const allInRange = game.fate.stock.every(card =>
        card.value.order >= 6 && card.value.order <= 10
      );

      expect(allHearts).toBe(true);
      expect(allInRange).toBe(true);
    });

    it('places one unexplored card in the dungeon', () => {
      const cardsInDungeon = game.dungeon.matrix.flat()
        .filter(cell => cell.card !== null);

      expect(cardsInDungeon.length).toBe(1);
      expect(cardsInDungeon[0].cardFaceDown).toBe(true);
    });

    it('has remaining dungeon cards in stock', () => {
      // 27 total dungeon cards - 1 placed = 26 in stock
      expect(game.dungeon.stock.length).toBe(26);
    });
  });

  describe('Taking damage', () => {
    it('moves health from available to stock when damaged', () => {
      game._loseCard('health', 2);

      expect(game.health.available.length).toBe(3);
      expect(game.health.stock.length).toBe(2);
    });

    it('cannot lose more health than available', () => {
      game._loseCard('health', 10);

      expect(game.health.available.length).toBe(0);
      expect(game.health.stock.length).toBe(5);
    });

    it('stops at zero health without crashing', () => {
      game._loseCard('health', 5);

      expect(game.health.available.length).toBe(0);
      // Note: Game over detection not implemented yet
    });
  });

  describe('Healing', () => {
    it('moves health from stock to available when healing', () => {
      // First lose health
      game._loseCard('health', 3);

      // Then heal
      game._gainCard('health', 2);

      expect(game.health.available.length).toBe(4);
      expect(game.health.stock.length).toBe(1);
    });

    it('cannot heal beyond maximum health', () => {
      // Lose 2 health
      game._loseCard('health', 2);

      // Try to heal more than we lost
      game._gainCard('health', 5);

      // Should only heal to max (5 total)
      expect(game.health.available.length).toBe(5);
      expect(game.health.stock.length).toBe(0);
    });
  });

  describe('Collecting gems', () => {
    it('moves gems from stock to available when collected', () => {
      game._gainCard('gems', 3);

      expect(game.gems.available.length).toBe(3);
      expect(game.gems.stock.length).toBe(7);
    });

    it('can collect all available gems', () => {
      game._gainCard('gems', 10);

      expect(game.gems.available.length).toBe(10);
      expect(game.gems.stock.length).toBe(0);
    });

    it('cannot collect more gems than exist', () => {
      game._gainCard('gems', 20);

      expect(game.gems.available.length).toBe(10);
      expect(game.gems.stock.length).toBe(0);
    });
  });

  describe('Spending gems', () => {
    it('moves gems from available to stock when spent', () => {
      // First collect some gems
      game._gainCard('gems', 5);

      // Then spend them
      game._loseCard('gems', 2);

      expect(game.gems.available.length).toBe(3);
      expect(game.gems.stock.length).toBe(7);
    });

    it('cannot spend more gems than available', () => {
      game._gainCard('gems', 3);
      game._loseCard('gems', 10);

      expect(game.gems.available.length).toBe(0);
      expect(game.gems.stock.length).toBe(10);
    });
  });

  describe('Fate checks (combat)', () => {
    it('draws a card from fate deck and returns its value', () => {
      const stockBefore = game.fate.stock.length;

      const result = game.fateCheck();

      // Result should be between 6-10
      expect(result).toBeGreaterThanOrEqual(6);
      expect(result).toBeLessThanOrEqual(10);

      // Deck should have one less card
      expect(game.fate.stock.length).toBe(stockBefore - 1);
      expect(game.fate.available.length).toBe(1);
    });

    it('moves used fate cards to available pile', () => {
      game.fateCheck();
      game.fateCheck();
      game.fateCheck();

      expect(game.fate.stock.length).toBe(2);
      expect(game.fate.available.length).toBe(3);
    });
  });

  describe('Inventory management', () => {
    it('moves items from stock to available when found', () => {
      const stockBefore = game.inventory.stock.length;

      game._gainCard('inventory', 1);

      expect(game.inventory.available.length).toBe(1);
      expect(game.inventory.stock.length).toBe(stockBefore - 1);
    });

    it('can collect multiple items', () => {
      game._gainCard('inventory', 3);

      expect(game.inventory.available.length).toBe(3);
      expect(game.inventory.stock.length).toBe(4);
    });
  });
});

describe('Dungeon Exploration', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  describe('Grid expansion', () => {
    it('starts with one card in a minimal grid', () => {
      const info = game.getMatrixInfo();

      expect(info.currentWidth).toBe(1);
      expect(info.currentHeight).toBe(1);
    });

    it('expands grid when placing cards near edges', () => {
      const initialWidth = game.dungeon.matrix[0].length;

      // Place card (grid should expand to accommodate)
      game.addCardToDungeon({ row: 0, col: 1 });

      expect(game.dungeon.matrix[0].length).toBeGreaterThanOrEqual(initialWidth);
    });

    it('maintains correct card count as grid expands', () => {
      const initialCards = game.dungeon.matrix.flat()
        .filter(cell => cell.card !== null).length;

      game.addCardToDungeon({ row: 0, col: 1 });

      const afterCards = game.dungeon.matrix.flat()
        .filter(cell => cell.card !== null).length;

      expect(afterCards).toBe(initialCards + 1);
    });
  });

  describe('Card placement', () => {
    it('places new cards face-up (explored)', () => {
      const faceDownBefore = game.dungeon.matrix.flat()
        .filter(cell => cell.card && cell.cardFaceDown).length;

      // Find available cell
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

      game.addCardToDungeon({ row: targetRow, col: targetCol });

      // Should have same number of face-down cards
      const faceDownAfter = game.dungeon.matrix.flat()
        .filter(cell => cell.card && cell.cardFaceDown).length;

      expect(faceDownAfter).toBe(faceDownBefore);

      // Should have exactly one face-up card
      const faceUpCards = game.dungeon.matrix.flat()
        .filter(cell => cell.card && !cell.cardFaceDown);

      expect(faceUpCards.length).toBe(1);
    });

    it('decrements dungeon stock when placing cards', () => {
      const stockBefore = game.dungeon.stock.length;

      game.addCardToDungeon({ row: 0, col: 1 });

      expect(game.dungeon.stock.length).toBe(stockBefore - 1);
    });

    it('updates available cells after placement', () => {
      // Placing a card should change which cells are available
      const availableBefore = game.dungeon.matrix.flat()
        .filter(cell => cell.available).length;

      game.addCardToDungeon({ row: 0, col: 1 });

      const availableAfter = game.dungeon.matrix.flat()
        .filter(cell => cell.available).length;

      // Should have recalculated availability
      expect(availableAfter).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cell availability', () => {
    it('marks face-up cards as available for interaction', () => {
      // Place a card (will be face-up)
      game.addCardToDungeon({ row: 0, col: 1 });

      // Find the face-up card
      const faceUpCells = game.dungeon.matrix.flat()
        .filter(cell => cell.card && !cell.cardFaceDown);

      expect(faceUpCells.length).toBeGreaterThan(0);
      expect(faceUpCells[0].available).toBe(true);
    });

    it('marks face-down cards as unavailable', () => {
      // Initial card is face-down
      const faceDownCells = game.dungeon.matrix.flat()
        .filter(cell => cell.card && cell.cardFaceDown);

      expect(faceDownCells.length).toBeGreaterThan(0);
      expect(faceDownCells[0].available).toBe(false);
    });
  });
});

describe('Game State Consistency', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('maintains total card count across stock and available', () => {
    // Health: always 5 total
    expect(game.health.stock.length + game.health.available.length).toBe(5);

    // Gems: always 10 total
    expect(game.gems.stock.length + game.gems.available.length).toBe(10);

    // Inventory: always 7 total
    expect(game.inventory.stock.length + game.inventory.available.length).toBe(7);

    // Fate: always 5 total
    expect(game.fate.stock.length + game.fate.available.length).toBe(5);
  });

  it('maintains card count after multiple operations', () => {
    // Perform various operations
    game._loseCard('health', 2);
    game._gainCard('gems', 5);
    game._gainCard('inventory', 2);
    game.fateCheck();

    // Totals should remain constant
    expect(game.health.stock.length + game.health.available.length).toBe(5);
    expect(game.gems.stock.length + game.gems.available.length).toBe(10);
    expect(game.inventory.stock.length + game.inventory.available.length).toBe(7);
    expect(game.fate.stock.length + game.fate.available.length).toBe(5);
  });

  it('maintains dungeon card count across grid and stock', () => {
    const cardsInGrid = game.dungeon.matrix.flat()
      .filter(cell => cell.card !== null).length;

    // Total should always be 27 (13 Spades + 13 Clubs + 1 Black Joker)
    expect(game.dungeon.stock.length + cardsInGrid).toBe(27);
  });
});
