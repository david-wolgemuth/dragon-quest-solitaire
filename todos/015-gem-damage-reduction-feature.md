# Todo #015: Implement Gem Damage Reduction Feature

**Status**: Open
**Priority**: P1 - High (Missing Feature)
**Created**: 2025-12-26
**Related**: BUG_REPORT.md Issue #16, GAME_RULES.md

## Problem

According to GAME_RULES.md, gems should reduce damage 1:1, but this is not implemented for:
- Visible pit traps (no UI to use gems)
- Combat damage (no option to spend gems)

**Note**: Hidden pit traps claim to auto-use gems but don't (see Todo #008)

## Expected Behavior

From GAME_RULES.md:
- Players can spend gems to reduce incoming damage
- 1 gem = 1 damage reduction
- Should work for both pit traps and combat

## Implementation Tasks

### 1. UI for Damage Reduction
- [ ] Add prompt after damage is calculated but before applied
- [ ] Show: "You will take X damage. Use gems to reduce? (You have Y gems)"
- [ ] Buttons for each gem amount (0, 1, 2, etc. up to available)

### 2. Update `loseHealth()` Function
- [ ] Add optional user prompt for gem usage
- [ ] Apply gem reduction before taking damage
- [ ] Update health and gem counts appropriately

### 3. Handle Different Damage Sources
- [ ] Visible pit traps - prompt for gem usage
- [ ] Hidden pit traps - automatic gem usage (see #008)
- [ ] Combat damage - prompt for gem usage
- [ ] Other damage sources as applicable

## UI/UX Considerations

- Show damage amount clearly
- Show gem count clearly
- Allow quick selection (0-5 gems)
- Show resulting damage after gem reduction
- Consider "auto-use all needed gems" option

## Testing

1. Take damage with 0 gems - no prompt
2. Take 1 damage with 3 gems - verify prompt, verify reduction works
3. Take 3 damage with 1 gem - verify can only reduce by 1
4. Take 2 damage with 5 gems - verify can reduce to 0
5. Test with pit traps and combat
