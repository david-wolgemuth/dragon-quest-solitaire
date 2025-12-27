import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['*.js'],
      exclude: ['vitest.config.js', 'test/**'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    }
  }
});
