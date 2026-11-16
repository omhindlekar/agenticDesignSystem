import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ModelProvider, CompleteOptions, CompleteResult } from './types.js';

export function hashKey(model: string, maxTokens: number, prompt: string): string {
  return createHash('sha256').update(`${model}|${maxTokens}|${prompt}`).digest('hex');
}

/** Cache and fixture key: plain calls keep hashKey; calls with web tools get their own. */
export function cacheKey(model: string, maxTokens: number, prompt: string, tools?: readonly string[]): string {
  return tools?.length ? hashKey(model, maxTokens, `${prompt}\n|tools:${[...tools].sort().join(',')}`) : hashKey(model, maxTokens, prompt);
}

/** What a stored response may carry back: never fetched page text. */
export function storedResult(raw: CompleteResult): CompleteResult {
  return {
    text: raw.text,
    costUsd: 0,
    ...(raw.toolLog ? { toolLog: raw.toolLog } : {}),
    ...(raw.usage ? { usage: raw.usage } : {}),
  };
}

export class FakeProvider implements ModelProvider {
  /** Looks in each directory in turn (replay also reads the real-model cache). */
  private readonly dirs: string[];
  constructor(fixturesDir: string | string[]) {
    this.dirs = Array.isArray(fixturesDir) ? fixturesDir : [fixturesDir];
  }

  private get fixturesDir(): string {
    return this.dirs.join(', ');
  }

  async complete(prompt: string, opts: CompleteOptions): Promise<CompleteResult> {
    const key = cacheKey(opts.model, opts.maxTokens, prompt, opts.tools);
    const fixturePath = this.dirs.map((d) => join(d, `${key}.json`)).find((p) => existsSync(p));

    if (!fixturePath) {
      throw new Error(
        `FakeProvider: no fixture for hash ${key}.\n` +
          `Fixture directory: ${this.fixturesDir}\n` +
          `To record a real response, run with MODEL_PROVIDER=api or MODEL_PROVIDER=claude-cli.\n` +
          `Prompt preview: ${prompt.slice(0, 120)}`,
      );
    }

    return storedResult(JSON.parse(readFileSync(fixturePath, 'utf8')) as CompleteResult);
  }
}
