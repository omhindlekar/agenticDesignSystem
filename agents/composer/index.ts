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

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return raw;
}

export async function runComposer(
  input: ComposerInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<ScreenSpec> {
  const config = loadConfig(repoRoot);
  const provider = createProvider(config, repoRoot);

  const prompt = buildComposerPrompt(input, previousError);
  const { text } = await provider.complete(prompt, { model: config.model, maxTokens: 2048 });

  return parseComposerResponse(input.taskId, text, input.contextPack);
}
