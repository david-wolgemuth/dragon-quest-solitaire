/**
 * Integration test for #AAH - Hidden Pit Trap Gem Reduction
 *
 * Creates fixtures demonstrating automatic gem usage when hitting hidden pit traps.
 * Saves fixtures to test/fixtures/ for PR comment generation.
 */

import { describe, it, expect } from 'vitest';
import { Game } from '../src/core/game.js';
import { serializeGameState } from '../src/state/url-state.js';
import { CLUBS, SPADES } from '../src/cards/suits.js';
import { TWO, THREE, FOUR, FIVE, SIX } from '../src/cards/values.js';
import { Cell } from '../src/core/cell.js';
import { Card } from '../src/cards/card.js';
import fs from 'fs';
import path from 'path';

/**
 * Save a fixture to disk
 */
function saveFixture(game, name, description, metadata = {}) {
  const fixtureData = {
    name,
    description,
    createdAt: new Date().toISOString(),
    metadata: {
      issue: 'AAH',
      ...metadata
    },
    state: {
      health: {
        stock: game.health.stock.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey })),
        available: game.health.available.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey }))
      },
      inventory: {
        stock: game.inventory.stock.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey })),
        available: game.inventory.available.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey }))
      },
      gems: {
        stock: game.gems.stock.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey })),
        available: game.gems.available.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey }))
      },
      fate: {
        stock: game.fate.stock.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey })),
        available: game.fate.available.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey }))
      },
      dragonQueenDefeated: game.dragonQueenDefeated || false,
      dungeonStock: game.dungeon.stock.map(c => ({ suitKey: c.suitKey, valueKey: c.valueKey })),
      matrixRows: game.dungeon.matrix.length,
      matrixCols: game.dungeon.matrix[0]?.length || 0,
      dungeonMatrix: game.dungeon.matrix.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) =>
          cell.card ? {
            row: rowIdx,
            col: colIdx,
            card: { suitKey: cell.card.suitKey, valueKey: cell.card.valueKey },
            cardFaceDown: cell.cardFaceDown
          } : null
        ).filter(c => c !== null)
      )
    }
  };

  const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const fixturePath = path.join(fixturesDir, `${name}.json`);
  fs.writeFileSync(fixturePath, JSON.stringify(fixtureData, null, 2));

  return fixtureData;
}

describe('#AAH Integration - Hidden Pit Trap Gem Reduction', () => {
  it('creates a fixture demonstrating gem reduction on hidden traps', () => {
    const game = new Game({ seed: 12345 });

    // Give player some gems to use
    game._gainCard('gems', 5); // Player has 5 gems

    // Remove some health so we can see the difference
    game._loseCard('health', 2); // Player at 3/5 health

    // Set up dungeon with hidden pit traps
    // Create a 5x3 grid
    game.dungeon.matrix = Array(3).fill(null).map(() =>
      Array(5).fill(null).map(() => new Cell())
    );

    // Place cards strategically:
    // Row 1, Col 2: Hidden pit trap (2 damage) - 2 of Clubs
    const trap2 = new Card(CLUBS, TWO);
    game.dungeon.matrix[1][2].card = trap2;
    game.dungeon.matrix[1][2].cardFaceDown = true;
    game.dungeon.matrix[1][2].available = true;

    // Row 1, Col 3: Hidden pit trap (3 damage) - 3 of Clubs
    const trap3 = new Card(CLUBS, THREE);
    game.dungeon.matrix[1][3].card = trap3;
    game.dungeon.matrix[1][3].cardFaceDown = true;
    game.dungeon.matrix[1][3].available = false; // Not yet available

    // Row 1, Col 1: Gem card for comparison - 6 of Spades
    const gemCard = new Card(SPADES, SIX);
    game.dungeon.matrix[1][1].card = gemCard;
    game.dungeon.matrix[1][1].cardFaceDown = true;
    game.dungeon.matrix[1][1].available = false;

    // Row 0, Col 2: Another gem for later
    const gemCard2 = new Card(SPADES, SIX);
    game.dungeon.matrix[0][2].card = gemCard2;
    game.dungeon.matrix[0][2].cardFaceDown = true;
    game.dungeon.matrix[0][2].available = false;

    // Update dungeon stock to remove placed cards
    game.dungeon.stock = game.dungeon.stock.filter(card =>
      !(card.suitKey === 'CLUBS' && ['TWO', 'THREE'].includes(card.valueKey)) &&
      !(card.suitKey === 'SPADES' && card.valueKey === 'SIX')
    );

    // Verify setup
    expect(game.health.available.length).toBe(3); // 3/5 health
    expect(game.gems.available.length).toBe(5); // 5 gems

    // Save fixture
    const fixtureData = saveFixture(
      game,
      'aah-gem-reduction-progressive',
      '#AAH: Progressive gem reduction (2 traps)',
      { scenario: 'progressive', health: 3, gems: 5 }
    );

    expect(fixtureData).toBeTruthy();
    expect(fixtureData.state.gems.available.length).toBe(5);
  });

  it('creates a fixture showing full damage negation with enough gems', () => {
    const game = new Game({ seed: 54321 });

    // Give player exactly enough gems to negate a 2-damage trap
    game._gainCard('gems', 2);

    // Keep full health
    expect(game.health.available.length).toBe(5);

    // Set up a simple scenario: one hidden pit trap
    game.dungeon.matrix = Array(3).fill(null).map(() =>
      Array(3).fill(null).map(() => new Cell())
    );

    const trap = new Card(CLUBS, TWO); // 2 damage
    game.dungeon.matrix[1][1].card = trap;
    game.dungeon.matrix[1][1].cardFaceDown = true;
    game.dungeon.matrix[1][1].available = true;

    game.dungeon.stock = game.dungeon.stock.filter(card =>
      !(card.suitKey === 'CLUBS' && card.valueKey === 'TWO')
    );

    // Save fixture
    const fixtureData = saveFixture(
      game,
      'aah-gem-reduction-full-negation',
      '#AAH: Full damage negation (2 gems = 2 damage)',
      { scenario: 'full-negation', health: 5, gems: 2 }
    );

    expect(fixtureData).toBeTruthy();
    expect(fixtureData.state.gems.available.length).toBe(2);
  });

  it('creates a fixture showing no gems available (takes full damage)', () => {
    const game = new Game({ seed: 99999 });

    // NO gems available
    expect(game.gems.available.length).toBe(0);

    // Lower health so we can see the damage
    game._loseCard('health', 2); // 3/5 health

    game.dungeon.matrix = Array(3).fill(null).map(() =>
      Array(3).fill(null).map(() => new Cell())
    );

    const trap = new Card(CLUBS, TWO); // 2 damage
    game.dungeon.matrix[1][1].card = trap;
    game.dungeon.matrix[1][1].cardFaceDown = true;
    game.dungeon.matrix[1][1].available = true;

    game.dungeon.stock = game.dungeon.stock.filter(card =>
      !(card.suitKey === 'CLUBS' && card.valueKey === 'TWO')
    );

    // Save fixture
    const fixtureData = saveFixture(
      game,
      'aah-gem-reduction-no-gems',
      '#AAH: No gems - takes full damage',
      { scenario: 'no-gems', health: 3, gems: 0 }
    );

    expect(fixtureData).toBeTruthy();
    expect(fixtureData.state.gems.available.length).toBe(0);
  });
});
