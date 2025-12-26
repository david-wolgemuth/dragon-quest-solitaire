# Todo #010: Young Dragon Critical Success Gives Wrong Amount

**Status**: Open
**Priority**: P1 - High (Major Bug)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #7

## Problem

Description says "gain 3 gems" but implementation only gives 1.

**Location**: `dungeon-cards.js:129-132`

**Impact**: Players only receive 1 gem instead of 3 on critical success against Young Dragon.

## Current Code

```javascript
[QUEEN]: buildEnemyCard({
  name: "Young Dragon",
  minFateToDefeat: 10,
  damageTakenIfUnsuccessful: 1,
  resolveCriticalSuccess: function (game) {
    game.gainGem(this);  // Only gives 1!
  },
  resolveCriticalSuccessDescription: "You will gain 3 gems",  // Says 3!
}),
```

## Fix Options

1. **Option A**: Change implementation to match description:
   ```javascript
   game.gainGem(this, 3);
   ```

2. **Option B**: Update description to match implementation:
   ```javascript
   resolveCriticalSuccessDescription: "You will gain 1 gem",
   ```

**Recommended**: Option A - 3 gems makes more sense for a critical success against a dragon.

## Testing

1. Encounter Young Dragon (Queen of Diamonds)
2. Get a critical success (fate value 10)
3. Verify 3 gems are added to inventory
4. Check gem count increases by 3
