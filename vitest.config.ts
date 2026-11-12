import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/tests/**/*.test.ts',
      'checks/*/tests/**/*.test.ts',
      'agents/*/tests/**/*.test.ts',
    ],
    environment: 'node',
  },
});
