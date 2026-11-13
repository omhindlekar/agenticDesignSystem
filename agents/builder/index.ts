import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createProvider } from '../../packages/provider/src/index.js';
import {
  buildBuilderPrompt,
  parseBuilderResponse,
  validateBuilderOutput,
  typeCheckBuilderOutput,
  loadComponentApis,
} from './tools.js';
import { BuilderOutputSchema } from './schema.js';
import type { ProviderConfig } from '../../packages/provider/src/types.js';
import type { BuilderInput, BuilderOutput } from './schema.js';

interface Config extends ProviderConfig {
  costCapPerRunUsd: number;
}

/** Response size limit for this agent. Part of the fixture hash, so changing it re-records fixtures. */
export const BUILDER_MAX_TOKENS = 4096;

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return raw;
}

export async function runBuilder(
  input: BuilderInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<BuilderOutput> {
  return (await runBuilderWithCost(input, previousError, repoRoot)).output;
}

/** Same as runBuilder, but also returns the model cost of this attempt. */
export async function runBuilderWithCost(
  input: BuilderInput,
  previousError?: string,
  repoRoot = join(new URL(import.meta.url).pathname, '..', '..', '..'),
): Promise<{ output: BuilderOutput; costUsd: number }> {
  const config = loadConfig(repoRoot);
  const provider = createProvider(config, repoRoot);

  const apis = loadComponentApis(repoRoot, input.contextPack.componentIds.map((c) => c.id));
  const prompt = buildBuilderPrompt(input, previousError, apis);
  const { text, costUsd } = await provider.complete(prompt, { model: config.model, maxTokens: BUILDER_MAX_TOKENS });

  const tsx = parseBuilderResponse(text);

  // Token lint — calls checks/token-lint, no code duplication
  const lintResult = validateBuilderOutput(tsx);
  if (!lintResult.valid) {
    const summary = lintResult.violations
      .map((v) => `line ${v.line}: [${v.pattern}] ${v.match}`)
      .join('; ');
    throw new Error(`Builder output failed token lint: ${summary}`);
  }

  // TypeScript type check on the generated TSX, against the real component props
  const typeResult = typeCheckBuilderOutput(tsx, repoRoot);
  if (!typeResult.valid) {
    throw new Error(`Builder output failed type check: ${typeResult.errors.slice(0, 3).join('; ')}`);
  }

  return { output: BuilderOutputSchema.parse({ taskId: input.taskId, tsx }), costUsd };
}
