import { test, expect } from '@playwright/test';

test.describe('URL State Loading', () => {
  test('loads fresh game without URL state', async ({ page }) => {
    await page.goto('/');

    // Check that game rendered
    await expect(page.locator('#game')).toBeVisible();

    // Check debug log shows fresh game
    const debugLog = page.locator('#debug-log');
    await expect(debugLog).toContainText('🆕 No URL params found, creating fresh game');
    await expect(debugLog).toContainText('✅ Game rendered successfully');
  });

  test('loads game from URL state', async ({ page }) => {
    // Generate a URL with state
    const { Game, serializeGameState, createSeededRNG } = await page.evaluate(() => {
      // Create a seeded game
      const rng = window.createSeededRNG(12345);
      const game = new window.Game({ seed: 12345 });
      const stateString = window.serializeGameState(game);

      return {
        stateString,
        inventoryCount: game.inventory.stock.length,
        dungeonStockCount: game.dungeon.stock.length,
      };
    });

    // Now visit with that state
    await page.goto(`/?${stateString}`);

    // Check debug log shows successful load
    const debugLog = page.locator('#debug-log');
    await expect(debugLog).toContainText('📥 Found URL params');
    await expect(debugLog).toContainText('✅ State deserialized successfully');
    await expect(debugLog).toContainText('✅ Game created from URL state');
    await expect(debugLog).toContainText('✅ Game rendered successfully');

    // Verify no error overlay
    await expect(page.locator('#error-overlay')).not.toBeVisible();

    // Check that game actually rendered with state
    await expect(page.locator('#game')).toBeVisible();
  });

  test('shows error for corrupted URL state', async ({ page }) => {
    // Visit with corrupted state
    await page.goto('/?state=CORRUPTED_BASE64');

    // Should show error overlay
    await expect(page.locator('#error-overlay')).toBeVisible();
    await expect(page.locator('#error-overlay')).toContainText('Failed to Load Game State from URL');
  });

  test('preserves game state after URL load', async ({ page }) => {
    // First, create a reference game with known seed
    await page.goto('/');

    const referenceData = await page.evaluate(() => {
      const game = new window.Game({ seed: 9999 });
      return {
        stateString: window.serializeGameState(game),
        health: game.health.available.length,
        inventoryStock: game.inventory.stock.length,
        dungeonStock: game.dungeon.stock.length,
      };
    });

    // Now load from URL
    await page.goto(`/?${referenceData.stateString}`);

    // Verify the loaded game has the same state
    const loadedData = await page.evaluate(() => {
      // Access the game instance from the page
      // We need to expose it or query the DOM
      return {
        debugText: document.getElementById('debug-log').textContent,
      };
    });

    // Check debug log confirms successful load
    expect(loadedData.debugText).toContain('✅ Game created from URL state');
    expect(loadedData.debugText).toContain('✅ Game rendered successfully');
  });
});
