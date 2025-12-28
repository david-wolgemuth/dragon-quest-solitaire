// Test setup file for Vitest
// This file runs before all tests

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import from new module locations
import { Card } from '../src/cards/card.js';
import { SUITS, HEARTS, CLUBS, SPADES, DIAMONDS, BLACK, RED } from '../src/cards/suits.js';
import { VALUES, ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER } from '../src/cards/values.js';
import { buildPitTrapCard, buildPassageCard, buildEnemyCard } from '../src/cards/card-builders.js';
import { DUNGEON_CARDS } from '../src/cards/dungeon-cards.js';
import { Cell } from '../src/core/cell.js';
import { MAX_WIDTH, MAX_HEIGHT } from '../src/core/constants.js';
import { Game } from '../src/core/game.js';
import { GameRenderer } from '../src/core/game-renderer.js';
import { buildPile, shuffle, allCards } from '../src/utils/card-utils.js';
import { createStyleSheet } from '../src/utils/style-generator.js';
import { logDebug } from '../src/utils/debug.js';
import { showErrorOverlay } from '../src/utils/error-handler.js';
import { serializeCard, deserializeCard, serializeGameState, deserializeGameState, createSeededRNG } from '../src/state/url-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a DOM environment with the necessary game elements
const html = `
<!DOCTYPE html>
<html>
<body>
  <div id="dungeon"><div class="matrix"></div></div>
  <table id="status-table">
    <tbody>
      <tr id="stock">
        <td id="health-stock"></td>
        <td id="inventory-stock"></td>
        <td id="gems-stock"></td>
        <td id="fate-stock"></td>
        <td id="dungeon-stock"></td>
      </tr>
      <tr id="available">
        <td id="health-available"></td>
        <td id="inventory-available"></td>
        <td id="gems-available"></td>
        <td id="fate-available"></td>
        <td id="dungeon-available"></td>
      </tr>
    </tbody>
  </table>
  <aside id="tutorial-modal">
    <div id="tutorial-modal-content">
      <div id="tutorial-modal-inner-content"></div>
      <div id="tutorial-modal-actions">
        <button id="tutorial-modal-dismiss">Dismiss</button>
        <button id="tutorial-modal-accept">Accept</button>
      </div>
    </div>
  </aside>
  <aside id="message-modal">
    <div id="message-modal-content">
      <div id="message-modal-inner-content"></div>
      <div id="message-modal-actions">
        <button id="message-modal-accept">Accept</button>
      </div>
    </div>
  </aside>
  <button id="reset-game">Reset Game</button>
</body>
</html>
`;

const dom = new JSDOM(html, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'outside-only'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Make all modules globally available on window (same as main.js does)
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
window.serializeCard = serializeCard;
window.deserializeCard = deserializeCard;
window.serializeGameState = serializeGameState;
window.deserializeGameState = deserializeGameState;
window.createSeededRNG = createSeededRNG;
window.DUNGEON_CARDS = DUNGEON_CARDS;
window.buildPitTrapCard = buildPitTrapCard;
window.buildPassageCard = buildPassageCard;
window.buildEnemyCard = buildEnemyCard;

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

// Create stylesheet for card CSS
createStyleSheet();
