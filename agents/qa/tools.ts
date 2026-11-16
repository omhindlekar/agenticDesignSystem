import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { QAReportSchema } from '../../packages/schemas/src/qa-report.js';
import { renderScreen } from '../../checks/render/render.js';
import type { RenderedScreen } from '../../checks/render/render.js';
import type { QAReport, QAFinding, CheckResult } from '../../packages/schemas/src/qa-report.js';
import type { QaCheck } from '../../checks/qa-check.js';
import type { QAInput } from './schema.js';

const RegistrySchema = z.object({
  checks: z.array(z.object({ name: z.string().min(1), module: z.string().min(1) })).min(1),
});

/** Loads every check listed in checks/registry.json (NFR-10: adding a check is a registry entry). */
export async function loadChecks(
  repoRoot: string,
  registryPath = join(repoRoot, 'checks', 'registry.json'),
): Promise<QaCheck[]> {
  const registry = RegistrySchema.parse(JSON.parse(readFileSync(registryPath, 'utf8')));
  const checks: QaCheck[] = [];
  for (const entry of registry.checks) {
    const mod = (await import(pathToFileURL(join(repoRoot, entry.module)).href)) as { default?: QaCheck };
    if (!mod.default || typeof mod.default.run !== 'function')
      throw new Error(`Check "${entry.name}" (${entry.module}) has no default QaCheck export`);
    checks.push({ ...mod.default, name: entry.name });
  }
  return checks;
}

export interface QAOptions {
  repoRoot: string;
  /** Where checks may write evidence (runs/<runId>/qa). Undefined: no files. */
  evidenceDir?: string;
  /** Override the registry (tests). */
  checks?: QaCheck[];
}

/**
 * Runs every registered check on one generated screen and returns a QA report (FR-9).
 * Deterministic: no model calls; the same spec, TSX and baselines give the same report (NFR-5).
 */
export async function runQa(input: QAInput, opts: QAOptions): Promise<QAReport> {
  const started = Date.now();
  const checks = opts.checks ?? (await loadChecks(opts.repoRoot));
  let rendered: Promise<RenderedScreen> | undefined;
  const render = () => (rendered ??= renderScreen(input.tsx, opts.repoRoot));

  const results: CheckResult[] = [];
  const findings: QAFinding[] = [];
  try {
    for (const check of checks) {
      const t = Date.now();
      let outcome;
      try {
        outcome = await check.run({
          taskId: input.taskId,
          runId: input.runId,
          spec: input.spec,
          tsx: input.tsx,
          repoRoot: opts.repoRoot,
          baselineId: input.baselineId,
          evidenceDir: opts.evidenceDir,
          render,
        });
      } catch (err) {
        // A check that cannot run fails the report rather than passing silently (NFR-4).
        const message = err instanceof Error ? err.message.split('\n')[0]! : String(err);
        outcome = {
          status: 'fail' as const,
          reason: message,
          findings: [{ ruleId: 'DS-Q-001', message: `${check.name} could not run: ${message}` }],
        };
      }
      const ruleIds = [...new Set(outcome.findings.map((f) => f.ruleId))];
      results.push({
        checkName: check.name,
        status: outcome.status,
        failingRuleIds: outcome.status === 'fail' ? ruleIds : [],
        ...(outcome.reason ? { reason: outcome.reason } : {}),
        ...(outcome.evidence?.length ? { evidenceLinks: outcome.evidence } : {}),
        durationMs: Date.now() - t,
      });
      if (outcome.status === 'fail') findings.push(...outcome.findings.map((f) => ({ checkName: check.name, ...f })));
    }
  } finally {
    if (rendered) await (await rendered.catch(() => undefined))?.close();
  }
  return QAReportSchema.parse({
    taskId: input.taskId,
    overallStatus: results.some((r) => r.status === 'fail') ? 'fail' : 'pass',
    checks: results,
    findings,
    durationMs: Date.now() - started,
  });
}
