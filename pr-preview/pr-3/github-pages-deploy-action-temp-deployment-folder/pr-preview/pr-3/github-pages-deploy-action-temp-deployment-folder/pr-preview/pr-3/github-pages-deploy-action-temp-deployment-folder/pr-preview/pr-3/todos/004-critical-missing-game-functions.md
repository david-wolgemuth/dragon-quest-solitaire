# Todo #004: CRITICAL - Missing Game Functions

**Status**: Open
**Priority**: P0 - Critical (Game-Breaking)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #3

## Problem

Functions `defeatDragonQueen()` and `resetDungeon()` are called but don't exist in the Game class.

**Location**: Referenced in `dungeon-cards.js:13, 69`

**Impact**:
- Exit card (Ace of Spades) crashes when clicked
- Dragon Queen critical success crashes the game
- No win condition implementation

## Required Functions

### 1. `defeatDragonQueen()`
Called when Dragon Queen is defeated with a critical success (fate value 10).

Should:
- Trigger victory condition
- Show victory message
- Possibly offer to continue or reset

### 2. `resetDungeon()`
Called when Exit card (Ace of Spades) is used.

Should:
- Clear current dungeon
- Reshuffle dungeon deck
- Keep player inventory/health
- Start new level/dungeon

## Testing

1. Test Exit card doesn't crash
2. Test Dragon Queen critical success doesn't crash
3. Verify victory condition works
4. Verify dungeon reset works correctly
