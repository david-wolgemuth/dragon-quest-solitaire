# Improve "Place Card" Confirmation Message

## Overview

Currently, when clicking an empty cell to place a new dungeon card, the confirmation modal shows placeholder text: "the rules about adding cards to the dungeon..." (see `game-renderer.js:73`). This needs to be replaced with proper, helpful content.

## Current State

```javascript
// game-renderer.js:71-77
cellElement.onclick = () => {
  this.addTutorialModal(`<div>
    the rules about adding cards to the dungeon...
  </div>`, () => {
    this.game.addCardToDungeon({ row, col });
  });
};
```

This is clearly placeholder text that was never replaced.

## Expected Behavior

When clicking an empty available cell, show confirmation modal with:
- Clear explanation of what will happen
- Dungeon card back visual (showing a card will be placed)
- Reminder of placement rules
- Accept/Dismiss buttons (standard confirmation flow)

## Implementation Tasks

### 1. Replace Placeholder Text

Update `game-renderer.js:72-74` with proper content:
```javascript
this.addTutorialModal(`<div>
  <div class="card card-back"></div>
  <h3>Place Dungeon Card</h3>
  <p>Draw and place a card from the dungeon deck at this location.</p>
  <p class="rules-reminder">
    <small>
      <strong>Reminder:</strong> New cards can only be placed adjacent to
      exactly one face-down card. The new card will be revealed immediately.
    </small>
  </p>
</div>`, () => {
  this.game.addCardToDungeon({ row, col });
});
```

### 2. Show Location Information

Include position information in the message:
```javascript
<p>Place a dungeon card at row ${row + 1}, column ${col + 1}.</p>
```

This helps players understand where the card will be placed, especially useful for learning the grid system.

### 3. Show Remaining Deck Count

Display how many dungeon cards remain:
```javascript
<p>
  Dungeon cards remaining: <strong>${this.game.dungeon.stock.length}</strong>
</p>
```

This provides strategic information - players can plan around running out of dungeon cards.

### 4. Optional: Preview Next Card (Advanced)

*Optional enhancement* - Show which card will be placed:
```javascript
if (this.game.dungeon.stock.length > 0) {
  const nextCard = this.game.dungeon.stock[this.game.dungeon.stock.length - 1];
  // Show card visual (face-up preview)
}
```

**Consideration**: This changes gameplay significantly - knowing the next card before placing it. May not be desirable. Recommend starting without this feature.

## Content Variations

### First Placement (Tutorial)

For the very first card placement (game just started):
```html
<h3>Welcome to Dragon Quest Solitaire!</h3>
<p>Click <strong>Accept</strong> to place your first dungeon card.</p>
<p>The card will be placed face-up, and you can then explore the dungeon by placing more cards adjacent to face-down cards.</p>
```

### Standard Placement

For all other placements:
```html
<h3>Place Dungeon Card</h3>
<p>Draw and place a card from the dungeon deck.</p>
<p><strong>${this.game.dungeon.stock.length}</strong> cards remaining.</p>
```

### Last Card Warning

When placing the last or second-to-last card:
```html
<h3>⚠️ Few Cards Remaining</h3>
<p>Only <strong>${this.game.dungeon.stock.length}</strong> card(s) left in the dungeon deck!</p>
<p>Consider your strategy carefully.</p>
```

## UI/UX Considerations

### Visual Hierarchy

- Card visual at top (card back image)
- Clear heading
- Short, scannable text
- Important info (card count) highlighted

### Tone

- Informative but concise
- Avoid overwhelming new players with too much text
- Progressive disclosure - more info for edge cases

### Consistency

- Match the style of other confirmation modals
- Use same heading style as card resolution confirmations

## Testing Checklist

- [ ] Placeholder text is removed
- [ ] Proper message shows when clicking empty cell
- [ ] Card back visual displays correctly
- [ ] Remaining card count is accurate
- [ ] Message is clear and understandable
- [ ] Accept button places the card
- [ ] Dismiss button cancels without placing
- [ ] First placement (if different) shows correct message
- [ ] Last card warning shows when appropriate

## Edge Cases

### No Cards Left

If somehow an empty cell is available but dungeon deck is empty:
```html
<h3>⚠️ No Cards Left</h3>
<p>The dungeon deck is empty. No card can be placed.</p>
```

And disable the Accept button, or don't show the modal at all.

### Tutorial Mode

If tutorial mode is implemented (see todos/README.md:33):
- Show more detailed instructions
- Highlight the placement rules
- Maybe include animated examples

## Related Tasks

- Part of #AAZ (confirmation modal system)
- Should match style/format of other confirmations
- Works with #ABC (preferences can skip this message too)
- Works with #AAP (dungeon deck depletion handling)

## Priority

**Priority**: P2 (UX improvement, not critical)
**Size**: XS (trivial - just replacing placeholder text)

This is a quick win - just replace placeholder text with proper content. Should be done when implementing #AAZ.

## Notes

This is placeholder text that should have been removed before initial release. Good opportunity to improve first-time user experience by explaining what's happening.

Consider this the "easy" part of the confirmation system - just text replacement. The real work is in the other confirmation tasks.
