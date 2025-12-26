# Dragon Quest Solitaire - Codebase Overview

A single-player dungeon-crawling card game built with vanilla JavaScript. Navigate procedurally-generated dungeons, fight monsters, collect treasures, and defeat the Dragon Queen.

## Project Structure

```
dragon-quest-solitaire/
├── index.html              # Main game page
├── styles.css              # Game styling
├── cards.js                # Card constants (SUITS, VALUES)
├── card-builders.js        # Factory functions for card types
├── dungeon-cards.js        # Card behavior definitions
├── index.js                # Game logic and rendering
├── GAME_RULES.md           # Complete game rules
└── test/                   # Test suite (Vitest)
```

## Core Architecture

### Model-View Pattern

**Model** (`Game` class in `index.js`)
- Manages all game state
- 5 resource piles: health, gems, inventory, fate, dungeon
- Dynamic 2D dungeon grid with auto-expansion
- Card resolution logic

**View** (`GameRenderer` class in `index.js`)
- Handles all DOM manipulation
- Renders dungeon grid, resource piles, modals
- Separated from game logic for testability

### Card System

**Card Model** (`cards.js`)
```javascript
class Card {
  suitKey: string    // HEARTS, CLUBS, DIAMONDS, SPADES, BLACK, RED
  valueKey: string   // ACE through KING, JOKER

  get suit()  // Returns SUITS[suitKey]
  get value() // Returns VALUES[valueKey]
}
```

**Card Behaviors** (`dungeon-cards.js`)
- Declarative definitions indexed by `[suit][value]`
- Each card has: `name`, `description`, `resolver` function
- Resolver returns `true` to mark card as resolved

**Card Factories** (`card-builders.js`)
- `buildPitTrapCard()` - Damage mechanics
- `buildPassageCard()` - Matching pair logic
- `buildEnemyCard()` - Combat with fate checks

## Game Mechanics

### Resource Piles
Each pile has `{ stock: Card[], available: Card[] }` structure:

1. **Health** - Hearts A-5 (5 cards)
   - Start: All in `available`
   - Game over when `available` reaches 0

2. **Gems** - Diamonds A-10 (10 cards)
   - Start: All in `stock`
   - Used to reduce damage or purchase from merchants

3. **Inventory** - Hearts/Diamonds J-K + Red Joker (7 cards)
   - Start: Shuffled in `stock`
   - Items gained from treasure chests

4. **Fate** - Hearts 6-10 (5 cards)
   - Start: Shuffled in `stock`
   - Used for combat resolution (draw → check value → reshuffle when empty)

5. **Dungeon** - All Clubs + Spades + Black Joker (27 cards)
   - Start: Shuffled in `stock`, one placed face-down
   - Forms the dungeon as you explore

### Dungeon Grid

**Dynamic 2D Matrix**
- Starts with one face-down card
- Auto-expands when cards approach edges (max 7×5)
- Auto-contracts when at max size
- Cells marked `available` based on placement rules

**Placement Rules**
- Can only place adjacent to exactly one face-down card
- Face-up cards can be resolved (clicked)
- Face-down cards are unresolved/unexplored

### Combat System

1. Player clicks enemy card
2. `fateCheck()` draws from fate deck (returns 6-10)
3. Compare to enemy's requirement:
   - Success: Enemy defeated, no damage
   - Critical (10): Bonus reward
   - Failure: Take damage

**Enemy Cards**
- Slime (10 Spades): Need 7+, 1 damage
- Skeleton (J Spades): Need 8+, 1 damage
- Dragon Queen (Q Spades): Need 9+, 3 damage
- Troll (K Spades): Need 9+, 2 damage
- Young Dragon (Q Clubs): Need 10+, 1 damage
- Troll King (K Clubs): Need 9+, 3 damage

## Key Classes

### Game (`index.js:106-623`)
```javascript
new Game()                           // Initialize game state
game.addCardToDungeon({row, col})   // Place card from stock
game.resolveCard({row, col})         // Execute card's resolver
game.fateCheck()                     // Draw from fate deck (6-10)
game._gainCard(key, amount)          // Add cards to available
game._loseCard(key, amount)          // Remove cards from available
game.updateDungeon()                 // Expand/contract/update availability
game.render()                        // Render all UI
```

### Cell (`index.js:26-32`)
```javascript
{
  card: Card | null        // The card in this cell
  cardFaceDown: boolean    // true = unresolved/back showing
  available: boolean       // true = can interact
}
```

### GameRenderer (`index.js:625-869`)
```javascript
renderer.renderDungeon()              // Render dungeon grid
renderer.renderHealth/Gems/etc()      // Render resource piles
renderer.renderMessage(html)          // Show modal
```

## Design Patterns

1. **Factory Pattern** - Card builders encapsulate creation logic
2. **Strategy Pattern** - Card resolvers provide polymorphic behavior
3. **Data-Driven** - Cards are declarative configurations
4. **Closure** - Resolvers capture card config in scope
5. **Dynamic CSS** - Runtime generation of card styling rules

## Getting Started

### Run the Game
```bash
npm start                 # Starts server on http://localhost:8008
```

### Run Tests
```bash
npm test                  # 36 tests (all passing)
npm run test:coverage     # Coverage report
```

### Card Definition Example
```javascript
DUNGEON_CARDS[SPADES][SEVEN] = {
  name: 'Gem',
  description: 'Take 1 gem',
  resolver: function(game) {
    game.gainGem(this);
    return true;  // Mark as resolved
  }
};
```

## Documentation

- **GAME_RULES.md** - Complete gameplay rules and mechanics
- **CODE_STRUCTURE_ANALYSIS.md** - Detailed architecture analysis
- **BUG_REPORT.md** - Known issues (20 bugs documented)
- **TESTING_STRATEGY.md** - Testing approach and recommendations
- **test/README.md** - Test suite documentation

## Tech Stack

- **Language**: Vanilla JavaScript (ES6+)
- **DOM**: Direct DOM API (no framework)
- **Layout**: CSS Grid for dungeon
- **Testing**: Vitest + JSDOM
- **Server**: http-server (dev)

## Game Flow

```
1. Initialize → Place one face-down dungeon card
2. Player turn:
   a. Click empty cell → Place new card (face-up)
   b. Click face-up card → Resolve card effect
3. Card resolution:
   a. Execute resolver(game)
   b. Update resources (health, gems, inventory)
   c. Mark card as resolved (face-down)
4. Grid updates:
   a. Expand/contract as needed
   b. Recalculate available cells
5. Render → Display updated state
6. Check win/lose conditions
7. Repeat from step 2
```

## Win Conditions

1. Defeat Dragon Queen (Q Spades)
2. Use Exit card (A Spades)

## Current State

- ✅ Core gameplay functional
- ✅ All card types implemented
- ✅ Dungeon grid system working
- ✅ Combat system operational
- ✅ Test suite established (36 tests)
- ⚠️ Known bugs documented (see BUG_REPORT.md)
- ⚠️ Some features incomplete (victory screen, inventory usage)

See BUG_REPORT.md for prioritized list of issues to address.
