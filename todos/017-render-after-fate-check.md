# Render Fate Deck During Combat

Combat resolution doesn't update the fate deck display until after the modal is dismissed.

**Location**: `card-builders.js:63-70` (enemy resolver)

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

The fate card is drawn, but the UI doesn't update until the combat modal is closed. Player doesn't see which fate card was drawn during combat, reducing game clarity and excitement.

## Expected Behavior

1. Player clicks enemy
2. Fate card is drawn and **immediately visible**
3. Modal shows: "You drew a X! [Success/Failure message]"
4. Player can see the fate card in the fate deck area
5. Combat result is applied

## Proposed Solutions

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

**Recommended**: Option B - Shows fate card in modal for immediate feedback, plus fate deck updates in background.
