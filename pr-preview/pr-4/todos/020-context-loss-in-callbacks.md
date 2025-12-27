# Context Loss in Callbacks

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

**Current Severity**: Low - The game appears to work despite this because `loseGem()` may not use the card parameter for critical logic.

## Fix

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

Or check what `loseGem()` actually uses from the card parameter and whether card definition vs instance matters.
