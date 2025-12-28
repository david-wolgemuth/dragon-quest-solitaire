# Remove Test Code from Production

**Priority**: P2 (medium - code quality)
**Size**: S (small - ~30 minutes)
**Related**: #022 (URL state storage - completed)

## Problem

Production code (`index.js`) contains **test-only infrastructure** that runs in production:

```javascript
// index.js:656 - IN PRODUCTION CODE
render() {
  // ... game rendering ...

  // Update test debug div with serialized state (for integration tests)
  this._updateTestDebugDiv(stateString);  // ❌ Runs in production!
}

_updateTestDebugDiv(stateString) {
  let debugDiv = document.getElementById('test-debug-state');
  if (!debugDiv) {
    debugDiv = document.createElement('pre');
    debugDiv.id = 'test-debug-state';
    // ... 25 lines of DOM manipulation ...
    document.body.appendChild(debugDiv);
  }
  debugDiv.textContent = stateString;
  debugDiv.dataset.state = stateString;
}
```

## Impact

- **Performance**: Creates/updates DOM element on every render (even in production)
- **Security**: Exposes full game state in DOM (`data-state` attribute visible to anyone)
- **Code size**: ~30 lines of test infrastructure shipped to production
- **Maintainability**: Harder to understand what's production vs test code

## Solution

Use **dependency injection** to inject test infrastructure only during tests:

### Option 1: Debugger Interface (Recommended)

```javascript
// index.js
class Game {
  constructor(options = {}) {
    this.debugger = options.debugger || null;  // Inject debugger
    // ...
  }

  render() {
    // ... game rendering ...

    // Only call debugger if one was injected
    if (this.debugger) {
      this.debugger.onRender(serializeGameState(this));
    }
  }
}

// test/helpers/test-debugger.js
export class TestDebugger {
  onRender(stateString) {
    let debugDiv = document.getElementById('test-debug-state');
    if (!debugDiv) {
      debugDiv = document.createElement('pre');
      debugDiv.id = 'test-debug-state';
      debugDiv.style.cssText = '...';
      document.body.appendChild(debugDiv);
    }
    debugDiv.textContent = stateString;
    debugDiv.dataset.state = stateString;
  }
}

// test/fixture-generation.test.js
import { TestDebugger } from './helpers/test-debugger.js';

it('generates fixture', () => {
  const debugger = new TestDebugger();
  const game = new Game({ debugger });  // Inject test infrastructure
  game.render();

  // Get state from debugger
  const state = debugger.getCurrentState();
});
```

### Option 2: Event System (Alternative)

```javascript
// index.js
class Game {
  constructor(options = {}) {
    this.eventListeners = { render: [] };
  }

  on(event, callback) {
    this.eventListeners[event].push(callback);
  }

  render() {
    // ... game rendering ...

    // Emit event for any listeners
    this.eventListeners.render.forEach(cb => cb(serializeGameState(this)));
  }
}

// test/fixture-generation.test.js
it('generates fixture', () => {
  let currentState = null;
  const game = new Game();
  game.on('render', (state) => { currentState = state; });
  game.render();

  // Use captured state
  fixtureHelper.saveFixture({ state: deserializeGameState(currentState) });
});
```

## Files to Update

**Option 1 (Recommended):**
- Create: `test/helpers/test-debugger.js` (move debug div logic here)
- Update: `index.js` (remove `_updateTestDebugDiv`, add debugger injection)
- Update: `test/fixture-generation.test.js` (inject TestDebugger)
- Update: `test/helpers/fixture-helper.js` (use TestDebugger)

**Option 2:**
- Update: `index.js` (remove `_updateTestDebugDiv`, add event system)
- Update: `test/fixture-generation.test.js` (listen to render events)

## Benefits

- ✅ Production code is cleaner (no test infrastructure)
- ✅ Smaller production bundle (30 fewer lines)
- ✅ No performance overhead in production
- ✅ Better separation of concerns
- ✅ More flexible for future test needs

## Acceptance Criteria

- [ ] `index.js` contains no test-specific code
- [ ] All fixture generation tests still pass
- [ ] `TestDebugger` class exists in `test/helpers/`
- [ ] Production bundle size reduced
- [ ] No `test-debug-state` div created in production
