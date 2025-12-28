# Generous Wizard Costs a Gem (Should Be Free)

The Generous Wizard (Black Joker) calls `game.loseGem(this)`, but should be free according to game rules.

**Location**: `dungeon-cards.js:162`

## Current Code

```javascript
resolver: function (game) {
  game.getUserInputInventoryCardSelection(
    "Choose an inventory item to gain: Treasure, Healing, Gem, or Exit",
    (card) => {
      game.inventory.stock = game.inventory.stock.filter((c) => {
        return c.suitKey !== card.suitKey && c.valueKey !== card.valueKey;
      });
      game.inventory.available.push(card);
      game.loseGem(this);  // BUG: Should be free!
    },
  )
  return true
}
```

## Fix

Remove the `game.loseGem(this);` line. The Generous Wizard should give a free item.

## Testing

1. Encounter Generous Wizard (Black Joker)
2. Note current gem count
3. Select an inventory item
4. Verify gem count doesn't decrease
5. Verify item is added to inventory
