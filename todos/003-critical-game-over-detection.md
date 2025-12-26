# Todo #003: CRITICAL - No Game Over Detection

**Status**: Open
**Priority**: P0 - Critical (Game-Breaking)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #2

## Problem

When the player loses all health, the game silently continues without ending.

**Location**: `index.js:418-426` (`_loseCard`)

**Impact**: Player can continue playing with 0 health. Game-over condition is never triggered.

## Current Code

```javascript
_loseCard(key, amount) {
  for (let i = 0; i < amount; i += 1) {
    if (this[key].available.length === 0) {
      return;  // Just returns, no game-over check
    }
    const card = this[key].available.pop();
    this[key].stock.push(card);
  }
}
```

## Fix

Add check after losing health:
```javascript
if (key === 'health' && this[key].available.length === 0) {
  this.gameOver();
}
```

## Testing

1. Play until health reaches 0
2. Verify game over screen appears
3. Verify game cannot continue after game over
4. Verify reset button works
