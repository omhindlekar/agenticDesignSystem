import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // generated/stories holds screens made by npm run generate (gitignored, local only).
  stories: ['../components/**/*.stories.tsx', '../examples/**/*.stories.tsx', '../generated/stories/*.stories.tsx'],
  addons: ['storybook-addon-pseudo-states'],
  core: {
    disableTelemetry: true,
  },
  // Generated screens import the design system as @ads/components, as the Builder writes them.
  viteFinal: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      '@ads/components': fileURLToPath(new URL('../components/index.ts', import.meta.url)),
    };
    // The Builder's type-check scratch folders come and go during generate runs; ignore them.
    config.server ??= {};
    config.server.watch = { ...(config.server.watch ?? {}), ignored: ['**/.ads-typecheck-tmp-*/**', '**/runs/**'] };
    return config;
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
