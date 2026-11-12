import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { hashKey } from './fake.js';
import type { ModelProvider, CompleteOptions, CompleteResult } from './types.js';

interface CacheEntry extends CompleteResult {
  cachedAt: string;
}

export class CachingProvider implements ModelProvider {
  constructor(
    private readonly inner: ModelProvider,
    private readonly cacheDir: string,
  ) {
    mkdirSync(cacheDir, { recursive: true });
  }

  async complete(prompt: string, opts: CompleteOptions): Promise<CompleteResult> {
    const key = hashKey(opts.model, prompt);
    const cachePath = join(this.cacheDir, `${key}.json`);

    if (existsSync(cachePath)) {
      const { text } = JSON.parse(readFileSync(cachePath, 'utf8')) as CacheEntry;
      return { text, costUsd: 0 };
    }

    const result = await this.inner.complete(prompt, opts);

    const entry: CacheEntry = { ...result, cachedAt: new Date().toISOString() };
    writeFileSync(cachePath, JSON.stringify(entry), 'utf8');

    return result;
  }
}
