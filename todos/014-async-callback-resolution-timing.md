# Todo #014: Async Callback Issues - Card Resolved Before Selection

**Status**: Open
**Priority**: P2 - Medium (Design Issue)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #13

## Problem

Merchant and Wizard return `true` immediately, marking the card as resolved before the user selects an item.

**Location**: `dungeon-cards.js:110, 166`

**Impact**:
- Card is marked resolved before selection completes
- User can cancel/close modal and card stays resolved without gaining item
- No error handling if user doesn't complete selection

## Current Code

```javascript
game.getUserInputInventoryCardSelection(
  "Purchase an inventory item...",
  (card) => {
    // This callback executes AFTER the card is resolved
    game.inventory.stock = game.inventory.stock.filter(...);
    game.inventory.available.push(card);
    game.loseGem(this);
  },
)
// Card is marked resolved immediately:
return true
```

## Proposed Solutions

### Option A: Promise-based Resolution
Change resolver to be async and wait for user input:
```javascript
resolver: async function (game) {
  await game.getUserInputInventoryCardSelection(...);
  return true;
}
```

### Option B: Callback-based Resolution
Pass resolution callback to user input function:
```javascript
resolver: function (game) {
  game.getUserInputInventoryCardSelection(
    message,
    (card) => {
      // Handle selection
      this.markAsResolved();
    }
  );
  return false; // Don't mark as resolved yet
}
```

### Option C: State-based Resolution
Track selection state and only mark resolved after confirmation.

## TODO Comments

Code already has TODO comments acknowledging this issue.

## Testing

1. Click Merchant/Wizard
2. Modal should open
3. Close modal without selecting
4. Verify card is NOT marked as resolved
5. Click again and complete selection
6. Verify card IS marked as resolved
