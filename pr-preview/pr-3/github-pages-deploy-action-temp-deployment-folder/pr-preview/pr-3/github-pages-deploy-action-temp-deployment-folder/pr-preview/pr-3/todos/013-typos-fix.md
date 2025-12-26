# Todo #013: Fix Typos in Card Descriptions

**Status**: Open
**Priority**: P2 - Medium (Minor Bugs)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issues #10, #11, #12

## Typos to Fix

### 1. Pit Trap Description
**Location**: `card-builders.js:20`
**Current**: "they w reduce"
**Fix**: "they will reduce"

### 2. Merchant Description
**Location**: `dungeon-cards.js:89`
**Current**: "Costs 1 one gem"
**Fix**: "Costs 1 gem"

### 3. Enemy Description
**Location**: `card-builders.js:60`
**Current**: "you lose you will take"
**Fix**: "you will take"

## Impact

Minor text display issues. Does not affect gameplay, only user-facing descriptions.

## Testing

1. View pit trap card description
2. View merchant card description
3. View enemy card descriptions
4. Verify all text reads correctly
