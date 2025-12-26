// URL State Serialization/Deserialization
// Enables storing and restoring game state via URL parameters

// Card class definition (needed for deserialization)
// Simplified version - full Card class with validation is in index.js
class Card {
  constructor(suitKey, valueKey) {
    this.suitKey = suitKey;
    this.valueKey = valueKey;
  }

  get suit() {
    return window.SUITS ? window.SUITS[this.suitKey] : { key: this.suitKey };
  }

  get value() {
    return window.VALUES ? window.VALUES[this.valueKey] : { key: this.valueKey };
  }
}

// Serialize a card to a short string (e.g., "HA" for Hearts Ace, "RX" for Red Joker)
function serializeCard(card) {
  const suitMap = { HEARTS: 'H', CLUBS: 'C', DIAMONDS: 'D', SPADES: 'S', BLACK: 'B', RED: 'R' };
  const valueMap = { ACE: 'A', TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '0', JACK: 'J', QUEEN: 'Q', KING: 'K', JOKER: 'X' };
  return `${valueMap[card.valueKey]}${suitMap[card.suitKey]}`;
}

// Deserialize a card from a short string
function deserializeCard(str) {
  const suitMap = { H: 'HEARTS', C: 'CLUBS', D: 'DIAMONDS', S: 'SPADES', B: 'BLACK', R: 'RED' };
  const valueMap = { A: 'ACE', '2': 'TWO', '3': 'THREE', '4': 'FOUR', '5': 'FIVE', '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE', '0': 'TEN', J: 'JACK', Q: 'QUEEN', K: 'KING', X: 'JOKER' };
  const valueKey = valueMap[str[0]];
  const suitKey = suitMap[str[1]];
  return new Card(suitKey, valueKey);
}

// Serialize game state to URL parameters
function serializeGameState(game) {
  const params = new URLSearchParams();

  // Serialize resource piles (store card order and split point)
  const serializePile = (pile) => {
    const allCards = [...pile.stock, ...pile.available];
    const cardStr = allCards.map(serializeCard).join('');
    return `${cardStr}:${pile.stock.length}`;
  };

  params.set('health', serializePile(game.health));
  params.set('inventory', serializePile(game.inventory));
  params.set('gems', serializePile(game.gems));
  params.set('fate', serializePile(game.fate));

  // Serialize dungeon pile
  const dungeonStock = game.dungeon.stock.map(serializeCard).join('');
  params.set('dungeonStock', dungeonStock);

  // Serialize dungeon matrix
  const matrixData = [];
  for (let row = 0; row < game.dungeon.matrix.length; row++) {
    for (let col = 0; col < game.dungeon.matrix[row].length; col++) {
      const cell = game.dungeon.matrix[row][col];
      if (cell.card) {
        const cardStr = serializeCard(cell.card);
        const faceDown = cell.cardFaceDown ? '1' : '0';
        matrixData.push(`${row},${col},${cardStr},${faceDown}`);
      }
    }
  }
  params.set('dungeonMatrix', matrixData.join('|'));

  return params.toString();
}

// Deserialize game state from URL parameters
function deserializeGameState(queryString) {
  const params = new URLSearchParams(queryString);

  const deserializePile = (pileStr) => {
    const [cardStr, stockLengthStr] = pileStr.split(':');
    const cards = [];
    for (let i = 0; i < cardStr.length; i += 2) {
      cards.push(deserializeCard(cardStr.substr(i, 2)));
    }
    const stockLength = parseInt(stockLengthStr, 10);
    return {
      stock: cards.slice(0, stockLength),
      available: cards.slice(stockLength)
    };
  };

  const state = {
    health: deserializePile(params.get('health')),
    inventory: deserializePile(params.get('inventory')),
    gems: deserializePile(params.get('gems')),
    fate: deserializePile(params.get('fate')),
    dungeonStock: [],
    dungeonMatrix: []
  };

  // Deserialize dungeon stock
  const dungeonStockStr = params.get('dungeonStock');
  for (let i = 0; i < dungeonStockStr.length; i += 2) {
    state.dungeonStock.push(deserializeCard(dungeonStockStr.substr(i, 2)));
  }

  // Deserialize dungeon matrix
  const matrixStr = params.get('dungeonMatrix');
  if (matrixStr) {
    const cells = matrixStr.split('|');
    for (const cellData of cells) {
      if (cellData) {
        const [rowStr, colStr, cardStr, faceDownStr] = cellData.split(',');
        state.dungeonMatrix.push({
          row: parseInt(rowStr, 10),
          col: parseInt(colStr, 10),
          card: deserializeCard(cardStr),
          cardFaceDown: faceDownStr === '1'
        });
      }
    }
  }

  return state;
}

// Seeded random number generator (mulberry32)
function createSeededRNG(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
