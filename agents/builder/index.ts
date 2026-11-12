import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildBuilderPrompt, parseBuilderResponse, validateBuilderOutput, typeCheckBuilderOutput } from './tools.js';
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
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<BuilderOutput> {
  const config = loadConfig(repoRoot);
  const client = new Anthropic();

  const prompt = buildBuilderPrompt(input, previousError);

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

  // Token lint — calls checks/token-lint, no code duplication
  const lintResult = validateBuilderOutput(tsx);
  if (!lintResult.valid) {
    const summary = lintResult.violations
      .map((v) => `line ${v.line}: [${v.pattern}] ${v.match}`)
      .join('; ');
    throw new Error(`Builder output failed token lint: ${summary}`);
  }

  // TypeScript type check on the generated TSX
  const typeResult = typeCheckBuilderOutput(tsx, repoRoot);
  if (!typeResult.valid) {
    throw new Error(`Builder output failed type check: ${typeResult.errors.slice(0, 3).join('; ')}`);
  }

  return BuilderOutputSchema.parse({ taskId: input.taskId, tsx });
}
