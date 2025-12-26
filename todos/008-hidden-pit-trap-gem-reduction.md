# Todo #008: Hidden Pit Trap Gem Reduction Not Implemented

**Status**: Open
**Priority**: P1 - High (Major Bug)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #5

## Problem

Hidden pit traps try to pass a `{ gems: true }` option, but `loseHealth()` doesn't accept a third parameter.

**Location**: `card-builders.js:12`

**Impact**: Hidden pit traps don't automatically use gems to reduce damage as described in the rules.

## Current Code

```javascript
resolver: function (game) {
  game.loseHealth(this, damage, { gems: true });  // Third param ignored!
  return true;
}
```

## Expected Behavior

Hidden traps should automatically consume gems to reduce damage according to game rules.

## Fix

Modify `loseHealth()` to accept and handle a third options parameter:
```javascript
loseHealth(card, amount, options = {}) {
  if (options.gems) {
    // Automatically use gems to reduce damage
    const gemsToUse = Math.min(amount, this.gems.available.length);
    this.loseGem(card, gemsToUse);
    amount -= gemsToUse;
  }
  this._loseCard('health', amount);
  // ... rest of logic
}
```

## Testing

1. Encounter hidden pit trap with gems in inventory
2. Verify gems are automatically consumed to reduce damage
3. Verify correct amount of damage is taken after gem reduction
4. Test with no gems, partial gems, and full gem coverage
