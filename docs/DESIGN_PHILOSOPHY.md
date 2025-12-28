# Dragon Quest Solitaire - Design Philosophy

## Core Principles

### Simplicity First
- **Minimalist Design**: Use clean, simple layouts without unnecessary decoration
- **Default HTML Styles**: Prefer native HTML elements and default browser styles over custom CSS frameworks
- **No Complexity**: Avoid over-engineering - if a simple solution works, use it

### Instructive User Experience
- **Teach Through Play**: The game should teach players how to play as they interact with it
- **Clear Information**: Present all necessary information to understand what's happening
- **Explain Game State**: Always show why something happened (e.g., "You lost because health reached 0")
- **Visual Feedback**: Let players see the board state, even in end-game scenarios

### Transparent Game State
- **Always Visible**: Keep the game board visible at all times, even during modals or game over
- **Show Your Work**: Display why decisions were made (e.g., fate check results, damage calculations)
- **Statistics Matter**: Let players see their progress/score so they can track improvement

## Design Patterns

### Modals and Overlays
- Use semi-transparent overlays that don't completely hide the game board
- Keep modals concise with clear actions
- Always provide context for why the modal appeared

### Game Over State
When the game ends, the player should:
1. **Still see the board** - Don't hide their final game state
2. **Understand what happened** - Clear explanation ("Game Over - You ran out of health!")
3. **See their performance** - Show relevant stats (cards explored, gems collected, etc.)
4. **Have clear next action** - Prominent "Reset Game" button

### Information Hierarchy
1. **Critical info first**: What happened and why
2. **Context second**: Current game state (health, resources, etc.)
3. **Actions last**: What can the player do next

### Default HTML Approach
- Use `<button>`, `<table>`, `<div>` with minimal custom styles
- Rely on semantic HTML for accessibility
- Let the browser handle default styling when possible
- Only add CSS when it genuinely improves usability

## User Flow Principles

### Learning Through Feedback
- When something unexpected happens, explain it
- Show intermediate states (e.g., fate card during combat)
- Use modals to pause and explain complex mechanics

### Progressive Disclosure
- Don't overwhelm with all rules at once
- Explain mechanics when they first appear
- Tutorial mode can guide new players through first game

### Error Recovery
- Always provide a way to reset/restart
- Never leave the player in an unclear state
- Make recovery actions obvious and accessible

## Examples

### Good: Game Over Modal
```
┌─────────────────────────────────┐
│         GAME OVER               │
│                                 │
│  You ran out of health! ♥️      │
│                                 │
│  Final Stats:                   │
│  - Cards Explored: 12           │
│  - Gems Collected: 8            │
│  - Inventory: 3 items           │
│                                 │
│  [Reset Game]                   │
└─────────────────────────────────┘
     ↓ (semi-transparent overlay)
  [Game board still visible below]
```

### Bad: Hidden Game State
```
┌─────────────────────────────────┐
│    GAME OVER                    │
│    [Reset Game]                 │
└─────────────────────────────────┘
(Completely covers the board - player can't see what happened)
```

### Good: Instructive Card Resolution
```
You encountered a Troll!

Combat strength: 9
Fate check: 7 ♦️

Result: You lost! Lost 2 health ♥️♥️
```

### Bad: Unclear Feedback
```
Troll resolved.
```

## Implementation Guidelines

### When Adding Features
1. **Ask**: Does this teach the player something?
2. **Ask**: Can I use default HTML for this?
3. **Ask**: Will the player understand what just happened?
4. **Ask**: Is this the simplest solution?

### When Showing Game State Changes
- Always explain WHY something happened
- Show WHAT changed (before/after is helpful)
- Provide CONTEXT (is this good or bad for the player?)

### When Designing Modals
- Keep background visible (semi-transparent overlay)
- Explain the situation clearly
- Provide exactly one or two clear actions
- Never leave player stuck or confused

## Accessibility Notes

- Use semantic HTML elements
- Ensure modals can be dismissed with keyboard
- Color should not be the only way to convey information
- Text should be readable against backgrounds

## Performance Considerations

- Default HTML is fast
- Minimal CSS = faster loading
- Simple DOM structure = easier to debug
- Progressive enhancement over heavy frameworks
