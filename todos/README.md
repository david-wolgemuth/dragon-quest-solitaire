# Dragon Quest Solitaire - Todo List

This directory contains all task tracking for the project. Each todo is a separate markdown file with details about the task, priority, and progress.

## Overview

Todos are numbered sequentially: `001-description.md`, `002-description.md`, etc.

## Priority Levels

- **P0 - Critical**: Game-breaking bugs that must be fixed
- **P1 - High**: Major bugs or important features
- **P2 - Medium**: Nice-to-have features and improvements
- **P3 - Low**: Polish, edge cases, future considerations

## Current Todos

### Critical (P0) - Must Fix 🔴
- [#001 - File Organization](001-file-organization.md) - Reorganize project structure
- [#002 - User Input Buttons Not Rendered](002-critical-user-input-buttons.md) - Fix Merchant/Wizard selection
- [#003 - Game Over Detection](003-critical-game-over-detection.md) - Implement game over when health reaches 0
- [#004 - Missing Game Functions](004-critical-missing-game-functions.md) - Implement `defeatDragonQueen()` and `resetDungeon()`
- [#005 - Fate Deck Duplication](005-critical-fate-deck-duplication.md) - Fix fate deck card duplication bug

### High Priority (P1) - Should Fix 🟡
- [#006 - Item Usage Logic](006-item-usage-logic.md) - Implement King/Queen/Jack/Joker usage
- [#008 - Hidden Pit Trap Gem Reduction](008-hidden-pit-trap-gem-reduction.md) - Implement automatic gem usage for hidden traps
- [#009 - Generous Wizard Costs Gem](009-generous-wizard-costs-gem.md) - Remove incorrect gem cost
- [#010 - Young Dragon Wrong Gem Amount](010-young-dragon-wrong-gem-amount.md) - Give 3 gems instead of 1 on critical
- [#011 - Passage Resolver Wrong Parameters](011-passage-resolver-wrong-parameters.md) - Fix parameter mismatch in passage logic
- [#012 - Passages Match Resolved Cards](012-passages-match-resolved-cards.md) - Only match face-up passages
- [#015 - Gem Damage Reduction Feature](015-gem-damage-reduction-feature.md) - Implement player choice to use gems for damage reduction

### Medium Priority (P2) - Nice to Have 🟢
- [#007 - Visual Sprites and Tiles](007-visual-sprites-and-tiles.md) - Replace cards with Dragon Quest sprites
- [#013 - Typos Fix](013-typos-fix.md) - Fix typos in card descriptions
- [#014 - Async Callback Resolution Timing](014-async-callback-resolution-timing.md) - Fix Merchant/Wizard card resolution timing
- [#016 - Dungeon Depletion Handling](016-dungeon-depletion-handling.md) - Handle when all 27 dungeon cards are placed
- [#017 - Render After Fate Check](017-render-after-fate-check.md) - Show fate card during combat

### Low Priority (P3) - Future 🔵
- [#018 - Empty Inventory Selection UX](018-empty-inventory-selection-ux.md) - Better UX when inventory is full
- [#019 - Modal Click Race Condition](019-modal-click-race-condition.md) - Investigate potential event bubbling issue
- [#020 - Context Loss in Callbacks](020-context-loss-in-callbacks.md) - Fix `this` reference in Merchant/Wizard callbacks
- [#021 - Health Maximum Enforcement](021-health-maximum-enforcement.md) - Review max health implementation

## Completed Todos

None yet!

## Creating New Todos

1. Find the next available number
2. Create file: `todos/XXX-short-description.md`
3. Use this template:

```markdown
# Todo #XXX: Brief Title

**Status**: Open | In Progress | Blocked | Completed
**Priority**: P0 | P1 | P2 | P3
**Created**: YYYY-MM-DD
**Related**: Links to related files, issues, or other todos

## Problem

Brief description of the problem or feature request.

## Proposed Solution

How to solve it.

## Tasks

- [ ] Subtask 1
- [ ] Subtask 2

## Testing

How to verify the fix works.
```

4. Update this README with a link to the new todo
