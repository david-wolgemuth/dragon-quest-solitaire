# Initial Game State Tutorial

## Overview

New players start the game with one face-down card and no explanation of what to do. They need immediate guidance on:
- What the goal is
- What actions are available
- What each UI element means
- How to take their first turn

## Current State

Game loads with:
- One face-down dungeon card in center
- Status table showing resource piles
- No instructions or tutorial
- No indication of what's clickable

New players are left confused about what to do first.

## Expected Behavior

### First-Time Player Experience

When game loads for the first time (or after reset):

1. **Welcome Modal** appears automatically:
```html
<div class="welcome-modal">
  <h2>Welcome to Dragon Quest Solitaire!</h2>
  <p>Your goal: Defeat the Dragon Queen and exit the dungeon.</p>

  <h3>Getting Started</h3>
  <ol>
    <li>Click the <strong>face-down card</strong> to reveal it</li>
    <li>Click <strong>empty cells</strong> (adjacent to face-down cards) to place new cards</li>
    <li>Click <strong>face-up cards</strong> to resolve their effects</li>
  </ol>

  <p>Click <strong>Rules</strong> anytime for the full card reference.</p>

  <div class="actions">
    <button>Start Playing</button>
    <label>
      <input type="checkbox" id="dont-show-welcome" />
      Don't show this again
    </label>
  </div>
</div>
```

2. **First Card Highlight** (optional):
   - After closing welcome modal
   - Face-down card pulses/glows
   - Tooltip: "Click here to reveal your first card"

3. **Contextual Help** during first turns:
   - After first card revealed: "Now place a new card adjacent to face-down cards"
   - After first enemy: "Combat uses your Fate deck - draw a card to determine success"

### Persistent Help Access

- **Rules button**: Already exists, opens full rules modal
- **Help icon**: Small "?" icon in corner for quick tips
- **Card tooltips**: Hover to see what a card does (covered in ABE)

## Implementation Tasks

### 1. Welcome Modal HTML/CSS

Add to `index.html`:
```html
<aside id="welcome-modal" class="welcome-modal">
  <div class="welcome-modal-content">
    <!-- Content as shown above -->
  </div>
</aside>
```

### 2. Show Welcome on First Load

In `main.js`:
```javascript
// Check localStorage for 'hasSeenWelcome'
if (!localStorage.getItem('hasSeenWelcome')) {
  showWelcomeModal();
}

function showWelcomeModal() {
  const modal = document.getElementById('welcome-modal');
  modal.classList.add('visible');

  document.getElementById('welcome-start').onclick = () => {
    if (document.getElementById('dont-show-welcome').checked) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    modal.classList.remove('visible');
  };
}
```

### 3. Optional: First Card Highlight

Add CSS class to highlight clickable elements:
```css
.first-turn-hint {
  animation: pulse 2s infinite;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}
```

Apply to first face-down card after welcome dismissed.

### 4. Contextual Tips (Future Enhancement)

Track game progress:
- `hasResolvedFirstCard`
- `hasPlacedFirstCard`
- `hasEncounteredFirstEnemy`

Show contextual tips after each milestone.

## UI/UX Considerations

- **Non-intrusive**: Welcome modal blocks game until dismissed, but user controls it
- **Persistent**: "Don't show again" checkbox respects user preference
- **Accessible**: Rules button always available for returning players
- **Progressive disclosure**: Don't overwhelm with all rules at once
- **Visual cues**: Highlight interactive elements on first play

## Content Writing

Keep welcome message:
- **Concise**: 3-4 sentences max
- **Action-oriented**: Tell them what to DO, not just what things ARE
- **Friendly**: Welcoming tone, not intimidating
- **Scannable**: Use numbered lists, bold key terms

## Testing Checklist

- [ ] Welcome modal appears on first load
- [ ] Modal doesn't appear if "Don't show again" was checked
- [ ] Start button dismisses modal and allows gameplay
- [ ] Rules button still accessible after welcome dismissed
- [ ] localStorage persists across page refreshes
- [ ] Clear localStorage shows welcome again
- [ ] Modal is responsive on mobile
- [ ] Keyboard navigation works (Tab, Enter)

## Alternative: Interactive Tutorial

Instead of modal, consider step-by-step tutorial:
1. Highlight face-down card with overlay
2. Show tooltip: "Click to reveal"
3. After click, highlight empty cell
4. Show tooltip: "Click to place new card"
5. Etc.

This is more engaging but also more complex to implement. Could be future enhancement.

## Priority Justification

**P1** - High priority for user onboarding. New players shouldn't feel lost. This significantly improves first-time experience and reduces bounce rate.

## Estimated Size

**S** (Small) - Simple modal with localStorage check. Minimal JavaScript required.
