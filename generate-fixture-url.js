#!/usr/bin/env node

// Generate preview URL from a test fixture
// Usage: node generate-fixture-url.js <fixture-name> <pr-number>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serializeGameState } from './url-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const urlOnly = args.includes('--url-only');
const nonFlagArgs = args.filter(arg => !arg.startsWith('--'));

if (nonFlagArgs.length < 2) {
  console.error('Usage: node generate-fixture-url.js [--url-only] <fixture-name> <pr-number>');
  console.error('Example: node generate-fixture-url.js mid-game 4');
  process.exit(1);
}

const fixtureName = nonFlagArgs[0];
const prNumber = nonFlagArgs[1];

try {
  // Load the fixture
  const fixturePath = path.join(__dirname, 'test', 'fixtures', `${fixtureName}.json`);

  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const state = fixtureData.state;

  // Create a mock game object that serializeGameState can use
  const mockGame = {
    health: state.health,
    inventory: state.inventory,
    gems: state.gems,
    fate: state.fate,
    dungeon: {
      stock: state.dungeonStock,
      matrix: []
    }
  };

  // Reconstruct the matrix
  const matrixRows = state.matrixRows || 1;
  const matrixCols = state.matrixCols || 1;

  for (let r = 0; r < matrixRows; r++) {
    const row = [];
    for (let c = 0; c < matrixCols; c++) {
      row.push({
        card: null,
        cardFaceDown: false,
        available: false
      });
    }
    mockGame.dungeon.matrix.push(row);
  }

  // Place cards from dungeonMatrix
  for (const cellData of state.dungeonMatrix) {
    mockGame.dungeon.matrix[cellData.row][cellData.col] = {
      card: cellData.card,
      cardFaceDown: cellData.cardFaceDown,
      available: false
    };
  }

  // Serialize to URL
  const stateString = serializeGameState(mockGame);
  const baseUrl = `https://david-wolgemuth.github.io/dragon-quest-solitaire/pr-preview/pr-${prNumber}/`;
  const fullUrl = `${baseUrl}?${stateString}`;

  if (urlOnly) {
    console.log(fullUrl);
  } else {
    console.log(`\n🎮 Preview URL for fixture "${fixtureName}" (PR #${prNumber}):\n`);
    console.log(`${fullUrl}\n`);
    console.log(`📊 Fixture: ${fixtureData.description || fixtureName}`);
    console.log(`   Created: ${fixtureData.createdAt || 'unknown'}`);
    console.log(`   Health: ${state.health.available.length}/${state.health.stock.length}`);
    console.log(`   Matrix: ${matrixRows}x${matrixCols} with ${state.dungeonMatrix.length} cards\n`);
  }

} catch (error) {
  console.error('❌ Failed to generate URL:', error.message);
  process.exit(1);
}
