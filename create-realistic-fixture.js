#!/usr/bin/env node

// Create fixture from realistic game interactions
// This simulates actual gameplay to create realistic states

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serializeGameState, deserializeGameState } from './url-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load and execute game scripts
const loadScript = (filename) => {
  const filepath = path.join(__dirname, filename);
  return fs.readFileSync(filepath, 'utf8');
};

// Setup window global
globalThis.window = globalThis;

// Load all game files in order (same as index.html)
eval(loadScript('card-builders.js'));
eval(loadScript('cards.js'));
eval(loadScript('dungeon-cards.js'));

// Load url-state exports to window
import { Card, createSeededRNG } from './url-state.js';
window.Card = Card;
window.createSeededRNG = createSeededRNG;

// Load index.js (the actual game implementation)
const indexContent = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8')
  .replace(/\nmain\(\);?\s*$/, ''); // Remove main() call

// Stub out DOM-dependent methods
const stubDOMMethods = `
// Stub out rendering and DOM interactions for server-side simulation
Game.prototype.render = function() { /* no-op */ };
GameRenderer.prototype.renderHealth = function() { /* no-op */ };
GameRenderer.prototype.renderInventory = function() { /* no-op */ };
GameRenderer.prototype.renderGems = function() { /* no-op */ };
GameRenderer.prototype.renderFate = function() { /* no-op */ };
GameRenderer.prototype.renderDungeon = function() { /* no-op */ };
GameRenderer.prototype.renderMessage = function() { /* no-op */ };
GameRenderer.prototype.addTutorialModal = function() { /* no-op */ };
GameRenderer.prototype.renderFateCheckResolution = function(html, opts) {
  // Auto-accept in simulation
  if (opts && opts.onAccept) opts.onAccept();
};
Game.prototype.displayMessage = function() { /* no-op */ };
Game.prototype.displayResolution = function(card, amount, pile, callback) {
  // Auto-execute callback in simulation
  callback();
};
Game.prototype.getUserInputInventoryCardSelection = function(msg, callback) {
  // Auto-select first card in simulation
  const card = this.inventory.stock[0];
  if (card) callback(card);
};

// Stub logDebug
window.logDebug = function() { /* no-op */ };
`;

eval(indexContent + stubDOMMethods);

// Now we can use the real Game class to simulate gameplay
const { Game } = window;

// Simulate a mid-game scenario
console.log('🎮 Creating realistic mid-game fixture...\n');

const game = new Game({ seed: 54321 });

console.log('Starting state:');
console.log(`  Health: ${game.health.available.length}`);
console.log(`  Matrix: ${game.dungeon.matrix.length}x${game.dungeon.matrix[0].length}`);
console.log(`  Cards with stock: ${game.dungeon.stock.length}\n`);

// Simulate gameplay: add cards to available positions
const moves = [
  // Move 1: Add card to position with card (should expand dungeon)
  () => {
    const availablePositions = [];
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[r].length; c++) {
        if (game.dungeon.matrix[r][c].available) {
          availablePositions.push({ row: r, col: c });
        }
      }
    }
    if (availablePositions.length > 0) {
      const pos = availablePositions[0];
      console.log(`➕ Adding card to (${pos.row},${pos.col})`);
      game.addCardToDungeon(pos);
    }
  },

  // Move 2: Resolve a card (if possible)
  () => {
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[r].length; c++) {
        const cell = game.dungeon.matrix[r][c];
        if (cell.card && !cell.cardFaceDown && cell.available) {
          console.log(`⚔️  Resolving card at (${r},${c})`);
          game.resolveCard({ row: r, col: c });
          return;
        }
      }
    }
  },

  // Add a few more cards
  () => {
    const availablePositions = [];
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[r].length; c++) {
        if (game.dungeon.matrix[r][c].available) {
          availablePositions.push({ row: r, col: c });
        }
      }
    }
    if (availablePositions.length > 0) {
      const pos = availablePositions[0];
      console.log(`➕ Adding card to (${pos.row},${pos.col})`);
      game.addCardToDungeon(pos);
    }
  },

  () => {
    const availablePositions = [];
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[r].length; c++) {
        if (game.dungeon.matrix[r][c].available) {
          availablePositions.push({ row: r, col: c });
        }
      }
    }
    if (availablePositions.length > 0) {
      const pos = availablePositions[1] || availablePositions[0];
      console.log(`➕ Adding card to (${pos.row},${pos.col})`);
      game.addCardToDungeon(pos);
    }
  },

  () => {
    const availablePositions = [];
    for (let r = 0; r < game.dungeon.matrix.length; r++) {
      for (let c = 0; c < game.dungeon.matrix[r].length; c++) {
        if (game.dungeon.matrix[r][c].available) {
          availablePositions.push({ row: r, col: c });
        }
      }
    }
    if (availablePositions.length > 1) {
      const pos = availablePositions[1];
      console.log(`➕ Adding card to (${pos.row},${pos.col})`);
      game.addCardToDungeon(pos);
    }
  },
];

// Execute moves
moves.forEach((move, i) => {
  console.log(`\n--- Move ${i + 1} ---`);
  move();
  console.log(`Matrix now: ${game.dungeon.matrix.length}x${game.dungeon.matrix[0].length}`);
  console.log(`Health: ${game.health.available.length}, Stock: ${game.dungeon.stock.length}`);
});

console.log('\n📊 Final state:');
console.log(`  Health: ${game.health.available.length}/${game.health.stock.length}`);
console.log(`  Inventory: ${game.inventory.available.length}/${game.inventory.stock.length}`);
console.log(`  Fate: ${game.fate.available.length}/${game.fate.stock.length}`);
console.log(`  Matrix: ${game.dungeon.matrix.length}x${game.dungeon.matrix[0].length}`);
console.log(`  Dungeon stock: ${game.dungeon.stock.length}`);

// Count cards in matrix
let cardsInMatrix = 0;
for (let r = 0; r < game.dungeon.matrix.length; r++) {
  for (let c = 0; c < game.dungeon.matrix[r].length; c++) {
    if (game.dungeon.matrix[r][c].card) cardsInMatrix++;
  }
}
console.log(`  Cards in matrix: ${cardsInMatrix}`);

// Serialize to state
const stateString = serializeGameState(game);
const state = deserializeGameState(stateString);

// Create fixture
const fixture = {
  name: 'mid-game',
  description: 'Realistic mid-game state from actual gameplay simulation',
  createdAt: new Date().toISOString(),
  seed: 54321,
  moves: moves.length,
  state: state
};

// Save fixture
const fixturesDir = path.join(__dirname, 'test', 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const fixturePath = path.join(fixturesDir, 'mid-game.json');
fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));

console.log(`\n✅ Realistic mid-game fixture saved: ${fixturePath}`);
