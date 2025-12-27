# Maximum Health Check

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

**Leave as-is with documentation comment**. Current implementation is correct and elegant. Add comment explaining the implicit max health via the stock/available pattern.
