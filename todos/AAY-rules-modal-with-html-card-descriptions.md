# Add Rules/About Modal with HTML-Formatted Card Descriptions

Create an accessible rules modal that displays on top of the current game without navigating away, allowing players to easily reference game rules and card details during gameplay.

## Requirements

### 1. Modal Overlay System
- Display modal on top of current game state (non-destructive)
- Dark overlay background with centered modal content
- Click outside modal or ESC key to close
- Modal should be accessible (proper ARIA attributes, focus management)

### 2. Hash-Based URL Routing
- Trigger modal with hash URL (e.g., `#rules` or `#about`)
- Opening modal updates URL to `#rules`
- Closing modal removes hash from URL
- Direct navigation to `#rules` opens modal automatically
- Preserves current game state in existing URL parameters

### 3. Content Sections

#### Game Rules
- Display comprehensive game rules from `docs/GAME_RULES.md`
- Include sections:
  - Overview and objective
  - Setup and card piles
  - Turn structure
  - Combat mechanics
  - Winning/losing conditions

#### Card Reference
- Show all 27 dungeon cards with details:
  - Card name and symbol
  - Card suit and value
  - Full description (formatted as HTML)
  - Special mechanics or interactions
- Organize by suit (Spades, Clubs) and value
- Include search/filter capability (optional enhancement)

### 4. Convert Card Descriptions to HTML

**Current State**: Card descriptions are plain text strings with line breaks
```javascript
description: `Exit to the next level of the dungeon,
  will reset all dungeon cards back to the deck but keep your current stats.

  If you have defeated the Dragon Queen (Queen of Spades) will end the game - you have won.
`
```

**Target State**: Structured HTML for better formatting
```javascript
description: {
  text: `Exit to the next level of the dungeon...`,
  html: `
    <p>Exit to the next level of the dungeon, resetting all dungeon cards while preserving your stats.</p>
    <p><strong>Victory condition:</strong> If you have defeated the Dragon Queen (Queen of Spades), exiting will end the game - you win!</p>
  `
}
```

**Conversion Tasks**:
- Add `html` property to all card definitions in `src/cards/dungeon-cards.js`
- Format with semantic HTML: `<p>`, `<strong>`, `<em>`, `<ul>`, `<li>` as appropriate
- Improve readability with proper paragraph breaks
- Highlight important information (damage values, requirements, special effects)
- Maintain backward compatibility with existing `description` text property
- Update card builders in `src/cards/card-builders.js` to support HTML descriptions

### 5. UI/UX Considerations
- Responsive design (mobile and desktop)
- Scrollable content if rules exceed viewport height
- Clear close button (X in top-right corner)
- "About" or "Rules" button in main game UI to trigger modal
- Preserve scroll position when closing modal

## Implementation Steps

1. Create modal HTML structure and styling
2. Implement hash-based URL routing for modal open/close
3. Convert all card descriptions to include HTML formatting
4. Create card reference section with all dungeon cards
5. Integrate game rules content from existing documentation
6. Add "Rules" button to main game interface
7. Test accessibility (keyboard navigation, screen readers)
8. Test on mobile and desktop viewports

## Files to Modify

- `src/cards/dungeon-cards.js` - Add HTML descriptions to all cards
- `src/cards/card-builders.js` - Update builders to support HTML descriptions
- `src/core/game-renderer.js` - Add rules button and modal rendering logic
- `src/styles.css` - Add modal styling
- `index.html` - Add modal container structure
- Create new module: `src/ui/rules-modal.js` (optional)

## Related Issues

- Addresses the need for in-game rules reference mentioned in todos/README.md (P3 | S | Printable version of rules)
- Improves upon "Credits/about page" todo by making it an overlay instead of separate page
- Enhances card description clarity and formatting

## Priority & Size

**Priority**: P2 (Medium - nice-to-have feature that improves UX)
**Size**: M (Medium - requires modal system, HTML conversion, and content integration)

## Acceptance Criteria

- [ ] Modal opens when navigating to `#rules` hash URL
- [ ] Modal displays without navigating away from current game
- [ ] All 27 dungeon cards shown with HTML-formatted descriptions
- [ ] Game rules content is comprehensive and readable
- [ ] Modal closes on outside click, ESC key, or close button
- [ ] Closing modal removes hash from URL
- [ ] Rules button added to main game UI
- [ ] Mobile responsive design
- [ ] Keyboard accessible (tab navigation, ESC to close)
