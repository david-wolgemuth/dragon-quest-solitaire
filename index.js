const MAX_WIDTH = 7;
const MAX_HEIGHT = 5;

const SUITS = {
  HEARTS: {
    key: "HEARTS",
    code: "H",
    display: "♥️",
  },
  CLUBS: {
    key: "CLUBS",
    code: "C",

    display: "♣️",
  },
  DIAMONDS: {
    key: "DIAMONDS",
    code: "D",
    display: "♦️",
  },
  SPADES: {
    key: "SPADES",
    code: "S",
    display: "♠️",
  },
  BLACK: {
    key: "BLACK",
    display: "⚫️",
    code: "B",
    isColor: true,
  },
  RED: {
    key: "RED",
    display: "🔴",
    code: "R",
    isColor: true,
  },
};

const HEARTS = SUITS.HEARTS.key;
const CLUBS = SUITS.CLUBS.key;
const DIAMONDS = SUITS.DIAMONDS.key;
const SPADES = SUITS.SPADES.key;
const BLACK = SUITS.BLACK.key;
const RED = SUITS.RED.key;

const VALUES = {
  ACE: {
    key: "ACE",
    display: "A",
    code: "A",
    order: 1,
  },
  TWO: {
    key: "TWO",
    display: "2",
    code: "2",
    order: 2,
  },
  THREE: {
    key: "THREE",
    display: "3",
    code: "3",
    order: 3,
  },
  FOUR: {
    key: "FOUR",
    display: "4",
    code: "4",
    order: 4,
  },
  FIVE: {
    key: "FIVE",
    display: "5",
    code: "5",
    order: 5,
  },
  SIX: {
    key: "SIX",
    display: "6",
    code: "6",
    order: 6,
  },
  SEVEN: {
    key: "SEVEN",
    display: "7",
    code: "7",
    order: 7,
  },
  EIGHT: {
    key: "EIGHT",
    display: "8",
    code: "8",
    order: 8,
  },
  NINE: {
    key: "NINE",
    display: "9",
    code: "9",
    order: 9,
  },
  TEN: {
    key: "TEN",
    display: "10",
    code: "0",
    order: 10,
  },
  JACK: {
    key: "JACK",
    display: "J",
    code: "J",
    order: 11,
  },
  QUEEN: {
    key: "QUEEN",
    display: "Q",
    code: "Q",
    order: 12,
  },
  KING: {
    key: "KING",
    display: "K",
    code: "K",
    order: 13,
  },
  JOKER: {
    key: "JOKER",
    isJoker: true,
    code: "X",
    display: "X",
    value: 14,
  },
};

const ACE = VALUES.ACE.key;
const TWO = VALUES.TWO.key;
const THREE = VALUES.THREE.key;
const FOUR = VALUES.FOUR.key;
const FIVE = VALUES.FIVE.key;
const SIX = VALUES.SIX.key;
const SEVEN = VALUES.SEVEN.key;
const EIGHT = VALUES.EIGHT.key;
const NINE = VALUES.NINE.key;
const TEN = VALUES.TEN.key;
const JACK = VALUES.JACK.key;
const QUEEN = VALUES.QUEEN.key;
const KING = VALUES.KING.key;
const JOKER = VALUES.JOKER.key;


class Card {
  constructor(suitKey, valueKey) {
    if (!Object.keys(SUITS).includes(suitKey)) {
      throw new Error(`Invalid suit key: ${suitKey}`);
    }
    if (!Object.keys(VALUES).includes(valueKey)) {
      throw new Error(`Invalid value key: ${valueKey}`);
    }
    this.suitKey = suitKey;
    this.valueKey = valueKey;
  }

  get suit() {
    return SUITS[this.suitKey];
  }

  get value() {
    return VALUES[this.valueKey];
  }
}

function buildPitTrapCard({ hidden, damage }) {
  if (hidden) {
    return {
      name: `Hidden Pit Trap (${damage} damage)`,

      description: `You fall into a hidden pit.
        Take ${damage} damage to resolve this tile, mandatory.
        If you have gems, they will reduce the damage taken
      `,
      resolver: (game) => {
        game.loseHealth(damage, { gems: true });
        return true;
      },
    };
  } else {
    return {
      name: `Visible Pit Trap (${damage} damage)`,
      description: `Take ${damage} damage to cross the pit trap, optional.
        If you have gems, they w reduce the damage taken`,
      resolver: (game) => {
        game.loseHealth(damage);
        return true;
      },
    };
  }
}

function buildPassageCard(suit, value) {
  const oppositeSuit = suit === CLUBS ? SPADES : CLUBS;

  return {
    name: `Passage (${value})`,
    description: `Impassable until you have found
      the other end of the passage (${value} of ${oppositeSuit}})`,
    resolver: (game) => {
      return game.foundPassage(suit, value);
    },
  };
}

function buildEnemyCard({
    name,
    minFateToDefeat,
    damageTakenIfUnsuccessful,
    resolveCriticalSuccess,
    resolveCriticalSuccessDescription,
  }) {
  return {
    name,
    description: `Fight Enemy "${name}".
      Pull a card from the Fate Deck (5 cards, 6-10 of Hearts),
      If you pull a card with a value of ${minFateToDefeat} or higher,
        the enemy will be defeated and you will take no damage.

      If you pull a perfect 10 of Hearts (Critical Success),
        ${resolveCriticalSuccessDescription}

      If you fail to defeat the enemy,
        you lose you will take ${damageTakenIfUnsuccessful} damage.
        Game over if you lose all your health.
    `,
    resolver: (game) => {
      const value = game.fateCheck();
      if (value < minFateToDefeat) {
        game.loseHealth(damageTakenIfUnsuccessful);
      } else if (value === 10) {
        resolveCriticalSuccess(game);
      }
      return true;  // always resolve, even if you lose
    },
  };
}

const DUNGEON_CARDS = {
  [SPADES]: {
    [ACE]: {
      name: "Exit",
      symbol: "⇧",
      description: `Exit to the next level of the dungeon,
        will reset all dungeon cards back to the deck but keep your current stats.

        If you have defeated the Dragon Queen (Queen of Spades) will end the game - you have won.
      `,
      resolver: (game) => {
        game.resetDungeon();
        return true;
      },
    },
    [TWO]: buildPitTrapCard({ hidden: true, damage: 2 }),
    [THREE]: buildPitTrapCard({ hidden: false, damage: 1 }),
    [FOUR]: buildPassageCard(SPADES, FOUR),
    [FIVE]: buildPassageCard(SPADES, FIVE),
    [SIX]: buildPassageCard(SPADES, SIX),
    [SEVEN]: {
      name: 'Gem',
      description: 'Take 1 gem',
      resolver: (game) => {
        game.gainGem();
        return true;
      }
    },
    [EIGHT]: {
      name: 'Healing',
      description: 'Gain 2 Health, up to your max health',
      resolver: (game) => {
        game.gainHealth(2);
        return true;
      },
    },
    [NINE]: {
      name: 'Treasure Chest',
      description: 'Gain 1 item from the treasure chest',
      resolver: (game) => {
        game.gainInventory();
        return true;
      },
    },
    [TEN]: buildEnemyCard({
      name: "Slime",
      minFateToDefeat: 7,
      damageTakenIfUnsuccessful: 1,
      resolveCriticalSuccess: (game) => {
        game.gainHealth();
      },
      resolveCriticalSuccessDescription: "You will heal 1 health.",
    }),
    [JACK]: buildEnemyCard({
      name: "Skeleton",
      minFateToDefeat: 8,
      damageTakenIfUnsuccessful: 1,
      resolveCriticalSuccess: (game) => {
        game.gainGem();
      },
      resolveCriticalSuccessDescription: "You will gain 1 gem.",
    }),
    [QUEEN]: buildEnemyCard({
      name: "Dragon Queen",
      minFateToDefeat: 9,
      damageTakenIfUnsuccessful: 3,
      resolveCriticalSuccess: (game) => {
        game.defeatDragonQueen();
      },
      resolveCriticalSuccessDescription: `You will defeat the Dragon Queen
        and win the game upon exiting the dungeon.
      `,
    }),
    [KING]: buildEnemyCard({
      name: "Troll",
      minFateToDefeat: 9,
      damageTakenIfUnsuccessful: 2,
      resolveCriticalSuccess: (game) => {
        game.gainInventory();
      },
      resolveCriticalSuccessDescription: "You will gain 1 item from the treasure chest.",
    }),
  },

  [CLUBS]: {
    [ACE]: {
      name: "Merchant",
      description: `Wildcard: Treasure, Healing, Gem, or Exit. Costs 1 one gem.`,
      /**
       *
       * @param {Game} game
       * @returns
       */
      resolver: (game) => {
        if (game.gems.available.length < 1) {
          game.displayMessage("You need at least 1 gem to use this card.");
          return false;
        }
        game.getUserInputInventoryCardSelection(
          "Purchase an inventory item: Treasure, Healing, Gem, or Exit",
          (card) => {
            game.inventory.stock = game.inventory.stock.filter((c) => {
              return c.suitKey !== card.suitKey && c.valueKey !== card.valueKey;
            });
            game.inventory.available.push(card);
            game.loseGem();
          },
        )
        // TODO - does not handle the case where the user does not select a card...
        //  should return a promise or callback to handle this case
        return true
      },
    },
    [TWO]: buildPitTrapCard({ damage: 2, hidden: false }),
    [THREE]: buildPitTrapCard({ damage: 3, hidden: false }),
    [FOUR]: buildPassageCard(CLUBS, FOUR),
    [FIVE]: buildPassageCard(CLUBS, FIVE),
    [SIX]: buildPassageCard(CLUBS, SIX),
    // [SEVEN]: buildGemCard(),
    // [EIGHT]: buildHealingCard(),
    // [NINE]: buildTreasureChestCard(),
    // [TEN]: buildEnemyCard({ name: "Slime" }),
    // [JACK]: buildEnemyCard({ name: "Skeleton" }),
    [QUEEN]: buildEnemyCard({
      name: "Young Dragon",
      minFateToDefeat: 10,
      damageTakenIfUnsuccessful: 1,
      resolveCriticalSuccess: (game) => {
        game.gainGem(3);
      },
      resolveCriticalSuccessDescription: "You will gain 3 gems",
    }),
    [KING]: buildEnemyCard({
      name: "Troll King",
      minFateToDefeat: 9,
      damageTakenIfUnsuccessful: 3,
      resolveCriticalSuccess: (game) => {
        game.gainGem();
        game.gainInventory();
        game.gainHealth();
      },
      resolveCriticalSuccessDescription: "You will gain 1 gem, 1 item from the treasure chest, and 1 health.",
    }),
  },

  [BLACK]: {
    [JOKER]: {
      name: "Generous Wizard",
      description: `
        A generous wizard offers you a choice of 4 cards.
          Treasure, Healing, Gem, or Exit
        `,
      resolver: (game) => {
        game.getUserInputInventoryCardSelection(
          "Choose an inventory item to gain: Treasure, Healing, Gem, or Exit",
          (card) => {
            game.inventory.stock = game.inventory.stock.filter((c) => {
              return c.suitKey !== card.suitKey && c.valueKey !== card.valueKey;
            });
            game.inventory.available.push(card);
            game.loseGem();
          },
        )
        // TODO - does not handle the case where the user does not select a card...
        //  should return a promise or callback to handle this case
        return true
      },
    },
  }
}

DUNGEON_CARDS[CLUBS][SEVEN] = DUNGEON_CARDS[SPADES][SEVEN];  // Gem
DUNGEON_CARDS[CLUBS][EIGHT] = DUNGEON_CARDS[SPADES][EIGHT];  // Healing
DUNGEON_CARDS[CLUBS][NINE] = DUNGEON_CARDS[SPADES][NINE];  // Treasure Chest
DUNGEON_CARDS[CLUBS][TEN] = DUNGEON_CARDS[SPADES][TEN];  // Slime
DUNGEON_CARDS[CLUBS][JACK] = DUNGEON_CARDS[SPADES][JACK];  // Skeleton


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

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
  constructor() {
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
        ])
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
        ])
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
        ])
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
    this.updateDungeon();
    this.render();
  }

  resolveCard({ row, col }) {
    const cell = this.dungeon.matrix[row][col];
    const dungeonCard = DUNGEON_CARDS[cell.card.suit.key][cell.card.value.key];
    const resolved = dungeonCard.resolver(this);
    if (resolved !== false) {
      cell.cardFaceDown = true;
      this.updateDungeon();
      this.render();
    } else {
      // assume already displayed a message
    }
  }

  updateDungeon() {
    this._expandDungeon();
    this._trimDungeon();
    this._updateDungeonAvailability();
  }

  gainHealth(amount) {
    this._gainCard("health", amount);
  }

  loseHealth(amount) {
    this._loseCard("health", amount);
  }

  gainGem(amount) {
    this._gainCard("gems", amount);
  }

  loseGem(amount) {
    this._loseCard("gems", amount);
  }

  gainInventory(amount) {
    this._gainCard("inventory", amount);
  }

  loseInventory(amount) {
    this._loseCard("inventory", amount);
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
  }
}

class GameRenderer {
  constructor(game) {
    this.game = game;
  }

  renderMessage(message) {
    const messageElement = document.querySelector("#message-modal");
    const messageTextElement = document.querySelector("#message-modal-inner-content");
    messageTextElement.innerHTML = message;
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


  renderDungeon() {
    const dungeonMatrixElement = document.querySelector("#dungeon .matrix");
    dungeonMatrixElement.innerHTML = "";
    dungeonMatrixElement.style.gridTemplateColumns = `repeat(${this.game.dungeon.matrix[0].length}, 1fr)`;
    dungeonMatrixElement.style.gridTemplateRows = `repeat(${this.game.dungeon.matrix.length}, 1fr)`;

    for (let row = 0; row < this.game.dungeon.matrix.length; row += 1) {
      for (let col = 0; col < this.game.dungeon.matrix[0].length; col += 1) {
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

  renderHealth() {
    this._renderStatsPiles("health");
  }

  renderInventory() {
    this._renderStatsPiles("inventory");
  }

  renderGems() {
    this._renderStatsPiles("gems");
  }

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

function main() {
  let game = new Game();
  game.render();

  const resetGameButton = document.querySelector("#reset-game");
  resetGameButton.onclick = () => {
    game = new Game();
    game.render();
  }
}

main();
