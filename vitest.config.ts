import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    include: [
      'packages/*/tests/**/*.test.ts',
      'checks/*/tests/**/*.test.{ts,tsx}',
      'agents/*/tests/**/*.test.ts',
      'components/*/tests/**/*.test.{ts,tsx}',
      'scripts/tests/**/*.test.ts',
    ],
    // Component tests opt into jsdom with a `// @vitest-environment jsdom` comment.
    environment: 'node',
  },
});
