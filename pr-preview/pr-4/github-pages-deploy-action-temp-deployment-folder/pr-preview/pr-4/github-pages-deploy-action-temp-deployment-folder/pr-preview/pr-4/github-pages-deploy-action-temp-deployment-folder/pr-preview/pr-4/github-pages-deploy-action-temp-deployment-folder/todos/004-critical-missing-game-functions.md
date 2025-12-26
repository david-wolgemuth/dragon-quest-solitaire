# Missing Game Functions

Functions `defeatDragonQueen()` and `resetDungeon()` are called but don't exist in the Game class.

**Referenced in**: `dungeon-cards.js:13, 69`

**Impact**:
- Exit card (Ace of Spades) crashes when clicked
- Dragon Queen critical success crashes the game
- No win condition implementation

## Required Functions

### `defeatDragonQueen()`
Called when Dragon Queen is defeated with a critical success (fate value 10).

Should:
- Trigger victory condition
- Show victory message
- Possibly offer to continue or reset

### `resetDungeon()`
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
