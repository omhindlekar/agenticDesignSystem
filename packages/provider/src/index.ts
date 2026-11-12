import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { FakeProvider } from './fake.js';
import { CachingProvider } from './cache.js';
import { ApiProvider } from './api.js';
import { ClaudeCliProvider } from './cli.js';
import type { ModelProvider, ProviderConfig } from './types.js';

export { FakeProvider } from './fake.js';
export { CachingProvider } from './cache.js';
export { ApiProvider } from './api.js';
export { ClaudeCliProvider } from './cli.js';
export type { ModelProvider, CompleteOptions, CompleteResult, ProviderConfig } from './types.js';

export function createProvider(config: ProviderConfig, repoRoot: string): ModelProvider {
  const name = process.env['MODEL_PROVIDER'] ?? config.provider ?? 'fake';

  let base: ModelProvider;

  switch (name) {
    case 'fake': {
      const fixturesDir = join(repoRoot, 'evals', 'fixtures', 'provider');
      base = new FakeProvider(fixturesDir);
      break;
    }
    case 'api':
      base = new ApiProvider(config.pricing);
      break;
    case 'claude-cli':
      base = new ClaudeCliProvider();
      break;
    default:
      throw new Error(
        `Unknown provider: "${name}". Valid values: fake, api, claude-cli. ` +
          `Set MODEL_PROVIDER env var or config.provider.`,
      );
  }

  if (config.cache?.enabled !== false) {
    const cacheDir = join(repoRoot, 'runs', '.provider-cache');
    mkdirSync(cacheDir, { recursive: true });
    return new CachingProvider(base, cacheDir);
  }

  return base;
}
