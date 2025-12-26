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

### Critical (P0)
- [#001 - File Organization](001-file-organization.md) - Reorganize project structure
- [#002 - User Input Buttons Not Rendered](002-critical-user-input-buttons.md) - Fix Merchant/Wizard selection
- [#003 - Game Over Detection](003-critical-game-over-detection.md) - Implement game over when health reaches 0
- [#004 - Missing Game Functions](004-critical-missing-game-functions.md) - Implement `defeatDragonQueen()` and `resetDungeon()`
- [#005 - Fate Deck Duplication](005-critical-fate-deck-duplication.md) - Fix fate deck card duplication bug

### High Priority (P1)
- [#006 - Item Usage Logic](006-item-usage-logic.md) - Implement King/Queen/Jack/Joker usage

### Medium Priority (P2)
- [#007 - Visual Sprites and Tiles](007-visual-sprites-and-tiles.md) - Replace cards with Dragon Quest sprites

### Backlog
See [BUG_REPORT.md](../BUG_REPORT.md) for additional bugs that need to be converted to todos:
- Major bugs (#5-9)
- Minor bugs (#10-12)
- Design issues (#13-20)

See [README.md](../README.md) for additional features that need to be converted to todos.

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
