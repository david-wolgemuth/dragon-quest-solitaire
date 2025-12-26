# Todo #005: CRITICAL - Fate Deck Duplication

**Status**: Open
**Priority**: P0 - Critical (Game-Breaking)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #4

## Problem

When reshuffling the fate deck, cards are duplicated instead of being moved.

**Location**: `index.js:393-401` (`fateCheck`)

**Impact**: After the first reshuffle, the fate deck contains duplicate cards. This breaks the probability system and gives players unfair advantages in combat.

## Current Code

```javascript
fateCheck() {
  if (this.fate.stock.length === 0) {
    this.fate.stock = shuffle(this.fate.available);
    // MISSING: this.fate.available = [];
  }
  const card = this.fate.stock.pop();
  this.fate.available.push(card);
  return card.value.order;
}
```

## Fix

Clear the available pile after shuffling:
```javascript
this.fate.stock = shuffle(this.fate.available);
this.fate.available = [];
```

## Testing

1. Play through multiple fate checks (5+ combats)
2. Force fate deck reshuffle
3. Verify no duplicate cards in fate deck
4. Check that probabilities remain consistent
