import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createProvider } from '../../packages/provider/src/index.js';
import { buildBuilderPrompt, parseBuilderResponse, validateBuilderOutput, typeCheckBuilderOutput } from './tools.js';
import { BuilderOutputSchema } from './schema.js';
import type { ProviderConfig } from '../../packages/provider/src/types.js';
import type { BuilderInput, BuilderOutput } from './schema.js';

interface Config extends ProviderConfig {
  costCapPerRunUsd: number;
}

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return raw;
}

export async function runBuilder(
  input: BuilderInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<BuilderOutput> {
  const config = loadConfig(repoRoot);
  const provider = createProvider(config, repoRoot);

  const prompt = buildBuilderPrompt(input, previousError);
  const { text } = await provider.complete(prompt, { model: config.model, maxTokens: 4096 });

  const tsx = parseBuilderResponse(text);

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
