const SUITS = {
  HEARTS: {
    key: 'HEARTS',
    code: 'H',
    display: '♥️',
  },
  CLUBS: {
    key: 'CLUBS',
    code: 'C',

    display: '♣️',
  },
  DIAMONDS: {
    key: 'DIAMONDS',
    code: 'D',
    display: '♦️',
  },
  SPADES: {
    key: 'SPADES',
    code: 'S',
    display: '♠️',
  },
  BLACK: {
    key: 'BLACK',
    display: '⚫️',
    code: 'B',
    isColor: true,
  },
  RED: {
    key: 'RED',
    display: '🔴',
    code: 'R',
    isColor: true,
  },
};

const HEARTS = SUITS.HEARTS.key
const CLUBS = SUITS.CLUBS.key
const DIAMONDS = SUITS.DIAMONDS.key
const SPADES = SUITS.SPADES.key
const BLACK = SUITS.BLACK.key
const RED = SUITS.RED.key

const VALUES = {
  ACE: {
    key: 'ACE',
    display: 'A',
    code: 'A',
    order: 1,
  },
  TWO: {
    key: 'TWO',
    display: '2',
    code: '2',
    order: 2,
  },
  THREE: {
    key: 'THREE',
    display: '3',
    code: '3',
    order: 3,
  },
  FOUR: {
    key: 'FOUR',
    display: '4',
    code: '4',
    order: 4,
  },
  FIVE: {
    key: 'FIVE',
    display: '5',
    code: '5',
    order: 5,
  },
  SIX: {
    key: 'SIX',
    display: '6',
    code: '6',
    order: 6,
  },
  SEVEN: {
    key: 'SEVEN',
    display: '7',
    code: '7',
    order: 7,
  },
  EIGHT: {
    key: 'EIGHT',
    display: '8',
    code: '8',
    order: 8,
  },
  NINE: {
    key: 'NINE',
    display: '9',
    code: '9',
    order: 9,
  },
  TEN: {
    key: 'TEN',
    display: '10',
    code: '0',
    order: 10,
  },
  JACK: {
    key: 'JACK',
    display: 'J',
    code: 'J',
    order: 11,
  },
  QUEEN: {
    key: 'QUEEN',
    display: 'Q',
    code: 'Q',
    order: 12,
  },
  KING: {
    key: 'KING',
    display: 'K',
    code: 'K',
    order: 13,
  },
  JOKER: {
    key: 'JOKER',
    isJoker: true,
    code: 'X',
    display: 'X',
    value: 14,
  },
};

const ACE = VALUES.ACE.key
const TWO = VALUES.TWO.key
const THREE = VALUES.THREE.key
const FOUR = VALUES.FOUR.key
const FIVE = VALUES.FIVE.key
const SIX = VALUES.SIX.key
const SEVEN = VALUES.SEVEN.key
const EIGHT = VALUES.EIGHT.key
const NINE = VALUES.NINE.key
const TEN = VALUES.TEN.key
const JACK = VALUES.JACK.key
const QUEEN = VALUES.QUEEN.key
const KING = VALUES.KING.key
const JOKER = VALUES.JOKER.key


class Card {
  constructor(suitKey, valueKey) {
    if (!Object.keys(SUITS).includes(suitKey)) {
      throw new Error(`Invalid suit key: ${suitKey}`);
    }
    if (!Object.keys(VALUES).includes(valueKey)) {
      throw new Error(`Invalid value key: ${valueKey}`);
    }
    this.suitKey = suitKey
    this.valueKey = valueKey
    this.faceDown = false;   // NOTE - not all piles make use of this
  }

  get suit() {
    return SUITS[this.suitKey];
  }

  get value() {
    return VALUES[this.valueKey];
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

  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);

  // styleElement.type = 'text/css';
  for (let card of allCards()) {
    console.log(card)
    const className = `card-${card.suit.code}${card.value.code}`;

    let color;
    switch (card.suit.key) {
      case HEARTS:
      case DIAMONDS:
      case RED:
        color = 'red';
        break;
      case CLUBS:
      case SPADES:
      case BLACK:
        color = 'black';
        break;
    }

    styleElement.sheet.insertRule(`
      .${className} {
        color: ${color};
      }
      `, styleElement.sheet.cssRules.length);
    styleElement.sheet.insertRule(`
      .${className}::after {
        content: "${card.value.display} ${card.suit.display}";
      }
      `, styleElement.sheet.cssRules.length);
  }
}


createStyleSheet()


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
      stock: shuffle(buildPile([
        [HEARTS, JACK],
        [HEARTS, QUEEN],
        [HEARTS, KING],
        [DIAMONDS, JACK],
        [DIAMONDS, QUEEN],
        [DIAMONDS, KING],
        [RED, JOKER],
      ])),
      available: [],
    };

    this.gems = {
      stock: shuffle(buildPile([
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
      ])),
      obtained: [],
    };

    this.fate = shuffle(buildPile([
      [HEARTS, SIX],
      [HEARTS, SEVEN],
      [HEARTS, EIGHT],
      [HEARTS, NINE],
      [HEARTS, TEN],
    ]));

    this.dungeon = {
      stock: shuffle(buildPile([
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
      ])),
      matrix: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
    };
    this.dungeon.matrix[1][1] = this.dungeon.stock.pop();
    this.dungeon.matrix[1][1].faceDown = true;
  }

  addCardToDungeon(coords) {
    const card = this.dungeon.stock.pop();
    this.dungeon.matrix[coords[0]][coords[1]] = card;
    card.faceDown = false;
    this.render();
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
    const hpStockElement = document.querySelector('#hp .stock');
    if (this.game.hp.stock.length > 0) {
      hpStockElement.classList.add('card');
      hpStockElement.classList.add('card-back');
    } else {
      hpStockElement.classList.remove('card');
      hpStockElement.classList.remove('card-back');
    }

    const hpAvailableElement = document.querySelector('#hp .available');
    if (this.game.hp.available.length > 0) {
      const topCard = this.game.hp.available[this.game.hp.available.length - 1];
      hpAvailableElement.classList.add('card');
      hpAvailableElement.classList.add(`card-${topCard.suit.code}${topCard.value.code}`);
    } else {
      hpAvailableElement.classList.remove('card');
      hpAvailableElement.classList.remove('card-back');
    }
  }

  renderDungeon() {
    const dungeonMatrixElement = document.querySelector('#dungeon .matrix');
    dungeonMatrixElement.innerHTML = '';
    dungeonMatrixElement.style.gridTemplateColumns = `repeat(${this.game.dungeon.matrix[0].length}, 1fr)`;
    dungeonMatrixElement.style.gridTemplateRows = `repeat(${this.game.dungeon.matrix.length}, 1fr)`;

    const flattenedMatrix = [].concat(...this.game.dungeon.matrix)
    for (let i = 0; i < flattenedMatrix.length; i += 1) {
      const cell = flattenedMatrix[i];
      const cellElement = document.createElement('button');
      cellElement.classList.add('cell');
      if (cell) {
        cellElement.classList.add('card');
        if (cell.faceDown) {
          cellElement.classList.add('card-back');
          cellElement.disabled = true;
        } else {
          // TODO disable if not valid move
          cellElement.classList.add(`card-${cell.suit.code}${cell.value.code}`);
        }
      } else {
        cellElement.onclick = () => {
          window.cell = cellElement;
          const coords = [Math.floor(i / 3), i % 3];
          this.game.addCardToDungeon(coords);
        }
      }
      dungeonMatrixElement.appendChild(cellElement);
    }

    const dungeonStockElement = document.querySelector('#dungeon .stock');
    if (this.game.dungeon.stock.length > 0) {
      dungeonStockElement.classList.add('card');
      dungeonStockElement.classList.add('card-back');
    } else {
      dungeonStockElement.classList.remove('card');
      dungeonStockElement.classList.remove('card-back');
    }

  }
}

function main() {
  const game = new Game();
  game.render();
}

main();
