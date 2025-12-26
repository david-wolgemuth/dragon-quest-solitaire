# Todo #020: Context Loss in Callbacks

**Status**: Open
**Priority**: P3 - Low (Design Issue)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #14

## Problem

Inside callbacks for Merchant and Wizard, `this` refers to the card definition object, not the dungeon card instance.

**Location**: `dungeon-cards.js:107, 162`

## Current Code

```javascript
(card) => {
  // ...
  game.loseGem(this);  // 'this' is the card definition, not the card instance
}
```

## Impact

May cause issues with:
- Display updates (card image might be wrong reference)
- Logging (card identity might be incorrect)
- Future features that depend on card instance

## Current Severity

**Low** - The game appears to work despite this issue because:
- `loseGem()` may not use the card parameter for critical logic
- Card definition has enough info for current needs

## Proper Fix

Capture the correct context:

```javascript
resolver: function (game) {
  const cardInstance = this; // Capture correct context
  game.getUserInputInventoryCardSelection(
    "...",
    (card) => {
      // ...
      game.loseGem(cardInstance); // Use captured reference
    },
  )
  return true
}
```

Or check what `loseGem()` actually uses from the card parameter.

## Investigation Needed

- [ ] Check what `loseGem(card)` does with the card parameter
- [ ] Check if card definition vs instance matters
- [ ] Verify current behavior is correct despite wrong context
- [ ] Document expected vs actual behavior

## Testing

1. Use Merchant/Wizard
2. Check console logs for card references
3. Verify correct card is updated in display
4. Ensure no side effects from wrong context
