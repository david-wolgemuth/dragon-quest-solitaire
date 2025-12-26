import { describe, it, expect, beforeEach } from 'vitest';

// Mock the display layer to bypass UI interactions in tests
function setupTestGame() {
  const game = new window.Game();

  // Mock displayResolution to immediately execute the callback
  game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
    callback();
  };

  // Mock displayMessage to do nothing
  game.displayMessage = () => {};

  return game;
}

// Helper to place a specific card in the dungeon for testing
function placeCard(game, suitKey, valueKey, row = 1, col = 1) {
  // Ensure the grid is big enough
  while (game.dungeon.matrix.length <= row) {
    game.dungeon.matrix.push([]);
  }
  while (game.dungeon.matrix[row].length <= col) {
    game.dungeon.matrix[row].push(new window.Cell());
  }

  // Place the card
  const cell = game.dungeon.matrix[row][col];
  cell.card = new window.Card(suitKey, valueKey);
  cell.cardFaceDown = false;
  cell.available = true;
}

describe('Gem Card (7 of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  it('gives player 1 gem when resolved', () => {
    // Setup: Place gem card in dungeon
    placeCard(game, window.SPADES, window.SEVEN, 1, 1);

    const gemsBefore = game.gems.available.length;

    // Action: Player clicks the gem card
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player gained 1 gem
    expect(game.gems.available.length).toBe(gemsBefore + 1);
    expect(game.gems.stock.length).toBe(9);
  });

  it('marks card as resolved after collection', () => {
    placeCard(game, window.SPADES, window.SEVEN, 1, 1);

    game.resolveCard({ row: 1, col: 1 });

    // Card should be face-down (resolved)
    expect(game.dungeon.matrix[1][1].cardFaceDown).toBe(true);
  });
});

describe('Healing Card (8 of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  it('restores 2 health when player is damaged', () => {
    // Setup: Player has taken damage
    game._loseCard('health', 3);
    placeCard(game, window.SPADES, window.EIGHT, 1, 1);

    expect(game.health.available.length).toBe(2);

    // Action: Player clicks healing card
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player healed 2 health
    expect(game.health.available.length).toBe(4);
  });

  it('cannot heal beyond maximum health', () => {
    // Setup: Player at full health
    placeCard(game, window.SPADES, window.EIGHT, 1, 1);

    expect(game.health.available.length).toBe(5);

    // Action: Player clicks healing card
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Health capped at maximum
    expect(game.health.available.length).toBe(5);
    expect(game.health.stock.length).toBe(0);
  });
});

describe('Treasure Chest Card (9 of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  it('gives player 1 inventory item', () => {
    placeCard(game, window.SPADES, window.NINE, 1, 1);

    const inventoryBefore = game.inventory.available.length;

    // Action: Player clicks treasure chest
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player gained 1 item
    expect(game.inventory.available.length).toBe(inventoryBefore + 1);
  });
});

describe('Hidden Pit Trap (2 of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  it('deals 2 damage when triggered', () => {
    placeCard(game, window.SPADES, window.TWO, 1, 1);

    expect(game.health.available.length).toBe(5);

    // Action: Player clicks hidden pit trap
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player took 2 damage
    expect(game.health.available.length).toBe(3);
    expect(game.health.stock.length).toBe(2);
  });

  // Note: Auto-gem reduction not implemented yet (Bug #5)
});

describe('Visible Pit Trap (3 of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  it('deals 1 damage when crossed', () => {
    placeCard(game, window.SPADES, window.THREE, 1, 1);

    expect(game.health.available.length).toBe(5);

    // Action: Player chooses to cross the trap
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player took 1 damage
    expect(game.health.available.length).toBe(4);
  });
});

describe('Slime (10 of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.SPADES, window.TEN, 1, 1);
  });

  it('defeats slime with fate 7+', () => {
    // Mock fate to succeed (7-10)
    game.fateCheck = () => 7;

    const healthBefore = game.health.available.length;

    // Action: Player attacks slime
    game.resolveCard({ row: 1, col: 1 });

    // Assert: No damage taken
    expect(game.health.available.length).toBe(healthBefore);
  });

  it('takes 1 damage with fate below 7', () => {
    // Mock fate to fail (6)
    game.fateCheck = () => 6;

    const healthBefore = game.health.available.length;

    // Action: Player attacks slime and loses
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player took 1 damage
    expect(game.health.available.length).toBe(healthBefore - 1);
  });

  it('heals 1 health on critical success (fate 10)', () => {
    // Setup: Player damaged
    game._loseCard('health', 2);

    // Mock fate for critical
    game.fateCheck = () => 10;

    const healthBefore = game.health.available.length;

    // Action: Player gets critical hit on slime
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Player healed 1
    expect(game.health.available.length).toBe(healthBefore + 1);
  });
});

describe('Skeleton (Jack of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.SPADES, window.JACK, 1, 1);
  });

  it('defeats skeleton with fate 8+', () => {
    game.fateCheck = () => 8;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore);
  });

  it('takes 1 damage with fate below 8', () => {
    game.fateCheck = () => 7;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore - 1);
  });

  it('gains 1 gem on critical success', () => {
    game.fateCheck = () => 10;

    const gemsBefore = game.gems.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.gems.available.length).toBe(gemsBefore + 1);
  });
});

describe('Dragon Queen (Queen of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.SPADES, window.QUEEN, 1, 1);
  });

  it('defeats Dragon Queen with fate 9+', () => {
    game.fateCheck = () => 9;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore);
  });

  it('takes 3 damage with fate below 9', () => {
    game.fateCheck = () => 8;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore - 3);
  });

  // Note: defeatDragonQueen() not implemented yet (Bug #3)
});

describe('Troll (King of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.SPADES, window.KING, 1, 1);
  });

  it('defeats troll with fate 9+', () => {
    game.fateCheck = () => 9;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore);
  });

  it('takes 2 damage with fate below 9', () => {
    game.fateCheck = () => 8;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore - 2);
  });

  it('gains inventory item on critical success', () => {
    game.fateCheck = () => 10;

    const inventoryBefore = game.inventory.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.inventory.available.length).toBe(inventoryBefore + 1);
  });
});
