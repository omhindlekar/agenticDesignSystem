import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cacheKey, storedResult } from './fake.js';
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
    const key = cacheKey(opts.model, opts.maxTokens, prompt, opts.tools);
    const cachePath = join(this.cacheDir, `${key}.json`);

    if (existsSync(cachePath)) {
      return storedResult(JSON.parse(readFileSync(cachePath, 'utf8')) as CacheEntry);
    }

    const result = await this.inner.complete(prompt, opts);

    // Fetched page text is never written (FR-24): only the answer, tool log and usage.
    const entry: CacheEntry = { ...storedResult(result), costUsd: result.costUsd, cachedAt: new Date().toISOString() };
    writeFileSync(cachePath, JSON.stringify(entry), 'utf8');

    return result;
  }
}
