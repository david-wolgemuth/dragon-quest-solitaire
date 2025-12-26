# Dragon Quest Solitaire - Bug Report & Edge Cases

Analysis Date: 2024-12-26

## Critical Bugs (Game-Breaking)

### 1. CRITICAL: User Input Card Selection Buttons Not Rendered
**Location**: `index.js:737-753` (`renderUserInputCardSelection`)

**Issue**: Card buttons are created but never appended to the DOM.

```javascript
for (let card of cards) {
  const cardButton = document.createElement("button");
  cardButton.classList.add(`card-${card.suit.code}${card.value.code}`);
  cardButton.onclick = (() => {
    callback(card);
    messageElement.classList.remove("visible");
    messageTextElement.innerHTML = "";
  });
  // MISSING: messageTextElement.appendChild(cardButton);
}
```

**Impact**: Merchant (Ace of Clubs) and Generous Wizard (Black Joker) are completely broken. Players cannot select inventory items.

**Fix**: Add `messageTextElement.appendChild(cardButton);` inside the loop.

---

### 2. CRITICAL: No Game Over Detection
**Location**: `index.js:418-426` (`_loseCard`)

**Issue**: When the player loses all health, the game silently continues without ending.

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

**Impact**: Player can continue playing with 0 health. Game-over condition is never triggered.

**Fix**: Add check after losing health:
```javascript
if (key === 'health' && this[key].available.length === 0) {
  this.gameOver();
}
```

---

### 3. CRITICAL: Missing Game Functions
**Location**: Referenced in `dungeon-cards.js:13, 69`

**Issue**: Functions `defeatDragonQueen()` and `resetDungeon()` are called but don't exist in the Game class.

**Impact**:
- Exit card (Ace of Spades) crashes when clicked
- Dragon Queen critical success crashes the game
- No win condition implementation

**Fix**: Implement both functions in the Game class.

---

### 4. CRITICAL: Fate Deck Duplication
**Location**: `index.js:393-401` (`fateCheck`)

**Issue**: When reshuffling the fate deck, cards are duplicated.

```javascript
fateCheck() {
  if (this.fate.stock.length === 0) {
    this.fate.stock = shuffle(this.fate.available);
    // MISSING: this.fate.available = [];
  }
  const card = this.fate.stock.pop();
  this.fate.available.push(card);
  return card.value.order;
}
```

**Impact**: After the first reshuffle, the fate deck contains duplicate cards. This breaks the probability system and gives players unfair advantages in combat.

**Fix**: Clear the available pile after shuffling:
```javascript
this.fate.stock = shuffle(this.fate.available);
this.fate.available = [];
```

---

## Major Bugs (Incorrect Behavior)

### 5. MAJOR: Hidden Pit Trap Gem Reduction Not Implemented
**Location**: `card-builders.js:12`

**Issue**: Hidden pit traps try to pass a `{ gems: true }` option, but `loseHealth()` doesn't accept a third parameter.

```javascript
resolver: function (game) {
  game.loseHealth(this, damage, { gems: true });  // Third param ignored!
  return true;
}
```

**Impact**: Hidden pit traps don't automatically use gems to reduce damage as described in the rules.

**Expected**: Hidden traps should automatically consume gems to reduce damage.

**Fix**: Modify `loseHealth` to accept and handle the gems option.

---

### 6. MAJOR: Generous Wizard Costs a Gem
**Location**: `dungeon-cards.js:162`

**Issue**: The Generous Wizard (Black Joker) calls `game.loseGem(this)`, but should be free.

```javascript
resolver: function (game) {
  game.getUserInputInventoryCardSelection(
    "Choose an inventory item to gain: Treasure, Healing, Gem, or Exit",
    (card) => {
      game.inventory.stock = game.inventory.stock.filter((c) => {
        return c.suitKey !== card.suitKey && c.valueKey !== card.valueKey;
      });
      game.inventory.available.push(card);
      game.loseGem(this);  // BUG: Should be free!
    },
  )
  return true
}
```

**Impact**: Generous Wizard requires a gem when it should be free.

**Fix**: Remove the `game.loseGem(this);` line.

---

### 7. MAJOR: Young Dragon Critical Success Gives Wrong Amount
**Location**: `dungeon-cards.js:129-132`

**Issue**: Description says "gain 3 gems" but implementation only gives 1.

```javascript
[QUEEN]: buildEnemyCard({
  name: "Young Dragon",
  minFateToDefeat: 10,
  damageTakenIfUnsuccessful: 1,
  resolveCriticalSuccess: function (game) {
    game.gainGem(this);  // Only gives 1!
  },
  resolveCriticalSuccessDescription: "You will gain 3 gems",  // Says 3!
}),
```

**Impact**: Players only receive 1 gem instead of 3 on critical success.

**Fix**: Change to `game.gainGem(this, 3);` or update description to say 1 gem.

---

### 8. MAJOR: Passage Card Resolver Has Wrong Parameters
**Location**: `card-builders.js:37`

**Issue**: Passage resolver passes incorrect parameters to `foundPassage()`.

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

**Impact**:
- First parameter `this` (card definition object) is treated as `suit`
- Second parameter `suit` is treated as `value`
- Third parameter `value` is ignored
- Passage matching is completely broken

**Fix**: Remove `this` from the call:
```javascript
return game.foundPassage(suit, value);
```

---

### 9. MAJOR: Passages Match Against Resolved Cards
**Location**: `index.js:334-347` (`foundPassage`)

**Issue**: The function doesn't check if the matching passage is face-up.

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

**Impact**: Players can match passages that have already been resolved (face-down), which shouldn't be possible.

**Fix**: Add check for face-up cards:
```javascript
if (cell.card && !cell.cardFaceDown &&
    cell.card.suitKey === oppositeSuit &&
    cell.card.valueKey === value) {
```

---

## Minor Bugs

### 10. Typo: Pit Trap Description
**Location**: `card-builders.js:20`

**Issue**: "they w reduce" should be "they will reduce"

**Impact**: Minor text display issue.

---

### 11. Typo: Merchant Description
**Location**: `dungeon-cards.js:89`

**Issue**: "Costs 1 one gem" should be "Costs 1 gem"

**Impact**: Minor text display issue.

---

### 12. Typo: Enemy Description
**Location**: `card-builders.js:60`

**Issue**: "you lose you will take" should be "you will take"

**Impact**: Minor text display issue.

---

## Design Issues & Edge Cases

### 13. Async Callback Issues
**Location**: `dungeon-cards.js:110, 166`

**Issue**: Merchant and Wizard return `true` immediately, marking the card as resolved before the user selects an item.

```javascript
game.getUserInputInventoryCardSelection(
  "Purchase an inventory item...",
  (card) => {
    // This callback executes AFTER the card is resolved
    game.inventory.stock = game.inventory.stock.filter(...);
    game.inventory.available.push(card);
    game.loseGem(this);
  },
)
// Card is marked resolved immediately:
return true
```

**Impact**:
- Card is marked as resolved before selection completes
- User can cancel/close modal and card stays resolved without gaining item
- No error handling if user doesn't select

**Expected**: Should wait for user selection before resolving.

**TODO Comments**: Code already acknowledges this issue.

---

### 14. Context Loss in Callbacks
**Location**: `dungeon-cards.js:107, 162`

**Issue**: Inside the callback, `this` refers to the card definition object, not the dungeon card instance.

```javascript
(card) => {
  // ...
  game.loseGem(this);  // 'this' is the card definition, not the card instance
}
```

**Impact**: May cause issues with display or logging, as the card reference is not what's expected.

---

### 15. No Maximum Health Check
**Location**: `index.js:403-416` (`_gainCard`)

**Issue**: While healing description says "up to your max health", there's no enforcement.

```javascript
_gainCard(key, amount) {
  if (!amount) { amount = 1; }
  for (let i = 0; i < amount; i += 1) {
    if (this[key].stock.length === 0) {
      return;  // Stops when stock is empty
    }
    const card = this[key].stock.pop();
    this[key].available.push(card);
  }
}
```

**Impact**: Currently works correctly because the stock pile prevents over-healing (all 5 health cards start in available). But the logic relies on setup rather than explicit constraints.

**Note**: This might be intentional - the stock/available pattern naturally enforces max health.

---

### 16. No Minimum Gem Check for Damage Reduction
**Location**: Missing feature

**Issue**: No implementation for using gems to reduce damage on pit traps or combat.

**Impact**:
- Visible pit traps don't allow gem usage
- Hidden pit traps claim to auto-use gems but don't
- Combat damage can't be reduced with gems

**Expected**: According to GAME_RULES.md, gems should reduce damage 1:1.

---

### 17. No Dungeon Depletion Check
**Location**: Missing feature

**Issue**: No check for when dungeon deck runs out of cards.

**Impact**: If player explores all 27 dungeon cards, what happens? No handling for this edge case.

**Expected**: Either prevent placement when deck is empty, or trigger some end condition.

---

### 18. No Render After Fate Check
**Location**: `card-builders.js:63-70` (enemy resolver)

**Issue**: Combat resolution doesn't update the fate deck display until after the modal is dismissed.

```javascript
resolver: function (game) {
  const value = game.fateCheck();  // Fate deck changes here
  if (value < minFateToDefeat) {
    game.loseHealth(this, damageTakenIfUnsuccessful);
  } else if (value === 10) {
    this.resolveCriticalSuccess(game);
  }
  return true;
  // Render only happens after this returns
}
```

**Impact**: Player doesn't see which fate card was drawn during combat. Reduces game clarity.

---

### 19. Empty Inventory Selection
**Location**: `index.js:362-370` (`getUserInputInventoryCardSelection`)

**Issue**: If inventory stock is empty, the selection only shows Exit card.

```javascript
getUserInputInventoryCardSelection(message, callback) {
  const renderer = new GameRenderer(this);
  renderer.renderUserInputCardSelection(
    message,
    this.inventory.stock.concat([new Card(SPADES, ACE)]),
    callback,
  );
}
```

**Impact**:
- If all inventory items have been obtained, merchant/wizard only offers Exit
- This might be intentional, but seems odd from gameplay perspective
- Should probably offer items from available pile or show error

---

### 20. Modal Click-Anywhere-To-Close Race Condition
**Location**: `index.js:798-804`

**Issue**: Messages have click-anywhere-to-close, which might conflict with button clicks.

```javascript
if (!disableClickAnywhereToClose) {
  messageElement.onclick = (() => {
    messageElement.classList.remove("visible");
    onAccept();
  });
}
```

**Impact**: Clicking anywhere on the modal triggers the callback. If buttons are inside the modal, clicking them triggers both the button action AND the modal close action.

---

## Summary Statistics

- **Critical Bugs**: 4 (game-breaking)
- **Major Bugs**: 5 (incorrect behavior)
- **Minor Bugs**: 3 (typos)
- **Design Issues**: 8 (edge cases, missing features)

**Total Issues**: 20

## Recommended Priority

**P0 (Must Fix)**:
1. #1 - Card selection buttons not rendered
2. #2 - No game over detection
3. #3 - Missing game functions (Exit/Dragon Queen)
4. #4 - Fate deck duplication

**P1 (Should Fix)**:
5. #5 - Hidden pit trap gem reduction
6. #6 - Generous Wizard costs gem
7. #7 - Young Dragon wrong reward amount
8. #8 - Passage resolver parameters
9. #9 - Passages match resolved cards

**P2 (Nice to Fix)**:
10-12. Typos
13-16. Async and design issues

**P3 (Consider)**:
17-20. Edge cases and polish

---

## Cross-Reference with GAME_RULES.md

### Confirmed Accurate Rules
- ✅ Resource card effects (Gem, Healing, Treasure)
- ✅ Enemy requirements and damage values
- ✅ Passage matching concept
- ✅ Fate deck composition (Hearts 6-10)
- ✅ Dungeon deck composition (27 cards)

### Rules That Don't Match Implementation
- ❌ **Gem usage for damage reduction** - Described but not implemented
- ❌ **Automatic gem usage for hidden traps** - Described but broken
- ❌ **Victory condition** - Described but not implemented
- ❌ **Dungeon reset** - Described but not implemented
- ❌ **Young Dragon critical reward** - Says 3 gems, gives 1
- ❌ **Generous Wizard** - Says free, costs 1 gem

### Rules That May Be AI Mistakes
The GAME_RULES.md correctly identifies these as missing:
- ✅ "The `defeatDragonQueen()` function exists but the victory condition logic is incomplete"
- ✅ "The `resetDungeon()` function is called by Exit cards but not fully implemented"
- ✅ Inventory item usage is not implemented

---

## Testing Recommendations

1. **Test Merchant/Wizard**: Verify card selection works at all
2. **Test Combat to 0 Health**: Verify game over triggers
3. **Test Exit Card**: Verify doesn't crash
4. **Test Multiple Combats**: Verify fate deck doesn't duplicate
5. **Test Hidden Pit Trap**: Verify gem reduction works
6. **Test Passages**: Verify matching logic works correctly
7. **Test Young Dragon Critical**: Verify gem count
8. **Test Generous Wizard**: Verify doesn't cost gem
9. **Test Deck Depletion**: Place all 27 dungeon cards
10. **Test Healing Beyond Max**: Verify can't exceed 5 health
