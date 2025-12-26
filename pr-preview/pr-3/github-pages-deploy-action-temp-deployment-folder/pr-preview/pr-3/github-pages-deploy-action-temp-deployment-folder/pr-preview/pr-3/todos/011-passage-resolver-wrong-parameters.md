# Todo #011: Passage Card Resolver Has Wrong Parameters

**Status**: Open
**Priority**: P1 - High (Major Bug)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #8

## Problem

Passage resolver passes incorrect parameters to `foundPassage()`.

**Location**: `card-builders.js:37`

**Impact**: Passage matching is completely broken due to parameter mismatch.

## Current Code

```javascript
// card-builders.js:37
resolver: function (game) {
  return game.foundPassage(this, suit, value);  // Passes 3 args!
}

// index.js:334
foundPassage(suit, value) {  // Only accepts 2 args!
  const oppositeSuit = suit === CLUBS ? SPADES : CLUBS;
  // ...
}
```

## What Happens

- First parameter `this` (card definition object) is treated as `suit`
- Second parameter `suit` is treated as `value`
- Third parameter `value` is ignored
- Passage matching logic fails completely

## Fix

Remove `this` from the call:
```javascript
resolver: function (game) {
  return game.foundPassage(suit, value);
}
```

## Testing

1. Place a passage card (2-4 of Clubs or Spades)
2. Place the matching opposite passage (same rank, opposite suit)
3. Verify both passages are marked as resolved
4. Test all passage combinations:
   - 2 of Clubs ↔ 2 of Spades
   - 3 of Clubs ↔ 3 of Spades
   - 4 of Clubs ↔ 4 of Spades
