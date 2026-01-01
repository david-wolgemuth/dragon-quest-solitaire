# Post-Resolution Feedback Modals

## Overview

After a card is resolved, show the player what happened. This is especially important for:
- **Fate checks** (combat) - "You drew a 7! Success!" vs "You drew a 6! Failed - take 1 damage"
- **Hidden effects** - What item was gained from treasure chest
- **Damage taken** - How much damage from a trap

## Current State

Currently, when you resolve a card:
- The action happens immediately
- No feedback is shown about what occurred
- For fate checks, you never see what value was drawn
- User doesn't get confirmation that action completed

## Expected Behavior

### Two-Modal Flow (for confirmed actions)

1. **Before resolution** (confirmation modal):
   - "Skeleton - Defeat this enemy? You need 8+ to succeed."
   - [Accept] [Dismiss]

2. **After resolution** (result modal):
   - "You drew an 8 from the Fate deck! Success - no damage taken."
   - [OK]

### One-Modal Flow (for auto-resolved actions)

1. **After resolution** (result modal only):
   - "Hidden Pit Trap! You took 2 damage."
   - [OK]

## Implementation Tasks

### 1. Create Result Modal Function

Add new method to `GameRenderer`:
```javascript
renderResultModal(messageHtml, options = {}) {
  // Similar to renderMessage() but with "result" styling
  // Can include card visuals, stats changes, etc.
}
```

### 2. Update Card Resolvers to Return Result Data

Modify resolvers to return information about what happened:
```javascript
resolver: function(game) {
  const fateValue = game.fateCheck();
  const success = fateValue >= 8;

  // Return result data instead of just `true`
  return {
    resolved: true,
    result: {
      fateValue: fateValue,
      success: success,
      message: success
        ? `You drew a ${fateValue}! Success!`
        : `You drew a ${fateValue}. Failed - take 1 damage.`
    }
  };
}
```

### 3. Show Result Modal After Resolution

In `game-renderer.js:renderDungeon()`:
- After calling `game.resolveCard()`, check for result data
- If result data exists, show result modal
- User clicks [OK] to dismiss

### 4. Handle Fate Checks Specially

For enemy cards (using `buildEnemyCard()`):
- Show fate card visually in result modal
- Display fate value prominently
- Show success/failure clearly
- Show damage taken (if any)
- Show bonus reward (if critical success)

Example result modal:
```html
<div>
  <h3>Combat Result</h3>
  <div class="fate-card card-H8"></div>
  <p><strong>Fate Value: 8</strong></p>
  <p class="success">Success! No damage taken.</p>
</div>
```

### 5. Handle Treasure Chest Results

When gaining inventory item:
- Show which item was drawn from the deck
- Display item card visually
- Explain what it does

### 6. Handle Damage Results

When taking damage:
- Show damage amount
- Show health before and after
- Visual indication (red border, shake animation?)

## UI/UX Considerations

### Modal Styling
- Confirmation modal: Neutral, informational
- Success result: Green border, checkmark
- Failure result: Red border, X icon
- Damage result: Red, attention-grabbing

### Content Structure
```html
<div class="result-modal">
  <div class="result-icon">✓ or ✗</div>
  <h3>Result Title</h3>
  <div class="result-details">
    <!-- Card visuals, stats, etc. -->
  </div>
  <p class="result-message">Descriptive message</p>
  <button>OK</button>
</div>
```

### Timing
- Show result modal immediately after action completes
- Don't auto-close - wait for user to click [OK]
- This gives player time to read and understand what happened

## Testing Checklist

- [ ] Enemy combat shows fate value drawn
- [ ] Success/failure is clearly communicated
- [ ] Damage taken is displayed
- [ ] Critical success shows bonus reward
- [ ] Treasure chest shows item gained
- [ ] Pit trap shows damage taken
- [ ] Healing shows health restored
- [ ] Gem collection shows gem gained
- [ ] Result modals have appropriate styling (success=green, failure=red)
- [ ] [OK] button dismisses result modal
- [ ] Game state updates are visible after dismissing result modal

## Related Tasks

- Requires #AAZ (confirmation modal system)
- Works with #ABA (auto-resolve cards still show results)
- Enhanced by #ABC (preferences can skip result modals)

## Notes

The key insight is: **always show results, even if confirmation was skipped**. This keeps the player informed about what's happening in the game.

Consider adding a "results history" log for advanced players who want to review past actions.
