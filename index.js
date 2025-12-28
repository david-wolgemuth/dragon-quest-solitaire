const MAX_WIDTH = 7;
const MAX_HEIGHT = 5;

// Note: Card class is now defined in url-state.js to avoid class redefinition issues
// When url-state.js loads first, it defines Card with basic getters
// This ensures Card instances created during URL deserialization remain valid

class Cell {
  constructor() {
    this.card = null;
    this.cardFaceDown = false;
    this.available = false;
  }
}

function buildPile(keyPairs) {
  return keyPairs.map(([suitKey, valueKey]) => new Card(suitKey, valueKey));
}

function shuffle(array, rng = Math.random) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function allCards() {
  const cards = [];
  for (const suitKey of Object.keys(SUITS)) {
    for (const valueKey of Object.keys(VALUES)) {
      if (valueKey === JOKER && suitKey !== BLACK && suitKey !== RED) {
        continue;
      }
      if (valueKey !== JOKER && (suitKey === BLACK || suitKey === RED)) {
        continue;
      }
      cards.push(new Card(suitKey, valueKey));
    }
  }
  return cards;
}

function createStyleSheet() {
  const styleElement = document.createElement("style");
  document.head.appendChild(styleElement);

  // styleElement.type = 'text/css';
  for (let card of allCards()) {
    const className = `card-${card.suit.code}${card.value.code}`;

    let color;
    switch (card.suit.key) {
      case HEARTS:
      case DIAMONDS:
      case RED:
        color = "red";
        break;
      case CLUBS:
      case SPADES:
      case BLACK:
        color = "black";
        break;
    }

    styleElement.sheet.insertRule(
      `
      .${className} {
        color: ${color};
      }
      `,
      styleElement.sheet.cssRules.length
    );
    styleElement.sheet.insertRule(
      `
      .${className}::after {
        content: "${card.value.display} ${card.suit.display}";
      }
      `,
      styleElement.sheet.cssRules.length
    );
  }
}

createStyleSheet();

class Game {
  constructor(options = {}) {
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

  addCardToDungeon({ row, col }) {
    const card = this.dungeon.stock.pop();
    const cell = this.dungeon.matrix[row][col];
    cell.cardFaceDown = false;
    cell.card = card;
    logDebug(`🃏 Added ${card.suitKey[0]}${card.valueKey[0]} to (${row},${col})`);
    this.updateDungeon();
    this.render();
  }

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

  updateDungeon() {
    this._expandDungeon();
    this._trimDungeon();
    this._updateDungeonAvailability();
  }

  gainHealth(dungeonCard, amount) {
    this.displayResolution(dungeonCard, (amount || 1), "health", () => {
      this._gainCard("health", amount);
      this.render();
    });
  }

  loseHealth(dungeonCard, amount) {
    this.displayResolution(dungeonCard, -(amount || 1), "health", () => {
      this._loseCard("health", amount);
      this.render();
    });
  }

  gainGem(dungeonCard, amount) {
    this.displayResolution(dungeonCard, (amount || 1), "gems", () => {
      this._gainCard("gems", amount);
      this.render();
    });
  }

  loseGem(dungeonCard, amount) {
    this.displayResolution(dungeonCard, -(amount || 1), "gems", () => {
      this._loseCard("gems", amount);
      this.render();
    });
  }

  gainInventory(dungeonCard, amount) {
    this.displayResolution(dungeonCard, (amount || 1), "inventory", () => {
      this._gainCard("inventory", amount);
      this.render();
    });
  }

  loseInventory(dungeonCard, amount) {
    this.displayResolution(dungeonCard, -(amount || 1), "inventory", () => {
      this._loseCard("inventory", amount);
      this.render();
    });
  }

  /**
   * @description - display a message to the user about the resolution of a dungeon card
   *            and call the callback when the user accepts the resolution
   *
   * @param {Object} dungeonCard - the card that triggered the resolution
   * @param {Number} amount - the amount  to gain/lose
   * @param {String} pileKey - (health, gems, inventory)
   * @param {Function} callback - function to call when resolution is accepted
   */
  displayResolution(dungeonCard, amount, pileKey, callback) {
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
        // disableClickAnywhereToClose: true,
      },
    )
  }

  /**
   * Check all visible cards in the dungeon,
   *  if corresponding passage is found,
   *  marks as resolved (flipped)
   *
   * @returns {boolean} true if a passage was found, false otherwise
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

  displayMessage(message) {
    const renderer = new GameRenderer(this);

    renderer.renderMessage(message);
  }

  /**
   * when a player encounters a merchant / wizard / etc
   *  they must choose a card to add to their inventory
   *
   * @param {*} message
   * @param {*} callback
   */
  getUserInputInventoryCardSelection(message, callback) {
    const renderer = new GameRenderer(this);

    // include Ace of Spades as a wild card - (Exit dungeon)
    renderer.renderUserInputCardSelection(
      message,
      this.inventory.stock.concat([new Card(SPADES, ACE)]),
      callback,
    );
  }

  /**
   * When a red joker card is used in inventory,
   *  the player must choose a which inventory card to use it as
   * @param {*} message
   * @param {*} callback
   */
  getUserInputUseJokerCardSelection(message, callback) {
    const renderer = new GameRenderer(this);

    renderer.renderUserInputCardSelection(
      message,
      [new Card(RED, JACK), new Card(RED, QUEEN), new Card(RED, KING)],
      callback,
    );
  }

  /**
   *
   * @returns {number} (6-10)
   */
  fateCheck() {
    if (this.fate.stock.length === 0) {
      this.fate.stock = shuffle(this.fate.available);
    }
    const card = this.fate.stock.pop();
    this.fate.available.push(card);

    return card.value.order;
  }

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

  _loseCard(key, amount) {
    for (let i = 0; i < amount; i += 1) {
      if (this[key].available.length === 0) {
        return;
      }
      const card = this[key].available.pop();
      this[key].stock.push(card);
    }
  }

  /**
   * Mark all cells as available if they are adjacent to a cell with a card.
   *  - If the cell has a card, mark it available if face up, otherwise mark it unavailable.
   *  - If the cell does not have a card,
   *    - mark it available if it is adjacent to ONLY ONE cell with a facedown card.
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
   * Expand the dungeon if needed.
   *  - If the dungeon is not at max width, add a column to the left or right.
   *  - If the dungeon is not at max height, add a row to the top or bottom.
   */
  _expandDungeon() {
    const {
      minRow,
      maxRow,
      minCol,
      maxCol,
      currentWidth,
      currentHeight ,
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
   * Trim the dungeon if needed.
   * - If the dungeon is at max width, remove a column from the left or right.
   * - If the dungeon is at max height, remove a row from the top or bottom.
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

  render() {
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
}

class GameRenderer {
  constructor(game) {
    this.game = game;
  }


  /**
   * @description Renders the main dungeon grid.
   *
   * This is the grid of cards that the player interacts with.
   *
   * Each cell in the grid is a button.
   *   - "dungeon card" is applied to cell
   *   - shows the card if the cell has a card.
   *   - clickable if the cell is available (disabled otherwise)
   * @
   */
  renderDungeon() {
    const dungeonMatrixElement = document.querySelector("#dungeon .matrix");
    dungeonMatrixElement.innerHTML = "";
    dungeonMatrixElement.style.gridTemplateColumns = `repeat(${this.game.dungeon.matrix[0].length}, 1fr)`;
    dungeonMatrixElement.style.gridTemplateRows = `repeat(${this.game.dungeon.matrix.length}, 1fr)`;

    for (let row = 0; row < this.game.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.game.dungeon.matrix[0].length; col += 1) {

        /**
         * Create a button for each cell in the dungeon.
         *  - If the cell is available, make it clickable.
         *  - If the cell has a card, show the card.
         *  - If the cell is not available, disable it.
         *
         */
        const cell = this.game.dungeon.matrix[row][col];
        const cellElement = document.createElement("button");
        // cellElement.innerHTML = `${row}, ${col}`;  // DEBUG
        cellElement.classList.add("cell");
        if (cell.available) {
          cellElement.classList.add("available");
        } else {
          cellElement.disabled = true;
        }

        if (cell.card) {
          cellElement.classList.add("card");

          /**
           * If the card is face down,
           *    show the back of the card.
           * Otherwise,
           *  show the front of the card.
           *    and make it clickable.
           */
          if (cell.cardFaceDown) {
            cellElement.classList.add("card-back");
          } else {
            // TODO disable if not valid move
            cellElement.classList.add(
              `card-${cell.card.suit.code}${cell.card.value.code}`
            );
            cellElement.onclick = () => {
              const dungeonCard = DUNGEON_CARDS[cell.card.suit.key][cell.card.value.key];
              this.addTutorialModal(`<div>
                <div class="card card-${cell.card.suit.code}${cell.card.value.code}"></div>
                ${dungeonCard.name}
                ${dungeonCard.description}
              </div>`, () => {
                this.game.resolveCard({ row, col });
              });
            };
          }
        } else {

          /**
           * Cell does not have a card.
           *    on click, add a card to the dungeon
           * (if valid move)
           */
          cellElement.onclick = () => {
            this.addTutorialModal(`<div>
              the rules about adding cards to the dungeon...
            </div>`, () => {
              this.game.addCardToDungeon({ row, col });
            });
          };
        }


        dungeonMatrixElement.appendChild(cellElement);
      }
    }

    this._renderStatsPiles("dungeon");
  }

  /**
   * @description utility function
   * add any message to the players message modal
   *
   * @param {String} messageHTML - HTML to display in the modal
   */
  renderMessage(messageHTML) {
    const messageElement = document.querySelector("#message-modal");
    const messageTextElement = document.querySelector("#message-modal-inner-content");
    messageTextElement.innerHTML = messageHTML;
    messageElement.classList.add("visible");
    messageElement.onclick = (() => {
      // click anywhere to dismiss
      messageElement.classList.remove("visible");
    });
  }

  renderUserInputCardSelection(message, cards, callback) {
    const messageElement = document.querySelector("#message-modal");
    const messageTextElement = document.querySelector("#message-modal-inner-content");
    messageTextElement.innerHTML = message;

    for (let card of cards) {
      const cardButton = document.createElement("button");
      cardButton.classList.add(
        `card-${card.suit.code}${card.value.code}`
      );
      cardButton.onclick = (() => {
        callback(card);
        messageElement.classList.remove("visible");
        messageTextElement.innerHTML = "";
      });
    }
  }


  /**
   * @description Renders the tutorial modal
   * and runs the callback when the user accepts the modal
   *
   * @param {String} content - HTML content to display in the modal
   * @param {Function} onAccept - callback to run when the user accepts the modal
   * @returns
   */
  addTutorialModal(content, onAccept) {

    onAccept();

    return;  // DISABLED FOR NOW !!

    const tutorialModalElement = document.getElementById("tutorial-modal");
    tutorialModalElement.classList.add("visible");

    const tutorialModalContentElement = document.getElementById("tutorial-modal-inner-content");
    tutorialModalContentElement.innerHTML = content;

    const tutorialModalAcceptButton = document.getElementById("tutorial-modal-accept");
    tutorialModalAcceptButton.onclick = () => {
      tutorialModalElement.classList.remove("visible");
      onAccept();
    }

    const tutorialModalCancelButton = document.getElementById("tutorial-modal-dismiss");
    tutorialModalCancelButton.onclick = () => {
      tutorialModalElement.classList.remove("visible");
    }
  }

  /**
   * @description Renders a message with a button to resolve a fate check
   * @param {String} messageHtml - HTML to display
   * @param {Array<Element>} extraActionButtonElements - extra buttons to display
   */
  renderFateCheckResolution(messageHtml, { extraActionButtonElements = [], disableClickAnywhereToClose = false, onAccept } = {}) {
    const messageElement = document.querySelector("#message-modal");
    const messageTextElement = document.querySelector("#message-modal-inner-content");
    messageTextElement.innerHTML = messageHtml;
    messageElement.classList.add("visible");
    if (!disableClickAnywhereToClose) {
      messageElement.onclick = (() => {
        // click anywhere to dismiss
        messageElement.classList.remove("visible");
        onAccept();
      });
    }

    const messageActionsElement = document.querySelector("#message-modal-actions");
    messageActionsElement.innerHTML = "";
    for (let actionEl of extraActionButtonElements) {
      actionEl.addEventListener("click", () => {
        messageElement.classList.remove("visible");
      });
      messageActionsElement.appendChild(actionEl);
    }
  }

  /**
   * @description Renders the player's stats
   */
  renderHealth() {
    this._renderStatsPiles("health");
  }

  /**
   * @description Renders the player's inventory
   */
  renderInventory() {
    this._renderStatsPiles("inventory");
  }

  /**
   * @description Renders the player's gems
   */
  renderGems() {
    this._renderStatsPiles("gems");
  }

  /**
   * @description Renders the player fate deck
   */
  renderFate() {
    this._renderStatsPiles("fate");
  }

  _renderStatsPiles(key) {
    const stockElement = document.querySelector(`#${key}-stock`);
    stockElement.innerHTML = '';  // clear

    if (this.game[key].stock.length > 0) {
      const cardElement = document.createElement("div");
      cardElement.innerHTML = `${this.game[key].stock.length}`;
      cardElement.classList.add("card");
      cardElement.classList.add("card-back");
      stockElement.appendChild(cardElement);
    }

    const availableElement = document.querySelector(`#${key}-available`);
    availableElement.innerHTML = '';  // clear
    if (this.game[key].available.length > 0) {
      const topCard = this.game[key].available[this.game[key].available.length - 1];
      const cardElement = document.createElement("div");
      // cardElement.innerHTML = `${topCard.value.code}`;
      cardElement.classList.add("card");
      cardElement.classList.add(
        `card-${topCard.suit.code}${topCard.value.code}`
      );
      availableElement.appendChild(cardElement);
    }
  }
}

// Show error overlay with full details
function showErrorOverlay(title, message, error) {
  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 800px;
    max-height: 90vh;
    overflow: auto;
    font-family: monospace;
  `;

  const heading = document.createElement('h1');
  heading.textContent = '🚨 ' + title;
  heading.style.cssText = 'color: #d32f2f; margin-top: 0;';

  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.cssText = 'font-size: 16px; line-height: 1.5;';

  const errorBox = document.createElement('pre');
  errorBox.style.cssText = `
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 12px;
    border-left: 4px solid #d32f2f;
  `;
  errorBox.textContent = error ? (error.stack || error.toString()) : 'No error details available';

  const urlInfo = document.createElement('details');
  urlInfo.style.cssText = 'margin-top: 20px;';
  const urlSummary = document.createElement('summary');
  urlSummary.textContent = 'URL Parameters';
  urlSummary.style.cssText = 'cursor: pointer; font-weight: bold; margin-bottom: 10px;';
  const urlPre = document.createElement('pre');
  urlPre.style.cssText = 'background: #e3f2fd; padding: 10px; border-radius: 5px; font-size: 11px;';
  urlPre.textContent = window.location.search || '(no URL parameters)';
  urlInfo.appendChild(urlSummary);
  urlInfo.appendChild(urlPre);

  const reloadBtn = document.createElement('button');
  reloadBtn.textContent = 'Start Fresh Game (Clear URL)';
  reloadBtn.style.cssText = `
    margin-top: 20px;
    padding: 12px 24px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  reloadBtn.onclick = () => {
    window.location.href = window.location.pathname;
  };

  content.appendChild(heading);
  content.appendChild(msg);
  content.appendChild(errorBox);
  content.appendChild(urlInfo);
  content.appendChild(reloadBtn);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

// Create debug log element at top right corner (minimized by default)
function createDebugLog() {
  const container = document.createElement('div');
  container.id = 'debug-log-container';
  container.className = 'minimized';

  const header = document.createElement('div');
  header.id = 'debug-log-header';
  header.innerHTML = 'Debug';
  header.style.cssText = `
    background: white;
    color: blue;
    font-family: monospace;
    font-size: 11px;
    padding: 4px 8px;
    cursor: pointer;
    border: 1px solid blue;
    border-radius: 3px 0 0 3px;
    user-select: none;
  `;

  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-log';
  debugDiv.style.cssText = `
    background: white;
    color: #333;
    font-family: monospace;
    font-size: 11px;
    padding: 10px;
    overflow-y: auto;
    border: 1px solid blue;
    border-top: none;
    border-radius: 0 0 0 3px;
  `;

  container.style.cssText = `
    position: fixed;
    top: 10px;
    right: 0;
    z-index: 9999;
    transition: all 0.3s ease;
  `;

  // Minimized state
  container.classList.add('minimized');
  updateDebugLogStyle(container, debugDiv, true);

  // Toggle on click
  header.addEventListener('click', () => {
    const isMinimized = container.classList.toggle('minimized');
    updateDebugLogStyle(container, debugDiv, isMinimized);
  });

  container.appendChild(header);
  container.appendChild(debugDiv);
  document.body.appendChild(container);
  return debugDiv;
}

function updateDebugLogStyle(container, debugDiv, isMinimized) {
  if (isMinimized) {
    debugDiv.style.display = 'none';
    container.style.width = 'auto';
  } else {
    debugDiv.style.display = 'block';
    debugDiv.style.maxHeight = 'calc(100vh - 60px)';
    debugDiv.style.width = '600px';
    debugDiv.style.maxWidth = '90vw';
  }
}

function logDebug(message, isError = false) {
  let debugDiv = document.getElementById('debug-log');
  if (!debugDiv) {
    debugDiv = createDebugLog();
  }
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const color = isError ? 'red' : '#333';
  const line = document.createElement('div');
  line.style.color = color;
  line.textContent = `[${timestamp}] ${message}`;
  debugDiv.appendChild(line);
  debugDiv.scrollTop = debugDiv.scrollHeight;
}

function main() {
  try {
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

main();
