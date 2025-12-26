# Todo #021: Maximum Health Check

**Status**: Open
**Priority**: P3 - Low (Design Review)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #15

## Problem

While healing description says "up to your max health", there's no explicit enforcement in the code.

**Location**: `index.js:403-416` (`_gainCard`)

## Current Code

```javascript
_gainCard(key, amount) {
  if (!amount) { amount = 1; }
  for (let i = 0; i < amount; i += 1) {
    if (this[key].stock.length === 0) {
      return;  // Stops when stock is empty
    }
    const card = this[key].stock.pop();
    this[key].available.push(card);
  }
}
```

## Current Behavior

**Already Works Correctly** because:
- All 5 health cards start in the `available` pile (current health)
- Lost health moves from `available` to `stock`
- Healing moves from `stock` back to `available`
- When `stock.length === 0`, can't heal anymore
- Maximum health is naturally enforced by the stock/available pattern

## Why This Is Listed

The logic **relies on initial setup** rather than explicit max health constraint. This could break if:
- Initial health setup changes
- Health cards are added/removed dynamically
- Future features modify health system

## Recommendation

### Option A: Leave As-Is
- Current implementation works correctly
- Stock/available pattern is elegant
- Add comment explaining the implicit max health

### Option B: Add Explicit Check
```javascript
_gainCard(key, amount) {
  if (!amount) { amount = 1; }
  const maxCards = this[key].available.length + this[key].stock.length;
  const currentCards = this[key].available.length;

  for (let i = 0; i < amount; i += 1) {
    if (this[key].stock.length === 0 || currentCards >= maxCards) {
      return;
    }
    const card = this[key].stock.pop();
    this[key].available.push(card);
  }
}
```

### Option C: Add Constant
```javascript
const MAX_HEALTH = 5;

// Check against constant instead of relying on stock length
if (this.health.available.length >= MAX_HEALTH) {
  return; // Already at max health
}
```

## Recommended

**Option A** with documentation comment. Current implementation is correct and elegant.

## Testing

1. Take damage to reduce health
2. Heal back to full
3. Try to heal beyond max
4. Verify healing stops at 5 hearts
5. Verify stock/available counts are correct
