// Card class - shared between browser and Node.js

export class Card {
  constructor(suitKey, valueKey) {
    this.suitKey = suitKey;
    this.valueKey = valueKey;
  }

  get suit() {
    // In browser, window.SUITS is available
    // In Node, this will be undefined but that's OK for serialization
    return (typeof window !== 'undefined' && window.SUITS)
      ? window.SUITS[this.suitKey]
      : { key: this.suitKey };
  }

  get value() {
    return (typeof window !== 'undefined' && window.VALUES)
      ? window.VALUES[this.valueKey]
      : { key: this.valueKey };
  }
}

export class Cell {
  constructor() {
    this.card = null;
    this.cardFaceDown = false;
    this.available = false;
  }
}
