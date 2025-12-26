# Todo #017: Render Fate Deck During Combat

**Status**: Open
**Priority**: P2 - Medium (UX Issue)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #18

## Problem

Combat resolution doesn't update the fate deck display until after the modal is dismissed.

**Location**: `card-builders.js:63-70` (enemy resolver)

**Impact**: Player doesn't see which fate card was drawn during combat. Reduces game clarity and excitement.

## Current Behavior

```javascript
resolver: function (game) {
  const value = game.fateCheck();  // Fate deck changes here
  if (value < minFateToDefeat) {
    game.loseHealth(this, damageTakenIfUnsuccessful);
  } else if (value === 10) {
    this.resolveCriticalSuccess(game);
  }
  return true;
  // Render only happens after this returns
}
```

The fate card is drawn, but the UI doesn't update until the combat modal is closed.

## Expected Behavior

1. Player clicks enemy
2. Fate card is drawn and **immediately visible**
3. Modal shows: "You drew a X! [Success/Failure message]"
4. Player can see the fate card in the fate deck area
5. Combat result is applied

## Proposed Solution

### Option A: Async Rendering
```javascript
resolver: async function (game) {
  const value = game.fateCheck();
  await game.render(); // Force render update
  // Show modal with result
  if (value < minFateToDefeat) {
    game.loseHealth(this, damageTakenIfUnsuccessful);
  }
  return true;
}
```

### Option B: Include Fate Card in Modal
- Show the drawn fate card as an image in the combat result modal
- "You drew: [card image] - Value X"
- More visual feedback

### Option C: Two-Step Modal
1. First modal: "Drawing fate card..." → shows card
2. Second modal: Combat result based on card value

## Recommended

**Option B** - Shows fate card in modal for immediate feedback, plus fate deck updates in background.

## Testing

1. Engage in combat
2. Verify fate card is visible when result modal appears
3. Verify player can clearly see which card was drawn
4. Test with all combat outcomes (success, failure, critical)
