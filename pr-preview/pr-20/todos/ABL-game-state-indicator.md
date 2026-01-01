# Game State Indicator

## Overview

Players need clear indication of the current game state and what actions are available. Currently, there's no explicit guidance on:
- What you can/should do right now
- What phase of the turn you're in
- Whether you must resolve a card or can place a new one
- What the current objective is

## Current State

The game allows both actions at all times:
- Place new cards (if cells available)
- Resolve face-down cards (if any exist)

No indicator tells the player what they should prioritize or what the current "phase" is.

## Expected Behavior

### Game State Display

Add a status bar showing current game state:

```html
<div id="game-state-indicator">
  <span class="state-label">Current Action:</span>
  <span class="state-value">Explore the dungeon</span>
  <span class="state-hint">Place or reveal a card</span>
</div>
```

### Possible States

1. **Start of Game**
   - Label: "Begin Quest"
   - Hint: "Reveal the first dungeon card to start"

2. **Exploration Phase**
   - Label: "Explore the Dungeon"
   - Hint: "Place or reveal a dungeon card"

3. **Must Defeat Dragon Queen**
   - Label: "Find the Dragon Queen"
   - Hint: "Explore cards to find the Queen of Spades"

4. **Dragon Queen Defeated**
   - Label: "Seek the Exit"
   - Hint: "Find an Ace of Spades to escape"

5. **No Actions Available** (edge case)
   - Label: "Stuck"
   - Hint: "No available actions - use an item or reset"

6. **Game Over - Victory**
   - Label: "Victory!"
   - Hint: "You escaped the dungeon!"

7. **Game Over - Defeat**
   - Label: "Defeated"
   - Hint: "Health depleted - game over"

### Visual Design

```css
#game-state-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #2c3e50, #3498db);
  color: white;
  border-radius: 4px;
  margin: 1rem 0;
  font-size: 1.1rem;
}

.state-label {
  font-weight: bold;
}

.state-value {
  color: #f1c40f;
  font-weight: bold;
}

.state-hint {
  opacity: 0.8;
  font-size: 0.9rem;
  margin-left: auto;
}

/* State-specific colors */
#game-state-indicator.victory {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
}

#game-state-indicator.defeat {
  background: linear-gradient(90deg, #c0392b, #e74c3c);
}

#game-state-indicator.critical {
  background: linear-gradient(90deg, #d35400, #e67e22);
  animation: pulse-warning 2s infinite;
}
```

## Implementation Tasks

### 1. Add HTML Element

In `index.html` after the nav, before the status table:
```html
<div id="game-state-indicator">
  <span class="state-label">Current Action:</span>
  <span class="state-value" id="state-value">Loading...</span>
  <span class="state-hint" id="state-hint"></span>
</div>
```

### 2. Add State Tracking to Game Class

In `Game` class (`src/core/game.js`):
```javascript
getGameState() {
  if (this.isGameOver) {
    if (this.dragonQueenDefeated && /* player used exit */) {
      return {
        state: 'victory',
        label: 'Victory!',
        hint: 'You escaped the dungeon!'
      };
    } else {
      return {
        state: 'defeat',
        label: 'Defeated',
        hint: 'Health depleted - game over'
      };
    }
  }

  if (this.dragonQueenDefeated) {
    return {
      state: 'seek-exit',
      label: 'Seek the Exit',
      hint: 'Find an Ace to escape the dungeon'
    };
  }

  // Check if Dragon Queen is still in deck
  const queenInDeck = this.dungeon.stock.some(card =>
    card.suit.key === 'SPADES' && card.value.key === 'QUEEN'
  );
  const queenInGrid = this.dungeon.matrix.flat().some(cell =>
    cell.card && cell.card.suit.key === 'SPADES' && cell.card.value.key === 'QUEEN'
  );

  if (queenInDeck || queenInGrid) {
    return {
      state: 'exploration',
      label: 'Explore the Dungeon',
      hint: 'Find and defeat the Dragon Queen'
    };
  }

  // Default
  return {
    state: 'exploration',
    label: 'Explore the Dungeon',
    hint: 'Place or reveal a dungeon card'
  };
}
```

### 3. Render State Indicator

In `GameRenderer` class:
```javascript
renderGameState() {
  const stateInfo = this.game.getGameState();
  const indicator = document.getElementById('game-state-indicator');
  const stateValue = document.getElementById('state-value');
  const stateHint = document.getElementById('state-hint');

  indicator.className = `game-state-${stateInfo.state}`;
  stateValue.textContent = stateInfo.label;
  stateHint.textContent = stateInfo.hint;
}
```

Call `renderGameState()` whenever game state changes (after placing cards, resolving cards, etc.).

### 4. Update on Game Events

Add `renderGameState()` calls in:
- `Game.addCardToDungeon()`
- `Game.resolveCard()`
- `Game._loseCard()` (when health changes)
- `Game.defeatDragonQueen()`

## UI/UX Considerations

- **Always visible**: Fixed position at top, always in view
- **Clear hierarchy**: State is most prominent, hint is secondary
- **Color coding**:
  - Normal: Blue gradient
  - Victory: Green gradient
  - Defeat: Red gradient
  - Critical (low health): Orange gradient with pulse
- **Responsive**: Works on mobile (stacks vertically if needed)

## Advanced Features (Future)

- **Action Counter**: "23/27 cards explored"
- **Turn Counter**: "Turn 15"
- **Progress Bar**: Visual indicator of dungeon exploration
- **Tips**: Randomized helpful tips in the hint area
- **Warnings**: "Low health!" when health <= 2

## Testing Checklist

- [ ] Indicator updates when placing cards
- [ ] Indicator updates when resolving cards
- [ ] Shows "Seek the Exit" after Dragon Queen defeated
- [ ] Shows "Victory" after using Exit (with Queen defeated)
- [ ] Shows "Defeated" when health reaches 0
- [ ] Color coding works for different states
- [ ] Responsive on mobile devices
- [ ] Accessible to screen readers (proper ARIA labels)

## Accessibility

Add ARIA live region for state changes:
```html
<div id="game-state-indicator" role="status" aria-live="polite">
  ...
</div>
```

Screen readers will announce state changes automatically.

## Priority Justification

**P1** - Important UX improvement. Helps players understand what to do next, especially important for new players. Reduces confusion about game objectives.

## Estimated Size

**S** (Small) - Simple status bar with game state logic. Mostly frontend work.
