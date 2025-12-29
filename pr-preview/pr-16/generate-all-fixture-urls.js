#!/usr/bin/env node

/**
 * Generates preview URLs for all fixtures in test/fixtures directory
 * This script is used by the PR preview workflow to dynamically
 * discover and generate links for all available test fixtures.
 *
 * Usage:
 *   node generate-all-fixture-urls.js <pr-number> [--json]
 *
 * Output formats:
 *   Default: GitHub Actions output format (key=value pairs for $GITHUB_OUTPUT)
 *   --json: JSON array with fixture metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serializeGameState } from './url-state.js';
import { Card } from './src/card.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get command line arguments
const args = process.argv.slice(2);
const prNumber = args[0];
const outputFormat = args.includes('--json') ? 'json' : 'github-actions';

if (!prNumber) {
  console.error('Usage: node generate-all-fixture-urls.js <pr-number> [--json]');
  process.exit(1);
}

// Load all fixtures
const fixturesDir = path.join(__dirname, 'test', 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  console.error('Error: test/fixtures directory not found');
  process.exit(1);
}

const fixtureFiles = fs.readdirSync(fixturesDir)
  .filter(file => file.endsWith('.json'))
  .sort();

if (fixtureFiles.length === 0) {
  console.error('Error: No fixture files found in test/fixtures/');
  process.exit(1);
}

const fixtures = [];

for (const file of fixtureFiles) {
  const fixturePath = path.join(fixturesDir, file);
  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  const { name, description, metadata = {}, state } = fixtureData;

  // Reconstruct game object for serialization
  const matrixRows = state.matrixRows ||
    Math.max(...state.dungeonMatrix.map(c => c.row), 0) + 1;
  const matrixCols = state.matrixCols ||
    Math.max(...state.dungeonMatrix.map(c => c.col), 0) + 1;

  const mockGame = {
    health: state.health,
    inventory: state.inventory,
    gems: state.gems,
    fate: state.fate,
    dungeon: {
      stock: state.dungeonStock,
      matrix: Array(matrixRows).fill(null).map(() =>
        Array(matrixCols).fill(null).map(() => ({
          card: null,
          cardFaceDown: false
        }))
      )
    }
  };

  // Place cards from dungeonMatrix
  for (const cellData of state.dungeonMatrix) {
    mockGame.dungeon.matrix[cellData.row][cellData.col] = {
      card: cellData.card,
      cardFaceDown: cellData.cardFaceDown
    };
  }

  // Serialize to URL state
  const stateString = serializeGameState(mockGame);
  const baseUrl = `https://david-wolgemuth.github.io/dragon-quest-solitaire/pr-preview/pr-${prNumber}`;
  const fullUrl = `${baseUrl}/?${stateString}`;

  // Calculate stats for the fixture
  const stats = {
    health: `${state.health.available.length}/${state.health.stock.length}`,
    matrixSize: `${matrixRows}x${matrixCols}`,
    cardsInMatrix: state.dungeonMatrix.length,
    dungeonStock: state.dungeonStock.length
  };

  fixtures.push({
    name,
    description,
    metadata,
    url: fullUrl,
    stats
  });
}

// Output based on format
if (outputFormat === 'json') {
  // JSON format for programmatic use
  console.log(JSON.stringify(fixtures, null, 2));
} else {
  // GitHub Actions format
  // Output each fixture as a variable (use sanitized name for variable)
  for (const fixture of fixtures) {
    const varName = fixture.name.replace(/-/g, '_');
    console.log(`${varName}_url=${fixture.url}`);
    console.log(`${varName}_desc=${fixture.description}`);
  }

  // Also output a list of all fixture names for iteration
  console.log(`fixture_names=${fixtures.map(f => f.name).join(',')}`);

  // Output count
  console.log(`fixture_count=${fixtures.length}`);
}
