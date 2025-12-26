# Handle Dungeon Deck Depletion

No check for when dungeon deck runs out of cards (27 total cards).

If player explores all 27 dungeon cards without winning or losing, what happens? No handling for this edge case.

## Possible Behaviors

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

- Detect when dungeon deck is empty
- Decide on behavior (discuss with game designer)
- Implement chosen behavior
- Show appropriate message to player
- Update game rules documentation
