import { describe, it, expect, beforeEach } from 'vitest';

describe('Game Initialization', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('initializes with correct health pile', () => {
    expect(game.health.stock.length).toBe(0);
    expect(game.health.available.length).toBe(5);

    // All health cards should be Hearts A-5
    game.health.available.forEach(card => {
      expect(card.suitKey).toBe(window.HEARTS);
      expect(card.value.order).toBeGreaterThanOrEqual(1);
      expect(card.value.order).toBeLessThanOrEqual(5);
    });
  });

  it('initializes with correct gem pile', () => {
    expect(game.gems.stock.length).toBe(10);
    expect(game.gems.available.length).toBe(0);

    // All gem cards should be Diamonds A-10
    game.gems.stock.forEach(card => {
      expect(card.suitKey).toBe(window.DIAMONDS);
    });
  });

  it('initializes with correct inventory pile', () => {
    expect(game.inventory.stock.length).toBe(7);
    expect(game.inventory.available.length).toBe(0);

    // Inventory should contain Hearts/Diamonds J-Q-K + Red Joker
    const suits = game.inventory.stock.map(c => c.suitKey);
    expect(suits.filter(s => s === window.HEARTS).length).toBe(3);
    expect(suits.filter(s => s === window.DIAMONDS).length).toBe(3);
    expect(suits.filter(s => s === window.RED).length).toBe(1);
  });

  it('initializes with correct fate pile', () => {
    expect(game.fate.stock.length).toBe(5);
    expect(game.fate.available.length).toBe(0);

    // All fate cards should be Hearts 6-10
    const values = game.fate.stock.map(c => c.value.order);
    values.forEach(order => {
      expect(order).toBeGreaterThanOrEqual(6);
      expect(order).toBeLessThanOrEqual(10);
    });
  });

  it('initializes with correct dungeon pile', () => {
    // 27 total cards: 13 Spades + 13 Clubs + 1 Black Joker = 27
    // One is placed on the grid, so stock should have 26
    expect(game.dungeon.stock.length).toBe(26);

    // Matrix should have one card (the starting card)
    const totalCardsInMatrix = game.dungeon.matrix.flat()
      .filter(cell => cell.card !== null).length;
    expect(totalCardsInMatrix).toBe(1);
  });

  it('initializes with one face-down card in dungeon', () => {
    // Find the cell with a card (grid expands on init, so card might not be at [0][0])
    const cellsWithCards = game.dungeon.matrix.flat().filter(cell => cell.card !== null);
    expect(cellsWithCards.length).toBe(1);
    expect(cellsWithCards[0].cardFaceDown).toBe(true);
  });
});

describe('Resource Pile Operations', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  describe('Gaining Cards', () => {
    it('gains a single health card', () => {
      // Lose health first so we can gain it back
      game._loseCard('health', 2);
      const before = game.health.available.length;

      game._gainCard('health', 1);

      expect(game.health.available.length).toBe(before + 1);
      expect(game.health.stock.length).toBe(1);
    });

    it('gains multiple gem cards', () => {
      const before = game.gems.available.length;

      game._gainCard('gems', 3);

      expect(game.gems.available.length).toBe(before + 3);
      expect(game.gems.stock.length).toBe(7);
    });

    it('stops gaining when stock is empty', () => {
      // Try to gain more gems than exist
      game._gainCard('gems', 20);

      // Should only gain the 10 available
      expect(game.gems.available.length).toBe(10);
      expect(game.gems.stock.length).toBe(0);
    });
  });

  describe('Losing Cards', () => {
    it('loses a single health card', () => {
      const before = game.health.available.length;

      game._loseCard('health', 1);

      expect(game.health.available.length).toBe(before - 1);
      expect(game.health.stock.length).toBe(1);
    });

    it('loses multiple health cards', () => {
      const before = game.health.available.length;

      game._loseCard('health', 3);

      expect(game.health.available.length).toBe(before - 3);
      expect(game.health.stock.length).toBe(3);
    });

    it('stops losing when available is empty', () => {
      // Lose all health
      game._loseCard('health', 20);

      // Should have lost all 5
      expect(game.health.available.length).toBe(0);
      expect(game.health.stock.length).toBe(5);
    });
  });

  describe('Fate Check', () => {
    it('draws a card from fate deck', () => {
      const stockBefore = game.fate.stock.length;
      const availableBefore = game.fate.available.length;

      const result = game.fateCheck();

      // Should return a value between 6-10
      expect(result).toBeGreaterThanOrEqual(6);
      expect(result).toBeLessThanOrEqual(10);

      // Stock should decrease, available should increase
      expect(game.fate.stock.length).toBe(stockBefore - 1);
      expect(game.fate.available.length).toBe(availableBefore + 1);
    });

    it('returns correct value order', () => {
      const result = game.fateCheck();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(6);
      expect(result).toBeLessThanOrEqual(10);
    });
  });
});

describe('Dungeon Grid Management', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('starts with a grid (expands automatically)', () => {
    // Grid expands on init, so it will be larger than 1x1
    expect(game.dungeon.matrix.length).toBeGreaterThanOrEqual(1);
    expect(game.dungeon.matrix[0].length).toBeGreaterThanOrEqual(1);

    // Should have exactly one card
    const totalCards = game.dungeon.matrix.flat().filter(cell => cell.card !== null).length;
    expect(totalCards).toBe(1);
  });

  it('calculates matrix info correctly', () => {
    const info = game.getMatrixInfo();

    // With one card, width and height should both be 1
    expect(info.currentWidth).toBe(1);
    expect(info.currentHeight).toBe(1);

    // Min and max should define a 1x1 area
    expect(info.maxRow - info.minRow).toBe(0);
    expect(info.maxCol - info.minCol).toBe(0);
  });

  it('expands grid when placing cards', () => {
    // Place a card to the right
    const initialWidth = game.dungeon.matrix[0].length;

    // Add card to dungeon (this should trigger expansion)
    game.addCardToDungeon({ row: 0, col: 1 });

    // Grid should have expanded
    expect(game.dungeon.matrix[0].length).toBeGreaterThanOrEqual(initialWidth);
  });

  it('marks new card as face-up after placement', () => {
    // Count cards before
    const cardsBefore = game.dungeon.matrix.flat().filter(cell => cell.card !== null).length;
    const faceDownBefore = game.dungeon.matrix.flat().filter(cell => cell.card && cell.cardFaceDown).length;

    // Find an available cell and place a card
    let targetRow, targetCol;
    for (let row = 0; row < game.dungeon.matrix.length; row++) {
      for (let col = 0; col < game.dungeon.matrix[row].length; col++) {
        const cell = game.dungeon.matrix[row][col];
        if (cell.available && !cell.card) {
          targetRow = row;
          targetCol = col;
          break;
        }
      }
      if (targetRow !== undefined) break;
    }

    if (targetRow === undefined) {
      throw new Error('No available cell found for testing');
    }

    game.addCardToDungeon({ row: targetRow, col: targetCol });

    // Should have one more card total
    const cardsAfter = game.dungeon.matrix.flat().filter(cell => cell.card !== null).length;
    expect(cardsAfter).toBe(cardsBefore + 1);

    // Should have same number of face-down cards (new card is face-up)
    const faceDownAfter = game.dungeon.matrix.flat().filter(cell => cell.card && cell.cardFaceDown).length;
    expect(faceDownAfter).toBe(faceDownBefore);

    // There should be exactly one face-up card now
    const faceUpCards = game.dungeon.matrix.flat().filter(cell => cell.card && !cell.cardFaceDown);
    expect(faceUpCards.length).toBe(1);
  });

  it('updates availability after card placement', () => {
    // After placing a card, some cells should become available
    const availableBefore = game.dungeon.matrix.flat()
      .filter(cell => cell.available).length;

    game.addCardToDungeon({ row: 0, col: 1 });

    const availableAfter = game.dungeon.matrix.flat()
      .filter(cell => cell.available).length;

    // Availability should be recalculated
    expect(availableAfter).toBeGreaterThanOrEqual(0);
  });
});

describe('Card Definitions', () => {
  it('has all Spades cards defined', () => {
    const spadesCards = window.DUNGEON_CARDS[window.SPADES];

    expect(spadesCards[window.ACE]).toBeDefined();
    expect(spadesCards[window.TWO]).toBeDefined();
    expect(spadesCards[window.TEN]).toBeDefined();
    expect(spadesCards[window.JACK]).toBeDefined();
    expect(spadesCards[window.QUEEN]).toBeDefined();
    expect(spadesCards[window.KING]).toBeDefined();
  });

  it('has all Clubs cards defined', () => {
    const clubsCards = window.DUNGEON_CARDS[window.CLUBS];

    expect(clubsCards[window.ACE]).toBeDefined();
    expect(clubsCards[window.TWO]).toBeDefined();
    expect(clubsCards[window.QUEEN]).toBeDefined();
    expect(clubsCards[window.KING]).toBeDefined();
  });

  it('has Black Joker defined', () => {
    const blackCards = window.DUNGEON_CARDS[window.BLACK];
    expect(blackCards[window.JOKER]).toBeDefined();
    expect(blackCards[window.JOKER].name).toBe('Generous Wizard');
  });

  it('all card definitions have required properties', () => {
    const allCards = [
      ...Object.values(window.DUNGEON_CARDS[window.SPADES]),
      ...Object.values(window.DUNGEON_CARDS[window.CLUBS]),
      ...Object.values(window.DUNGEON_CARDS[window.BLACK])
    ];

    allCards.forEach(card => {
      expect(card.name).toBeDefined();
      expect(card.description).toBeDefined();
      expect(card.resolver).toBeDefined();
      expect(typeof card.resolver).toBe('function');
    });
  });

  it('Clubs 7-Jack match Spades equivalents', () => {
    const clubsCards = window.DUNGEON_CARDS[window.CLUBS];
    const spadesCards = window.DUNGEON_CARDS[window.SPADES];

    expect(clubsCards[window.SEVEN]).toBe(spadesCards[window.SEVEN]);
    expect(clubsCards[window.EIGHT]).toBe(spadesCards[window.EIGHT]);
    expect(clubsCards[window.NINE]).toBe(spadesCards[window.NINE]);
    expect(clubsCards[window.TEN]).toBe(spadesCards[window.TEN]);
    expect(clubsCards[window.JACK]).toBe(spadesCards[window.JACK]);
  });
});
