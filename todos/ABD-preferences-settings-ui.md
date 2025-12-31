# Settings UI for Preference Management

## Overview

Create a settings panel where players can view and reset their confirmation preferences. This gives players control over the "Don't show again" choices they've made.

## Current State

- Settings link exists in nav: `index.html:29` (`<li><a href="#settings">Settings</a></li>`)
- No settings modal/panel implemented yet
- Preferences will be stored in localStorage (see #ABC)

## Expected Behavior

When user clicks "Settings" in nav:
1. Show settings modal/panel
2. Display current preference states
3. Allow user to reset preferences (individually or all at once)
4. Close settings modal when done

## Implementation Tasks

### 1. Create Settings Modal HTML

Add to `index.html` (after other modals):
```html
<aside id="settings-modal">
  <div id="settings-modal-content">
    <h2>Settings</h2>

    <section class="settings-section">
      <h3>Confirmation Preferences</h3>
      <p>Manage which confirmation dialogs are shown:</p>

      <div id="preference-list">
        <!-- Dynamically populated with current preferences -->
      </div>

      <button id="reset-all-preferences">Reset All Preferences</button>
    </section>

    <button id="settings-close">Close</button>
  </div>
</aside>
```

### 2. Wire Up Settings Link

In `src/main.js` or appropriate location:
```javascript
document.querySelector('a[href="#settings"]').addEventListener('click', (e) => {
  e.preventDefault();
  showSettingsModal();
});
```

### 3. Display Current Preferences

Function to render preference list:
```javascript
function renderPreferenceList(preferences) {
  const list = document.getElementById('preference-list');

  if (preferences.globalSkip) {
    list.innerHTML = `
      <div class="preference-item global">
        <span>🌐 All confirmations are disabled</span>
        <button onclick="resetGlobalPreference()">Re-enable</button>
      </div>
    `;
    return;
  }

  const skipCards = preferences.skipCards || {};
  if (Object.keys(skipCards).length === 0) {
    list.innerHTML = '<p class="no-preferences">No preferences set</p>';
    return;
  }

  list.innerHTML = Object.entries(skipCards)
    .filter(([_, skip]) => skip)
    .map(([cardKey, _]) => {
      const cardName = getCardName(cardKey); // Helper to get display name
      return `
        <div class="preference-item">
          <span>${cardName}</span>
          <button onclick="resetCardPreference('${cardKey}')">
            Re-enable confirmation
          </button>
        </div>
      `;
    })
    .join('');
}
```

### 4. Reset Functions

Add functions to reset preferences:
```javascript
function resetGlobalPreference() {
  preferences.setSkipAll(false);
  renderPreferenceList(preferences);
}

function resetCardPreference(cardKey) {
  preferences.resetCard(cardKey);
  renderPreferenceList(preferences);
}

function resetAllPreferences() {
  if (confirm('Reset all confirmation preferences?')) {
    preferences.reset();
    renderPreferenceList(preferences);
  }
}
```

### 5. Style Settings Modal

In `src/styles.css`:
```css
#settings-modal {
  /* Similar to other modals */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: none;
  align-items: center;
  justify-content: center;
}

#settings-modal.visible {
  display: flex;
}

#settings-modal-content {
  background: white;
  padding: 2em;
  border-radius: 8px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  border-bottom: 1px solid #eee;
}

.preference-item.global {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 1em;
  margin-bottom: 1em;
}

.no-preferences {
  color: #666;
  font-style: italic;
}
```

## UI Layout

```
┌─────────────────────────────────────┐
│  Settings                      [×]  │
├─────────────────────────────────────┤
│                                     │
│  Confirmation Preferences           │
│  Manage which dialogs are shown:    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌐 All confirmations disabled │ │
│  │               [Re-enable]     │ │
│  └───────────────────────────────┘ │
│     OR (if not global skip)        │
│  ┌───────────────────────────────┐ │
│  │ Slime      [Re-enable]        │ │
│  │ Skeleton   [Re-enable]        │ │
│  │ Gem        [Re-enable]        │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Reset All Preferences]            │
│                                     │
│                    [Close]          │
└─────────────────────────────────────┘
```

## Features

### Preference Categories

Group preferences by type:
- **Global** - "All confirmations" (highlighted differently)
- **Card-specific** - List of individual card preferences

### Search/Filter (Future Enhancement)

If many preferences are set:
- Add search box to filter card list
- Category filters (enemies, resources, etc.)

### Confirmation for Reset All

When clicking "Reset All Preferences":
- Show confirmation dialog: "Are you sure? This will re-enable all confirmation dialogs."
- Prevent accidental resets

### Visual Feedback

After resetting a preference:
- Brief success message: "Preference reset"
- Update the list immediately
- Or: Highlight the removed item briefly before removing

## Testing Checklist

- [ ] Settings link in nav opens settings modal
- [ ] Settings modal displays current preferences correctly
- [ ] Global preference shows when enabled
- [ ] Individual card preferences show when set
- [ ] "No preferences set" message shows when appropriate
- [ ] Re-enable button for global preference works
- [ ] Re-enable button for card preferences works
- [ ] "Reset All" button works with confirmation
- [ ] Settings modal closes properly
- [ ] Clicking outside settings modal closes it
- [ ] Settings modal is responsive on mobile

## Accessibility

- Modal has proper ARIA labels
- Close button is keyboard accessible
- Focus is trapped within modal when open
- ESC key closes modal
- Screen reader announces preference changes

## Related Tasks

- Requires #ABC (preferences system)
- Enhances #AAZ (confirmation modal system)
- Independent from #ABA and #ABB

## Future Enhancements

Consider adding other settings:
- **Animations**: Toggle card flip animations
- **Auto-save**: Auto-save game state periodically
- **Sound**: Toggle sound effects (if added)
- **Theme**: Dark mode / color scheme
- **Accessibility**: Reduce motion, high contrast

For now, focus only on confirmation preferences. Other settings can be added later in separate tasks.
