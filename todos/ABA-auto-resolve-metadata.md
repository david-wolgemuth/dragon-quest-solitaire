# Add Auto-Resolve Metadata to Card Definitions

## Overview

Some cards should automatically resolve without confirmation (e.g., traps pulled from the deck), while others should show the confirmation modal. This task adds metadata to distinguish between these two behaviors.

## Problem

Not all card resolutions should require user confirmation:
- **Auto-resolve cases**: Hidden pit traps (automatically triggered when revealed), forced encounters
- **User-initiated cases**: Most cards where the player has a choice to resolve or not

Currently, all cards go through the same confirmation flow.

## Expected Behavior

Cards with `autoResolve: true` metadata should:
- Skip the confirmation modal
- Execute their resolver immediately when revealed
- Still show post-resolution feedback (see #ABB)

Cards without this flag (default) should:
- Show confirmation modal before resolving
- Wait for user to click "Accept"

## Implementation Tasks

### 1. Add Metadata Field to Card Definitions

In `src/cards/dungeon-cards.js` and `src/cards/card-builders.js`:
- Add `autoResolve` boolean flag to card definitions
- Hidden pit trap (SPADES TWO) should have `autoResolve: true`
- Most other cards should omit this (defaults to false)

Example:
```javascript
[TWO]: {
  name: "Hidden Pit Trap",
  description: "...",
  autoResolve: true,  // <-- Add this
  resolver: function(game) { ... }
}
```

### 2. Update Card Builders

For `buildPitTrapCard()`:
- If `hidden: true`, set `autoResolve: true`
- If `hidden: false`, leave as default (confirmation required)

### 3. Update GameRenderer Logic

In `game-renderer.js:renderDungeon()`:
- When card is clicked, check `dungeonCard.autoResolve`
- If `true`: skip modal, call resolver immediately
- If `false` (default): show confirmation modal as usual

### 4. Determine Which Cards Should Auto-Resolve

Review all dungeon cards and decide which should auto-resolve:
- **Auto-resolve candidates**:
  - Hidden Pit Trap (SPADES TWO) - ✓ definitely
  - Possibly: Passage cards when second match is revealed?
- **Require confirmation** (most cards):
  - Enemies (player chooses when to fight)
  - Treasure chests, gems, healing
  - Visible traps (player chooses when to trigger)
  - Exit/Aces

## Testing Checklist

- [ ] Hidden pit trap resolves immediately without confirmation
- [ ] All other cards still show confirmation modal
- [ ] Auto-resolved cards still show result feedback (see #ABB)
- [ ] No regression in existing card behavior

## Design Considerations

**Question**: Should placing a new dungeon card face-up trigger auto-resolve?
- Current behavior: New cards are placed face-up, then must be clicked to resolve
- Alternative: Face-up cards auto-resolve if they have `autoResolve: true`
- **Recommendation**: Keep current behavior - even auto-resolve cards require explicit click to trigger

**Question**: Should passage cards auto-resolve when the matching pair is found?
- This could be implemented later as an enhancement
- For now, require manual resolution of both passage cards

## Related Tasks

- Depends on #AAZ (confirmation modal must be working)
- Works with #ABB (post-resolution feedback)
- Works with #ABC (preferences can override auto-resolve)

## Notes

Keep this simple - just add a boolean flag and check it before showing the modal. Don't over-engineer with complex auto-resolve rules.
