/**
 * Agent registry: the runner for each agent name in config/pipeline.json. Adding an agent is
 * a folder under agents/ (instructions, schema, tools, tests), an entry here and a pipeline
 * step; the orchestrator does not change (NFR-10).
 */
import { join } from 'node:path';
import { guardedFs } from '../packages/permissions/src/index.js';
import { runContextAgent, detectInstructions } from './context/index.js';
import { runComposerWithCost } from './composer/index.js';
import { runBuilderWithCost } from './builder/index.js';
import { runQa } from './qa/index.js';
import type { DataStore } from './context/index.js';
import type { AgentRunner } from './orchestrator/tools.js';
import type { ContextPack } from '../packages/schemas/src/context-pack.js';
import type { ScreenSpec } from '../packages/schemas/src/screen-spec.js';

export interface RegistryOptions {
  repoRoot: string;
  store: DataStore;
  /** Golden-set id for the visual baseline. */
  baselineId?: string;
  /** Root for evidence files; QA writes under <runsDir>/<runId>/qa. */
  runsDir?: string;
}

export function createAgentRegistry(opts: RegistryOptions): Record<string, AgentRunner> {
  const { repoRoot, store } = opts;
  return {
    context: async ({ taskId, brief }) => {
      const flags = detectInstructions(brief);
      return {
        result: runContextAgent({ taskId, task: brief }, store),
        costUsd: 0,
        ...(flags.length ? { flags } : {}),
      };
    },
    composer: async ({ taskId, brief, outputs, previousError }) => {
      const { spec, costUsd } = await runComposerWithCost(
        { taskId, brief, contextPack: outputs['context'] as ContextPack },
        previousError,
        repoRoot,
      );
      return { result: spec, costUsd };
    },
    builder: async ({ taskId, outputs, previousError }) => {
      const { output, costUsd } = await runBuilderWithCost(
        { taskId, spec: outputs['composer'] as ScreenSpec, contextPack: outputs['context'] as ContextPack },
        previousError,
        repoRoot,
      );
      return { result: output.tsx, costUsd };
    },
    qa: async ({ taskId, runId, outputs }) => {
      const report = await runQa(
        {
          taskId,
          runId,
          spec: outputs['composer'] as ScreenSpec,
          tsx: outputs['builder'] as string,
          ...(opts.baselineId ? { baselineId: opts.baselineId } : {}),
        },
        { repoRoot, ...(opts.runsDir ? { evidenceDir: join(opts.runsDir, runId, 'qa') } : {}) },
      );
      // Keep the report beside the run log, so failures can be read later (QA writes only under runs/<id>/qa).
      if (opts.runsDir) {
        const fs = guardedFs('qa', repoRoot);
        fs.mkdir(join(opts.runsDir, runId, 'qa'));
        fs.writeFile(join(opts.runsDir, runId, 'qa', `report-${Date.now()}.json`), JSON.stringify(report, null, 2));
      }
      return { result: report, costUsd: 0 };
    },
  };
}
