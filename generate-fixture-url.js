#!/usr/bin/env node

// Generate preview URL from a test fixture
// Usage: node generate-fixture-url.js <fixture-name> <pr-number>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadFixtureFile, fixtureToURL } from './lib/fixture-utils.js';

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

  const fixtureData = loadFixtureFile(fixturePath);
  const fullUrl = fixtureToURL(fixtureData, prNumber);

  if (urlOnly) {
    console.log(fullUrl);
  } else {
    const state = fixtureData.state;
    const matrixRows = state.matrixRows || Math.max(...state.dungeonMatrix.map(c => c.row), 0) + 1;
    const matrixCols = state.matrixCols || Math.max(...state.dungeonMatrix.map(c => c.col), 0) + 1;

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
