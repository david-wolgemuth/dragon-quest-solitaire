# Visual Affordances for Clickable Elements

## Overview

Players can't easily tell what's clickable and what's not. The game needs clear visual indicators for:
- Available cells (can place cards)
- Face-down cards (can reveal)
- Face-up cards (can resolve)
- Disabled/unavailable elements

## Current State

Cells have an `available` class and enabled/disabled states, but visual feedback is minimal:
- Cursor doesn't change on hover
- Available cells look very similar to unavailable cells
- No hover states to indicate clickability
- Disabled buttons don't look clearly disabled

## Expected Behavior

### Cursor Changes

```css
.cell.available {
  cursor: pointer;
}

.cell:not(.available), .cell:disabled {
  cursor: not-allowed;
}

button:not(:disabled) {
  cursor: pointer;
}
```

### Hover States

**Available empty cells:**
```css
.cell.available:not(.card):hover {
  background-color: rgba(74, 144, 226, 0.2);
  border: 2px solid #4a90e2;
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.4);
}
```

**Face-down cards:**
```css
.cell.card.card-back.available:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
```

**Face-up cards:**
```css
.cell.card:not(.card-back).available:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid gold;
}
```

### Focus States (Keyboard Navigation)

```css
.cell.available:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
}
```

### Disabled States

```css
.cell:disabled {
  opacity: 0.5;
  filter: grayscale(50%);
}
```

### Visual Indicators for Available Actions

Add subtle pulsing glow to available cells:
```css
@keyframes subtle-pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(74, 144, 226, 0.3); }
  50% { box-shadow: 0 0 15px rgba(74, 144, 226, 0.6); }
}

.cell.available:not(.card) {
  animation: subtle-pulse 3s infinite;
}
```

(Make this optional/subtle so it's not distracting)

## Implementation Tasks

### 1. Update CSS in `src/styles.css`

Add all cursor, hover, focus, and disabled styles as shown above.

### 2. Ensure Proper Classes

Verify that cells have correct classes:
- `available` when clickable
- `disabled` attribute when not clickable
- `card` when card present
- `card-back` when face-down

### 3. Add Hover Tooltips (Future Enhancement)

When hovering over available cells, show small tooltip:
- Empty cell: "Place dungeon card"
- Face-down card: "Reveal card"
- Face-up card: "[Card name] - [Action]"

This is covered more in ABE (hover preview enhancement).

### 4. Test Across Browsers

Ensure hover states work on:
- Desktop (Chrome, Firefox, Safari, Edge)
- Touch devices (consider :active instead of :hover)
- Keyboard navigation (focus states)

## Mobile Considerations

Hover doesn't work on touch devices. Alternative approaches:
- **Active states**: Show feedback when touched
- **Long press**: Show card details on long press
- **Visual indicators**: Use borders/glows without hover

```css
@media (hover: none) {
  /* Touch device styles */
  .cell.available:not(.card) {
    border: 2px dashed rgba(74, 144, 226, 0.5);
  }

  .cell.available:active {
    background-color: rgba(74, 144, 226, 0.3);
  }
}
```

## Accessibility Considerations

- **Keyboard users**: Focus states must be visible
- **Screen readers**: Add `aria-label` to cells describing action
  - `aria-label="Place dungeon card"`
  - `aria-label="Reveal Gem card"`
  - `aria-label="Resolve Skeleton enemy - requires fate check"`
- **Color blind users**: Don't rely on color alone - use borders, icons, patterns

## UI/UX Best Practices

1. **Immediate feedback**: Hover state appears instantly (no delay)
2. **Clear distinction**: Available vs unavailable is obvious at a glance
3. **Consistent patterns**: Same hover behavior across all clickable elements
4. **Subtle animations**: Don't distract from gameplay
5. **Performance**: Use transforms instead of position changes for smooth 60fps

## Example Visual Hierarchy

From most to least prominent:
1. **Face-down cards** (primary action) - Strongest hover effect
2. **Face-up cards** (resolution action) - Medium hover effect
3. **Empty available cells** (secondary action) - Subtle hover effect
4. **Unavailable cells** - No hover, clearly disabled

## Testing Checklist

- [ ] Cursor changes to pointer on available cells
- [ ] Cursor changes to not-allowed on disabled cells
- [ ] Hover states appear smoothly
- [ ] Focus states visible when tabbing through cells
- [ ] Disabled cells are clearly grayed out
- [ ] Hover effects work in all major browsers
- [ ] Touch devices show appropriate feedback
- [ ] Keyboard navigation is smooth
- [ ] No performance issues with animations
- [ ] Color contrast meets WCAG AA standards

## Related Tasks

- Works with #ABJ (initial tutorial) - tutorial can reference visual cues
- Enhanced by #ABE (hover preview) - adds tooltips on hover
- Requires mobile fixes from backlog

## Priority Justification

**P1** - Essential UX improvement. Players need immediate feedback about what they can interact with. This removes guesswork and frustration.

## Estimated Size

**S** (Small) - Primarily CSS changes. Testing required across browsers and devices.
