import { describe, it, expect, beforeEach } from 'vitest';

describe('Card System', () => {
  describe('Card creation and validation', () => {
    it('creates valid cards with proper suit and value', () => {
      const card = new window.Card(window.HEARTS, window.ACE);

      expect(card.suit.key).toBe(window.HEARTS);
      expect(card.value.key).toBe(window.ACE);
      expect(card.suit.display).toBe('♥️');
      expect(card.value.display).toBe('A');
    });

    it('rejects invalid suit keys', () => {
      expect(() => new window.Card('INVALID_SUIT', window.ACE)).toThrow();
    });

    it('rejects invalid value keys', () => {
      expect(() => new window.Card(window.HEARTS, 'INVALID_VALUE')).toThrow();
    });
  });

  describe('Card properties', () => {
    it('provides numeric order for card values', () => {
      const ace = new window.Card(window.HEARTS, window.ACE);
      const five = new window.Card(window.HEARTS, window.FIVE);
      const king = new window.Card(window.HEARTS, window.KING);

      expect(ace.value.order).toBe(1);
      expect(five.value.order).toBe(5);
      expect(king.value.order).toBe(13);
    });

    it('distinguishes red suits from black suits', () => {
      const heartCard = new window.Card(window.HEARTS, window.ACE);
      const spadeCard = new window.Card(window.SPADES, window.ACE);

      // Hearts and Diamonds are red, Spades and Clubs are black
      expect(heartCard.suit.key).toBe(window.HEARTS);
      expect(spadeCard.suit.key).toBe(window.SPADES);
    });

    it('supports joker cards with color suits', () => {
      const blackJoker = new window.Card(window.BLACK, window.JOKER);
      const redJoker = new window.Card(window.RED, window.JOKER);

      expect(blackJoker.suit.isColor).toBe(true);
      expect(redJoker.suit.isColor).toBe(true);
      expect(blackJoker.value.isJoker).toBe(true);
    });
  });
});

describe('Dungeon Card Definitions', () => {
  it('defines all dungeon cards with required behavior', () => {
    const testCards = [
      window.DUNGEON_CARDS[window.SPADES][window.ACE],   // Exit
      window.DUNGEON_CARDS[window.SPADES][window.SEVEN], // Gem
      window.DUNGEON_CARDS[window.SPADES][window.TEN],   // Slime
      window.DUNGEON_CARDS[window.CLUBS][window.ACE],    // Merchant
      window.DUNGEON_CARDS[window.BLACK][window.JOKER],  // Wizard
    ];

    testCards.forEach(card => {
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('resolver');
      expect(typeof card.resolver).toBe('function');
    });
  });

  it('shares common cards between Spades and Clubs', () => {
    // Clubs 7-Jack should reference the same objects as Spades
    expect(window.DUNGEON_CARDS[window.CLUBS][window.SEVEN])
      .toBe(window.DUNGEON_CARDS[window.SPADES][window.SEVEN]);

    expect(window.DUNGEON_CARDS[window.CLUBS][window.EIGHT])
      .toBe(window.DUNGEON_CARDS[window.SPADES][window.EIGHT]);

    expect(window.DUNGEON_CARDS[window.CLUBS][window.JACK])
      .toBe(window.DUNGEON_CARDS[window.SPADES][window.JACK]);
  });
});
