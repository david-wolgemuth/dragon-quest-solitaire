/**
 * Integration test for #AAH - Hidden Pit Trap Gem Reduction
 *
 * Creates a fixture demonstrating automatic gem usage when hitting hidden pit traps.
 */

import { describe, it, expect } from 'vitest';
import { Game } from '../src/core/game.js';
import { serializeGameState } from '../src/state/url-state.js';
import { CLUBS, SPADES } from '../src/cards/suits.js';
import { TWO, THREE, FOUR, FIVE, SIX } from '../src/cards/values.js';
import { Cell } from '../src/core/cell.js';
import { Card } from '../src/cards/card.js';

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

    // Row 1, Col 1: Gem card for comparison - 7 of Spades
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
      !(card.suit.key === 'CLUBS' && ['TWO', 'THREE'].includes(card.value.key)) &&
      !(card.suit.key === 'SPADES' && card.value.key === 'SIX')
    );

    // Verify setup
    expect(game.health.available.length).toBe(3); // 3/5 health
    expect(game.gems.available.length).toBe(5); // 5 gems

    // Serialize the game state
    const stateString = serializeGameState(game);
    const fixtureUrl = `http://localhost:8008/?state=${encodeURIComponent(stateString)}`;

    console.log('\n🎮 QA FIXTURE - Hidden Pit Trap Gem Reduction (#AAH)');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📍 Fixture URL (copy and paste into browser):');
    console.log(fixtureUrl);
    console.log('\n📋 Test Scenario:');
    console.log('  • Player Health: 3/5 ❤️');
    console.log('  • Player Gems: 5 💎');
    console.log('  • Hidden Pit Trap (2 damage) ready to click - middle card');
    console.log('  • Hidden Pit Trap (3 damage) will become available after');
    console.log('\n✅ Expected Behavior:');
    console.log('  1. Click the first face-down card (2 of Clubs - Hidden Pit Trap)');
    console.log('  2. Card reveals as "Hidden Pit Trap (2 damage)"');
    console.log('  3. Modal shows gem consumption (-2 gems)');
    console.log('  4. After accepting: Gems: 5 → 3, Health: stays at 3');
    console.log('  5. Next card becomes available');
    console.log('  6. Click second trap (3 of Clubs - 3 damage)');
    console.log('  7. Gems: 3 → 0, Health: 3 → 2 (only 1 damage after using 3 gems)');
    console.log('\n🐛 Bug Behavior (if not fixed):');
    console.log('  • Gems would NOT be used automatically');
    console.log('  • Health would drop from 3 → 1 → would be DEAD');
    console.log('  • Game over without using gems');
    console.log('\n══════════════════════════════════════════════════════════\n');

    // Basic validation that fixture is valid
    expect(stateString).toBeTruthy();
    expect(stateString.length).toBeGreaterThan(100);
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
      !(card.suit.key === 'CLUBS' && card.value.key === 'TWO')
    );

    const stateString = serializeGameState(game);
    const fixtureUrl = `http://localhost:8008/?state=${encodeURIComponent(stateString)}`;

    console.log('\n🎮 QA FIXTURE - Full Damage Negation (#AAH)');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📍 Fixture URL:');
    console.log(fixtureUrl);
    console.log('\n📋 Test Scenario:');
    console.log('  • Health: 5/5 ❤️ (full)');
    console.log('  • Gems: 2 💎 (exactly enough for trap)');
    console.log('  • Hidden Pit Trap (2 damage) - center card');
    console.log('\n✅ Expected Behavior:');
    console.log('  1. Click the face-down card');
    console.log('  2. Modal shows: "Used 2 gems to reduce damage"');
    console.log('  3. After: Gems: 2 → 0, Health: STAYS AT 5 (no damage!)');
    console.log('\n══════════════════════════════════════════════════════════\n');

    expect(stateString).toBeTruthy();
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
      !(card.suit.key === 'CLUBS' && card.value.key === 'TWO')
    );

    const stateString = serializeGameState(game);
    const fixtureUrl = `http://localhost:8008/?state=${encodeURIComponent(stateString)}`;

    console.log('\n🎮 QA FIXTURE - No Gems Available (#AAH)');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📍 Fixture URL:');
    console.log(fixtureUrl);
    console.log('\n📋 Test Scenario:');
    console.log('  • Health: 3/5 ❤️');
    console.log('  • Gems: 0 💎 (none available)');
    console.log('  • Hidden Pit Trap (2 damage)');
    console.log('\n✅ Expected Behavior:');
    console.log('  1. Click the face-down card');
    console.log('  2. Modal shows: "Lose 2 health"');
    console.log('  3. After: Health: 3 → 1, Gems: stays at 0');
    console.log('\n══════════════════════════════════════════════════════════\n');

    expect(stateString).toBeTruthy();
  });
});
