import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildComposerPrompt, parseComposerResponse } from './tools.js';
import type { ComposerInput } from './schema.js';
import type { ScreenSpec } from '../../packages/schemas/src/screen-spec.js';

interface Config {
  model: string;
  costCapPerRunUsd: number;
}

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return { model: raw.model, costCapPerRunUsd: raw.costCapPerRunUsd };
}

export async function runComposer(
  input: ComposerInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<ScreenSpec> {
  const config = loadConfig(repoRoot);
  const client = new Anthropic();

  const prompt = buildComposerPrompt(input, previousError);

  const message = await client.messages.create({
    model: config.model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Composer: model returned no text content');
  }

  return parseComposerResponse(input.taskId, textBlock.text, input.contextPack);
}
