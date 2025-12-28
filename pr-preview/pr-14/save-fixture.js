#!/usr/bin/env node

// Save game state as a test fixture
// Usage: node save-fixture.js <fixture-name> <state-url-param>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deserializeGameState } from './url-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node save-fixture.js <fixture-name> <state-param>');
  console.error('Example: node save-fixture.js mid-game "state=eyJ..."');
  process.exit(1);
}

const fixtureName = args[0];
const stateParam = args[1];

try {
  // Deserialize the state to validate it
  const state = deserializeGameState(stateParam);

  // Create a fixture object with metadata
  const fixture = {
    name: fixtureName,
    description: `Game state fixture: ${fixtureName}`,
    createdAt: new Date().toISOString(),
    state: state
  };

  // Save to fixtures directory
  const fixturesDir = path.join(__dirname, 'test', 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const fixturePath = path.join(fixturesDir, `${fixtureName}.json`);
  fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));

  console.log(`✅ Fixture saved to: ${fixturePath}`);
  console.log(`\nFixture summary:`);
  console.log(`  Health: ${state.health.available.length}/${state.health.stock.length}`);
  console.log(`  Inventory: ${state.inventory.stock.length} in stock`);
  console.log(`  Gems: ${state.gems.stock.length} in stock`);
  console.log(`  Fate: ${state.fate.stock.length} in stock`);
  console.log(`  Dungeon stock: ${state.dungeonStock.length}`);
  console.log(`  Matrix: ${state.matrixRows}x${state.matrixCols} (${state.dungeonMatrix.length} cells with cards)`);

} catch (error) {
  console.error('❌ Failed to save fixture:', error.message);
  process.exit(1);
}
