# Passages Match Against Resolved Cards

The `foundPassage()` function doesn't check if the matching passage is face-up (unresolved).

**Location**: `index.js:334-347`

## Current Code

```javascript
for (let row = 0; row < this.dungeon.matrix.length; row += 1) {
  for (let col = 0; col < this.dungeon.matrix[row].length; col += 1) {
    const cell = this.dungeon.matrix[row][col];
    if (cell.card && cell.card.suitKey === oppositeSuit && cell.card.valueKey === value) {
      cell.cardFaceDown = true;
      return true;
    }
  }
}
```

Players can match passages that have already been resolved (face-down), which shouldn't be possible.

## Fix

Add check to only match face-up (unresolved) cards:
```javascript
if (cell.card && !cell.cardFaceDown &&
    cell.card.suitKey === oppositeSuit &&
    cell.card.valueKey === value) {
  cell.cardFaceDown = true;
  return true;
}
```

## Testing

1. Place two matching passages (e.g., 2 of Clubs and 2 of Spades)
2. Resolve both passages (both should turn face-down)
3. Place another 2 of Clubs
4. Verify it does NOT match the already-resolved 2 of Spades
5. Place a new 2 of Spades
6. Verify it DOES match the new face-up 2 of Clubs
