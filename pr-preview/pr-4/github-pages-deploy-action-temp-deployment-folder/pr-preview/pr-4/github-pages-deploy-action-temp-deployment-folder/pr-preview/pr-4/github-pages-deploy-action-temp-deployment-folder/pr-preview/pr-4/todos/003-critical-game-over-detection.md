# No Game Over Detection

When the player loses all health, the game silently continues without ending.

**Location**: `index.js:418-426` (`_loseCard`)

## Current Code

```javascript
_loseCard(key, amount) {
  for (let i = 0; i < amount; i += 1) {
    if (this[key].available.length === 0) {
      return;  // Just returns, no game-over check
    }
    const card = this[key].available.pop();
    this[key].stock.push(card);
  }
}
```

Player can continue playing with 0 health because there's no game over trigger.

## Fix

Add check after losing health:
```javascript
if (key === 'health' && this[key].available.length === 0) {
  this.gameOver();
}
```

## Testing

1. Play until health reaches 0
2. Verify game over screen appears
3. Verify game cannot continue after game over
4. Verify reset button works
