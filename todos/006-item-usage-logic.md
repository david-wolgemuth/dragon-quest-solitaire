# Item Usage Logic

Inventory items (King, Queen, Jack, Jokers) cannot be used by the player.

## Required Functionality

### Click Handler
Implement `handleClickItem()` from the renderer to allow clicking inventory items during appropriate game phases.

### King of Spades - Redo Fate Check
- Allow usage during combat
- Discard current fate card
- Draw new fate card
- Update combat result

### Queen of Spades - No Damage for Snare
- Show card first, before damage
- Get user input to use Queen
- Negate damage from pit trap
- OR: Add 1 to fate check value

### Jack of Spades - Secret Passage Wildcard
- Click item to activate
- Highlight any card to bypass
- Bypass selected card (treat as resolved)
- Decision: Should it bypass ANY card or only specific types?

### Jokers - Choose Which Power
- Get user input after seeing card
- Let player choose King/Queen/Jack effect
- Apply chosen effect

## UI/UX Considerations

- Need user input modal **after** card is revealed
- Need user input **before** damage is applied
- Need visual feedback for which items are usable when
- Consider disabling items when not applicable
