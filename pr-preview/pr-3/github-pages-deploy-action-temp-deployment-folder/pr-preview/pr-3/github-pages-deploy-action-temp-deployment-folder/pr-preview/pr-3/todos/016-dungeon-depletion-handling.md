# Todo #016: Handle Dungeon Deck Depletion

**Status**: Open
**Priority**: P2 - Medium (Edge Case)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #17

## Problem

No check for when dungeon deck runs out of cards (27 total cards).

**Impact**: If player explores all 27 dungeon cards without winning or losing, what happens? No handling for this edge case.

## Current Behavior

Unknown - likely crashes or allows invalid placement.

## Expected Behaviors (Choose One)

### Option A: Automatic Victory
- When all 27 cards are placed and resolved
- Trigger victory condition
- "You explored the entire dungeon!"

### Option B: Prevent Further Placement
- Disable card placement when deck is empty
- Show message: "Dungeon deck depleted - no more cards to explore"
- Force player to use Exit card or lose

### Option C: Auto-Reshuffle
- When deck runs out, reshuffle resolved dungeon cards back
- Continue indefinitely until victory or death
- Track "dungeon level" or "depth"

### Option D: Game Over
- Running out of dungeon cards is a loss condition
- "You couldn't find the exit in time!"

## Recommended

**Option A** or **Option C** depending on desired difficulty and game length.

## Implementation

- [ ] Detect when dungeon deck is empty
- [ ] Decide on behavior (discuss with game designer)
- [ ] Implement chosen behavior
- [ ] Show appropriate message to player
- [ ] Update game rules documentation

## Testing

1. Play through all 27 dungeon cards
2. Verify chosen behavior triggers
3. Verify game doesn't crash
4. Verify appropriate message is shown
