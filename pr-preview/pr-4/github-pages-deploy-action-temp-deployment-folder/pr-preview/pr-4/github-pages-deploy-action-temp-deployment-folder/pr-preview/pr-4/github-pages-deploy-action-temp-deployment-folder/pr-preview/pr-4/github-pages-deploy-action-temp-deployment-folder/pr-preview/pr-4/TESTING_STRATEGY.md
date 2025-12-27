# Testing Infrastructure Recommendations

## Overview

This document proposes testing strategies for Dragon Quest Solitaire. Given the vanilla JavaScript architecture and browser-based nature, we present two complementary approaches and one "high enough" hybrid approach.

---

## Approach 1: Two-Tier Testing (Comprehensive)

### Low-Level: Vitest + JSDOM (Unit & Integration)

**Purpose**: Test game logic, state management, and card behavior in isolation

**Setup**:
```json
// package.json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "@vitest/ui": "^1.0.0"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Configuration**:
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js']
  }
});
```

**What to Test**:

1. **Card Model Tests** (`test/cards.test.js`)
   - Card creation and validation
   - Suit/value getters
   - Card equality checks

2. **Game State Tests** (`test/game-state.test.js`)
   - Resource pile management (stock/available)
   - Gain/lose card operations
   - Edge cases (empty piles, overfilling)

3. **Card Resolver Tests** (`test/card-resolvers.test.js`)
   - Each card type's resolver logic
   - Combat outcomes at different fate values
   - Passage matching logic
   - Resource modifications

4. **Dungeon Grid Tests** (`test/dungeon-grid.test.js`)
   - Grid expansion/contraction
   - Availability calculation
   - Card placement rules

**Example Test**:
```javascript
// test/game-state.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../index.js';

describe('Game State Management', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  describe('Health Management', () => {
    it('starts with 5 health available', () => {
      expect(game.health.available.length).toBe(5);
      expect(game.health.stock.length).toBe(0);
    });

    it('loses health correctly', () => {
      game._loseCard('health', 2);
      expect(game.health.available.length).toBe(3);
      expect(game.health.stock.length).toBe(2);
    });

    it('triggers game over when health reaches 0', () => {
      game._loseCard('health', 5);
      expect(game.health.available.length).toBe(0);
      // TODO: expect(game.isGameOver).toBe(true);
    });

    it('cannot lose more health than available', () => {
      game._loseCard('health', 10);
      expect(game.health.available.length).toBe(0);
      expect(game.health.stock.length).toBe(5);
    });

    it('cannot gain more health than maximum', () => {
      game._loseCard('health', 2);
      game._gainCard('health', 5);
      expect(game.health.available.length).toBe(5);
      expect(game.health.stock.length).toBe(0);
    });
  });

  describe('Fate Check', () => {
    it('returns value between 6-10', () => {
      const value = game.fateCheck();
      expect(value).toBeGreaterThanOrEqual(6);
      expect(value).toBeLessThanOrEqual(10);
    });

    it('reshuffles when stock is empty', () => {
      // Use all 5 cards
      for (let i = 0; i < 5; i++) {
        game.fateCheck();
      }
      expect(game.fate.stock.length).toBe(0);
      expect(game.fate.available.length).toBe(5);

      // Next draw should reshuffle
      game.fateCheck();
      expect(game.fate.stock.length).toBe(4);
      expect(game.fate.available.length).toBe(1);
    });

    it('does not duplicate cards on reshuffle', () => {
      // Use all cards and trigger reshuffle
      for (let i = 0; i < 6; i++) {
        game.fateCheck();
      }
      const totalCards = game.fate.stock.length + game.fate.available.length;
      expect(totalCards).toBe(5);
    });
  });
});

describe('Card Resolvers', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  describe('Enemy Cards', () => {
    it('Slime: defeats with fate 7+', () => {
      const slimeCard = DUNGEON_CARDS[SPADES][TEN];

      // Mock fateCheck to return 7
      game.fateCheck = () => 7;

      const healthBefore = game.health.available.length;
      slimeCard.resolver(game);

      // Should not lose health on success
      expect(game.health.available.length).toBe(healthBefore);
    });

    it('Slime: takes 1 damage with fate <7', () => {
      const slimeCard = DUNGEON_CARDS[SPADES][TEN];

      // Mock fateCheck to return 6
      game.fateCheck = () => 6;

      const healthBefore = game.health.available.length;
      slimeCard.resolver(game);

      // Should lose 1 health on failure
      expect(game.health.available.length).toBe(healthBefore - 1);
    });

    it('Slime: critical success (10) heals 1 health', () => {
      const slimeCard = DUNGEON_CARDS[SPADES][TEN];

      // Mock fateCheck to return 10
      game.fateCheck = () => 10;

      // Lose health first
      game._loseCard('health', 1);
      const healthBefore = game.health.available.length;

      slimeCard.resolver(game);

      // Should gain 1 health on critical
      expect(game.health.available.length).toBe(healthBefore + 1);
    });
  });

  describe('Passage Cards', () => {
    it('resolves when matching passage is found', () => {
      // Place 4 of Spades
      game.dungeon.matrix[0][0].card = new Card(SPADES, FOUR);
      game.dungeon.matrix[0][0].cardFaceDown = false;

      // Place 4 of Clubs
      game.dungeon.matrix[0][1].card = new Card(CLUBS, FOUR);
      game.dungeon.matrix[0][1].cardFaceDown = false;

      // Try to resolve passage
      const result = game.foundPassage(SPADES, FOUR);

      expect(result).toBe(true);
      expect(game.dungeon.matrix[0][1].cardFaceDown).toBe(true);
    });

    it('does not resolve when passage not found', () => {
      // Place 4 of Spades only
      game.dungeon.matrix[0][0].card = new Card(SPADES, FOUR);
      game.dungeon.matrix[0][0].cardFaceDown = false;

      const result = game.foundPassage(SPADES, FOUR);

      expect(result).toBe(false);
    });

    it('does not match already-resolved passages', () => {
      // Place 4 of Spades
      game.dungeon.matrix[0][0].card = new Card(SPADES, FOUR);
      game.dungeon.matrix[0][0].cardFaceDown = false;

      // Place 4 of Clubs but already resolved
      game.dungeon.matrix[0][1].card = new Card(CLUBS, FOUR);
      game.dungeon.matrix[0][1].cardFaceDown = true; // Already resolved

      const result = game.foundPassage(SPADES, FOUR);

      expect(result).toBe(false);
    });
  });
});
```

**Benefits**:
- Fast execution (milliseconds)
- No browser required
- Easy to debug
- TDD-friendly
- High code coverage possible
- Tests all bug fixes from BUG_REPORT.md

**Limitations**:
- Doesn't test actual DOM rendering
- Doesn't test user interactions
- Doesn't catch CSS/layout issues

---

### High-Level: Playwright (End-to-End)

**Purpose**: Test complete user workflows and visual behavior

**Setup**:
```json
// package.json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

**Configuration**:
```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:8008',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm start',
    port: 8008,
    reuseExistingServer: true
  }
});
```

**What to Test**:

1. **Game Initialization** (`e2e/game-start.spec.js`)
   - Page loads correctly
   - Initial state is correct
   - First card is placed

2. **Combat Flow** (`e2e/combat.spec.js`)
   - Click enemy card
   - Modal appears with description
   - Fate check executes
   - Health/resources update correctly

3. **Merchant/Wizard Flow** (`e2e/merchant.spec.js`)
   - Click merchant card
   - Card selection modal appears
   - Buttons are visible and clickable
   - Item is gained after selection

4. **Complete Playthrough** (`e2e/full-game.spec.js`)
   - Play through entire dungeon
   - Defeat Dragon Queen
   - Use Exit to win
   - Verify victory screen

**Example Test**:
```javascript
// e2e/combat.spec.js
import { test, expect } from '@playwright/test';

test.describe('Combat System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dungeon .matrix');
  });

  test('fighting Slime enemy', async ({ page }) => {
    // Navigate until we find a Slime (10 of Spades)
    // This is simplified - real test would need game manipulation
    const slimeCard = page.locator('.card-S0').first();

    // Check initial health
    const initialHealth = await page.locator('#health-available .card').count();

    // Click the slime
    await slimeCard.click();

    // Modal should appear
    await expect(page.locator('#message-modal')).toHaveClass(/visible/);

    // Modal should show enemy info
    await expect(page.locator('#message-modal')).toContainText('Slime');

    // Click anywhere to continue
    await page.locator('#message-modal').click();

    // Health should have changed (either lost 1 or gained 1 on crit)
    const finalHealth = await page.locator('#health-available .card').count();
    expect(finalHealth).not.toBe(initialHealth);

    // Card should be resolved (face-down)
    await expect(slimeCard).toHaveClass(/card-back/);
  });

  test('game over when health reaches 0', async ({ page }) => {
    // Manipulate game state to have 1 health
    await page.evaluate(() => {
      window.game._loseCard('health', 4);
    });

    // Fight enemy and lose
    // Mock fate to always fail
    await page.evaluate(() => {
      window.game.fateCheck = () => 6;
    });

    const enemyCard = page.locator('.card').filter({ hasText: 'enemy' }).first();
    await enemyCard.click();

    // Should show game over
    await expect(page.locator('#message-modal')).toContainText('Game Over');
  });
});

test.describe('Merchant & Wizard', () => {
  test('merchant shows card selection', async ({ page }) => {
    await page.goto('/');

    // Add gems to inventory
    await page.evaluate(() => {
      window.game._gainCard('gems', 1);
    });

    // Find and click merchant (Ace of Clubs)
    const merchantCard = page.locator('.card-CA');
    await merchantCard.click();

    // Modal should appear
    await expect(page.locator('#message-modal')).toBeVisible();
    await expect(page.locator('#message-modal')).toContainText('Purchase');

    // Card buttons should be visible (BUG #1 check)
    const cardButtons = page.locator('#message-modal button.card');
    await expect(cardButtons).not.toHaveCount(0);

    // Click a card button
    await cardButtons.first().click();

    // Gem should be consumed
    const gems = await page.evaluate(() => window.game.gems.available.length);
    expect(gems).toBe(0);

    // Item should be gained
    const items = await page.evaluate(() => window.game.inventory.available.length);
    expect(items).toBeGreaterThan(0);
  });
});

test.describe('Visual Regression', () => {
  test('initial game state matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('initial-state.png');
  });

  test('dungeon expands correctly', async ({ page }) => {
    await page.goto('/');

    // Place several cards
    for (let i = 0; i < 10; i++) {
      const emptyCell = page.locator('.cell.available').not('.card').first();
      await emptyCell.click();
    }

    await expect(page.locator('#dungeon .matrix')).toHaveScreenshot('expanded-dungeon.png');
  });
});
```

**Benefits**:
- Tests real user experience
- Catches rendering bugs
- Validates full integration
- Can do visual regression testing
- Tests all browsers
- Finds issues unit tests miss

**Limitations**:
- Slower execution (seconds per test)
- Requires running server
- Harder to debug
- Randomness makes tests brittle
- Can't test all edge cases

---

## Approach 2: "High Enough" Hybrid (Pragmatic)

### Vitest + JSDOM + Testing Library

**Purpose**: Single tool that tests both units and integration at multiple levels

**Setup**:
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "@testing-library/dom": "^9.3.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

**Three Testing Levels in One Framework**:

#### Level 1: Pure Logic Tests (Fast, Isolated)
```javascript
// test/unit/card-logic.test.js
describe('Card Logic', () => {
  it('calculates combat outcomes correctly', () => {
    const result = calculateCombatResult(7, 7); // fate, requirement
    expect(result).toBe('success');
  });
});
```

#### Level 2: Game Integration Tests (Medium, Stateful)
```javascript
// test/integration/game-flow.test.js
import { Game } from '../../index.js';

describe('Game Flow', () => {
  it('complete combat sequence', () => {
    const game = new Game();
    const initialHealth = game.health.available.length;

    // Place enemy
    game.addCardToDungeon({ row: 0, col: 1 });

    // Mock fate to fail
    vi.spyOn(game, 'fateCheck').mockReturnValue(6);

    // Resolve combat
    game.resolveCard({ row: 0, col: 1 });

    expect(game.health.available.length).toBe(initialHealth - 1);
  });
});
```

#### Level 3: DOM Integration Tests (Slow, Full Stack)
```javascript
// test/integration/rendering.test.js
import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('DOM Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="dungeon"><div class="matrix"></div></div>
      <div id="health-available"></div>
      <div id="message-modal"><div id="message-modal-inner-content"></div></div>
    `;
    window.game = new Game();
    window.game.render();
  });

  it('merchant displays card selection buttons', () => {
    // Setup: Give player gems
    window.game._gainCard('gems', 1);

    // Place merchant card manually
    window.game.dungeon.matrix[0][1] = new Cell();
    window.game.dungeon.matrix[0][1].card = new Card(CLUBS, ACE);
    window.game.dungeon.matrix[0][1].cardFaceDown = false;
    window.game.dungeon.matrix[0][1].available = true;
    window.game.render();

    // Click merchant
    const merchantCard = screen.getByRole('button', { name: /A ♣️/ });
    fireEvent.click(merchantCard);

    // Check buttons are rendered (BUG #1)
    const cardButtons = screen.getAllByRole('button');
    const inventoryButtons = cardButtons.filter(btn =>
      btn.classList.contains('card')
    );

    expect(inventoryButtons.length).toBeGreaterThan(0);
  });

  it('updates health display after damage', () => {
    const healthBefore = screen.getAllByClass('card').length;

    window.game._loseCard('health', 1);
    window.game.render();

    const healthAfter = screen.getAllByClass('card').length;
    expect(healthAfter).toBe(healthBefore - 1);
  });
});
```

**Test Organization**:
```
test/
├── unit/              # Pure logic, no DOM (Level 1)
│   ├── cards.test.js
│   ├── combat.test.js
│   └── grid.test.js
├── integration/       # Game + DOM (Level 2 & 3)
│   ├── game-state.test.js
│   ├── rendering.test.js
│   └── card-flow.test.js
├── fixtures/          # Shared test data
│   ├── game-states.js
│   └── mock-cards.js
└── helpers/           # Test utilities
    ├── game-builder.js
    └── assertions.js
```

**Custom Test Helpers**:
```javascript
// test/helpers/game-builder.js
export class GameBuilder {
  constructor() {
    this.game = new Game();
  }

  withHealth(amount) {
    this.game.health.available = this.game.health.available.slice(0, amount);
    return this;
  }

  withGems(amount) {
    for (let i = 0; i < amount; i++) {
      this.game._gainCard('gems', 1);
    }
    return this;
  }

  withCardAt(row, col, suit, value) {
    this.game.dungeon.matrix[row][col].card = new Card(suit, value);
    this.game.dungeon.matrix[row][col].cardFaceDown = false;
    return this;
  }

  withFateResult(value) {
    this.game.fateCheck = () => value;
    return this;
  }

  build() {
    return this.game;
  }
}

// Usage in tests:
const game = new GameBuilder()
  .withHealth(2)
  .withGems(3)
  .withCardAt(0, 1, SPADES, TEN) // Slime
  .withFateResult(6) // Will fail combat
  .build();
```

**Snapshot Testing for Cards**:
```javascript
// test/unit/card-definitions.test.js
describe('Card Definitions', () => {
  it('Spades cards match snapshot', () => {
    expect(DUNGEON_CARDS[SPADES]).toMatchSnapshot();
  });

  it('all enemy cards have required properties', () => {
    const enemies = [
      DUNGEON_CARDS[SPADES][TEN],    // Slime
      DUNGEON_CARDS[SPADES][JACK],   // Skeleton
      DUNGEON_CARDS[SPADES][QUEEN],  // Dragon Queen
      DUNGEON_CARDS[SPADES][KING],   // Troll
    ];

    enemies.forEach(enemy => {
      expect(enemy).toHaveProperty('name');
      expect(enemy).toHaveProperty('resolver');
      expect(enemy).toHaveProperty('resolveCriticalSuccess');
      expect(typeof enemy.resolver).toBe('function');
    });
  });
});
```

**Coverage-Driven Testing**:
```json
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['*.js', '!test/**'],
      exclude: ['vitest.config.js'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

**Benefits**:
- ✅ Single tool to learn
- ✅ Fast unit tests + thorough integration tests
- ✅ Good coverage without E2E slowness
- ✅ Tests DOM rendering
- ✅ Can test visual feedback
- ✅ Incremental adoption
- ✅ Works with current architecture

**Limitations**:
- ⚠️ JSDOM isn't a real browser
- ⚠️ Can't test cross-browser issues
- ⚠️ No visual regression testing
- ⚠️ Harder to test complex interactions

---

## Recommendation Matrix

| Scenario | Recommended Approach |
|----------|---------------------|
| **Just starting testing** | Hybrid (Vitest + JSDOM) |
| **Small team, limited time** | Hybrid only |
| **Production app, critical quality** | Two-tier (Vitest + Playwright) |
| **Continuous refactoring** | Hybrid + snapshot tests |
| **Bug fixes only** | Manual checklist + targeted unit tests |
| **Pre-release validation** | Playwright E2E suite |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Set up Vitest + JSDOM
2. Write tests for critical bugs from BUG_REPORT.md
3. Add tests for game state management
4. Achieve 50% coverage

### Phase 2: Core Coverage (Week 2)
5. Test all card resolvers
6. Test dungeon grid logic
7. Add snapshot tests for card definitions
8. Achieve 80% coverage

### Phase 3: Integration (Week 3)
9. Add DOM integration tests
10. Test rendering functions
11. Test user interaction flows
12. Add test helpers/builders

### Phase 4: E2E (Optional)
13. Set up Playwright
14. Write critical path tests
15. Add visual regression tests
16. Set up CI/CD integration

---

## Bug Coverage Checklist

Tests that should be written based on BUG_REPORT.md:

- [ ] **Bug #1**: Test that card selection buttons render
- [ ] **Bug #2**: Test game over triggers at 0 health
- [ ] **Bug #3**: Test Exit and Dragon Queen functions exist
- [ ] **Bug #4**: Test fate deck doesn't duplicate on reshuffle
- [ ] **Bug #5**: Test hidden pit trap gem reduction
- [ ] **Bug #6**: Test Generous Wizard is free
- [ ] **Bug #7**: Test Young Dragon gives 3 gems on crit
- [ ] **Bug #8**: Test passage matching works correctly
- [ ] **Bug #9**: Test passages don't match resolved cards
- [ ] **Edge**: Test health can't exceed maximum
- [ ] **Edge**: Test dungeon depletion handling
- [ ] **Edge**: Test empty inventory selection

---

## Conclusion

**My Recommendation**: Start with the **Hybrid Approach (Vitest + JSDOM)**.

**Why**:
1. Single tool = lower learning curve
2. Fast enough for TDD workflow
3. Can test both units and integration
4. Catches 90% of bugs without E2E complexity
5. Easy to add Playwright later if needed
6. Works with current vanilla JS architecture

**Add Playwright later if**:
- You need cross-browser testing
- Visual regression is critical
- You're preparing for production release
- Team wants high confidence in UI

**Quick Start Command**:
```bash
npm install -D vitest jsdom @testing-library/dom @vitest/coverage-v8
npm run test
```

Start with tests for the 4 critical bugs, then expand coverage incrementally. You'll catch most issues with unit/integration tests, and can add E2E for critical paths later.
