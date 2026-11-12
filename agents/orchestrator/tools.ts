import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';
import { ContextPackSchema } from '../../packages/schemas/src/context-pack.js';
import type { ContextPack } from '../../packages/schemas/src/context-pack.js';
import type { ScreenSpec } from '../../packages/schemas/src/screen-spec.js';
import type { TaskInput, OrchestratorResult } from './schema.js';

interface Config {
  retryLimit: number;
  costCapPerRunUsd: number;
}

export interface OrchestratorDeps {
  contextRunner: (input: { taskId: string; task: string }) => Promise<ContextPack>;
  composerRunner: (input: { taskId: string; brief: string; contextPack: ContextPack }) => Promise<unknown>;
  builderRunner: (input: { taskId: string; spec: ScreenSpec; contextPack: ContextPack }) => Promise<unknown>;
  config?: Config;
  repoRoot?: string;
}

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as {
    retryLimit: number;
    costCapPerRunUsd: number;
  };
  return { retryLimit: raw.retryLimit, costCapPerRunUsd: raw.costCapPerRunUsd };
}

async function withRetry<T>(
  fn: () => Promise<T>,
  validate: (v: unknown) => T,
  retryLimit: number,
): Promise<{ value: T; attempts: number } | { error: string; attempts: number }> {
  let lastError = '';
  for (let attempt = 1; attempt <= retryLimit + 1; attempt++) {
    try {
      const raw = await fn();
      const parsed = validate(raw);
      return { value: parsed, attempts: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === retryLimit + 1) break;
    }
  }
  return { error: lastError, attempts: retryLimit + 1 };
}

export async function runOrchestrator(
  input: TaskInput,
  deps: OrchestratorDeps,
): Promise<OrchestratorResult> {
  const runId = randomUUID();
  const repoRoot = deps.repoRoot ?? join(new URL(import.meta.url).pathname, '..', '..', '..');
  const config = deps.config ?? loadConfig(repoRoot);

  // Step 1: Context agent (no retry — runtime errors escalate immediately)
  let contextPack: ContextPack;
  try {
    const raw = await deps.contextRunner({ taskId: input.taskId, task: input.brief });
    contextPack = ContextPackSchema.parse(raw);
  } catch (err) {
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Context agent failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Step 2: Composer agent (retry up to retryLimit on schema failure)
  const composerResult = await withRetry(
    () => deps.composerRunner({ taskId: input.taskId, brief: input.brief, contextPack }),
    (v) => ScreenSpecSchema.parse(v),
    config.retryLimit,
  );

  if ('error' in composerResult) {
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Composer failed after ${composerResult.attempts} attempt(s): ${composerResult.error}`,
    };
  }

  const spec = composerResult.value;

  // Step 3: Builder agent (retry up to retryLimit on schema failure)
  const builderResult = await withRetry(
    () => deps.builderRunner({ taskId: input.taskId, spec, contextPack }),
    (v) => {
      if (typeof v !== 'string') throw new Error(`Builder must return a string, got ${typeof v}`);
      return v;
    },
    config.retryLimit,
  );

  if ('error' in builderResult) {
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Builder failed after ${builderResult.attempts} attempt(s): ${builderResult.error}`,
    };
  }

  return {
    taskId: input.taskId,
    runId,
    outcome: 'pass',
    tsx: builderResult.value,
  };
}
