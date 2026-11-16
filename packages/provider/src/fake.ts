import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ModelProvider, CompleteOptions, CompleteResult } from './types.js';

export function hashKey(model: string, maxTokens: number, prompt: string): string {
  return createHash('sha256').update(`${model}|${maxTokens}|${prompt}`).digest('hex');
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
    const key = hashKey(opts.model, opts.maxTokens, prompt);
    const fixturePath = this.dirs.map((d) => join(d, `${key}.json`)).find((p) => existsSync(p));

    if (!fixturePath) {
      throw new Error(
        `FakeProvider: no fixture for hash ${key}.\n` +
          `Fixture directory: ${this.fixturesDir}\n` +
          `To record a real response, run with MODEL_PROVIDER=api or MODEL_PROVIDER=claude-cli.\n` +
          `Prompt preview: ${prompt.slice(0, 120)}`,
      );
    }

    const { text } = JSON.parse(readFileSync(fixturePath, 'utf8')) as CompleteResult;
    return { text, costUsd: 0 };
  }
}
