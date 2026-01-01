# Hover Preview for Cards (UX Enhancement)

## Overview

Show a preview tooltip when hovering over face-up cards in the dungeon. This allows players to read card descriptions without clicking and triggering the confirmation modal.

## Current State

- Cards show minimal information until clicked
- No way to "preview" a card's effect without committing to the confirmation flow
- Players must click → read → dismiss to learn what a card does

## Expected Behavior

When hovering over a face-up card:
1. Show tooltip/preview after ~500ms delay
2. Display card name and brief description
3. Hide tooltip when mouse leaves card
4. Clicking still triggers the confirmation modal (existing behavior)

## Implementation Tasks

### 1. Create Tooltip Component

Add to `index.html`:
```html
<div id="card-preview-tooltip" class="card-tooltip">
  <div class="card-tooltip-content">
    <h4 id="tooltip-card-name"></h4>
    <p id="tooltip-card-description"></p>
  </div>
</div>
```

### 2. Add Hover Listeners to Cards

In `game-renderer.js:renderDungeon()`, for face-up cards:
```javascript
cellElement.addEventListener('mouseenter', (e) => {
  showCardTooltip(e, dungeonCard);
});

cellElement.addEventListener('mouseleave', () => {
  hideCardTooltip();
});
```

### 3. Tooltip Display Logic

```javascript
let tooltipTimeout;

function showCardTooltip(event, cardData) {
  // Clear any existing timeout
  clearTimeout(tooltipTimeout);

  // Show after delay
  tooltipTimeout = setTimeout(() => {
    const tooltip = document.getElementById('card-preview-tooltip');
    const nameEl = document.getElementById('tooltip-card-name');
    const descEl = document.getElementById('tooltip-card-description');

    nameEl.textContent = cardData.name;
    descEl.textContent = cardData.description; // Use plain text for tooltip

    // Position tooltip near cursor
    positionTooltip(tooltip, event);

    tooltip.classList.add('visible');
  }, 500); // 500ms delay
}

function hideCardTooltip() {
  clearTimeout(tooltipTimeout);
  const tooltip = document.getElementById('card-preview-tooltip');
  tooltip.classList.remove('visible');
}
```

### 4. Tooltip Positioning

```javascript
function positionTooltip(tooltip, event) {
  const x = event.clientX;
  const y = event.clientY;

  // Position below and to the right of cursor
  tooltip.style.left = `${x + 15}px`;
  tooltip.style.top = `${y + 15}px`;

  // Adjust if tooltip goes off-screen
  const rect = tooltip.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    tooltip.style.left = `${x - rect.width - 15}px`;
  }
  if (rect.bottom > window.innerHeight) {
    tooltip.style.top = `${y - rect.height - 15}px`;
  }
}
```

### 5. Style the Tooltip

In `src/styles.css`:
```css
.card-tooltip {
  position: fixed;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75em 1em;
  border-radius: 6px;
  font-size: 0.9em;
  max-width: 250px;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.card-tooltip.visible {
  opacity: 1;
}

.card-tooltip-content h4 {
  margin: 0 0 0.5em 0;
  font-size: 1.1em;
  color: #ffd700;
}

.card-tooltip-content p {
  margin: 0;
  line-height: 1.4;
}
```

## UI/UX Considerations

### Hover Delay

- 500ms delay prevents tooltips from appearing during quick mouse movements
- Feels responsive without being annoying
- Can make configurable in settings later

### Tooltip Content

- Use **plain text** `description` in tooltip (brief)
- Use `descriptionHtml` in confirmation modal (detailed)
- Keep tooltip concise - just enough to understand the card

### Mobile Behavior

- Tooltips don't make sense on touch devices
- Disable hover listeners on touch devices:
  ```javascript
  const isTouchDevice = 'ontouchstart' in window;
  if (!isTouchDevice) {
    // Add hover listeners
  }
  ```

### Tooltip Position

- Default: Below and to the right of cursor
- Adjust if going off-screen (above or to the left)
- Never obscure the card being hovered

### Interaction with Confirmation Modal

- Tooltip disappears when modal opens
- Tooltip doesn't interfere with clicking

## Testing Checklist

- [ ] Tooltip appears after ~500ms hover
- [ ] Tooltip disappears when mouse leaves
- [ ] Tooltip shows correct card name
- [ ] Tooltip shows correct description
- [ ] Tooltip positions correctly (doesn't go off-screen)
- [ ] Tooltip doesn't interfere with clicking
- [ ] Tooltip doesn't appear on mobile/touch devices
- [ ] Tooltip has smooth fade-in/out animation
- [ ] Multiple rapid hovers don't create duplicate tooltips
- [ ] Tooltip disappears when confirmation modal opens

## Accessibility

### Screen Readers

- Tooltip content should be available via `aria-describedby`
- Card buttons should have `aria-label` with card name
- Consider adding visually-hidden description text

### Keyboard Navigation

- Tooltip should show on keyboard focus (not just hover)
- Tab navigation should trigger tooltip
- ESC key should dismiss tooltip

### Reduced Motion

- Respect `prefers-reduced-motion` for fade animation
- Instant show/hide if motion is reduced

## Related Tasks

- Independent enhancement, works with all other tasks
- Complements #AAZ (provides info without opening modal)
- Works alongside #ABC (preview available even if confirmations disabled)

## Priority

**Priority**: P2 (nice-to-have UX improvement)
**Size**: S (small - straightforward implementation)

This is a quality-of-life improvement that makes the game more discoverable and user-friendly. Players can learn what cards do without triggering confirmations.

## Future Enhancements

- **Keyboard shortcut**: Hold SHIFT while hovering for instant tooltip
- **Tooltip history**: Log of recently previewed cards
- **Rich tooltips**: Include card visual, not just text
- **Comparison**: Show multiple card tooltips side-by-side (for passages)
