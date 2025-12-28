import { describe, it, expect, beforeEach } from 'vitest';

// Import required modules (sets window globals)
import '../src/cards/suits.js';
import '../src/cards/values.js';
import '../src/cards/card.js';
import '../src/core/cell.js';
import '../src/core/game.js';
import '../src/core/game-renderer.js';

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

  // FIXME: Bug #5 - Hidden pit trap should auto-consume gems to reduce damage
  it.skip('should automatically reduce damage by consuming gems', () => {
    // Setup: Player has gems
    game._gainCard('gems', 2);
    placeCard(game, window.SPADES, window.TWO, 1, 1);

    expect(game.gems.available.length).toBe(2);
    expect(game.health.available.length).toBe(5);

    // Action: Player triggers hidden pit trap (2 damage, should auto-use 2 gems)
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Gems consumed instead of health lost
    expect(game.gems.available.length).toBe(0);
    expect(game.health.available.length).toBe(5); // No damage taken
  });
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

  // FIXME: Bug #3 - defeatDragonQueen() function not implemented
  it.skip('should trigger victory on critical success (fate 10)', () => {
    game.fateCheck = () => 10;
    game.defeatDragonQueen = undefined; // Simulate missing function

    // Action: Player gets critical hit on Dragon Queen
    // This should call defeatDragonQueen() and trigger victory
    expect(() => game.resolveCard({ row: 1, col: 1 })).toThrow();
  });
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

describe('Passage Cards (4-6 of Clubs/Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  // FIXME: Bug #8 - Passage matching currently broken due to wrong parameters
  it.skip('matches opposite suit passage and resolves both', () => {
    // Setup: Place two matching passages (4 of Clubs and 4 of Spades)
    placeCard(game, window.CLUBS, window.FOUR, 1, 1);
    placeCard(game, window.SPADES, window.FOUR, 2, 2);

    // Action: Resolve first passage
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Both passages marked as resolved
    expect(game.dungeon.matrix[1][1].cardFaceDown).toBe(true);
    expect(game.dungeon.matrix[2][2].cardFaceDown).toBe(true);
  });

  // FIXME: Bug #8 - Passage resolver passes wrong parameters to foundPassage()
  it.skip('should pass correct parameters to foundPassage', () => {
    // This test will fail because resolver passes (this, suit, value)
    // but foundPassage expects (suit, value)
    placeCard(game, window.CLUBS, window.FIVE, 1, 1);
    placeCard(game, window.SPADES, window.FIVE, 2, 2);

    game.resolveCard({ row: 1, col: 1 });

    // Currently broken: passages won't match correctly
    expect(game.dungeon.matrix[2][2].cardFaceDown).toBe(true);
  });

  // FIXME: Bug #9 - Passages can match against already-resolved (face-down) cards
  it.skip('should not match passages that are already resolved', () => {
    placeCard(game, window.CLUBS, window.SIX, 1, 1);
    placeCard(game, window.SPADES, window.SIX, 2, 2);

    // Manually mark the matching passage as already resolved
    game.dungeon.matrix[2][2].cardFaceDown = true;

    // Action: Try to resolve the first passage
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Should not find match (passage already resolved)
    // Currently broken: will incorrectly match the face-down card
    expect(game.dungeon.matrix[1][1].cardFaceDown).toBe(false); // Should not resolve
  });
});

describe('Exit Card (Ace of Spades)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
  });

  // FIXME: Bug #3 - resetDungeon() function not implemented
  it.skip('should reset dungeon when clicked', () => {
    placeCard(game, window.SPADES, window.ACE, 1, 1);
    game.resetDungeon = undefined; // Simulate missing function

    // Action: Player clicks exit card
    // This should call resetDungeon() to reset the dungeon
    expect(() => game.resolveCard({ row: 1, col: 1 })).toThrow();
  });
});

describe('Young Dragon (Queen of Clubs)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.CLUBS, window.QUEEN, 1, 1);
  });

  it('defeats Young Dragon with fate 10', () => {
    game.fateCheck = () => 10;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore);
  });

  it('takes 1 damage with fate below 10', () => {
    game.fateCheck = () => 9;

    const healthBefore = game.health.available.length;

    game.resolveCard({ row: 1, col: 1 });

    expect(game.health.available.length).toBe(healthBefore - 1);
  });

  // FIXME: Bug #7 - Young Dragon critical success gives 1 gem instead of 3
  it.skip('should gain 3 gems on critical success (fate 10)', () => {
    game.fateCheck = () => 10;

    const gemsBefore = game.gems.available.length;

    game.resolveCard({ row: 1, col: 1 });

    // Description says "gain 3 gems" but implementation only gives 1
    expect(game.gems.available.length).toBe(gemsBefore + 3);
  });
});

describe('Merchant (Ace of Clubs)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.CLUBS, window.ACE, 1, 1);
  });

  // FIXME: Bug #1 - Card selection buttons not rendered (not appended to DOM)
  it.skip('should display inventory selection when clicked', () => {
    // Mock getUserInputInventoryCardSelection to verify it's called
    let selectionCalled = false;
    game.getUserInputInventoryCardSelection = (message, callback) => {
      selectionCalled = true;
    };

    game.resolveCard({ row: 1, col: 1 });

    expect(selectionCalled).toBe(true);
    // Currently broken: buttons created but never appended to messageTextElement
  });

  it.skip('should cost 1 gem to purchase item', () => {
    game._gainCard('gems', 1);
    const gemsBefore = game.gems.available.length;

    // This would need proper mocking of the user selection
    game.resolveCard({ row: 1, col: 1 });

    expect(game.gems.available.length).toBe(gemsBefore - 1);
  });
});

describe('Generous Wizard (Black Joker)', () => {
  let game;

  beforeEach(() => {
    game = setupTestGame();
    placeCard(game, window.CLUBS, window.JOKER, 1, 1);
  });

  // FIXME: Bug #6 - Generous Wizard costs 1 gem but should be free
  it.skip('should be free (not cost a gem)', () => {
    game._gainCard('gems', 1);
    const gemsBefore = game.gems.available.length;

    // Action: Use Generous Wizard
    game.resolveCard({ row: 1, col: 1 });

    // Assert: Should not cost a gem
    expect(game.gems.available.length).toBe(gemsBefore); // Currently fails: loses 1 gem
  });
});
