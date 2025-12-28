// URL State Serialization/Deserialization
// Enables storing and restoring game state via URL parameters

// Card class definition (shared between url-state.js and index.js)
// Defined here to avoid class redefinition when scripts load
class Card {
  constructor(suitKey, valueKey) {
    // Validation only if SUITS/VALUES are available (after cards.js loads)
    if (window.SUITS && !Object.keys(window.SUITS).includes(suitKey)) {
      throw new Error(`Invalid suit key: ${suitKey}`);
    }
    if (window.VALUES && !Object.keys(window.VALUES).includes(valueKey)) {
      throw new Error(`Invalid value key: ${valueKey}`);
    }
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

// Serialize a card to a plain object
function serializeCard(card) {
  return {
    suit: card.suitKey,
    value: card.valueKey
  };
}

// Deserialize a card from a plain object
function deserializeCard(obj) {
  return new Card(obj.suit, obj.value);
}

// Serialize game state to URL parameter (single base64-encoded JSON)
function serializeGameState(game) {
  const serializePile = (pile) => ({
    stock: pile.stock.map(serializeCard),
    available: pile.available.map(serializeCard)
  });

  const state = {
    health: serializePile(game.health),
    inventory: serializePile(game.inventory),
    gems: serializePile(game.gems),
    fate: serializePile(game.fate),
    dungeon: {
      stock: game.dungeon.stock.map(serializeCard),
      matrix: []
    }
  };

  // Serialize dungeon matrix
  for (let row = 0; row < game.dungeon.matrix.length; row++) {
    for (let col = 0; col < game.dungeon.matrix[row].length; col++) {
      const cell = game.dungeon.matrix[row][col];
      if (cell.card) {
        state.dungeon.matrix.push({
          row,
          col,
          card: serializeCard(cell.card),
          faceDown: cell.cardFaceDown
        });
      }
    }
  }

  // Convert to JSON and base64 encode
  const json = JSON.stringify(state);
  const base64 = btoa(json);

  return `state=${encodeURIComponent(base64)}`;
}

// Deserialize game state from URL parameter
function deserializeGameState(queryString) {
  try {
    const params = new URLSearchParams(queryString);
    const base64 = params.get('state');

    if (!base64) {
      throw new Error('No state parameter found in URL');
    }

    // Decode base64 and parse JSON
    // Note: URLSearchParams.get() already URL-decodes, so no need for decodeURIComponent
    const json = atob(base64);
    const state = JSON.parse(json);

    // Deserialize piles
    const deserializePile = (pile) => ({
      stock: pile.stock.map(deserializeCard),
      available: pile.available.map(deserializeCard)
    });

    return {
      health: deserializePile(state.health),
      inventory: deserializePile(state.inventory),
      gems: deserializePile(state.gems),
      fate: deserializePile(state.fate),
      dungeonStock: state.dungeon.stock.map(deserializeCard),
      dungeonMatrix: state.dungeon.matrix.map(cell => ({
        row: cell.row,
        col: cell.col,
        card: deserializeCard(cell.card),
        cardFaceDown: cell.faceDown
      }))
    };
  } catch (error) {
    throw new Error(`Failed to deserialize state: ${error.message}`);
  }
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

// Make functions and classes globally available (for use in index.js and tests)
if (typeof window !== 'undefined') {
  window.Card = Card;
  window.serializeCard = serializeCard;
  window.deserializeCard = deserializeCard;
  window.serializeGameState = serializeGameState;
  window.deserializeGameState = deserializeGameState;
  window.createSeededRNG = createSeededRNG;
}
