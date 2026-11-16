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

const ALIASES: Record<string, string> = { cli: 'claude-cli' };

/** The provider that will actually run: MODEL_PROVIDER env, then config.provider, then fake. */
export function resolveProviderName(config: ProviderConfig): string {
  const raw = process.env['MODEL_PROVIDER'] ?? config.provider ?? 'fake';
  return ALIASES[raw] ?? raw;
}

export function createProvider(config: ProviderConfig, repoRoot: string): ModelProvider {
  const name = resolveProviderName(config);

  let base: ModelProvider;

  switch (name) {
    case 'fake': {
      const fixturesDir = join(repoRoot, 'evals', 'fixtures', 'provider');
      base = new FakeProvider(fixturesDir);
      break;
    }
    case 'replay':
      // Replays a past run: recorded fixtures, then responses the real model gave earlier
      // (runs/.provider-cache). Never calls a model (FR-19).
      base = new FakeProvider([
        join(repoRoot, 'evals', 'fixtures', 'provider'),
        join(repoRoot, 'runs', '.provider-cache'),
      ]);
      break;
    case 'api':
      base = new ApiProvider(config.pricing);
      break;
    case 'claude-cli':
      base = new ClaudeCliProvider();
      break;
    default:
      throw new Error(
        `Unknown provider: "${name}". Valid values: fake, replay, api, claude-cli (alias: cli). ` +
          `Set MODEL_PROVIDER env var or config.provider.`,
      );
  }

  // The fake provider is never cached: its fixtures are the record, and a cache hit could
  // hide a missing fixture locally that CI would then fail on.
  if (config.cache?.enabled !== false && name !== 'fake' && name !== 'replay') {
    const cacheDir = join(repoRoot, 'runs', '.provider-cache');
    mkdirSync(cacheDir, { recursive: true });
    return new CachingProvider(base, cacheDir);
  }

  return base;
}
