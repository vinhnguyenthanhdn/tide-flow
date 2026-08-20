import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Collect by property, not by a list of directories. The previous
    // include named tests/unit and tests/integration; the second did not
    // exist, and a file anywhere else under tests/ was never collected while
    // the run still reported success. A test the runner never saw is
    // indistinguishable from a test that passed.
    include: ['tests/**/*.test.js'],
    // Playwright owns tests/e2e -- npm run test:e2e is the only thing that
    // should run those.
    exclude: ['tests/e2e/**'],
    // vitest's default, pinned. An include that matches nothing has to be a
    // failure: a silent zero looks exactly like a suite that passed.
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 100,
        lines: 100,
      },
    },
  },
})
