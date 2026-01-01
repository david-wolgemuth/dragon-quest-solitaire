# Undo Last Action

## Overview

Players sometimes click cards accidentally or want to try a different strategy. An undo feature allows:
- Recovering from misclicks
- Experimenting with different approaches
- Learning card effects without permanent consequences

## Current State

No undo functionality exists. Every action is permanent once committed.

## Expected Behavior

### Basic Undo

Press Ctrl+Z (Cmd+Z on Mac) or click "Undo" button to revert last action:
- Placing a card from dungeon
- Revealing a face-down card
- Resolving a card effect

### Limitations

Consider limiting undo to prevent abuse:
- **Option A**: Only undo placement/reveal, not resolution effects
- **Option B**: Allow undoing last action only (not full history)
- **Option C**: Allow unlimited undo (full game history)

**Recommended**: Option B - allows fixing mistakes without enabling save-scumming.

### UI

```html
<div id="game-controls">
  <button id="undo-button" disabled>
    ⟲ Undo
    <span class="shortcut">Ctrl+Z</span>
  </button>
  <button id="reset-game">
    ↻ Reset Game
  </button>
  <button id="open-rules">
    📖 Rules
  </button>
</div>
```

Undo button:
- **Disabled** when no actions to undo
- **Enabled** when undo is available
- Shows what will be undone on hover: "Undo: Place card at row 2, col 3"

## Implementation Tasks

### 1. Game History Tracking

Add to `Game` class:
```javascript
constructor() {
  // ... existing code
  this.history = [];
  this.maxHistorySize = 1; // Only store last action
}

_recordAction(action) {
  this.history.push({
    type: action.type,
    snapshot: this._createSnapshot(),
    timestamp: Date.now()
  });

  // Keep only last N actions
  if (this.history.length > this.maxHistorySize) {
    this.history.shift();
  }
}

_createSnapshot() {
  // Return deep copy of game state
  return {
    health: JSON.parse(JSON.stringify(this.health)),
    gems: JSON.parse(JSON.stringify(this.gems)),
    inventory: JSON.parse(JSON.stringify(this.inventory)),
    fate: JSON.parse(JSON.stringify(this.fate)),
    dungeon: this._snapshotDungeon(),
    dragonQueenDefeated: this.dragonQueenDefeated,
    isGameOver: this.isGameOver
  };
}

_snapshotDungeon() {
  // Create deep copy of dungeon state
  return {
    stock: [...this.dungeon.stock],
    matrix: this.dungeon.matrix.map(row =>
      row.map(cell => ({
        card: cell.card,
        cardFaceDown: cell.cardFaceDown,
        available: cell.available
      }))
    ),
    available: [...this.dungeon.available]
  };
}

undo() {
  if (this.history.length === 0) {
    return false;
  }

  const previousState = this.history.pop();
  this._restoreSnapshot(previousState.snapshot);
  this.render();
  return true;
}

_restoreSnapshot(snapshot) {
  this.health = snapshot.health;
  this.gems = snapshot.gems;
  this.inventory = snapshot.inventory;
  this.fate = snapshot.fate;
  this.dungeon = this._restoreDungeon(snapshot.dungeon);
  this.dragonQueenDefeated = snapshot.dragonQueenDefeated;
  this.isGameOver = snapshot.isGameOver;
}
```

### 2. Record Actions

In each action method, record before executing:
```javascript
addCardToDungeon({ row, col }) {
  this._recordAction({ type: 'place-card', row, col });
  // ... existing logic
}

resolveCard({ row, col }) {
  this._recordAction({ type: 'resolve-card', row, col });
  // ... existing logic
}
```

### 3. Add Undo Button

In `index.html`, update controls section:
```html
<div id="game-controls">
  <button id="undo-button">⟲ Undo</button>
  <button id="reset-game">↻ Reset</button>
  <button id="open-rules">📖 Rules</button>
</div>
```

### 4. Wire Up Undo Handler

In `main.js`:
```javascript
document.getElementById('undo-button').addEventListener('click', () => {
  game.undo();
  updateUndoButton();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    game.undo();
    updateUndoButton();
  }
});

function updateUndoButton() {
  const undoButton = document.getElementById('undo-button');
  undoButton.disabled = game.history.length === 0;
}

// Call updateUndoButton() after every action
```

### 5. Show Undo Description on Hover

Add tooltip showing what will be undone:
```javascript
updateUndoButton() {
  const undoButton = document.getElementById('undo-button');
  if (game.history.length === 0) {
    undoButton.disabled = true;
    undoButton.title = 'No actions to undo';
  } else {
    undoButton.disabled = false;
    const lastAction = game.history[game.history.length - 1];
    undoButton.title = `Undo: ${formatAction(lastAction.type)}`;
  }
}

function formatAction(type) {
  switch (type) {
    case 'place-card': return 'Place dungeon card';
    case 'resolve-card': return 'Resolve card';
    default: return 'Last action';
  }
}
```

## Advanced Features (Future)

- **Redo**: Implement redo (Ctrl+Y) to reverse an undo
- **Undo History UI**: Show list of actions that can be undone
- **Unlimited Undo**: Allow full game history (may require optimization)
- **Replay**: Record and replay entire games
- **Branching**: Allow creating save points and exploring multiple paths

## UI/UX Considerations

- **Keyboard shortcut**: Ctrl+Z (Cmd+Z on Mac) - familiar to users
- **Visual feedback**: Button briefly highlights when undo happens
- **Disabled state**: Clear when undo is not available
- **Preserve seeds**: Undoing shouldn't break RNG seeding
- **URL state**: Update URL state after undo for sharing

## Performance

Snapshotting full game state on every action could be expensive. Optimizations:
- Only snapshot changed portions of state
- Use structural sharing (copy-on-write)
- Limit history size to 1 or small number
- Consider using Immer.js for immutable state management

## Testing Checklist

- [ ] Undo button disabled when no history
- [ ] Undo button enabled after action
- [ ] Clicking undo reverts last action
- [ ] Ctrl+Z keyboard shortcut works
- [ ] Game state fully restored (health, gems, dungeon, etc.)
- [ ] Undo button tooltip shows action description
- [ ] Multiple undos work (if history size > 1)
- [ ] Undo doesn't break RNG
- [ ] URL state updates after undo
- [ ] Performance acceptable (no lag)

## Edge Cases

- **Undo after game over**: Should restore to state before game over
- **Undo with empty history**: Button should be disabled
- **Undo during modal**: Should close modal first? Or prevent undo?
- **Undo async actions**: If resolvers become async, handle carefully

## Alternative: Confirmation Instead of Undo

Instead of undo, prevent mistakes with confirmation modals (already implemented in #AAZ). Undo is still valuable for:
- Trying different strategies
- Learning card effects
- Recovering from accidental clicks on confirmations

## Priority Justification

**P2** - Nice-to-have UX improvement. Confirmation modals (#AAZ) already prevent most mistakes, but undo adds extra safety net and enables experimentation.

## Estimated Size

**S** (Small) - State snapshotting is straightforward. Main complexity is ensuring all state is captured correctly.
