# Dragon Quest Solitaire - Game Rules

## Overview

Dragon Quest Solitaire is a single-player dungeon-crawling card game where you explore a randomly generated dungeon, fight monsters, collect treasures, and ultimately defeat the Dragon Queen to win.

## Setup

The game uses a standard deck of cards plus jokers, divided into different piles:

### Player Resources

1. **Health Pile**: Hearts A-5 (5 cards)
   - Start with all 5 health cards available
   - Losing health moves cards back to stock
   - Game over if you lose all health

2. **Gems Pile**: Diamonds A-10 (10 cards)
   - Start with all cards in stock (ordered from 10 down to Ace)
   - Gain gems by moving cards from stock to available
   - Use gems to reduce damage or purchase from merchants

3. **Inventory Pile**: Hearts J-K, Diamonds J-K, Red Joker (7 cards)
   - Start with all cards shuffled in stock
   - Gain items from treasure chests
   - Use items for special abilities (not fully implemented)

4. **Fate Deck**: Hearts 6-10 (5 cards)
   - Shuffled at game start
   - Used for combat resolution
   - Reshuffles when empty (used cards move to available pile)

### Dungeon

5. **Dungeon Deck**: All Clubs, All Spades, Black Joker (27 cards)
   - Shuffled at game start
   - Forms the dungeon matrix as you explore
   - Maximum dungeon size: 7 wide × 5 high

## Game Flow

### Starting the Game

1. Begin with one face-down card in the center of the dungeon
2. You can only place cards adjacent to existing cards
3. You can only add cards next to face-down (unresolved) cards

### Turn Structure

Each turn, you can either:
1. **Explore**: Place a new dungeon card adjacent to an existing face-down card
2. **Resolve**: Interact with a face-up dungeon card

### Dungeon Expansion

- Cards can only be placed adjacent to face-down cards
- The dungeon automatically expands and contracts to maintain optimal size
- Maximum size is 7 wide by 5 high
- Empty cells are only available if adjacent to exactly one face-down card

## Card Types & Effects

### Spades (Primary Dungeon)

| Card | Name | Effect |
|------|------|---------|
| **Ace** | Exit | Advance to next dungeon level. Win if Dragon Queen is defeated. |
| **2** | Hidden Pit Trap | Take 2 damage (mandatory). Gems reduce damage. |
| **3** | Visible Pit Trap | Take 1 damage (optional). Gems reduce damage. |
| **4-6** | Passages | Must find matching passage in Clubs to proceed. |
| **7** | Gem | Gain 1 gem. |
| **8** | Healing | Gain 2 health (up to maximum). |
| **9** | Treasure Chest | Gain 1 inventory item. |
| **10** | Slime | Combat: Need 7+ to defeat, 1 damage if failed. Critical: Heal 1. |
| **Jack** | Skeleton | Combat: Need 8+ to defeat, 1 damage if failed. Critical: Gain 1 gem. |
| **Queen** | Dragon Queen | Combat: Need 9+ to defeat, 3 damage if failed. Critical: Win game. |
| **King** | Troll | Combat: Need 9+ to defeat, 2 damage if failed. Critical: Gain 1 item. |

### Clubs (Secondary Dungeon)

| Card | Name | Effect |
|------|------|---------|
| **Ace** | Merchant | Purchase inventory item for 1 gem. |
| **2** | Visible Pit Trap | Take 2 damage (optional). |
| **3** | Visible Pit Trap | Take 3 damage (optional). |
| **4-6** | Passages | Must find matching passage in Spades to proceed. |
| **7-Jack** | Same as Spades equivalents |
| **Queen** | Young Dragon | Combat: Need 10+ to defeat, 1 damage if failed. Critical: Gain 3 gems. |
| **King** | Troll King | Combat: Need 9+ to defeat, 3 damage if failed. Critical: Gain 1 gem, 1 item, 1 health. |

### Special Cards

| Card | Name | Effect |
|------|------|---------|
| **Black Joker** | Generous Wizard | Choose any inventory item for free. |

## Important Game Mechanics

### Resolved Cards
- After successfully resolving a dungeon card, it flips face-down (becomes resolved)
- Resolved cards cannot be interacted with again
- Only face-up cards can be resolved

### Card Placement Rules
- You can only place new cards in empty cells
- Empty cells are only available if they're adjacent to exactly one face-down card
- The dungeon grid expands automatically as you explore
- When the dungeon reaches maximum size (7×5), it will trim unused edges

### User Interface
- **Green pulsing outline**: Indicates available actions (clickable cells)
- **Card backs**: Face-down/unresolved cards show a blue diamond pattern
- **Status table**: Shows current resources (Health, Inventory, Gems, Fate, Dungeon remaining)
- **Modal dialogs**: Used for card effects, merchant purchases, and game messages

## Combat System

When encountering an enemy:

1. **Fate Check**: Draw a card from the Fate Deck (Hearts 6-10)
2. **Success**: If the card value meets or exceeds the enemy's requirement, defeat the enemy
3. **Critical Success**: If you draw exactly a 10 of Hearts, gain the critical bonus
4. **Failure**: Take damage equal to the enemy's damage value
5. **Deck Management**: Used fate cards go to available pile; reshuffle when stock is empty

### Enemy Requirements

- **Slime**: Need 7+ to defeat (1 damage)
- **Skeleton**: Need 8+ to defeat (1 damage)
- **Troll**: Need 9+ to defeat (2 damage)
- **Dragon Queen**: Need 9+ to defeat (3 damage)
- **Young Dragon**: Need 10+ to defeat (1 damage)
- **Troll King**: Need 9+ to defeat (3 damage)

## Passages

- Passages (4-6 of Spades/Clubs) are impassable until you find their matching pair
- Example: 4 of Spades requires finding 4 of Clubs to proceed
- Both cards are marked as resolved when the pair is found
- If you try to resolve a passage without its pair, you get a message and the card remains unresolved

## Special Interactions

### Merchants & Wizards
- **Merchant (Ace of Clubs)**: Requires 1 gem to purchase any inventory item
- **Generous Wizard (Black Joker)**: Offers free choice of inventory items
- Both present a selection dialog including: Hearts/Diamonds J-Q-K, Red Joker, and Ace of Spades (Exit)

### Selection Mechanics
- Some cards require player choices (merchants, wizards)
- Selection dialogs show available options as clickable card buttons
- The game pauses until a selection is made

## Damage and Gems

- **Taking Damage**: Move health cards from available back to stock
- **Gems**: Can be spent to reduce incoming damage (1 gem = 1 damage reduction)
- **Healing**: Move health cards from stock to available (cannot exceed starting health)
- **Automatic Gem Usage**: Hidden pit traps automatically use gems to reduce damage if available

## Missing Game Features

The following features are referenced in the code but not yet fully implemented:

### Inventory Item Usage
- **Hearts/Diamonds Jack**: Planned special abilities (not implemented)
- **Hearts/Diamonds Queen**: Planned special abilities (not implemented)
- **Hearts/Diamonds King**: Planned special abilities (not implemented)
- **Red Joker**: Wildcard that can substitute for other inventory items

### Dragon Queen Victory State
- The `defeatDragonQueen()` function exists but the victory condition logic is incomplete
- Defeating the Dragon Queen should set a flag that makes the Exit card end the game

### Dungeon Reset Function
- The `resetDungeon()` function is called by Exit cards but not fully implemented
- Should shuffle dungeon cards back and start a new level

## Setup Instructions

### Physical Setup (if playing with real cards)
1. Remove all cards listed below from a standard deck + jokers
2. Organize into the five piles as described above
3. Shuffle only the Fate and Dungeon decks
4. Place one Dungeon card face-down in the center to start

### Digital Setup
- The game automatically handles all setup when you load the page
- Click "Reset Game" to start over at any time
- The interface shows your current resources in the status table

## Winning Conditions

1. **Primary Victory**: Defeat the Dragon Queen (Queen of Spades) then use an Exit (Ace of Spades)
2. **Critical Victory**: Defeat the Dragon Queen with a critical success (10 of Hearts)

## Losing Conditions

- **Health Depletion**: Lose all health cards
- **Deck Exhaustion**: Unable to make valid moves (not fully implemented)

## Strategy Tips

1. **Manage Resources**: Balance health, gems, and inventory carefully
2. **Passage Planning**: Look for passage pairs before committing to exploration
3. **Combat Preparation**: Save gems for difficult fights
4. **Risk Assessment**: Visible pit traps are optional - consider your current health
5. **Merchant Timing**: Use merchants strategically when you have gems to spare
6. **Exploration Order**: Prioritize face-down cards that might be beneficial (exits, healing)
7. **Gem Conservation**: Remember that hidden pit traps automatically consume gems
8. **Grid Management**: Plan your dungeon layout to avoid getting trapped with no valid moves

## Technical Notes

### Browser Compatibility
- Requires a modern browser with JavaScript enabled
- Uses CSS Grid for dungeon layout
- Modal dialogs for game interactions

### Visual Indicators
- **Green pulsing outline**: Available/clickable cells
- **Card suits displayed**: ♠️ ♣️ ♥️ ♦️ plus special symbols
- **Card values**: Standard A-K plus X for jokers

## Game Variants

The current implementation supports:
- **Standard Play**: As described above
- **Reset Function**: Start a new game at any time
- **Dungeon Progression**: Multiple levels (via Exit cards)

---

*Note: This is a work-in-progress game. Some features like inventory item usage and advanced game mechanics are still in development.*
