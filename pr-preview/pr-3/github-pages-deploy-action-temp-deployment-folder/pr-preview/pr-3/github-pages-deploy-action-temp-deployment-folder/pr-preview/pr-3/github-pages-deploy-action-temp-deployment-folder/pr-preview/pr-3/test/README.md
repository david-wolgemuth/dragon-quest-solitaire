# Dragon Quest Solitaire - Test Suite

## Overview

This test suite validates the core functionality of the Dragon Quest Solitaire game using Vitest with JSDOM.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### test/setup.js
- Configures JSDOM environment with necessary DOM elements
- Loads game scripts in correct order (cards.js → card-builders.js → dungeon-cards.js → index.js)
- Prevents automatic execution of main() function
- Exports game classes to window for testing

### test/cards.test.js (12 tests)
Tests for the card model and constants:
- Card creation and validation
- Suit and value getters
- Error handling for invalid inputs
- Suit constants (HEARTS, CLUBS, DIAMONDS, SPADES, BLACK, RED)
- Value constants (ACE through KING, JOKER)
- Cell model initialization

### test/game-state.test.js (24 tests)
Tests for game state management and logic:

**Game Initialization (6 tests)**
- Health pile setup (5 cards, Hearts A-5)
- Gem pile setup (10 cards, Diamonds A-10)
- Inventory pile setup (7 cards, shuffled)
- Fate pile setup (5 cards, Hearts 6-10)
- Dungeon pile setup (27 cards)
- Initial dungeon card placement

**Resource Pile Operations (8 tests)**
- Gaining cards (health, gems, inventory)
- Losing cards (health, gems, inventory)
- Boundary conditions (empty stock, empty available)
- Fate check mechanics

**Dungeon Grid Management (5 tests)**
- Grid initialization and expansion
- Matrix info calculation
- Card placement mechanics
- Availability updates

**Card Definitions (5 tests)**
- All Spades cards defined
- All Clubs cards defined
- Black Joker defined
- Required properties validation
- Clubs 7-Jack reference Spades equivalents

## Current Test Coverage

**36 tests passing**, covering:
- ✅ Card model and constants
- ✅ Game initialization
- ✅ Resource pile operations (gain/lose)
- ✅ Fate deck mechanics (first draw only)
- ✅ Dungeon grid expansion
- ✅ Card placement
- ✅ Card definition validation

**Not yet tested** (requires bug fixes first):
- ⚠️ Fate deck reshuffle (Bug #4 - duplicates cards)
- ⚠️ Passage matching (Bug #8, #9 - broken parameters, matches resolved)
- ⚠️ Merchant/Wizard card selection (Bug #1 - buttons not rendered)
- ⚠️ Game over condition (Bug #2 - not implemented)
- ⚠️ Combat critical success (Bug #7 - wrong amounts)
- ⚠️ Hidden pit trap gem reduction (Bug #5 - not implemented)

See `BUG_REPORT.md` for full list of known issues.

## Test Philosophy

These are **happy path tests** that validate functionality that currently works correctly. They intentionally avoid testing known bugs to establish a baseline. Once bugs are fixed, corresponding tests should be added to prevent regressions.

## Adding New Tests

1. Add test file to `test/` directory
2. Import from `vitest`: `import { describe, it, expect, beforeEach } from 'vitest'`
3. Access game objects via `window.*` (Card, Game, GameRenderer, etc.)
4. Run tests to verify

Example:
```javascript
import { describe, it, expect } from 'vitest';

describe('New Feature', () => {
  it('does something correctly', () => {
    const game = new window.Game();
    expect(game.health.available.length).toBe(5);
  });
});
```

## Coverage Goals

Once bugs are fixed:
- **Target**: 80% line coverage
- **Target**: 80% function coverage
- **Target**: 75% branch coverage

Run `npm run test:coverage` to see current coverage report.

## Notes

- Tests run in JSDOM (simulated browser environment)
- Each test gets a fresh Game instance via `beforeEach`
- Console logs from game code (e.g., `_gainCard`) appear in test output
- Grid expansion happens automatically, so position-based tests must account for this
- Some randomness (shuffling) makes certain tests non-deterministic; tests should be robust to order
