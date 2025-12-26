import { describe, it, expect } from 'vitest';

// Card creation and basic properties
describe('Card Model', () => {
  it('creates a card with suit and value', () => {
    const card = new window.Card(window.HEARTS, window.ACE);
    expect(card.suitKey).toBe(window.HEARTS);
    expect(card.valueKey).toBe(window.ACE);
  });

  it('provides suit object through getter', () => {
    const card = new window.Card(window.SPADES, window.KING);
    expect(card.suit).toBeDefined();
    expect(card.suit.key).toBe(window.SPADES);
    expect(card.suit.display).toBe('♠️');
  });

  it('provides value object through getter', () => {
    const card = new window.Card(window.DIAMONDS, window.TEN);
    expect(card.value).toBeDefined();
    expect(card.value.key).toBe(window.TEN);
    expect(card.value.display).toBe('10');
    expect(card.value.order).toBe(10);
  });

  it('throws error for invalid suit', () => {
    expect(() => new window.Card('INVALID_SUIT', window.ACE)).toThrow();
  });

  it('throws error for invalid value', () => {
    expect(() => new window.Card(window.HEARTS, 'INVALID_VALUE')).toThrow();
  });
});

describe('Suit Constants', () => {
  it('has all four standard suits', () => {
    expect(window.SUITS.HEARTS).toBeDefined();
    expect(window.SUITS.CLUBS).toBeDefined();
    expect(window.SUITS.DIAMONDS).toBeDefined();
    expect(window.SUITS.SPADES).toBeDefined();
  });

  it('has color suits for jokers', () => {
    expect(window.SUITS.BLACK).toBeDefined();
    expect(window.SUITS.RED).toBeDefined();
    expect(window.SUITS.BLACK.isColor).toBe(true);
    expect(window.SUITS.RED.isColor).toBe(true);
  });

  it('each suit has required properties', () => {
    Object.values(window.SUITS).forEach(suit => {
      expect(suit.key).toBeDefined();
      expect(suit.display).toBeDefined();
      expect(suit.code).toBeDefined();
    });
  });
});

describe('Value Constants', () => {
  it('has all standard card values', () => {
    expect(window.VALUES.ACE).toBeDefined();
    expect(window.VALUES.TWO).toBeDefined();
    expect(window.VALUES.TEN).toBeDefined();
    expect(window.VALUES.JACK).toBeDefined();
    expect(window.VALUES.QUEEN).toBeDefined();
    expect(window.VALUES.KING).toBeDefined();
  });

  it('has joker value', () => {
    expect(window.VALUES.JOKER).toBeDefined();
    expect(window.VALUES.JOKER.isJoker).toBe(true);
  });

  it('values have correct order', () => {
    expect(window.VALUES.ACE.order).toBe(1);
    expect(window.VALUES.FIVE.order).toBe(5);
    expect(window.VALUES.TEN.order).toBe(10);
    expect(window.VALUES.KING.order).toBe(13);
  });
});

describe('Cell Model', () => {
  it('creates an empty cell', () => {
    const cell = new window.Cell();
    expect(cell.card).toBeNull();
    expect(cell.cardFaceDown).toBe(false);
    expect(cell.available).toBe(false);
  });
});
