# Empty Inventory Selection UX

If inventory stock is empty, the selection modal only shows Exit card.

**Location**: `index.js:362-370`

## Current Code

```javascript
getUserInputInventoryCardSelection(message, callback) {
  const renderer = new GameRenderer(this);
  renderer.renderUserInputCardSelection(
    message,
    this.inventory.stock.concat([new Card(SPADES, ACE)]),
    callback,
  );
}
```

## Current Behavior

- Merchant/Wizard offer selection from `inventory.stock` (unavailable items)
- If all items are in player's inventory, stock is empty
- Modal only shows Exit card
- Seems odd from gameplay perspective

## Possible Solutions

### Option A: Disable When Inventory Full
Check before showing selection:
```javascript
if (this.inventory.stock.length === 0) {
  game.showMessage("No items available to purchase!");
  return false; // Don't resolve card
}
```

### Option B: Offer Duplicates
Allow selecting from available pile (already owned items):
```javascript
this.inventory.stock.concat(this.inventory.available).concat([new Card(SPADES, ACE)])
```

### Option C: Special Message
Show different message when only Exit available:
```javascript
if (this.inventory.stock.length === 0) {
  message = "Your inventory is full! You can only take the Exit.";
}
```

**Recommended**: Option C - Clarify the situation to the player.
