// Test setup file for Vitest
// This file runs before all tests and sets up the DOM environment

import { JSDOM } from 'jsdom';

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

// Set up global DOM variables for all tests
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Note: Individual test files should import the modules they need.
// This ensures import errors are caught and tests only load necessary dependencies.
