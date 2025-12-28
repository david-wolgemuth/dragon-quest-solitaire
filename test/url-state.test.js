import { describe, it, expect, beforeEach } from 'vitest';

describe('URL State Serialization', () => {
  let game;

  beforeEach(() => {
    game = new window.Game();
  });

  it('serializes and deserializes game state correctly', () => {
    const serialized = window.serializeGameState(game);
    expect(serialized).toBeTruthy();
    expect(typeof serialized).toBe('string');

    const deserialized = window.deserializeGameState(serialized);
    expect(deserialized).toBeTruthy();
    expect(deserialized.health).toBeDefined();
    expect(deserialized.gems).toBeDefined();
    expect(deserialized.inventory).toBeDefined();
    expect(deserialized.fate).toBeDefined();
    expect(deserialized.dungeonStock).toBeDefined();
    expect(deserialized.dungeonMatrix).toBeDefined();
  });

  it('preserves health pile state', () => {
    const serialized = window.serializeGameState(game);
    const deserialized = window.deserializeGameState(serialized);

    expect(deserialized.health.available.length).toBe(game.health.available.length);
    expect(deserialized.health.stock.length).toBe(game.health.stock.length);

    // Check cards match
    for (let i = 0; i < game.health.available.length; i++) {
      expect(deserialized.health.available[i].suitKey).toBe(game.health.available[i].suitKey);
      expect(deserialized.health.available[i].valueKey).toBe(game.health.available[i].valueKey);
    }
  });

  it('preserves dungeon pile state', () => {
    const serialized = window.serializeGameState(game);
    const deserialized = window.deserializeGameState(serialized);

    expect(deserialized.dungeonStock.length).toBe(game.dungeon.stock.length);

    // Check cards match
    for (let i = 0; i < game.dungeon.stock.length; i++) {
      expect(deserialized.dungeonStock[i].suitKey).toBe(game.dungeon.stock[i].suitKey);
      expect(deserialized.dungeonStock[i].valueKey).toBe(game.dungeon.stock[i].valueKey);
    }
  });

  it('preserves dungeon matrix state', () => {
    const serialized = window.serializeGameState(game);
    const deserialized = window.deserializeGameState(serialized);

    // Check that matrix has correct number of cells
    const originalCellCount = game.dungeon.matrix.flat().filter(c => c.card).length;
    expect(deserialized.dungeonMatrix.length).toBe(originalCellCount);

    // Check first cell exists and has the expected structure
    const firstCell = deserialized.dungeonMatrix[0];
    expect(firstCell.row).toBeGreaterThanOrEqual(0);
    expect(firstCell.col).toBeGreaterThanOrEqual(0);
    expect(firstCell.card).toBeDefined();
    expect(firstCell.cardFaceDown).toBe(true);
  });

  it('restores game from serialized state', () => {
    const serialized = window.serializeGameState(game);
    const deserialized = window.deserializeGameState(serialized);
    const restoredGame = new window.Game({ state: deserialized });

    // Check health
    expect(restoredGame.health.available.length).toBe(game.health.available.length);
    expect(restoredGame.health.stock.length).toBe(game.health.stock.length);

    // Check dungeon stock
    expect(restoredGame.dungeon.stock.length).toBe(game.dungeon.stock.length);

    // Check dungeon matrix
    const originalMatrix = game.dungeon.matrix;
    const restoredMatrix = restoredGame.dungeon.matrix;

    for (let row = 0; row < originalMatrix.length; row++) {
      for (let col = 0; col < originalMatrix[row].length; col++) {
        const originalCell = originalMatrix[row][col];
        const restoredCell = restoredMatrix[row][col];

        if (originalCell.card) {
          expect(restoredCell.card).toBeDefined();
          expect(restoredCell.card.suitKey).toBe(originalCell.card.suitKey);
          expect(restoredCell.card.valueKey).toBe(originalCell.card.valueKey);
          expect(restoredCell.cardFaceDown).toBe(originalCell.cardFaceDown);
        }
      }
    }
  });

  it('serializes and restores a modified game state', () => {
    // Modify the game state
    game.health.available.pop(); // Lose health
    game.health.stock.push(new window.Card('HEARTS', 'FIVE'));
    game.gems.available.push(game.gems.stock.pop()); // Gain a gem

    // Serialize and restore
    const serialized = window.serializeGameState(game);
    const deserialized = window.deserializeGameState(serialized);
    const restoredGame = new window.Game({ state: deserialized });

    // Verify modified state is preserved
    expect(restoredGame.health.available.length).toBe(4); // Lost one health
    expect(restoredGame.health.stock.length).toBe(1);
    expect(restoredGame.gems.available.length).toBe(1); // Gained one gem
  });
});

describe('Seeded Game Creation', () => {
  it('creates identical games with the same seed', () => {
    const seed = 12345;
    const game1 = new window.Game({ seed });
    const game2 = new window.Game({ seed });

    // Check that shuffled decks are identical
    expect(game1.inventory.stock.length).toBe(game2.inventory.stock.length);
    for (let i = 0; i < game1.inventory.stock.length; i++) {
      expect(game1.inventory.stock[i].suitKey).toBe(game2.inventory.stock[i].suitKey);
      expect(game1.inventory.stock[i].valueKey).toBe(game2.inventory.stock[i].valueKey);
    }

    expect(game1.fate.stock.length).toBe(game2.fate.stock.length);
    for (let i = 0; i < game1.fate.stock.length; i++) {
      expect(game1.fate.stock[i].suitKey).toBe(game2.fate.stock[i].suitKey);
      expect(game1.fate.stock[i].valueKey).toBe(game2.fate.stock[i].valueKey);
    }

    expect(game1.dungeon.stock.length).toBe(game2.dungeon.stock.length);
    for (let i = 0; i < game1.dungeon.stock.length; i++) {
      expect(game1.dungeon.stock[i].suitKey).toBe(game2.dungeon.stock[i].suitKey);
      expect(game1.dungeon.stock[i].valueKey).toBe(game2.dungeon.stock[i].valueKey);
    }
  });

  it('creates different games with different seeds', () => {
    const game1 = new window.Game({ seed: 11111 });
    const game2 = new window.Game({ seed: 22222 });

    // At least one card should be different in shuffled decks
    let isDifferent = false;
    for (let i = 0; i < game1.inventory.stock.length; i++) {
      if (game1.inventory.stock[i].suitKey !== game2.inventory.stock[i].suitKey ||
          game1.inventory.stock[i].valueKey !== game2.inventory.stock[i].valueKey) {
        isDifferent = true;
        break;
      }
    }

    expect(isDifferent).toBe(true);
  });
});

describe('Card Serialization', () => {
  it('serializes cards correctly', () => {
    const testCases = [
      { card: new window.Card('HEARTS', 'ACE'), expected: { suit: 'HEARTS', value: 'ACE' } },
      { card: new window.Card('CLUBS', 'KING'), expected: { suit: 'CLUBS', value: 'KING' } },
      { card: new window.Card('DIAMONDS', 'TEN'), expected: { suit: 'DIAMONDS', value: 'TEN' } },
      { card: new window.Card('SPADES', 'FIVE'), expected: { suit: 'SPADES', value: 'FIVE' } },
      { card: new window.Card('RED', 'JOKER'), expected: { suit: 'RED', value: 'JOKER' } },
      { card: new window.Card('BLACK', 'JOKER'), expected: { suit: 'BLACK', value: 'JOKER' } },
    ];

    for (const { card, expected } of testCases) {
      const serialized = window.serializeCard(card);
      expect(serialized.suit).toBe(expected.suit);
      expect(serialized.value).toBe(expected.value);
    }
  });

  it('deserializes cards correctly', () => {
    const testCases = [
      { obj: { suit: 'HEARTS', value: 'ACE' }, expected: { suitKey: 'HEARTS', valueKey: 'ACE' } },
      { obj: { suit: 'CLUBS', value: 'KING' }, expected: { suitKey: 'CLUBS', valueKey: 'KING' } },
      { obj: { suit: 'DIAMONDS', value: 'TEN' }, expected: { suitKey: 'DIAMONDS', valueKey: 'TEN' } },
      { obj: { suit: 'SPADES', value: 'FIVE' }, expected: { suitKey: 'SPADES', valueKey: 'FIVE' } },
      { obj: { suit: 'RED', value: 'JOKER' }, expected: { suitKey: 'RED', valueKey: 'JOKER' } },
      { obj: { suit: 'BLACK', value: 'JOKER' }, expected: { suitKey: 'BLACK', valueKey: 'JOKER' } },
    ];

    for (const { obj, expected } of testCases) {
      const card = window.deserializeCard(obj);
      expect(card.suitKey).toBe(expected.suitKey);
      expect(card.valueKey).toBe(expected.valueKey);
    }
  });

  it('round-trips card serialization', () => {
    const originalCard = new window.Card('HEARTS', 'QUEEN');
    const serialized = window.serializeCard(originalCard);
    const deserialized = window.deserializeCard(serialized);

    expect(deserialized.suitKey).toBe(originalCard.suitKey);
    expect(deserialized.valueKey).toBe(originalCard.valueKey);
  });
});
