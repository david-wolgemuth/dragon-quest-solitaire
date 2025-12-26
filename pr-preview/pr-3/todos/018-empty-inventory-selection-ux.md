# Todo #018: Empty Inventory Selection UX

**Status**: Open
**Priority**: P3 - Low (Edge Case)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #19

## Problem

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

## Questions

1. Should merchant/wizard be disabled if inventory is full?
2. Should they offer items from the available pile (allowing duplicates)?
3. Should Exit always be an option for "free"?
4. Is offering only Exit intentional gameplay?

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

### Option D: Keep Current Behavior
Document that this is intentional - when inventory is full, merchant/wizard only offer Exit.

## Recommended

**Option C** - Clarify the situation to the player with an appropriate message.

## Testing

1. Acquire all 4 inventory items (Gem, Healing, Treasure, Exit)
2. Encounter Merchant or Wizard
3. Verify UX is clear about what's happening
4. Verify selecting Exit works correctly
