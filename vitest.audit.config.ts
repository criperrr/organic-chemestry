import { defineConfig } from 'vitest/config';

/**
 * Separate config for the nomenclature audit: it shells out to the OPSIN jar,
 * so it must never run as part of the normal `npm test`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tools/**/*.audit.ts'],
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
