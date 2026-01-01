# User Preferences System for Confirmation Modals

## Overview

Allow players to customize their confirmation experience with "Don't show this again" checkboxes. Two levels of preferences:
1. **Per-card type**: "Don't ask me to confirm [Slime] in the future"
2. **Global**: "Don't ask me to confirm any cards in the future"

Preferences should persist across sessions using `localStorage`.

## Expected Behavior

### Confirmation Modal with Checkboxes

When showing a confirmation modal, include:
```html
<div class="confirmation-preferences">
  <label>
    <input type="checkbox" id="skip-this-card" />
    Don't ask me to confirm Slime in the future
  </label>
  <label>
    <input type="checkbox" id="skip-all-cards" />
    Don't ask me to confirm any cards in the future
  </label>
</div>
```

### Preference Storage Structure

Store preferences in localStorage as JSON:
```javascript
{
  "confirmationPreferences": {
    "globalSkip": false,
    "skipCards": {
      "SPADES-TEN": true,  // Slime
      "CLUBS-QUEEN": true,  // Young Dragon
      // ... etc
    }
  }
}
```

### Preference Logic

When about to show confirmation modal:
1. Check if `globalSkip === true` → skip modal, auto-confirm
2. Check if `skipCards[cardKey] === true` → skip modal, auto-confirm
3. Otherwise → show modal with preference checkboxes

## Implementation Tasks

### 1. Create Preferences Manager

New file: `src/state/preferences.js`

```javascript
export class PreferencesManager {
  constructor() {
    this.load();
  }

  load() {
    // Load from localStorage
  }

  save() {
    // Save to localStorage
  }

  shouldSkipConfirmation(cardKey) {
    // Returns true if should skip modal
  }

  setSkipCard(cardKey, skip = true) {
    // Update per-card preference
  }

  setSkipAll(skip = true) {
    // Update global preference
  }

  reset() {
    // Clear all preferences
  }

  resetCard(cardKey) {
    // Clear preference for specific card
  }
}
```

### 2. Integrate with GameRenderer

In `game-renderer.js:addTutorialModal()`:
- Before showing modal, check `preferences.shouldSkipConfirmation(cardKey)`
- If true, skip modal and call `onAccept()` immediately
- If false, show modal with preference checkboxes

### 3. Add Preference Checkboxes to Modal HTML

Update `index.html:34-46` tutorial modal to include:
```html
<div id="tutorial-modal-preferences">
  <hr>
  <label>
    <input type="checkbox" id="skip-this-card-type" />
    <span id="skip-this-card-label">Don't ask to confirm this card</span>
  </label>
  <label>
    <input type="checkbox" id="skip-all-confirmations" />
    Don't ask me to confirm any cards
  </label>
</div>
```

### 4. Handle Preference Updates

When user clicks "Accept" button:
1. Check if "skip this card" is checked → call `preferences.setSkipCard(cardKey)`
2. Check if "skip all" is checked → call `preferences.setSkipAll()`
3. Save preferences to localStorage
4. Execute the action (call `onAccept()`)

### 5. Initialize Preferences in Game

In `src/main.js`:
```javascript
import { PreferencesManager } from './state/preferences.js';

const preferences = new PreferencesManager();
// Pass preferences to GameRenderer
```

## Card Key Format

Use consistent key format for card identification:
- Format: `"SUIT-VALUE"` (e.g., `"SPADES-TEN"`, `"CLUBS-QUEEN"`)
- Makes it easy to store and lookup
- Human-readable in localStorage

## UI/UX Considerations

### Checkbox Labels

Per-card checkbox should show the card name:
- "Don't ask me to confirm **Slime** in the future" (not "SPADES-TEN")
- Update label dynamically based on card being confirmed

### Warning for Global Skip

When checking "skip all confirmations", show a warning:
```
⚠️ You can reset this preference in Settings
```

### Visual Feedback

When a confirmation is skipped due to preferences:
- Brief toast notification: "Auto-confirmed (preferences)"
- Or: Small indicator in result modal: "Confirmation skipped"

### Accessibility

- Checkboxes must have proper labels
- Keyboard navigation works correctly
- Screen reader friendly

## Testing Checklist

- [ ] Per-card preference is saved to localStorage
- [ ] Global preference is saved to localStorage
- [ ] Preferences persist across page reloads
- [ ] Checking "skip this card" works correctly
- [ ] Checking "skip all" works correctly
- [ ] Skipped confirmations still show result modals (see #ABB)
- [ ] Settings panel can reset preferences (see #ABD)
- [ ] localStorage quota is not exceeded (unlikely with this data)
- [ ] Invalid localStorage data is handled gracefully

## Edge Cases

### Both Checkboxes Checked

If user checks both:
- Save both preferences
- Global preference takes precedence in future
- Per-card preference is redundant but harmless

### Auto-Resolve Cards with Preferences

If a card has `autoResolve: true` (see #ABA):
- Don't show preference checkboxes (can't customize what's already auto)
- Preferences don't apply to auto-resolve cards

### Empty Cell Placement

For placing new dungeon cards (clicking empty cells):
- Different preference key: `"PLACE_CARD"`
- Label: "Don't ask me to confirm placing cards"

## Related Tasks

- Requires #AAZ (confirmation modal system)
- Works with #ABA (auto-resolve cards don't use preferences)
- Works with #ABB (result modals still show even if confirmation skipped)
- Requires #ABD (settings UI to manage preferences)

## Notes

Keep localStorage data minimal and efficient. Consider adding versioning to the preferences object in case the structure needs to change in the future:

```javascript
{
  "version": 1,
  "confirmationPreferences": { ... }
}
```
