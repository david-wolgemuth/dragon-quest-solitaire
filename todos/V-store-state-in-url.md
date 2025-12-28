# Store Game State in URL

Store the current game state in the URL query string to enable:
- **QA testing**: Easy reproduction of specific game states
- **Agent-generated scenarios**: AI agents can create URLs for specific test cases
- **Sharing/debugging**: Share exact game state via URL

## What to Store

### Essential State
- Deck seed (for reproducible shuffles)
- Dungeon layout (card positions and types)
- Player health count
- Player gem count
- Inventory items (which items are owned)
- Fate deck state

### Optional State
- Current level/dungeon number
- Cards already resolved (face down)
- Any active effects

## Use Cases

### 1. QA Testing
Generate URLs for specific scenarios:
- "Start with 1 health, 0 gems, facing Dragon Queen"
- "Dungeon full of pit traps with no healing fountains"
- "Edge case: All passages already placed"

### 2. Agent-Generated Test Cases
AI agents can:
- Create URLs for bug reproduction
- Generate edge case scenarios
- Build test suite with specific game states

### 3. Test Library Integration
Use with vitest to:
- View generated query strings
- Validate URL parsing
- Test state reconstruction from URL
- Verify game state serialization/deserialization

## Implementation

### URL Format
```
https://example.com/?seed=abc123&health=3&gems=2&inv=KQJA&dungeon=...
```

### Functions Needed
- `serializeGameState()` - Convert game object to URL params
- `deserializeGameState()` - Parse URL and load game state
- `generateTestURL(scenario)` - Helper for creating test URLs

### Testing
```javascript
// Example test
import { serializeGameState, deserializeGameState } from './game'

test('serialize and deserialize game state', () => {
  const game = createTestGame({ health: 2, gems: 3 })
  const url = serializeGameState(game)
  const restored = deserializeGameState(url)
  expect(restored.health).toBe(2)
  expect(restored.gems).toBe(3)
})
```

## Benefits

- Faster QA cycles (no manual setup)
- Better bug reports (include exact state URL)
- Automated test scenario generation
- Easy sharing of interesting game states
- Regression testing for specific scenarios
