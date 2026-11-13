import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createProvider } from '../../packages/provider/src/index.js';
import { buildComposerPrompt, parseComposerResponse } from './tools.js';
import type { ProviderConfig } from '../../packages/provider/src/types.js';
import type { ComposerInput } from './schema.js';
import type { ScreenSpec } from '../../packages/schemas/src/screen-spec.js';

interface Config extends ProviderConfig {
  costCapPerRunUsd: number;
}

/** Response size limit for this agent. Part of the fixture hash, so changing it re-records fixtures. */
export const COMPOSER_MAX_TOKENS = 2048;

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return raw;
}

export async function runComposer(
  input: ComposerInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<ScreenSpec> {
  return (await runComposerWithCost(input, previousError, repoRoot)).spec;
}

/** Same as runComposer, but also returns the model cost of this attempt. */
export async function runComposerWithCost(
  input: ComposerInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<{ spec: ScreenSpec; costUsd: number }> {
  const config = loadConfig(repoRoot);
  const provider = createProvider(config, repoRoot);

  const prompt = buildComposerPrompt(input, previousError);
  const { text, costUsd } = await provider.complete(prompt, { model: config.model, maxTokens: COMPOSER_MAX_TOKENS });

  return { spec: parseComposerResponse(input.taskId, text, input.contextPack), costUsd };
}
