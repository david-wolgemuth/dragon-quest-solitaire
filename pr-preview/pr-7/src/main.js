/**
 * Main Entry Point
 *
 * Initializes the Dragon Quest Solitaire game and sets up event handlers.
 */

// Import all dependencies
import { SUITS, HEARTS, CLUBS, SPADES, DIAMONDS, BLACK, RED } from './cards/suits.js';
import {
  VALUES, ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER
} from './cards/values.js';
import { Card } from './cards/card.js';
import { buildPitTrapCard, buildPassageCard, buildEnemyCard } from './cards/card-builders.js';
import { DUNGEON_CARDS } from './cards/dungeon-cards.js';
import { Cell } from './core/cell.js';
import { MAX_WIDTH, MAX_HEIGHT } from './core/constants.js';
import { Game } from './core/game.js';
import { GameRenderer } from './core/game-renderer.js';
import { buildPile, shuffle, allCards } from './utils/card-utils.js';
import { createStyleSheet } from './utils/style-generator.js';
import { logDebug } from './utils/debug.js';
import { showErrorOverlay } from './utils/error-handler.js';
import {
  serializeGameState,
  deserializeGameState,
  createSeededRNG
} from './state/url-state.js';

// Make key classes and functions globally available for backwards compatibility
// and for dynamic access from the browser console
window.SUITS = SUITS;
window.VALUES = VALUES;
window.Card = Card;
window.Cell = Cell;
window.Game = Game;
window.GameRenderer = GameRenderer;
window.buildPile = buildPile;
window.shuffle = shuffle;
window.allCards = allCards;
window.createStyleSheet = createStyleSheet;
window.logDebug = logDebug;
window.showErrorOverlay = showErrorOverlay;
window.serializeGameState = serializeGameState;
window.deserializeGameState = deserializeGameState;
window.createSeededRNG = createSeededRNG;
window.DUNGEON_CARDS = DUNGEON_CARDS;

// Suit constants
window.HEARTS = HEARTS;
window.CLUBS = CLUBS;
window.SPADES = SPADES;
window.DIAMONDS = DIAMONDS;
window.BLACK = BLACK;
window.RED = RED;

// Value constants
window.ACE = ACE;
window.TWO = TWO;
window.THREE = THREE;
window.FOUR = FOUR;
window.FIVE = FIVE;
window.SIX = SIX;
window.SEVEN = SEVEN;
window.EIGHT = EIGHT;
window.NINE = NINE;
window.TEN = TEN;
window.JACK = JACK;
window.QUEEN = QUEEN;
window.KING = KING;
window.JOKER = JOKER;

// Constants
window.MAX_WIDTH = MAX_WIDTH;
window.MAX_HEIGHT = MAX_HEIGHT;

/**
 * Initialize and start the game
 */
function main() {
  try {
    // Create dynamic stylesheet for cards
    createStyleSheet();

    // Check if URL contains game state
    const urlParams = new URLSearchParams(window.location.search);
    let game;

    logDebug('🎮 Game initializing...');

    if (urlParams.toString()) {
      logDebug(`📥 Found URL params: ${urlParams.toString().substring(0, 100)}...`);
      logDebug('🔄 Attempting to load state from URL...');

      // Restore game from URL
      try {
        const state = deserializeGameState(urlParams.toString());
        logDebug('✅ State deserialized successfully');

        if (!state || !state.health || !state.inventory || !state.gems || !state.fate || !state.dungeonStock) {
          throw new Error('Deserialized state is incomplete or invalid. Missing required properties.');
        }

        logDebug('✅ State validation passed');
        logDebug(`📊 State: health=${state.health.available.length}/${state.health.stock.length}, inv=${state.inventory.stock.length}, dungeon stock=${state.dungeonStock.length}, matrix=${state.dungeonMatrix.length} cells`);

        // Log matrix cell details
        const matrixDetails = state.dungeonMatrix.map(c => {
          const card = c.card.suitKey?.[0] + c.card.valueKey?.[0] || `${c.card.suit?.[0] || '?'}${c.card.value?.[0] || '?'}`;
          return `(${c.row},${c.col}):${card}${c.cardFaceDown ? '↓' : '↑'}`;
        }).join(' ');
        logDebug(`🎴 Matrix cells: ${matrixDetails}`);

        game = new Game({ state });
        logDebug(`📊 Game: health=${game.health.available.length}/${game.health.stock.length}, inv=${game.inventory.stock.length}, dungeon stock=${game.dungeon.stock.length}, matrix=${game.dungeon.matrix.length}x${game.dungeon.matrix[0].length}`);

        // Log game matrix cell details after construction
        const gameMatrixCells = [];
        for (let r = 0; r < game.dungeon.matrix.length; r++) {
          for (let c = 0; c < game.dungeon.matrix[0].length; c++) {
            const cell = game.dungeon.matrix[r][c];
            if (cell.card) {
              const card = cell.card.suitKey?.[0] + cell.card.valueKey?.[0];
              gameMatrixCells.push(`(${r},${c}):${card}${cell.cardFaceDown ? '↓' : '↑'}`);
            }
          }
        }
        logDebug(`🎴 Game matrix cells: ${gameMatrixCells.join(' ')}`);
        logDebug('✅ Game created from URL state');
      } catch (error) {
        logDebug(`❌ Failed to load state: ${error.message}`, true);
        showErrorOverlay(
          'Failed to Load Game State from URL',
          'The URL contains game state parameters, but they could not be loaded. This might be because the URL is corrupted or from an old version. Click below to start a fresh game.',
          error
        );
        throw error; // Re-throw to prevent further execution
      }
    } else {
      logDebug('🆕 No URL params found, creating fresh game');
      // Create new game
      game = new Game();
    }

    game.render();
    logDebug('✅ Game rendered successfully');

    const resetGameButton = document.querySelector("#reset-game");
    resetGameButton.onclick = () => {
      logDebug('🔄 Resetting game...');
      game = new Game();
      game.render();
      // Clear URL when resetting
      window.history.replaceState(null, '', window.location.pathname);
      logDebug('✅ Game reset complete');
    }
  } catch (error) {
    logDebug(`❌ Fatal error in main(): ${error.message}`, true);
    // Catch any errors in main() and show overlay if one wasn't already shown
    if (!document.getElementById('error-overlay')) {
      showErrorOverlay(
        'Game Initialization Failed',
        'An unexpected error occurred while starting the game.',
        error
      );
    }
  }
}

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  if (!document.getElementById('error-overlay')) {
    showErrorOverlay(
      'Uncaught Error',
      'An error occurred that prevented the game from working correctly.',
      event.error
    );
  }
});

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
