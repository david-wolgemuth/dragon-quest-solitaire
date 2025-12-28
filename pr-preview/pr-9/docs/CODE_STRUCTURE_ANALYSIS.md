# Dragon Quest Solitaire - Code Structure Analysis

## Overview

This is a browser-based solitaire dungeon crawler game built with vanilla JavaScript. The codebase consists of four main JavaScript files that handle different aspects of the game architecture.

## File Structure

```
dragon-quest-solitaire/
├── index.html          # Main HTML structure
├── styles.css          # Styling (not analyzed)
├── cards.js            # Card constants and suit/value definitions
├── card-builders.js    # Factory functions for card types
├── dungeon-cards.js    # Card behavior definitions
└── index.js            # Main game logic, state, and rendering
```

## Architecture Pattern

The game follows a **Model-View pattern** with distinct separation of concerns:

- **Model**: `Game` class manages all game state
- **View**: `GameRenderer` class handles all DOM manipulation
- **Configuration**: Card definitions are declarative data structures
- **Behavior**: Card resolvers are functions attached to card definitions

---

## Card Modeling System

### 1. Card Structure (cards.js)

Cards are modeled using a **two-property system**:

```javascript
class Card {
  constructor(suitKey, valueKey) {
    this.suitKey = suitKey;  // Reference to SUITS object
    this.valueKey = valueKey; // Reference to VALUES object
  }

  get suit() { return SUITS[this.suitKey]; }
  get value() { return VALUES[this.valueKey]; }
}
```

**Suits** (`SUITS` object):
- Hearts (♥️), Clubs (♣️), Diamonds (♦️), Spades (♠️)
- Special: BLACK (⚫️), RED (🔴) for jokers
- Each suit has: `key`, `code`, `display`, and optional `isColor`

**Values** (`VALUES` object):
- Standard: ACE through KING (order 1-13)
- Special: JOKER (order 14)
- Each value has: `key`, `display`, `code`, and `order`

### 2. Card Behavior Definitions (dungeon-cards.js)

Dungeon cards are defined in a **nested object structure** indexed by `[suit][value]`:

```javascript
window.DUNGEON_CARDS = {
  [SPADES]: {
    [ACE]: { name, description, resolver, ... },
    [TWO]: { ... },
    // etc.
  },
  [CLUBS]: { ... },
  [BLACK]: { ... }
}
```

**Card Definition Structure**:
```javascript
{
  name: "Display name",
  symbol: "Optional symbol",
  description: "Game rule text",
  resolver: function(game) {
    // Game logic that executes when card is resolved
    // Returns true if card should be marked as resolved
    // Returns false if resolution failed
  },
  // Optional fields for enemy cards:
  resolveCriticalSuccess: function(game) { ... },
  resolveCriticalSuccessDescription: "..."
}
```

### 3. Card Builder Functions (card-builders.js)

Factory functions create common card types with shared behavior:

**buildPitTrapCard({ hidden, damage })**
- Creates trap cards with damage mechanics
- Hidden traps auto-use gems to reduce damage
- Visible traps require user confirmation

**buildPassageCard(suit, value)**
- Creates passage cards that require finding matching pairs
- Checks for opposite suit (Clubs ↔ Spades)
- Only resolves when both passages are found

**buildEnemyCard({ name, minFateToDefeat, damageTakenIfUnsuccessful, ... })**
- Creates combat encounters
- Uses fate deck for combat resolution
- Handles critical success (drawing 10 of Hearts)
- Applies damage on failure

---

## Game State Management

### Game Class Structure (index.js:106-623)

The `Game` class manages five resource piles, each with the same structure:

```javascript
{
  stock: Card[],      // Face-down cards (deck)
  available: Card[]   // Face-up cards (discard/hand)
}
```

**Resource Piles**:

1. **health** - Hearts A-5 (5 cards)
   - Start: All 5 in `available`
   - Losing health moves cards to `stock`

2. **inventory** - Hearts/Diamonds J-K + Red Joker (7 cards)
   - Start: All in `stock`, shuffled
   - Items gained through treasure chests

3. **gems** - Diamonds A-10 (10 cards)
   - Start: All in `stock`, reverse-ordered (10→A)
   - Gained from gem cards, spent on merchants/damage reduction

4. **fate** - Hearts 6-10 (5 cards)
   - Start: Shuffled in `stock`
   - Used for combat resolution
   - Reshuffles when empty

5. **dungeon** - All Clubs + Spades + Black Joker (27 cards)
   - Start: Shuffled in `stock`
   - Special structure: `matrix` (2D grid of Cells)

### Dungeon Grid System

The dungeon uses a **dynamic 2D matrix** with automatic expansion/contraction:

```javascript
class Cell {
  card: Card | null           // The card in this cell
  cardFaceDown: boolean       // true = unresolved/back showing
  available: boolean          // true = can interact with this cell
}
```

**Grid Management** (index.js:226-613):

1. **Expansion** (`_expandDungeon`): Adds rows/columns when cards approach edges
   - Max size: 7 wide × 5 high
   - Only expands if not at maximum

2. **Trimming** (`_trimDungeon`): Removes empty rows/columns when at max size
   - Maintains playable area within size limits

3. **Availability** (`_updateDungeonAvailability`):
   - Face-up cards are available for resolution
   - Empty cells adjacent to exactly ONE face-down card are available for placement
   - All other cells are unavailable

---

## Card Resolution Flow

### Player Actions

1. **Explore** (add card to dungeon):
   ```
   User clicks empty cell → addCardToDungeon() →
   Pop card from dungeon.stock → Place in cell (face-up) →
   updateDungeon() → render()
   ```

2. **Resolve** (interact with face-up card):
   ```
   User clicks face-up card → resolveCard() →
   Look up DUNGEON_CARDS[suit][value] →
   Execute resolver(game) →
   If returns true: flip card face-down →
   updateDungeon() → render()
   ```

### Resolver Pattern

Resolvers are **closures** that have access to the card definition and game state:

```javascript
resolver: function(game) {
  // 'this' refers to the card definition object
  // 'game' is the Game instance

  // Perform game logic
  game.loseHealth(this, 2);

  // Return true to mark as resolved, false to keep available
  return true;
}
```

Common resolver operations:
- `game.gainHealth(card, amount)` / `game.loseHealth(card, amount)`
- `game.gainGem(card)` / `game.loseGem(card)`
- `game.gainInventory(card)` / `game.loseInventory(card)`
- `game.fateCheck()` - Draw from fate deck, returns 6-10
- `game.foundPassage(suit, value)` - Check for matching passage
- `game.displayMessage(msg)` - Show modal to user
- `game.getUserInputInventoryCardSelection(msg, callback)` - User chooses card

---

## Rendering System

### GameRenderer Class (index.js:625-869)

**Separation of Concerns**:
- `Game` class handles state changes
- `GameRenderer` handles all DOM manipulation
- Renderer is instantiated fresh for each render operation

**Key Rendering Methods**:

1. **renderDungeon()** (lines 642-718):
   - Clears and rebuilds entire grid
   - Creates `<button>` for each cell
   - Applies CSS classes for card display
   - Attaches click handlers

2. **_renderStatsPiles(key)** (lines 844-868):
   - Shows stock pile as single card-back with count
   - Shows available pile as top card (face-up)
   - Used for health, inventory, gems, fate, dungeon

3. **Modal Rendering**:
   - `renderMessage()` - Simple message display
   - `renderFateCheckResolution()` - Combat/action results with custom buttons
   - `renderUserInputCardSelection()` - Card selection interface
   - `addTutorialModal()` - Currently disabled tutorial system

**CSS Class Pattern**:
```javascript
// Dynamic classes generated at startup
.card-H5  // Hearts 5
.card-SA  // Spades Ace
.card-BX  // Black Joker

// Classes use CSS ::after pseudo-elements to show card content
```

---

## Data Flow

### Game Initialization
```
main() → new Game() →
  Build 5 resource piles →
  Place first dungeon card face-down →
  updateDungeon() →
  render()
```

### Turn Flow (Explore)
```
User clicks empty cell →
addCardToDungeon({row, col}) →
  dungeon.stock.pop() →
  Place in cell (face-up) →
  updateDungeon() →
    _expandDungeon() →
    _trimDungeon() →
    _updateDungeonAvailability() →
  render() →
    renderDungeon() →
    renderHealth/Gems/Inventory/Fate()
```

### Turn Flow (Resolve)
```
User clicks face-up card →
resolveCard({row, col}) →
  Look up DUNGEON_CARDS[suit][value] →
  Execute resolver(game) →
    May trigger resource changes →
    May display modals →
    Returns true/false →
  If true: flip card face-down →
  updateDungeon() →
  render()
```

---

## Design Patterns & Techniques

### 1. Factory Pattern
- `buildPitTrapCard()`, `buildPassageCard()`, `buildEnemyCard()`
- Encapsulates common card creation logic

### 2. Strategy Pattern
- Each card has a `resolver` function
- Different cards implement different strategies
- Polymorphic behavior through function properties

### 3. Data-Driven Design
- Card behaviors are declarative data structures
- Game logic is separated from card definitions
- Easy to add new cards by adding to `DUNGEON_CARDS`

### 4. Closure Pattern
- Resolvers capture card configuration in closure
- `resolveCriticalSuccess` functions can access parent scope

### 5. Namespace Pattern
- Global `window.SUITS`, `window.VALUES`, `window.DUNGEON_CARDS`
- Avoids naming conflicts
- Makes data accessible across files

### 6. Dynamic CSS Generation
- `createStyleSheet()` generates CSS rules at runtime
- One rule per card for visual display
- Uses CSS pseudo-elements (::after) for content

---

## Strengths

1. **Clear Separation of Concerns**: Model, view, and data are well-separated
2. **Extensible Card System**: Easy to add new cards without changing core logic
3. **Declarative Card Definitions**: Card behavior is readable and maintainable
4. **Dynamic Grid System**: Dungeon grid expands/contracts automatically
5. **Resource Consistency**: All piles follow same stock/available pattern

## Areas for Improvement

1. **No Type Safety**: Plain JavaScript without TypeScript or JSDoc types
2. **Global State**: Heavy use of `window` globals
3. **Async Handling**: User input callbacks don't use Promises
4. **Renderer Coupling**: Renderer tightly coupled to DOM structure
5. **Missing Features**: Several TODO comments for incomplete features:
   - Inventory item usage (index.js:110)
   - Callback handling for card selection (dungeon-cards.js:110, 166)
   - Victory condition (defeatDragonQueen not fully implemented)
   - Dungeon reset function (resetDungeon stub)

---

## Card Categories

### Resource Cards (Spades/Clubs 7-9)
- **Gem** (7): Gain 1 gem
- **Healing** (8): Gain 2 health
- **Treasure Chest** (9): Gain 1 inventory item

### Enemy Cards (Spades/Clubs 10-K, Queen of Clubs)
- **Slime** (10): Defeat 7+, 1 damage, Critical: Heal 1
- **Skeleton** (J): Defeat 8+, 1 damage, Critical: Gain 1 gem
- **Troll** (K Spades): Defeat 9+, 2 damage, Critical: Gain item
- **Dragon Queen** (Q Spades): Defeat 9+, 3 damage, Critical: Win condition
- **Young Dragon** (Q Clubs): Defeat 10+, 1 damage, Critical: Gain 3 gems
- **Troll King** (K Clubs): Defeat 9+, 3 damage, Critical: Gem+Item+Health

### Hazard Cards (Spades/Clubs 2-3)
- **Hidden Pit Trap** (2 Spades): Mandatory 2 damage, auto-uses gems
- **Visible Pit Traps** (3 Spades, 2-3 Clubs): Optional damage

### Navigation Cards (Spades/Clubs 4-6)
- **Passages**: Require finding matching pair to resolve

### Special Cards
- **Exit** (Ace Spades): Advance to next level (or win if Dragon Queen defeated)
- **Merchant** (Ace Clubs): Purchase inventory item for 1 gem
- **Generous Wizard** (Black Joker): Free inventory item

---

## Technical Stack

- **Language**: Vanilla JavaScript (ES6+)
- **DOM Manipulation**: Direct DOM API (no framework)
- **Styling**: CSS Grid for dungeon layout
- **State Management**: Class-based encapsulation
- **Module Pattern**: Multiple script files loaded via HTML
- **Build System**: None (direct browser execution)
- **Server**: http-server for development (package.json:3)

---

## Conclusion

The codebase demonstrates a well-structured approach to browser-based game development using vanilla JavaScript. The card modeling system is flexible and extensible, using factory functions and resolver patterns to encapsulate behavior. The separation between game state (Game class) and presentation (GameRenderer class) follows sound software engineering principles, making the code maintainable and testable.

The use of a dynamic 2D grid for the dungeon, combined with automatic expansion and availability tracking, creates an elegant solution for managing spatial gameplay. The consistent resource pile structure (stock/available) provides a unified interface for managing different types of game resources.

While there are opportunities for improvement (TypeScript, better async handling, modularization), the current implementation successfully balances simplicity with functionality, resulting in a playable and extensible game system.
