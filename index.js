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
    this.hp = {
      stock: [],
      available: buildPile([
        [HEARTS, ACE],
        [HEARTS, TWO],
        [HEARTS, THREE],
        [HEARTS, FOUR],
        [HEARTS, FIVE],
      ]),
    };

    this.items = {
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
      stock: shuffle(
        buildPile([
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
        ])
      ),
      obtained: [],
    };

    this.fate = shuffle(
      buildPile([
        [HEARTS, SIX],
        [HEARTS, SEVEN],
        [HEARTS, EIGHT],
        [HEARTS, NINE],
        [HEARTS, TEN],
      ])
    );

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
      matrix: [
        [new Cell(), new Cell(), new Cell()],
        [new Cell(), new Cell(), new Cell()],
        [new Cell(), new Cell(), new Cell()],
      ],
    };
    const centerCell = this.dungeon.matrix[1][1];
    centerCell.card = this.dungeon.stock.pop();
    centerCell.cardFaceDown = true;
  }

  addCardToDungeon({ row, col }) {
    console.log("addCardToDungeon", { row, col });
    const card = this.dungeon.stock.pop();
    const cell = this.dungeon.matrix[row][col];
    cell.cardFaceDown = false;
    cell.card = card;
    this.updateDungeonAvailability();
    this.render();
  }

  resolveCard({ row, col }) {
    const cell = this.dungeon.matrix[row][col];
    cell.cardFaceDown = true;
    this.updateDungeonAvailability();
    this.render();
  }

  /**
   * If dungeon width / height is less than MAX_WIDTH x MAX_HEIGHT,
   *  should be able to add a new row / column to the dungeon.
   *  matrix.shift([...]) / matrix.push([...]) to add a row
   *  matrix.forEach(row => row.shift() / row.push() to add a column
   *
   * if a space does not yet have a card and is not already adjacent to two cards,
   *    but is adjacent to only one exactly one card,
   *    it should be available to add a card to
   */
  updateDungeonAvailability() {
    // loop through matrix row by col
    // find max/min row/col with card

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
    } else if (addToRight) {
      for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
        this.dungeon.matrix[row].push(new Cell());
      }
    } else if (addToTop) {
      const newRow = [];
      for (let col = 0; col < this.dungeon.matrix[0].length; col += 1) {
        newRow.push(new Cell());
      }
      this.dungeon.matrix.unshift(newRow);
    } else if (addToBottom) {
      const newRow = [];
      for (let col = 0; col < this.dungeon.matrix[0].length; col += 1) {
        newRow.push(new Cell());
      }
      this.dungeon.matrix.push(newRow);
    } else {
      console.debug("no need to add row or column", {
        minRow,
        maxRow,
        minCol,
        maxCol,
        currentWidth,
        currentHeight,
      });
    }

    this._trimDungeon();
  }

  _trimDungeon() {
    const {
      currentWidth,
      currentHeight,
      maxCol,
      maxRow,
      minCol,
      minRow,
    } = this.getMatrixInfo();
    console.debug('trimming dungeon', { currentWidth, currentHeight });

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
    renderer.renderHp();
    renderer.renderDungeon();
  }
}

class GameRenderer {
  constructor(game) {
    this.game = game;
  }

  renderHp() {
    const hpStockElement = document.querySelector("#hp .stock");
    if (this.game.hp.stock.length > 0) {
      hpStockElement.classList.add("card");
      hpStockElement.classList.add("card-back");
    } else {
      hpStockElement.classList.remove("card");
      hpStockElement.classList.remove("card-back");
    }

    const hpAvailableElement = document.querySelector("#hp .available");
    if (this.game.hp.available.length > 0) {
      const topCard = this.game.hp.available[this.game.hp.available.length - 1];
      hpAvailableElement.classList.add("card");
      hpAvailableElement.classList.add(
        `card-${topCard.suit.code}${topCard.value.code}`
      );
    } else {
      hpAvailableElement.classList.remove("card");
      hpAvailableElement.classList.remove("card-back");
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
        if (cell.card) {
          cellElement.classList.add("card");
          if (cell.cardFaceDown) {
            cellElement.classList.add("card-back");
            cellElement.disabled = true;
          } else {
            // TODO disable if not valid move
            cellElement.classList.add(
              `card-${cell.card.suit.code}${cell.card.value.code}`
            );
            cellElement.onclick = () => {
              this.game.resolveCard({ row, col });
            };
          }
        } else {
          cellElement.onclick = () => {
            this.game.addCardToDungeon({ row, col });
          };
        }
        dungeonMatrixElement.appendChild(cellElement);
      }

      const dungeonStockElement = document.querySelector("#dungeon .stock");
      if (this.game.dungeon.stock.length > 0) {
        dungeonStockElement.classList.add("card");
        dungeonStockElement.classList.add("card-back");
      } else {
        dungeonStockElement.classList.remove("card");
        dungeonStockElement.classList.remove("card-back");
      }
    }
  }
}

function main() {
  const game = new Game();
  game.render();
}

main();
