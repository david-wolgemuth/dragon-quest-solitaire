/**
 * Card Suit Definitions
 *
 * Defines all suits available in the game including traditional playing card suits
 * (Hearts, Clubs, Diamonds, Spades) and special Joker color suits (Black, Red).
 */

/**
 * All available card suits
 * @type {Object.<string, {key: string, code: string, display: string, isColor?: boolean}>}
 */
export const SUITS = {
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

/** @const {string} Hearts suit key */
export const HEARTS = SUITS.HEARTS.key;
/** @const {string} Clubs suit key */
export const CLUBS = SUITS.CLUBS.key;
/** @const {string} Diamonds suit key */
export const DIAMONDS = SUITS.DIAMONDS.key;
/** @const {string} Spades suit key */
export const SPADES = SUITS.SPADES.key;
/** @const {string} Black (Joker) suit key */
export const BLACK = SUITS.BLACK.key;
/** @const {string} Red (Joker) suit key */
export const RED = SUITS.RED.key;

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.SUITS = SUITS;
  window.HEARTS = HEARTS;
  window.CLUBS = CLUBS;
  window.DIAMONDS = DIAMONDS;
  window.SPADES = SPADES;
  window.BLACK = BLACK;
  window.RED = RED;
}
