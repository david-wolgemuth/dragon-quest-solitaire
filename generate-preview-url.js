#!/usr/bin/env node

// Generate a preview URL with game state for testing
// Usage: npm run preview-url [PR_NUMBER] [SEED]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load required files
const loadScript = (filename) => {
  const filepath = path.join(__dirname, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return content;
};

// Create a window-like global object for browser scripts
globalThis.window = globalThis;

// Load cards.js (sets window.SUITS, window.VALUES, etc.)
eval(loadScript('cards.js'));

// Load url-state.js functions (use indirect eval to make functions global)
(1, eval)(loadScript('url-state.js'));

// Use window constants directly
const { HEARTS, CLUBS, DIAMONDS, SPADES, BLACK, RED, ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER } = window;

// Define minimal classes and functions needed
class Card {
  constructor(suitKey, valueKey) {
    this.suitKey = suitKey;
    this.valueKey = valueKey;
  }
}

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

// Simplified Game class for state generation
class Game {
  constructor(options = {}) {
    const rng = options.seed ? createSeededRNG(options.seed) : Math.random;

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
      matrix: [[new Cell()]],
      available: [],
    };

    const centerCell = this.dungeon.matrix[0][0];
    centerCell.card = this.dungeon.stock.pop();
    centerCell.cardFaceDown = true;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const prNumber = args[0] || '4';
const seed = args[1] ? parseInt(args[1], 10) : Date.now();

// Generate game state
console.log(`\n🎮 Generating game state with seed: ${seed}\n`);
const game = new Game({ seed });
const stateString = serializeGameState(game);

// Build preview URL
const baseUrl = `https://david-wolgemuth.github.io/dragon-quest-solitaire/pr-preview/pr-${prNumber}/`;
const fullUrl = `${baseUrl}?${stateString}`;

console.log(`🔗 Preview URL for PR #${prNumber}:\n`);
console.log(`${fullUrl}\n`);
console.log(`📋 To copy: Ctrl+Click (or Cmd+Click) on the URL above\n`);
console.log(`💡 Tip: Use a different seed to generate different game states`);
console.log(`   Example: npm run preview-url ${prNumber} 12345\n`);
