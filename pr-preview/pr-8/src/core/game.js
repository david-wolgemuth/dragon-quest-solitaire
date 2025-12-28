/**
 * Game Class
 *
 * Core game logic for Dragon Quest Solitaire.
 * Manages game state including health, inventory, gems, fate deck, and dungeon matrix.
 */

import { Cell } from './cell.js';
import { MAX_WIDTH, MAX_HEIGHT } from './constants.js';
import { Card } from '../cards/card.js';
import { HEARTS, CLUBS, SPADES, DIAMONDS, BLACK, RED, SUITS } from '../cards/suits.js';
import {
  ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, JOKER
} from '../cards/values.js';
import { DUNGEON_CARDS } from '../cards/dungeon-cards.js';
import { buildPile, shuffle } from '../utils/card-utils.js';
import { serializeGameState, createSeededRNG } from '../state/url-state.js';
import { logDebug } from '../utils/debug.js';

// GameRenderer will be imported via window.GameRenderer for now to avoid circular dependencies
// This gets set when GameRenderer is loaded

/**
 * Main Game class managing all game state and logic
 */
export class Game {
  /**
   * Create a new game or restore from saved state
   * @param {Object} [options={}] - Game initialization options
   * @param {Object} [options.state] - Saved game state to restore
   * @param {number} [options.seed] - Random seed for deterministic gameplay
   */
  constructor(options = {}) {
    // Track game over state
    this.isGameOver = false;

    // If state is provided, restore from it
    if (options.state) {
      this.health = options.state.health;
      this.inventory = options.state.inventory;
      this.gems = options.state.gems;
      this.fate = options.state.fate;

      // Restore dungeon matrix
      // Use saved matrix dimensions if available, otherwise calculate from cell positions
      const matrixRows = options.state.matrixRows ||
        Math.max(...options.state.dungeonMatrix.map(c => c.row), 0) + 1;
      const matrixCols = options.state.matrixCols ||
        Math.max(...options.state.dungeonMatrix.map(c => c.col), 0) + 1;

      this.dungeon = {
        stock: options.state.dungeonStock,
        matrix: Array(matrixRows).fill(null).map(() =>
          Array(matrixCols).fill(null).map(() => new Cell())
        ),
        available: []
      };

      // Populate matrix cells
      for (const cellData of options.state.dungeonMatrix) {
        const cell = this.dungeon.matrix[cellData.row][cellData.col];
        cell.card = cellData.card;
        cell.cardFaceDown = cellData.cardFaceDown;
      }

      // Update availability only - don't expand/trim the dungeon since
      // the state already has the correct matrix size
      this._updateDungeonAvailability();
      return;
    }

    // Determine RNG (seeded or random)
    const rng = options.seed ? createSeededRNG(options.seed) : Math.random;

    // Initialize new game
    this.health = {
      stock: [],
      available: buildPile([
        [HEARTS, ACE],
        [HEARTS, TWO],
        [HEARTS, THREE],
        [HEARTS, FOUR],
        [HEARTS, FIVE],
      ]),
    };

    this.inventory = {
      stock: shuffle(
        buildPile([
          [HEARTS, JACK],
          [HEARTS, QUEEN],
          [HEARTS, KING],
          [DIAMONDS, JACK],
          [DIAMONDS, QUEEN],
          [DIAMONDS, KING],
          [RED, JOKER],
        ]),
        rng
      ),
      available: [],
    };

    this.gems = {
      stock: buildPile([
        [DIAMONDS, TEN],
        [DIAMONDS, NINE],
        [DIAMONDS, EIGHT],
        [DIAMONDS, SEVEN],
        [DIAMONDS, SIX],
        [DIAMONDS, FIVE],
        [DIAMONDS, FOUR],
        [DIAMONDS, THREE],
        [DIAMONDS, TWO],
        [DIAMONDS, ACE],
      ]).reverse(),
      available: [],
    };

    this.fate = {
      stock: shuffle(
        buildPile([
          [HEARTS, SIX],
          [HEARTS, SEVEN],
          [HEARTS, EIGHT],
          [HEARTS, NINE],
          [HEARTS, TEN],
        ]),
        rng
      ),
      available: [],
    };

    this.dungeon = {
      stock: shuffle(
        buildPile([
          [CLUBS, ACE],
          [CLUBS, TWO],
          [CLUBS, THREE],
          [CLUBS, FOUR],
          [CLUBS, FIVE],
          [CLUBS, SIX],
          [CLUBS, SEVEN],
          [CLUBS, EIGHT],
          [CLUBS, NINE],
          [CLUBS, TEN],
          [CLUBS, JACK],
          [CLUBS, QUEEN],
          [CLUBS, KING],
          [SPADES, ACE],
          [SPADES, TWO],
          [SPADES, THREE],
          [SPADES, FOUR],
          [SPADES, FIVE],
          [SPADES, SIX],
          [SPADES, SEVEN],
          [SPADES, EIGHT],
          [SPADES, NINE],
          [SPADES, TEN],
          [SPADES, JACK],
          [SPADES, QUEEN],
          [SPADES, KING],
          [BLACK, JOKER],
        ]),
        rng
      ),
      matrix: [[new Cell()]],
      available: [],  // match pattern for status piles, but not used
    };
    const centerCell = this.dungeon.matrix[0][0];
    centerCell.card = this.dungeon.stock.pop();
    centerCell.cardFaceDown = true;
    this.updateDungeon();
  }

  /**
   * Add a card from the dungeon deck to a specific cell
   * @param {Object} position - Cell position
   * @param {number} position.row - Row index
   * @param {number} position.col - Column index
   */
  addCardToDungeon({ row, col }) {
    const card = this.dungeon.stock.pop();
    const cell = this.dungeon.matrix[row][col];
    cell.cardFaceDown = false;
    cell.card = card;
    logDebug(`🃏 Added ${card.suitKey[0]}${card.valueKey[0]} to (${row},${col})`);
    this.updateDungeon();
    this.render();
  }

  /**
   * Resolve (activate) a dungeon card at a specific position
   * @param {Object} position - Cell position
   * @param {number} position.row - Row index
   * @param {number} position.col - Column index
   */
  resolveCard({ row, col }) {
    const cell = this.dungeon.matrix[row][col];
    const dungeonCard = DUNGEON_CARDS[cell.card.suit.key][cell.card.value.key];
    logDebug(`⚔️ Resolving ${cell.card.suitKey[0]}${cell.card.valueKey[0]} at (${row},${col}): ${dungeonCard.name}`);
    const resolved = dungeonCard.resolver(this);
    if (resolved !== false) {
      cell.cardFaceDown = true;
      this.updateDungeon();
      this.render();
      logDebug(`✅ Card resolved, flipped face down`);
    } else {
      logDebug(`❌ Card not resolved`);
      // assume already displayed a message
    }
  }

  /**
   * Update dungeon state (expand, trim, update availability)
   */
  updateDungeon() {
    this._expandDungeon();
    this._trimDungeon();
    this._updateDungeonAvailability();
  }

  /**
   * Gain health
   * @param {Object} dungeonCard - The card that triggered this
   * @param {number} [amount=1] - Amount of health to gain
   */
  gainHealth(dungeonCard, amount) {
    this.displayResolution(dungeonCard, (amount || 1), "health", () => {
      this._gainCard("health", amount);
      this.render();
    });
  }

  /**
   * Lose health
   * @param {Object} dungeonCard - The card that triggered this
   * @param {number} [amount=1] - Amount of health to lose
   */
  loseHealth(dungeonCard, amount) {
    this.displayResolution(dungeonCard, -(amount || 1), "health", () => {
      this._loseCard("health", amount);
      this.render();
    });
  }

  /**
   * Gain gems
   * @param {Object} dungeonCard - The card that triggered this
   * @param {number} [amount=1] - Amount of gems to gain
   */
  gainGem(dungeonCard, amount) {
    this.displayResolution(dungeonCard, (amount || 1), "gems", () => {
      this._gainCard("gems", amount);
      this.render();
    });
  }

  /**
   * Lose gems
   * @param {Object} dungeonCard - The card that triggered this
   * @param {number} [amount=1] - Amount of gems to lose
   */
  loseGem(dungeonCard, amount) {
    amount = amount || 1;
    this.displayResolution(dungeonCard, -amount, "gems", () => {
      this._loseCard("gems", amount);
      this.render();
    });
  }

  /**
   * Gain inventory item
   * @param {Object} dungeonCard - The card that triggered this
   * @param {number} [amount=1] - Amount of items to gain
   */
  gainInventory(dungeonCard, amount) {
    this.displayResolution(dungeonCard, (amount || 1), "inventory", () => {
      this._gainCard("inventory", amount);
      this.render();
    });
  }

  /**
   * Lose inventory item
   * @param {Object} dungeonCard - The card that triggered this
   * @param {number} [amount=1] - Amount of items to lose
   */
  loseInventory(dungeonCard, amount) {
    this.displayResolution(dungeonCard, -(amount || 1), "inventory", () => {
      this._loseCard("inventory", amount);
      this.render();
    });
  }

  /**
   * Display a resolution modal showing the result of a card action
   * @param {Object} dungeonCard - The card that triggered the resolution
   * @param {number} amount - The amount to gain/lose
   * @param {string} pileKey - The pile key (health, gems, inventory)
   * @param {Function} callback - Function to call when resolution is accepted
   */
  displayResolution(dungeonCard, amount, pileKey, callback) {
    const GameRenderer = window.GameRenderer;
    const renderer = new GameRenderer(this);
    const acceptButton = document.createElement("button");
    acceptButton.innerHTML = "Accept";
    acceptButton.addEventListener("click", () => {
      callback();
    });

    let pileCardSuit;
    switch (pileKey) {
      case "health":
        pileCardSuit = SUITS.HEARTS.code;
        break;
      case "gems":
        pileCardSuit = SUITS.DIAMONDS.code;
        break;
      case "inventory":
        pileCardSuit = SUITS.RED.code;  // TODO: this can be DIAMONDS or HEARTS or RED (joker)
        break;
      default:
        throw new Error(`Unknown pileKey: ${pileKey}`);
    }

    const cardClassName = `card-${pileCardSuit}${Math.abs(amount)}`;

    renderer.renderFateCheckResolution(
      `<h4>Result Your ${pileKey} pile will
          <div class="${cardClassName}"></div>
          ${amount > 0 ? "gain" : "lose"} ${Math.abs(amount)} cards</h4>

          <hr>

          <h5>${dungeonCard.name}</h5>
          <p>${dungeonCard.description}</p>
      `,
      {
        actions: [acceptButton],
        onAccept: callback
      },
    )
  }

  /**
   * Check if corresponding passage is found in the dungeon
   * @param {string} suit - Suit of the passage
   * @param {string} value - Value of the passage
   * @returns {boolean} True if passage was found, false otherwise
   */
  foundPassage(suit, value) {
    const oppositeSuit = suit === CLUBS ? SPADES : CLUBS;
    for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.dungeon.matrix[row].length; col += 1) {
        const cell = this.dungeon.matrix[row][col];
        if (cell.card && cell.card.suitKey === oppositeSuit && cell.card.valueKey === value) {
          cell.cardFaceDown = true; // (resolved)
          return true;
        }
      }
    }
    this.displayMessage("You found a passage, but it doesn't match any other passage in the dungeon.");
    return false;
  }

  /**
   * Display a message to the user
   * @param {string} message - Message to display
   */
  displayMessage(message) {
    const GameRenderer = window.GameRenderer;
    const renderer = new GameRenderer(this);
    renderer.renderMessage(message);
  }

  /**
   * Get user input for selecting an inventory card (Merchant/Wizard)
   * @param {string} message - Prompt message
   * @param {Function} callback - Callback function receiving selected card
   */
  getUserInputInventoryCardSelection(message, callback) {
    const GameRenderer = window.GameRenderer;
    const renderer = new GameRenderer(this);

    // include Ace of Spades as a wild card - (Exit dungeon)
    renderer.renderUserInputCardSelection(
      message,
      this.inventory.stock.concat([new Card(SPADES, ACE)]),
      callback,
    );
  }

  /**
   * Get user input for using a Red Joker as an inventory card
   * @param {string} message - Prompt message
   * @param {Function} callback - Callback function receiving selected card
   */
  getUserInputUseJokerCardSelection(message, callback) {
    const GameRenderer = window.GameRenderer;
    const renderer = new GameRenderer(this);

    renderer.renderUserInputCardSelection(
      message,
      [new Card(RED, JACK), new Card(RED, QUEEN), new Card(RED, KING)],
      callback,
    );
  }

  /**
   * Perform a fate check (draw from fate deck)
   * @returns {number} The value of the drawn card (6-10)
   */
  fateCheck() {
    if (this.fate.stock.length === 0) {
      this.fate.stock = shuffle(this.fate.available);
      this.fate.available = [];
    }
    const card = this.fate.stock.pop();
    this.fate.available.push(card);

    return card.value.order;
  }

  /**
   * Internal: Gain cards from stock to available pile
   * @private
   * @param {string} key - Pile key (health, gems, inventory, fate)
   * @param {number} [amount=1] - Number of cards to gain
   */
  _gainCard(key, amount) {
    if (!amount) {
      amount = 1;
    }
    console.log(`_gainCard(${key}, ${amount})`, this[key].stock.length, this[key].available.length)
    for (let i = 0; i < amount; i += 1) {
      if (this[key].stock.length === 0) {
        console.log(`_gainCard(${key}, ${amount}) - no more cards`)
        return;
      }
      const card = this[key].stock.pop();
      this[key].available.push(card);
    }
  }

  /**
   * Internal: Lose cards from available pile back to stock
   * @private
   * @param {string} key - Pile key (health, gems, inventory, fate)
   * @param {number} amount - Number of cards to lose
   */
  _loseCard(key, amount) {
    for (let i = 0; i < amount; i += 1) {
      if (this[key].available.length === 0) {
        return;
      }
      const card = this[key].available.pop();
      this[key].stock.push(card);
    }

    // Check for game over when health is depleted
    if (key === 'health' && this.health.available.length === 0) {
      this.gameOver();
    }
  }

  /**
   * Internal: Update which cells in the dungeon are available for interaction
   * @private
   */
  _updateDungeonAvailability() {
    for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.dungeon.matrix[0].length; col += 1) {
        const cell = this.dungeon.matrix[row][col];
        cell.available = false;
      }
    }

    for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.dungeon.matrix[0].length; col += 1) {
        const cell = this.dungeon.matrix[row][col];
        if (cell.card) {
          cell.available = !cell.cardFaceDown;
        } else {
          const adjacentCellsWithCards = this._getAdjacentCells({ row, col }).filter(
            (cell) => cell.card
          );
          if (adjacentCellsWithCards.length === 1 && adjacentCellsWithCards[0].cardFaceDown) {
            cell.available = true;
          }
        }
      }
    }
  }

  /**
   * Internal: Get adjacent cells for a given position
   * @private
   * @param {Object} position - Cell position
   * @param {number} position.row - Row index
   * @param {number} position.col - Column index
   * @returns {Array<Cell>} Array of adjacent cells
   */
  _getAdjacentCells({ row, col }) {
    const adjacentCells = [];
    if (row > 0) {
      adjacentCells.push(this.dungeon.matrix[row - 1][col]);
    }
    if (row < this.dungeon.matrix.length - 1) {
      adjacentCells.push(this.dungeon.matrix[row + 1][col]);
    }
    if (col > 0) {
      adjacentCells.push(this.dungeon.matrix[row][col - 1]);
    }
    if (col < this.dungeon.matrix[0].length - 1) {
      adjacentCells.push(this.dungeon.matrix[row][col + 1]);
    }
    return adjacentCells;
  }

  /**
   * Internal: Expand the dungeon grid if needed (up to MAX_WIDTH x MAX_HEIGHT)
   * @private
   */
  _expandDungeon() {
    const {
      minRow,
      maxRow,
      minCol,
      maxCol,
      currentWidth,
      currentHeight,
    } = this.getMatrixInfo();

    const addToLeft = (
      currentWidth < MAX_WIDTH
      && minCol === 0
    );
    const addToRight = (
      currentWidth < MAX_WIDTH
      && maxCol === this.dungeon.matrix[0].length - 1
    );
    const addToTop = (
      currentHeight < MAX_HEIGHT
      && minRow === 0
    );
    const addToBottom = (
      currentHeight < MAX_HEIGHT
      && maxRow === this.dungeon.matrix.length - 1
    );

    if (addToLeft) {
      for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
        this.dungeon.matrix[row].unshift(new Cell());
      }
    }
    if (addToRight) {
      for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
        this.dungeon.matrix[row].push(new Cell());
      }
    }
    if (addToTop) {
      const newRow = [];
      for (let col = 0; col < this.dungeon.matrix[0].length; col += 1) {
        newRow.push(new Cell());
      }
      this.dungeon.matrix.unshift(newRow);
    }
    if (addToBottom) {
      const newRow = [];
      for (let col = 0; col < this.dungeon.matrix[0].length; col += 1) {
        newRow.push(new Cell());
      }
      this.dungeon.matrix.push(newRow);
    }
  }

  /**
   * Internal: Trim empty edges from the dungeon grid when at max size
   * @private
   */
  _trimDungeon() {
    const {
      currentWidth,
      currentHeight,
      maxCol,
      maxRow,
      minCol,
      minRow,
    } = this.getMatrixInfo();

    const trimTop = (
      currentHeight === MAX_HEIGHT
      && minRow > 0
    );
    const trimBottom = (
      currentHeight === MAX_HEIGHT
      && maxRow < this.dungeon.matrix.length - 1
    );
    const trimLeft = (
      currentWidth === MAX_WIDTH
      && minCol > 0
    );
    const trimRight = (
      currentWidth === MAX_WIDTH
      && maxCol < this.dungeon.matrix[0].length - 1
    );

    if (trimLeft) {
      for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
        this.dungeon.matrix[row].shift();
      }
    }
    if (trimRight) {
      for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
        this.dungeon.matrix[row].pop();
      }
    }
    if (trimTop) {
      this.dungeon.matrix.shift();
    }
    if (trimBottom) {
      this.dungeon.matrix.pop();
    }
  }

  /**
   * Get information about the current dungeon matrix bounds
   * @returns {Object} Matrix info including min/max row/col and dimensions
   */
  getMatrixInfo() {
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.dungeon.matrix[row].length; col += 1) {
        const cell = this.dungeon.matrix[row][col];
        if (cell.card) {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, col);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    const currentWidth = maxCol - minCol + 1;
    const currentHeight = maxRow - minRow + 1;

    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      currentWidth,
      currentHeight,
    };
  }

  /**
   * Render the entire game UI
   */
  render() {
    const GameRenderer = window.GameRenderer;
    const renderer = new GameRenderer(this);
    renderer.renderHealth();
    renderer.renderDungeon();
    renderer.renderFate();
    renderer.renderInventory();
    renderer.renderGems();

    // Update URL with current game state
    const stateString = serializeGameState(this);
    window.history.replaceState(null, '', `?${stateString}`);

    // Update test debug div with serialized state (for integration tests)
    this._updateTestDebugDiv(stateString);
  }

  /**
   * Internal: Update hidden test debug div with serialized state
   * @private
   * @param {string} stateString - Serialized game state
   */
  _updateTestDebugDiv(stateString) {
    // Keep hidden div for test access via dataset.state
    let debugDiv = document.getElementById('test-debug-state');
    if (!debugDiv) {
      debugDiv = document.createElement('pre');
      debugDiv.id = 'test-debug-state';
      debugDiv.style.cssText = `
        display: none;
      `;
      document.body.appendChild(debugDiv);
    }
    debugDiv.textContent = stateString;
    debugDiv.dataset.state = stateString;

    // Also update debug log with state info
    let debugLogDiv = document.getElementById('debug-log-state');
    if (!debugLogDiv) {
      const debugLog = document.getElementById('debug-log');
      if (debugLog) {
        debugLogDiv = document.createElement('div');
        debugLogDiv.id = 'debug-log-state';
        debugLogDiv.style.cssText = `
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
          font-size: 10px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        `;
        const label = document.createElement('div');
        label.textContent = 'Serialized State:';
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '5px';
        debugLogDiv.appendChild(label);

        const stateContent = document.createElement('div');
        stateContent.id = 'debug-log-state-content';
        stateContent.style.cssText = `
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
        `;
        debugLogDiv.appendChild(stateContent);
        debugLog.appendChild(debugLogDiv);
      }
    }
    const stateContent = document.getElementById('debug-log-state-content');
    if (stateContent) {
      stateContent.textContent = stateString;
    }
  }

  /**
   * Reset the dungeon (for Ace of Spades - Exit card)
   */
  resetDungeon() {
    // TODO: Implement dungeon reset logic
    logDebug('🔄 Reset dungeon called (not yet implemented)');
  }

  /**
   * Defeat the Dragon Queen (win condition)
   */
  defeatDragonQueen() {
    // TODO: Implement Dragon Queen defeat logic
    logDebug('👑 Dragon Queen defeated! (not yet implemented)');
  }

  /**
   * Get current game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    const exploredCards = this.dungeon.matrix.flat()
      .filter(cell => cell.card && !cell.cardFaceDown).length;

    const totalCardsPlaced = this.dungeon.matrix.flat()
      .filter(cell => cell.card).length;

    return {
      cardsExplored: exploredCards,
      totalCardsPlaced: totalCardsPlaced,
      gemsCollected: this.gems.available.length,
      inventoryItems: this.inventory.available.length,
      healthRemaining: this.health.available.length,
      dungeonCardsRemaining: this.dungeon.stock.length,
    };
  }

  /**
   * Trigger game over state
   * This is called when the player runs out of health
   */
  gameOver() {
    if (this.isGameOver) {
      return; // Already game over, don't trigger again
    }

    this.isGameOver = true;
    logDebug('💀 GAME OVER - Player health depleted');

    // Show game over modal via renderer if available
    if (window.GameRenderer && window.GameRenderer.showGameOver) {
      const stats = this.getGameStats();
      window.GameRenderer.showGameOver(stats);
    }
  }
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.Game = Game;
}
