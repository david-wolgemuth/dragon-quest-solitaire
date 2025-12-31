# Contributing to Dragon Quest Solitaire

Thank you for your interest in contributing! This guide will walk you through the process of grabbing a task and working on it.

## Quick Start

1. **Pick a task** from [todos/README.md](todos/README.md)
2. **Write tests** to verify the issue exists
3. **Fix the issue** and ensure tests pass
4. **Create a fixture** for QA testing
5. **Mark the todo as complete** in todos/README.md
6. **Submit your PR** with the fixture link

---

## Step 1: Pick a Task

Browse the [todo list](todos/README.md) and choose a task that matches your skill level and impact:

### Priority Levels

- **P0 (Critical)**: Game-breaking bugs or essential missing features
- **P1 (High)**: Major UX improvements that significantly enhance the game
- **P2 (Medium)**: Nice-to-have features and polish
- **P3 (Low)**: Cosmetic enhancements and edge cases

### T-Shirt Sizes

- **XS (Extra Small)**: Trivial fixes - great for first-time contributors
- **S (Small)**: Small features or bug fixes
- **M (Medium)**: Moderate complexity
- **L (Large)**: Significant features
- **XL (Extra Large)**: Major architectural changes

### Recommended Starting Points

**New contributors**: Start with **P1 | S** or **P2 | XS-S** tasks - high impact, manageable scope.

**Experienced contributors**: Tackle **P0** tasks - critical for completing the game.

See the [**Recommended Implementation Order**](todos/README.md#-recommended-implementation-order) in the todo list for a strategic approach.

```bash
# View the todo list
cat todos/README.md

# Read a specific task (example)
cat todos/AAH-hidden-pit-trap-gem-reduction.md
```

---

## Step 2: Write Tests First

Before fixing anything, write tests that **prove the bug exists**. This ensures:
- The issue is real and reproducible
- Your fix actually solves the problem
- We prevent regressions

### Test Structure

```javascript
// test/your-feature.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../src/core/game.js';

describe('Bug #AAJ - Young Dragon gives wrong gem amount', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  it('should give 3 gems on critical success (not 1)', () => {
    // Arrange: Set up the game state
    const initialGems = game.gems.available.length;

    // TODO: Set up Young Dragon encounter
    // TODO: Trigger critical success

    // Act: Resolve the critical success
    // game.resolveCard(...)

    // Assert: Verify 3 gems were gained
    const gemsGained = game.gems.available.length - initialGems;
    expect(gemsGained).toBe(3);
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**The test should FAIL initially** - this proves the bug exists!

---

## Step 3: Fix the Issue

Now that you've confirmed the bug with a failing test, implement the fix.

### Example Fix

For task #AAJ (Young Dragon wrong gem amount):

```javascript
// src/cards/dungeon-cards.js
[QUEEN]: buildEnemyCard({
  name: "Young Dragon",
  minFateToDefeat: 10,
  damageTakenIfUnsuccessful: 1,
  resolveCriticalSuccess: function (game) {
    game.gainGem(this, 3);  // Changed from 1 to 3
  },
  resolveCriticalSuccessDescription: "You will gain 3 gems",
}),
```

### Verify Tests Pass

```bash
npm test
```

**All tests should now PASS** - your fix works!

---

## Step 4: Create a QA Fixture

Create a fixture URL that demonstrates your fix in action. This allows reviewers to test your changes in the browser.

### What is a Fixture?

A fixture is a saved game state encoded in the URL. It lets anyone load a specific scenario instantly without playing through the game.

### Create Your Fixture

1. **Set up the scenario** in your local game
2. **Save the fixture** with a descriptive name

```bash
# Run the game locally
npm start

# In your browser, set up the scenario (e.g., encounter Young Dragon)
# Then run this to save the fixture:
node save-fixture.js "young-dragon-critical-success"
```

This creates a file in `test/fixtures/` and outputs a URL.

### Alternative: Manual Fixture Creation

If you're working with tests, you can create a fixture programmatically:

```javascript
// In your test file
import { saveFixture } from '../lib/fixture-utils.js';

it('should handle Young Dragon critical success', () => {
  // Set up game state
  const game = new Game();
  // ... configure the scenario

  // Save the fixture
  saveFixture(game, 'young-dragon-critical-success');

  // Continue with test...
});
```

### Generate the Fixture URL

```bash
# Generate a single fixture URL
node generate-fixture-url.js young-dragon-critical-success

# Or generate all fixture URLs at once
node generate-all-fixture-urls.js
```

**Copy the URL** - you'll include this in your PR!

---

## Step 5: Mark the Todo as Complete

Update the todo list to mark your task as complete. This keeps the project organized and helps others see what's been done.

### Update todos/README.md

Find your task in the list and move it from the **On Deck** or **Backlog** section to the **Completed** section:

```markdown
## Completed

- [x] [#AAJ](AAJ-young-dragon-wrong-gem-amount.md) | Young Dragon gives 3 gems on critical - Fixed in PR #XX
- [x] [#AAA](AAA-file-organization.md) | Reorganize files into src/ and docs/ - Completed in #5
```

**Important**:
- Change `[ ]` to `[x]` to mark it as done
- Add a note about which PR fixed it (you can add the PR number after it's created)
- Move the entire line to the Completed section at the bottom

### Example Change

**Before:**
```markdown
## On Deck

- [ ] P1 | XS | [#AAJ](AAJ-young-dragon-wrong-gem-amount.md) | Young Dragon gives 1 gem instead of 3
```

**After:**
```markdown
## Completed

- [x] [#AAJ](AAJ-young-dragon-wrong-gem-amount.md) | Young Dragon gives 3 gems on critical - Fixed in PR #10
```

This change should be **included in your PR** so reviewers can see you've properly tracked your work.

---

## Step 6: Submit Your Pull Request

### Commit Your Changes

```bash
# Add your changes (including the todos/README.md update)
git add .

# Commit with a clear message
git commit -m "Fix #AAJ: Young Dragon now gives 3 gems on critical success

- Updated resolveCriticalSuccess to call game.gainGem(this, 3)
- Added test to verify 3 gems are gained
- Test fixture: young-dragon-critical-success
- Marked #AAJ as complete in todos/README.md"

# Push to your branch
git push origin your-branch-name
```

### PR Description Template

Use this template for your pull request description:

```markdown
## Summary

Fixes #AAJ - Young Dragon gives 3 gems on critical success (was only giving 1)

## Changes

- Updated `dungeon-cards.js` to call `game.gainGem(this, 3)` instead of `game.gainGem(this)`
- Added test case to verify critical success gives 3 gems
- Test initially failed (confirmed bug), now passes (confirmed fix)
- Marked #AAJ as complete in `todos/README.md`

## Testing

### Automated Tests
- [x] All existing tests pass
- [x] New test added: `test/young-dragon.test.js`
- [x] Test coverage maintained/improved

### Manual QA
Test this fix with the following fixture:

**[🎮 Test Young Dragon Critical Success](https://yourusername.github.io/dragon-quest-solitaire/?fixture=young-dragon-critical-success)**

#### How to test:
1. Click the fixture link above
2. The game loads with Young Dragon ready to encounter
3. Click the Young Dragon card
4. Critical success triggers automatically
5. **Verify**: Gem count increases by **3** (not 1)

## Checklist

- [x] Tests written and passing
- [x] Fixture URL created for QA
- [x] Todo marked as complete in `todos/README.md`
- [x] Code follows project style
- [x] No unrelated changes included
```

---

## Best Practices

### ✅ DO

- **Start small**: Pick XS or S tasks if you're new
- **Write tests first**: Prove the bug, then fix it
- **Keep changes focused**: One issue per PR
- **Test thoroughly**: Run the full test suite
- **Create fixtures**: Make it easy for reviewers to verify
- **Mark todos complete**: Update todos/README.md to track progress
- **Update docs**: If you change behavior, update relevant docs
- **Follow existing patterns**: Look at how similar code is written

### ❌ DON'T

- **Skip tests**: Every fix needs tests
- **Mix concerns**: Don't fix multiple unrelated issues in one PR
- **Break existing tests**: All tests must pass
- **Add unnecessary changes**: Don't refactor unrelated code
- **Forget the fixture**: Reviewers need a way to QA your work

---

## Project Structure Quick Reference

```
dragon-quest-solitaire/
├── src/
│   ├── main.js              # Entry point
│   ├── cards/               # Card definitions and logic
│   │   ├── dungeon-cards.js # Card behaviors
│   │   └── card-builders.js # Enemy/trap/passage factories
│   ├── core/                # Game engine
│   │   ├── game.js          # Game state
│   │   └── game-renderer.js # UI rendering
│   └── utils/               # Helper functions
├── test/
│   ├── fixtures/            # Saved game states
│   └── *.test.js            # Test files (Vitest)
├── todos/                   # Task tracking
│   ├── README.md            # Todo list
│   └── AAJ-*.md             # Individual task files
└── lib/
    └── fixture-utils.js     # Fixture helpers
```

---

## Running the Game

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:8008)
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

---

## Need Help?

- **Questions about a task?** Read the detailed task file in `todos/`
- **Not sure how to test?** Look at existing tests in `test/`
- **Stuck on a bug?** Check [CLAUDE.md](CLAUDE.md) for codebase overview
- **Want to discuss an approach?** Open a discussion issue first
- **Priority questions?** See [Priority Rationale](todos/README.md#-priority-rationale) in the todo list

---

## Example Workflow

Here's a complete example for fixing task #AAJ:

```bash
# 1. Read the task
cat todos/AAJ-young-dragon-wrong-gem-amount.md

# 2. Create a branch
git checkout -b fix/young-dragon-gems

# 3. Write a failing test
cat > test/young-dragon.test.js << 'EOF'
import { describe, it, expect } from 'vitest';
import { Game } from '../src/core/game.js';

describe('Young Dragon Critical Success', () => {
  it('gives 3 gems on critical success', () => {
    const game = new Game();
    // ... test implementation
    expect(gemsGained).toBe(3);
  });
});
EOF

# 4. Run test (should FAIL)
npm test

# 5. Fix the code
# Edit src/cards/dungeon-cards.js
# Change: game.gainGem(this)
# To: game.gainGem(this, 3)

# 6. Run test (should PASS)
npm test

# 7. Create fixture for QA
npm start  # Set up scenario in browser
node save-fixture.js "young-dragon-critical-success"

# 8. Generate fixture URL
node generate-fixture-url.js young-dragon-critical-success

# 9. Mark todo as complete
# Edit todos/README.md:
# - Move task from "On Deck" to "Completed" section
# - Change [ ] to [x]
# - Add "Fixed in PR #XX" note

# 10. Commit and push
git add .
git commit -m "Fix #AAJ: Young Dragon gives 3 gems on critical success"
git push origin fix/young-dragon-gems

# 11. Create PR with fixture link
# Use the PR template above
```

---

Happy coding! 🎮✨
