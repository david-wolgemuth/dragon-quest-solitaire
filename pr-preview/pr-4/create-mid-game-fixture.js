#!/usr/bin/env node

// Create a mid-game fixture by simulating some gameplay
// This creates a realistic mid-game state for testing

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Card, serializeGameState, createSeededRNG } from './url-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load required files for game simulation
const loadScript = (filename) => {
  const filepath = path.join(__dirname, filename);
  return fs.readFileSync(filepath, 'utf8');
};

// Create window global
globalThis.window = globalThis;

// Load cards.js
eval(loadScript('cards.js'));

const { HEARTS, CLUBS, DIAMONDS, SPADES, BLACK, RED, ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER } = window;

class Cell {
  constructor() {
    this.card = null;
    this.cardFaceDown = false;
    this.available = false;
  }
}

function buildPile(keyPairs) {
  return keyPairs.map(([suitKey, valueKey]) => new Card(suitKey, valueKey));
}

function shuffle(array, rng = Math.random) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Simplified Game class
class Game {
  constructor(seed) {
    const rng = createSeededRNG(seed);

    this.health = {
      stock: [],
      available: buildPile([
        [HEARTS, ACE],
        [HEARTS, TWO],
        [HEARTS, THREE],
        [HEARTS, FOUR],
        [HEARTS, FIVE],
      ]),
    };

    this.inventory = {
      stock: shuffle(
        buildPile([
          [HEARTS, JACK],
          [HEARTS, QUEEN],
          [HEARTS, KING],
          [DIAMONDS, JACK],
          [DIAMONDS, QUEEN],
          [DIAMONDS, KING],
          [RED, JOKER],
        ]),
        rng
      ),
      available: [],
    };

    this.gems = {
      stock: buildPile([
        [DIAMONDS, TEN],
        [DIAMONDS, NINE],
        [DIAMONDS, EIGHT],
        [DIAMONDS, SEVEN],
        [DIAMONDS, SIX],
        [DIAMONDS, FIVE],
        [DIAMONDS, FOUR],
        [DIAMONDS, THREE],
        [DIAMONDS, TWO],
        [DIAMONDS, ACE],
      ]).reverse(),
      available: [],
    };

    this.fate = {
      stock: shuffle(
        buildPile([
          [HEARTS, SIX],
          [HEARTS, SEVEN],
          [HEARTS, EIGHT],
          [HEARTS, NINE],
          [HEARTS, TEN],
        ]),
        rng
      ),
      available: [],
    };

    this.dungeon = {
      stock: shuffle(
        buildPile([
          [CLUBS, ACE],
          [CLUBS, TWO],
          [CLUBS, THREE],
          [CLUBS, FOUR],
          [CLUBS, FIVE],
          [CLUBS, SIX],
          [CLUBS, SEVEN],
          [CLUBS, EIGHT],
          [CLUBS, NINE],
          [CLUBS, TEN],
          [CLUBS, JACK],
          [CLUBS, QUEEN],
          [CLUBS, KING],
          [SPADES, ACE],
          [SPADES, TWO],
          [SPADES, THREE],
          [SPADES, FOUR],
          [SPADES, FIVE],
          [SPADES, SIX],
          [SPADES, SEVEN],
          [SPADES, EIGHT],
          [SPADES, NINE],
          [SPADES, TEN],
          [SPADES, JACK],
          [SPADES, QUEEN],
          [SPADES, KING],
          [BLACK, JOKER],
        ]),
        rng
      ),
      matrix: [[new Cell(), new Cell(), new Cell()], [new Cell(), new Cell(), new Cell()], [new Cell(), new Cell(), new Cell()]],
      available: [],
    };

    // Place initial card at center
    const centerCell = this.dungeon.matrix[1][1];
    centerCell.card = this.dungeon.stock.pop();
    centerCell.cardFaceDown = true;

    // Simulate some gameplay - add a few cards around the center
    // Add card to the right of center
    this.dungeon.matrix[1][2].card = this.dungeon.stock.pop();
    this.dungeon.matrix[1][2].cardFaceDown = false;

    // Add card above center
    this.dungeon.matrix[0][1].card = this.dungeon.stock.pop();
    this.dungeon.matrix[0][1].cardFaceDown = false;

    // Add card below center
    this.dungeon.matrix[2][1].card = this.dungeon.stock.pop();
    this.dungeon.matrix[2][1].cardFaceDown = false;

    // Flip center card to face up (player revealed it)
    centerCell.cardFaceDown = false;

    // Take some damage (lose 2 health)
    this.health.stock.push(this.health.available.pop());
    this.health.stock.push(this.health.available.pop());

    // Draw an inventory item
    if (this.inventory.stock.length > 0) {
      this.inventory.available.push(this.inventory.stock.pop());
    }

    // Draw a fate card
    if (this.fate.stock.length > 0) {
      this.fate.available.push(this.fate.stock.pop());
    }
  }
}

// Create mid-game state
const seed = 54321; // Different seed for variety
const game = new Game(seed);
const stateString = serializeGameState(game);

// Parse the state to create fixture
import { deserializeGameState } from './url-state.js';
const state = deserializeGameState(stateString);

// Create fixture
const fixture = {
  name: 'mid-game',
  description: 'Mid-game state with several cards revealed and some damage taken',
  createdAt: new Date().toISOString(),
  seed: seed,
  state: state
};

// Save fixture
const fixturesDir = path.join(__dirname, 'test', 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const fixturePath = path.join(fixturesDir, 'mid-game.json');
fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));

console.log(`✅ Mid-game fixture created: ${fixturePath}`);
console.log(`\nFixture summary:`);
console.log(`  Health: ${state.health.available.length} available, ${state.health.stock.length} in stock`);
console.log(`  Inventory: ${state.inventory.available.length} available, ${state.inventory.stock.length} in stock`);
console.log(`  Gems: ${state.gems.stock.length} in stock`);
console.log(`  Fate: ${state.fate.available.length} available, ${state.fate.stock.length} in stock`);
console.log(`  Dungeon stock: ${state.dungeonStock.length}`);
console.log(`  Matrix: ${state.matrixRows}x${state.matrixCols} with ${state.dungeonMatrix.length} cards`);
