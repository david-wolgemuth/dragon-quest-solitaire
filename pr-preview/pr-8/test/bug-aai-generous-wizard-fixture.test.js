import { describe, it, expect, beforeEach } from 'vitest';
import { FixtureHelper, createStateSnapshot } from './helpers/fixture-helper.js';

// Import required modules (sets window globals)
import '../src/cards/suits.js';
import '../src/cards/values.js';
import '../src/cards/card.js';
import '../src/cards/dungeon-cards.js';
import '../src/core/cell.js';
import '../src/utils/card-utils.js';
import '../src/utils/style-generator.js';
import '../src/state/url-state.js';
import '../src/core/game.js';
import '../src/core/game-renderer.js';

// Access globals from window
const { Game, createStyleSheet, Card } = window;

// Initialize stylesheet for rendering
createStyleSheet();

describe('Bug AAI: Generous Wizard Fixture Generation', () => {
  let fixtureHelper;
  let game;

  beforeEach(() => {
    fixtureHelper = new FixtureHelper();

    // Clear dynamic content
    const matrixElement = document.querySelector('#dungeon .matrix');
    if (matrixElement) matrixElement.innerHTML = '';

    const debugLog = document.querySelector('#debug-log');
    if (debugLog) debugLog.innerHTML = '';

    const testDebug = document.getElementById('test-debug-state');
    if (testDebug) testDebug.remove();
  });

  it('generates fixture with Generous Wizard ready to use', () => {
    // Create a new game
    game = new window.Game();

    // Mock displayResolution to immediately execute the callback
    game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
      callback();
    };

    // Mock displayMessage to do nothing
    game.displayMessage = () => {};

    // Give the player 3 gems so they can see the gem count doesn't decrease
    game._gainCard('gems', 3);

    // Place the Generous Wizard (Black Joker) in the dungeon at position (1, 1)
    const wizardCard = new Card(window.BLACK, window.JOKER);
    game.dungeon.matrix[1][1].card = wizardCard;
    game.dungeon.matrix[1][1].cardFaceDown = false; // Face-up and ready to use

    // Render the game to generate the state string
    game.render();

    // Create the fixture
    const state = createStateSnapshot(game);
    const fixturePath = fixtureHelper.saveFixture({
      name: 'bug-aai-generous-wizard',
      description: 'QA Fixture: Game with Generous Wizard (Black Joker) ready to use. Player has 3 gems. Click the Generous Wizard to verify it does NOT cost a gem.',
      state,
      metadata: {
        bug: 'AAI',
        bugTitle: 'Generous Wizard costs gem - should be free',
        testInstructions: [
          '1. Load the game with this fixture URL',
          '2. Note the current gem count (should be 3 gems)',
          '3. Click on the Generous Wizard (Black Joker card)',
          '4. Select any inventory item from the popup',
          '5. Verify gem count remains at 3 (does NOT decrease to 2)',
          '6. Verify the selected item is added to your inventory'
        ],
        expectedBehavior: 'Generous Wizard should be free - no gem cost',
        gems: 3,
        health: 5,
        wizardPosition: { row: 1, col: 1 }
      }
    });

    expect(fixturePath).toBeTruthy();
    console.log('\n📋 QA Test Instructions:');
    console.log('1. Copy the fixture URL from the generated file');
    console.log('2. Open the game in a browser with the fixture URL');
    console.log('3. Click the Generous Wizard (Black Joker)');
    console.log('4. Select any item');
    console.log('5. Verify gems remain at 3 (not decreased)\n');
  });

  it('generates fixture showing before/after state', () => {
    // This fixture shows what happens when the bug is NOT present
    game = new window.Game();

    game.displayResolution = (dungeonCard, amount, pileKey, callback) => {
      callback();
    };
    game.displayMessage = () => {};

    // Give player 5 gems to make it very obvious
    game._gainCard('gems', 5);

    // Place Generous Wizard
    const wizardCard = new Card(window.BLACK, window.JOKER);
    game.dungeon.matrix[1][1].card = wizardCard;
    game.dungeon.matrix[1][1].cardFaceDown = false;

    game.render();

    const state = createStateSnapshot(game);
    fixtureHelper.saveFixture({
      name: 'bug-aai-generous-wizard-5gems',
      description: 'QA Fixture: Generous Wizard with 5 gems - makes it easier to verify no cost',
      state,
      metadata: {
        bug: 'AAI',
        gems: 5,
        health: 5,
        wizardPosition: { row: 1, col: 1 },
        note: 'With 5 gems, it is very obvious if a gem is lost'
      }
    });

    expect(state).toBeTruthy();
  });
});
