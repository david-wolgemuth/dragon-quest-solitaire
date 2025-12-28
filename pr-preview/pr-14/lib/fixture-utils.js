/**
 * Fixture Utilities
 *
 * Shared utilities for working with test fixtures.
 * Extracts common logic for reconstructing game state from fixture data
 * and generating URLs for PR previews.
 */

import fs from 'fs';
import { serializeGameState } from '../src/state/url-state.js';

/**
 * Load a fixture file from disk
 * @param {string} fixturePath - Path to the fixture JSON file
 * @returns {Object} Parsed fixture data
 */
export function loadFixtureFile(fixturePath) {
  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  return fixtureData;
}

/**
 * Reconstruct a game state object from fixture state data
 * @param {Object} state - Fixture state object
 * @returns {Object} Mock game object suitable for serialization
 */
export function reconstructGameState(state) {
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
        Array(matrixCols).fill(null).map(() => ({ card: null, cardFaceDown: false }))
      )
    }
  };

  for (const cellData of state.dungeonMatrix) {
    mockGame.dungeon.matrix[cellData.row][cellData.col] = {
      card: cellData.card,
      cardFaceDown: cellData.cardFaceDown
    };
  }

  return mockGame;
}

/**
 * Convert a fixture to a PR preview URL
 * @param {Object} fixtureData - Fixture data object
 * @param {number} prNumber - Pull request number
 * @returns {string} Full URL for the PR preview
 */
export function fixtureToURL(fixtureData, prNumber) {
  const mockGame = reconstructGameState(fixtureData.state);
  const stateString = serializeGameState(mockGame);
  const baseUrl = `https://david-wolgemuth.github.io/dragon-quest-solitaire/pr-preview/pr-${prNumber}`;
  return `${baseUrl}/?${stateString}`;
}
