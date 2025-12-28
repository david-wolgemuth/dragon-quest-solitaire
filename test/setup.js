// Test setup file for Vitest
// This file runs before all tests

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Card, serializeCard, deserializeCard, serializeGameState, deserializeGameState, createSeededRNG } from '../url-state.js';

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

// Function to load and execute a script in the window context
const loadScript = (filename) => {
  const filepath = path.join(__dirname, '..', filename);
  const content = fs.readFileSync(filepath, 'utf8');

  // Execute in the context of the window
  dom.window.eval(content);
};

// Load game files in the correct order (same as index.html)
loadScript('cards.js');
loadScript('card-builders.js');
loadScript('dungeon-cards.js');

// url-state.js is now an ES module, so we import it at the top and assign to window
window.Card = Card;
window.serializeCard = serializeCard;
window.deserializeCard = deserializeCard;
window.serializeGameState = serializeGameState;
window.deserializeGameState = deserializeGameState;
window.createSeededRNG = createSeededRNG;

// Load index.js but wrap it to prevent main() from running
const indexPath = path.join(__dirname, '..', 'index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Remove the call to main() at the end
indexContent = indexContent.replace(/\nmain\(\);?\s*$/, '');

// Also export classes and functions to window explicitly
indexContent += `
// Make classes and functions available on window for tests
// Card, serializeCard, deserializeCard, serializeGameState, deserializeGameState, createSeededRNG
// are already loaded from url-state.js
window.Cell = Cell;
window.Game = Game;
window.GameRenderer = GameRenderer;
`;

dom.window.eval(indexContent);

// Make sure Card and url-state functions are accessible on window for tests
global.window.Card = dom.window.Card;
global.window.serializeCard = dom.window.serializeCard;
global.window.deserializeCard = dom.window.deserializeCard;
global.window.serializeGameState = dom.window.serializeGameState;
global.window.deserializeGameState = dom.window.deserializeGameState;
global.window.createSeededRNG = dom.window.createSeededRNG;
