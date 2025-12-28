/**
 * Card Value Definitions
 *
 * Defines all card values from Ace through King, plus Joker.
 * Each value has a display representation, code, and order for comparison.
 */

/**
 * All available card values
 * @type {Object.<string, {key: string, code: string, display: string, order?: number, isJoker?: boolean}>}
 */
export const VALUES = {
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

/** @const {string} Ace value key */
export const ACE = VALUES.ACE.key;
/** @const {string} Two value key */
export const TWO = VALUES.TWO.key;
/** @const {string} Three value key */
export const THREE = VALUES.THREE.key;
/** @const {string} Four value key */
export const FOUR = VALUES.FOUR.key;
/** @const {string} Five value key */
export const FIVE = VALUES.FIVE.key;
/** @const {string} Six value key */
export const SIX = VALUES.SIX.key;
/** @const {string} Seven value key */
export const SEVEN = VALUES.SEVEN.key;
/** @const {string} Eight value key */
export const EIGHT = VALUES.EIGHT.key;
/** @const {string} Nine value key */
export const NINE = VALUES.NINE.key;
/** @const {string} Ten value key */
export const TEN = VALUES.TEN.key;
/** @const {string} Jack value key */
export const JACK = VALUES.JACK.key;
/** @const {string} Queen value key */
export const QUEEN = VALUES.QUEEN.key;
/** @const {string} King value key */
export const KING = VALUES.KING.key;
/** @const {string} Joker value key */
export const JOKER = VALUES.JOKER.key;

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.VALUES = VALUES;
  window.ACE = ACE;
  window.TWO = TWO;
  window.THREE = THREE;
  window.FOUR = FOUR;
  window.FIVE = FIVE;
  window.SIX = SIX;
  window.SEVEN = SEVEN;
  window.EIGHT = EIGHT;
  window.NINE = NINE;
  window.TEN = TEN;
  window.JACK = JACK;
  window.QUEEN = QUEEN;
  window.KING = KING;
  window.JOKER = JOKER;
}
