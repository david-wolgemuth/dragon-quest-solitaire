// URL State Serialization/Deserialization
// Enables storing and restoring game state via URL parameters

import { Card } from './src/card.js';

// Serialize a card to a plain object
function serializeCard(card) {
  if (!card || !card.suitKey || !card.valueKey) {
    throw new Error('Invalid card: missing suitKey or valueKey');
  }
  return {
    suit: card.suitKey,
    value: card.valueKey
  };
}

// Deserialize a card from a plain object
function deserializeCard(obj) {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid card object: expected object, got ' + typeof obj);
  }
  if (!obj.suit || !obj.value) {
    throw new Error('Invalid card object: missing suit or value');
  }
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
      matrixRows: game.dungeon.matrix.length,
      matrixCols: game.dungeon.matrix[0]?.length || 0,
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

    // Validate state structure
    if (!state || typeof state !== 'object') {
      throw new Error('State is not an object');
    }

    const required = ['health', 'inventory', 'gems', 'fate', 'dungeon'];
    for (const field of required) {
      if (!state[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate pile structure
    const validatePile = (pile, name) => {
      if (!pile || typeof pile !== 'object') {
        throw new Error(`${name} is not an object`);
      }
      if (!Array.isArray(pile.stock)) {
        throw new Error(`${name}.stock is not an array`);
      }
      if (!Array.isArray(pile.available)) {
        throw new Error(`${name}.available is not an array`);
      }
    };

    validatePile(state.health, 'health');
    validatePile(state.inventory, 'inventory');
    validatePile(state.gems, 'gems');
    validatePile(state.fate, 'fate');

    // Validate dungeon structure
    if (!Array.isArray(state.dungeon.stock)) {
      throw new Error('dungeon.stock is not an array');
    }
    if (!Array.isArray(state.dungeon.matrix)) {
      throw new Error('dungeon.matrix is not an array');
    }

    // Deserialize piles
    const deserializePile = (pile, name) => {
      try {
        return {
          stock: pile.stock.map((card, i) => {
            try {
              return deserializeCard(card);
            } catch (e) {
              throw new Error(`${name}.stock[${i}]: ${e.message}`);
            }
          }),
          available: pile.available.map((card, i) => {
            try {
              return deserializeCard(card);
            } catch (e) {
              throw new Error(`${name}.available[${i}]: ${e.message}`);
            }
          })
        };
      } catch (e) {
        throw new Error(`Failed to deserialize ${name}: ${e.message}`);
      }
    };

    const result = {
      health: deserializePile(state.health, 'health'),
      inventory: deserializePile(state.inventory, 'inventory'),
      gems: deserializePile(state.gems, 'gems'),
      fate: deserializePile(state.fate, 'fate'),
      dungeonStock: state.dungeon.stock.map((card, i) => {
        try {
          return deserializeCard(card);
        } catch (e) {
          throw new Error(`dungeon.stock[${i}]: ${e.message}`);
        }
      }),
      matrixRows: state.dungeon.matrixRows,
      matrixCols: state.dungeon.matrixCols,
      dungeonMatrix: state.dungeon.matrix.map((cell, i) => {
        if (!cell || typeof cell !== 'object') {
          throw new Error(`dungeon.matrix[${i}] is not an object`);
        }
        if (typeof cell.row !== 'number') {
          throw new Error(`dungeon.matrix[${i}].row is not a number`);
        }
        if (typeof cell.col !== 'number') {
          throw new Error(`dungeon.matrix[${i}].col is not a number`);
        }
        if (!cell.card) {
          throw new Error(`dungeon.matrix[${i}].card is missing`);
        }
        if (typeof cell.faceDown !== 'boolean') {
          throw new Error(`dungeon.matrix[${i}].faceDown is not a boolean`);
        }
        return {
          row: cell.row,
          col: cell.col,
          card: deserializeCard(cell.card),
          cardFaceDown: cell.faceDown
        };
      })
    };

    return result;
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

// Export for ES modules
export {
  Card,
  serializeCard,
  deserializeCard,
  serializeGameState,
  deserializeGameState,
  createSeededRNG
};

// Make functions and classes globally available for browser (backwards compat)
if (typeof window !== 'undefined') {
  window.Card = Card;
  window.serializeCard = serializeCard;
  window.deserializeCard = deserializeCard;
  window.serializeGameState = serializeGameState;
  window.deserializeGameState = deserializeGameState;
  window.createSeededRNG = createSeededRNG;
}
