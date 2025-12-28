# Async Callback Issues - Card Resolved Before Selection

Merchant and Wizard return `true` immediately, marking the card as resolved before the user selects an item.

**Location**: `dungeon-cards.js:110, 166`

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

**Problems**:
- Card is marked resolved before selection completes
- User can cancel/close modal and card stays resolved without gaining item
- No error handling if user doesn't complete selection

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

**Note**: Code already has TODO comments acknowledging this issue.
