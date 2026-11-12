import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildBuilderPrompt, parseBuilderResponse, validateBuilderOutput } from './tools.js';
import { BuilderOutputSchema } from './schema.js';
import type { BuilderInput, BuilderOutput } from './schema.js';

interface Config {
  model: string;
  costCapPerRunUsd: number;
}

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return { model: raw.model, costCapPerRunUsd: raw.costCapPerRunUsd };
}

export async function runBuilder(
  input: BuilderInput,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<BuilderOutput> {
  const config = loadConfig(repoRoot);
  const client = new Anthropic();

  const prompt = buildBuilderPrompt(input);

  const message = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Builder: model returned no text content');
  }

  const tsx = parseBuilderResponse(textBlock.text);

  const result = validateBuilderOutput(tsx);
  if (!result.valid) {
    const summary = result.violations
      .map((v) => `line ${v.line}: [${v.pattern}] ${v.match}`)
      .join('; ');
    throw new Error(`Builder output failed token lint: ${summary}`);
  }

  return BuilderOutputSchema.parse({ taskId: input.taskId, tsx });
}
