# Refactor Fixture Code Duplication

**Priority**: P2 (medium - maintainability)
**Size**: S (small - ~1 hour)
**Related**: #022 (URL state storage - completed)

## Problem

Three scripts (`generate-all-fixture-urls.js`, `generate-pr-comment.js`, `generate-fixture-url.js`) contain **identical fixture reconstruction logic** (55 lines each):

```javascript
// Duplicated in 3 files:
const matrixRows = state.matrixRows || Math.max(...state.dungeonMatrix.map(c => c.row), 0) + 1;
const matrixCols = state.matrixCols || Math.max(...state.dungeonMatrix.map(c => c.col), 0) + 1;

const mockGame = {
  health: state.health,
  inventory: state.inventory,
  gems: state.gems,
  fate: state.fate,
  dungeon: {
    stock: state.dungeonStock,
    matrix: Array(matrixRows).fill(null).map(() =>
      Array(matrixCols).fill(null).map(() => ({ card: null, cardFaceDown: false }))
    )
  }
};

for (const cellData of state.dungeonMatrix) {
  mockGame.dungeon.matrix[cellData.row][cellData.col] = {
    card: cellData.card,
    cardFaceDown: cellData.cardFaceDown
  };
}

const stateString = serializeGameState(mockGame);
```

## Impact

- **Maintainability**: Bug fixes or fixture format changes require updating 3 files
- **Inconsistency risk**: Already has minor differences (e.g., `faceDown` vs `cardFaceDown`)
- **Testing**: Same logic tested 3 times instead of once

## Solution

Extract shared logic into a module:

```javascript
// lib/fixture-utils.js
export function loadFixtureFile(fixturePath) {
  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  return fixtureData;
}

export function reconstructGameState(state) {
  const matrixRows = state.matrixRows ||
    Math.max(...state.dungeonMatrix.map(c => c.row), 0) + 1;
  const matrixCols = state.matrixCols ||
    Math.max(...state.dungeonMatrix.map(c => c.col), 0) + 1;

  const mockGame = {
    health: state.health,
    inventory: state.inventory,
    gems: state.gems,
    fate: state.fate,
    dungeon: {
      stock: state.dungeonStock,
      matrix: Array(matrixRows).fill(null).map(() =>
        Array(matrixCols).fill(null).map(() => ({ card: null, cardFaceDown: false }))
      )
    }
  };

  for (const cellData of state.dungeonMatrix) {
    mockGame.dungeon.matrix[cellData.row][cellData.col] = {
      card: cellData.card,
      cardFaceDown: cellData.cardFaceDown
    };
  }

  return mockGame;
}

export function fixtureToURL(fixtureData, prNumber) {
  const mockGame = reconstructGameState(fixtureData.state);
  const stateString = serializeGameState(mockGame);
  const baseUrl = `https://david-wolgemuth.github.io/dragon-quest-solitaire/pr-preview/pr-${prNumber}`;
  return `${baseUrl}/?${stateString}`;
}
```

Then update all 3 scripts:

```javascript
// generate-pr-comment.js
import { loadFixtureFile, fixtureToURL } from './lib/fixture-utils.js';

for (const file of fixtureFiles) {
  const fixtureData = loadFixtureFile(path.join(fixturesDir, file));
  const url = fixtureToURL(fixtureData, prNumber);
  // ...
}
```

## Files to Update

- Create: `lib/fixture-utils.js`
- Update: `generate-all-fixture-urls.js` (remove 55 lines, import utils)
- Update: `generate-pr-comment.js` (remove 55 lines, import utils)
- Update: `generate-fixture-url.js` (remove 55 lines, import utils)
- Add tests: `test/lib/fixture-utils.test.js`

## Benefits

- ✅ Single source of truth for fixture reconstruction
- ✅ Easier to add validation/error handling
- ✅ Easier to modify fixture format in future
- ✅ Better testability (test utils module once)

## Acceptance Criteria

- [ ] All 3 scripts use shared `lib/fixture-utils.js`
- [ ] All existing PR preview URLs still work
- [ ] Tests added for fixture reconstruction logic
- [ ] No duplicate code between the 3 scripts
