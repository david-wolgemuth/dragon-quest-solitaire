/**
 * Game Renderer Class
 *
 * Handles all UI rendering for Dragon Quest Solitaire.
 * Renders dungeon grid, player stats, modals, and messages.
 */

import { DUNGEON_CARDS } from '../cards/dungeon-cards.js';

/**
 * Renders the game UI to the DOM
 */
export class GameRenderer {
  /**
   * Create a new game renderer
   * @param {Game} game - The game instance to render
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Render the main dungeon grid
   *
   * Creates a button for each cell in the dungeon matrix.
   * Face-down cards show as card backs, face-up cards show their values.
   * Available cells are clickable, others are disabled.
   */
  renderDungeon() {
    const dungeonMatrixElement = document.querySelector("#dungeon .matrix");
    dungeonMatrixElement.innerHTML = "";
    dungeonMatrixElement.style.gridTemplateColumns = `repeat(${this.game.dungeon.matrix[0].length}, 1fr)`;
    dungeonMatrixElement.style.gridTemplateRows = `repeat(${this.game.dungeon.matrix.length}, 1fr)`;

    for (let row = 0; row < this.game.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.game.dungeon.matrix[0].length; col += 1) {

        const cell = this.game.dungeon.matrix[row][col];
        const cellElement = document.createElement("button");
        cellElement.classList.add("cell");
        if (cell.available) {
          cellElement.classList.add("available");
        } else {
          cellElement.disabled = true;
        }

        if (cell.card) {
          cellElement.classList.add("card");

          if (cell.cardFaceDown) {
            // Face-down card shows as card back
            cellElement.classList.add("card-back");
          } else {
            // Face-up card shows its value and is clickable
            cellElement.classList.add(
              `card-${cell.card.suit.code}${cell.card.value.code}`
            );
            cellElement.onclick = () => {
              const dungeonCard = DUNGEON_CARDS[cell.card.suit.key][cell.card.value.key];
              this.addTutorialModal(`<div>
                <div class="card card-${cell.card.suit.code}${cell.card.value.code}"></div>
                <h3>${dungeonCard.name}</h3>
                ${dungeonCard.descriptionHtml || `<p>${dungeonCard.description}</p>`}
              </div>`, () => {
                this.game.resolveCard({ row, col });
              });
            };
          }
        } else {
          // Empty cell - clicking adds a card from the dungeon deck
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
   * Display a message in the modal
   * @param {string} messageHTML - HTML content to display
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

  /**
   * Show card selection UI for user input
   * @param {string} message - Prompt message
   * @param {Array<Card>} cards - Array of cards to choose from
   * @param {Function} callback - Callback function receiving selected card
   */
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
      messageTextElement.appendChild(cardButton);
    }

    // Show the modal
    messageElement.classList.add("visible");
  }

  /**
   * Show tutorial modal with content and accept callback
   * @param {string} content - HTML content to display
   * @param {Function} onAccept - Callback when user accepts
   * @returns {void}
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
   * Render fate check resolution modal
   * @param {string} messageHtml - HTML message to display
   * @param {Object} options - Rendering options
   * @param {Array<HTMLElement>} [options.extraActionButtonElements=[]] - Extra action buttons
   * @param {boolean} [options.disableClickAnywhereToClose=false] - Disable click-to-close
   * @param {Function} [options.onAccept] - Callback when accepted
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
   * Render the player's health display
   */
  renderHealth() {
    this._renderStatsPiles("health");
  }

  /**
   * Render the player's inventory display
   */
  renderInventory() {
    this._renderStatsPiles("inventory");
  }

  /**
   * Render the player's gems display
   */
  renderGems() {
    this._renderStatsPiles("gems");
  }

  /**
   * Render the fate deck display
   */
  renderFate() {
    this._renderStatsPiles("fate");
  }

  /**
   * Render the victory status indicator
   * Shows a banner when Dragon Queen has been defeated
   */
  renderVictoryStatus() {
    const victoryStatusElement = document.getElementById('victory-status');
    if (victoryStatusElement) {
      if (this.game.dragonQueenDefeated) {
        victoryStatusElement.style.display = 'block';
      } else {
        victoryStatusElement.style.display = 'none';
      }
    }
  }

  /**
   * Internal: Render a stats pile (health, gems, inventory, fate, or dungeon stock)
   * @private
   * @param {string} key - Pile key (health, gems, inventory, fate, dungeon)
   */
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
      cardElement.classList.add("card");
      cardElement.classList.add(
        `card-${topCard.suit.code}${topCard.value.code}`
      );
      availableElement.appendChild(cardElement);
    }
  }

  /**
   * Show game over modal with stats
   * Static method that can be called without a renderer instance
   * @param {Object} stats - Game statistics
   */
  static showGameOver(stats) {
    const messageModal = document.getElementById('message-modal');
    const messageContent = document.getElementById('message-modal-inner-content');
    const messageActions = document.getElementById('message-modal-actions');

    if (!messageModal || !messageContent || !messageActions) {
      console.error('Game over modal elements not found');
      return;
    }

    // Build game over message following design philosophy:
    // - Clear explanation of what happened
    // - Show relevant stats so player can see their performance
    // - Keep board visible (modal already has semi-transparent overlay)
    const gameOverHTML = `
      <h2 style="margin-top: 0; color: #d32f2f;">Game Over</h2>
      <p style="font-size: 1.2em; margin: 1em 0;">
        <strong>You ran out of health! ♥️</strong>
      </p>
      <div style="margin: 1.5em 0; text-align: left; max-width: 300px; margin-left: auto; margin-right: auto;">
        <h3 style="margin-top: 0; margin-bottom: 0.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.5em;">Final Stats:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 0.4em 0;">Cards Explored:</td>
            <td style="padding: 0.4em 0; text-align: right; font-weight: bold;">${stats.cardsExplored}</td>
          </tr>
          <tr>
            <td style="padding: 0.4em 0;">Total Cards Placed:</td>
            <td style="padding: 0.4em 0; text-align: right; font-weight: bold;">${stats.totalCardsPlaced}</td>
          </tr>
          <tr>
            <td style="padding: 0.4em 0;">Gems Collected:</td>
            <td style="padding: 0.4em 0; text-align: right; font-weight: bold;">${stats.gemsCollected} 💎</td>
          </tr>
          <tr>
            <td style="padding: 0.4em 0;">Inventory Items:</td>
            <td style="padding: 0.4em 0; text-align: right; font-weight: bold;">${stats.inventoryItems}</td>
          </tr>
          <tr style="border-top: 1px solid #eee;">
            <td style="padding: 0.4em 0; padding-top: 0.8em;">Cards Remaining:</td>
            <td style="padding: 0.4em 0; padding-top: 0.8em; text-align: right; font-weight: bold;">${stats.dungeonCardsRemaining}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 0.9em; color: #666; margin-top: 1.5em;">
        Try again to explore deeper into the dungeon!
      </p>
    `;

    messageContent.innerHTML = gameOverHTML;

    // Clear existing action buttons and add reset button
    messageActions.innerHTML = '';
    const resetButton = document.createElement('button');
    resetButton.id = 'game-over-reset';
    resetButton.textContent = 'Reset Game';
    resetButton.style.cssText = 'padding: 0.8em 2em; font-size: 1.1em; cursor: pointer;';

    resetButton.onclick = () => {
      // Reload the page to reset the game (clears URL state too)
      window.location.href = window.location.pathname;
    };

    messageActions.appendChild(resetButton);

    // Show the modal
    messageModal.classList.add('visible');

    // Make modal persistent (can't be dismissed by clicking outside)
    messageModal.onclick = (e) => {
      // Only close if clicking the reset button
      if (e.target.id === 'game-over-reset') {
        return;
      }
      e.stopPropagation();
    };
  }
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.GameRenderer = GameRenderer;
}
