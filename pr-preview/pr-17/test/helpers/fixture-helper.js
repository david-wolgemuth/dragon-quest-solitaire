import fs from 'fs';
import path from 'path';

/**
 * Helper class for managing test fixtures
 * Automatically saves game states as fixtures during integration tests
 */
export class FixtureHelper {
  constructor() {
    this.fixturesDir = path.join(process.cwd(), 'test', 'fixtures');

    // Ensure fixtures directory exists
    if (!fs.existsSync(this.fixturesDir)) {
      fs.mkdirSync(this.fixturesDir, { recursive: true });
    }
  }

  /**
   * Save a fixture from a test
   * This should be called automatically at the end of every integration test
   *
   * @param {Object} options
   * @param {string} options.name - Fixture name (kebab-case, e.g., 'mid-game-with-items')
   * @param {string} options.description - Human-readable description
   * @param {Object} options.state - Deserialized game state object
   * @param {Object} [options.metadata] - Optional metadata (seed, turnCount, etc.)
   * @returns {string} Path to saved fixture file
   */
  saveFixture({ name, description, state, metadata = {} }) {
    const fixture = {
      name,
      description,
      createdAt: new Date().toISOString(),
      metadata,
      state
    };

    const fixturePath = path.join(this.fixturesDir, `${name}.json`);
    fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));

    console.log(`💾 Saved fixture: ${name}`);
    return fixturePath;
  }

  /**
   * Load a fixture by name
   *
   * @param {string} name - Fixture name (without .json extension)
   * @returns {Object} Fixture data
   */
  loadFixture(name) {
    const fixturePath = path.join(this.fixturesDir, `${name}.json`);
    if (!fs.existsSync(fixturePath)) {
      throw new Error(`Fixture not found: ${name}`);
    }
    return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  }

  /**
   * Get all fixture names
   *
   * @returns {Array<string>} List of fixture names (without .json extension)
   */
  getAllFixtureNames() {
    if (!fs.existsSync(this.fixturesDir)) {
      return [];
    }

    return fs.readdirSync(this.fixturesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort();
  }

  /**
   * Clean up old fixtures (useful in beforeEach/beforeAll)
   * Optionally specify which fixtures to keep
   *
   * @param {Array<string>} [keepFixtures] - Fixture names to keep
   */
  cleanFixtures(keepFixtures = []) {
    if (!fs.existsSync(this.fixturesDir)) {
      return;
    }

    const files = fs.readdirSync(this.fixturesDir);
    for (const file of files) {
      const name = file.replace('.json', '');
      if (!keepFixtures.includes(name)) {
        fs.unlinkSync(path.join(this.fixturesDir, file));
      }
    }
  }
}

/**
 * Create a game state snapshot for fixture generation
 * Extracts the necessary state from a Game instance
 *
 * @param {Game} game - Game instance
 * @returns {Object} State object suitable for fixture
 */
export function createStateSnapshot(game) {
  // Use the deserializeGameState function that's already available
  // This ensures consistency with the actual serialization logic
  const { deserializeGameState, serializeGameState } = global.window || window;

  // Serialize then deserialize to get clean state object
  const stateString = serializeGameState(game);
  return deserializeGameState(stateString);
}

/**
 * Get current serialized state from the test debug div
 *
 * @returns {string} Serialized state string
 */
export function getCurrentStateString() {
  const debugDiv = document.getElementById('test-debug-state');
  if (!debugDiv) {
    throw new Error('Test debug div not found - game.render() may not have been called');
  }
  return debugDiv.dataset.state;
}
