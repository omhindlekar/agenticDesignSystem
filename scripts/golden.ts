/**
 * npm run golden              Run the 20 golden briefs through the full pipeline (fake provider,
 *                             recorded fixtures) and check the phase gate. Exit 1 if it fails.
 * npm run golden:record       Same briefs against the real model (MODEL_PROVIDER=cli, your
 *                             subscription); saves every response as a fixture, then replays.
 * npm run golden -- <id…>     Only these briefs.
 *
 * Writes evals/reports/golden-latest.json. Metrics follow the PRD (evaluation and quality):
 * first-pass QA rate, rule violation rate, retry rate, escalation rate, context size and
 * precision, plus each brief's expected and forbidden components.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoldenBriefSchema } from '../packages/schemas/src/golden-brief.js';
import { runGenerate } from './generate.js';
import { loadDataStore, runContextAgent } from '../agents/context/index.js';
import { closeRenderer } from '../checks/render/render.js';
import type { GoldenBrief } from '../packages/schemas/src/golden-brief.js';
import type { ComponentNode } from '../packages/schemas/src/screen-spec.js';

export const GATE = { firstPassRate: 0.8, maxEscalationRate: 0.1, maxRuleViolationRate: 0.5, maxContextShare: 0.3 };

export interface BriefResult {
  id: string;
  outcome: string;
  firstPass: boolean;
  qa: string;
  failingRuleIds: string[];
  attempts: Record<string, number>;
  missingComponents: string[];
  forbiddenUsed: string[];
  flagged: boolean;
  contextShare: number;
  contextPrecision: number;
  passed: boolean;
  runId: string;
  error?: string;
}

export interface GoldenReport {
  ranAt: string;
  provider: string;
  briefs: number;
  metrics: {
    firstPassRate: number;
    briefsPassing: number;
    ruleViolationRate: number;
    retryRate: number;
    escalationRate: number;
    maxContextShare: number;
    meanContextPrecision: number;
  };
  gate: typeof GATE & { passed: boolean; failures: string[] };
  results: BriefResult[];
}

export function loadGoldenSet(repoRoot: string): GoldenBrief[] {
  const dir = join(repoRoot, 'evals', 'golden-set');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => GoldenBriefSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8'))));
}

const componentsIn = (n: ComponentNode | undefined): string[] =>
  n ? [n.component, ...(n.children ?? []).flatMap((c) => componentsIn(c))] : [];

export async function runGolden(
  repoRoot: string,
  opts: { only?: string[]; print?: (l: string) => void } = {},
): Promise<GoldenReport> {
  const print = opts.print ?? ((l: string) => console.log(l));
  const briefs = loadGoldenSet(repoRoot).filter((b) => !opts.only?.length || opts.only.includes(b.id));
  const store = await loadDataStore(repoRoot);
  const totalRuleText = store.rules.map((r) => r.statement).join('').length;
  const results: BriefResult[] = [];

  for (const b of briefs) {
    const { result } = await runGenerate(b.brief, {
      repoRoot,
      outDir: join(repoRoot, 'generated', 'golden'),
      runsDir: join(repoRoot, 'runs', 'golden'),
      baselineId: b.id,
      print: () => {},
    });
    const pack = runContextAgent({ taskId: result.taskId, task: b.brief }, store);
    const packRules = store.rules.filter((r) => pack.ruleIds.some((x) => x.id === r.id));
    const used = new Set(componentsIn(result.spec?.tree));
    const needed = packRules.filter((r) => r.appliesTo.some((a) => used.has(a)));
    const missingComponents = b.expectedComponents.filter((c) => !used.has(c));
    const forbiddenUsed = b.forbiddenComponents.filter((c) => used.has(c));
    const flagged = result.flags.length > 0;
    const passed =
      result.outcome === 'pass' &&
      missingComponents.length === 0 &&
      forbiddenUsed.length === 0 &&
      (!b.adversarial || flagged);
    const r: BriefResult = {
      id: b.id,
      outcome: result.outcome,
      firstPass: result.firstPass,
      qa: result.qaReport?.overallStatus ?? 'not run',
      failingRuleIds: [...new Set(result.qaReport?.checks.flatMap((c) => c.failingRuleIds) ?? [])],
      attempts: result.attempts,
      missingComponents,
      forbiddenUsed,
      flagged,
      contextShare: packRules.map((x) => x.statement).join('').length / totalRuleText,
      contextPrecision: packRules.length ? needed.length / packRules.length : 1,
      passed,
      runId: result.runId,
      ...(result.error ? { error: result.error.split('\n')[0]!.slice(0, 200) } : {}),
    };
    results.push(r);
    print(
      `${passed ? 'PASS' : 'FAIL'} ${b.id.padEnd(20)} ${r.outcome.padEnd(8)} first-pass ${r.firstPass ? 'yes' : 'no '}  qa ${r.qa}` +
        `${r.failingRuleIds.length ? ` [${r.failingRuleIds.join(', ')}]` : ''}` +
        `${missingComponents.length ? ` missing ${missingComponents.join(',')}` : ''}${forbiddenUsed.length ? ` forbidden ${forbiddenUsed.join(',')}` : ''}` +
        `${r.error && r.outcome !== 'pass' ? ` — ${r.error}` : ''}`,
    );
  }
  await closeRenderer();

  const n = results.length || 1;
  const attemptsTotal = results.reduce((s, r) => s + Object.values(r.attempts).reduce((a, b) => a + b, 0), 0);
  const stepsTotal = results.reduce((s, r) => s + Object.values(r.attempts).filter((a) => a > 0).length, 0);
  const metrics = {
    firstPassRate: results.filter((r) => r.firstPass && r.passed).length / n,
    briefsPassing: results.filter((r) => r.passed).length,
    ruleViolationRate: results.reduce((s, r) => s + r.failingRuleIds.length, 0) / n,
    retryRate: attemptsTotal ? (attemptsTotal - stepsTotal) / attemptsTotal : 0,
    escalationRate: results.filter((r) => r.outcome === 'escalate').length / n,
    maxContextShare: Math.max(0, ...results.map((r) => r.contextShare)),
    meanContextPrecision: results.reduce((s, r) => s + r.contextPrecision, 0) / n,
  };
  const failures = [
    ...(metrics.firstPassRate < GATE.firstPassRate
      ? [`first-pass QA rate ${(metrics.firstPassRate * 100).toFixed(0)}% < 80%`]
      : []),
    ...(metrics.escalationRate >= GATE.maxEscalationRate
      ? [`escalation rate ${(metrics.escalationRate * 100).toFixed(0)}% ≥ 10%`]
      : []),
    ...(metrics.ruleViolationRate >= GATE.maxRuleViolationRate
      ? [`rule violation rate ${metrics.ruleViolationRate.toFixed(2)} ≥ 0.5`]
      : []),
    ...(metrics.maxContextShare >= GATE.maxContextShare
      ? [`context share ${(metrics.maxContextShare * 100).toFixed(0)}% ≥ 30%`]
      : []),
  ];
  const config = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as { provider: string };
  return {
    ranAt: new Date().toISOString(),
    provider: process.env['MODEL_PROVIDER'] ?? config.provider,
    briefs: results.length,
    metrics,
    gate: { ...GATE, passed: failures.length === 0, failures },
    results,
  };
}

/** Copies provider-cache entries written since `since` into the fixtures, so CI can replay them. */
export function saveRecordedFixtures(repoRoot: string, since: number): number {
  const cache = join(repoRoot, 'runs', '.provider-cache');
  const fixtures = join(repoRoot, 'evals', 'fixtures', 'provider');
  if (!existsSync(cache)) return 0;
  let n = 0;
  for (const f of readdirSync(cache)) {
    if (!f.endsWith('.json') || statSync(join(cache, f)).mtimeMs < since) continue;
    copyFileSync(join(cache, f), join(fixtures, f));
    n++;
  }
  return n;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const repoRoot = join(dirname(thisFile), '..');
  const args = process.argv.slice(2);
  const record = args.includes('--record');
  const only = args.filter((a) => !a.startsWith('--'));
  (async () => {
    if (record) {
      const since = Date.now() - 1000;
      process.env['MODEL_PROVIDER'] = 'cli';
      console.log('Recording the golden set with the real model (MODEL_PROVIDER=cli)…');
      await runGolden(repoRoot, { only });
      console.log(
        `Saved ${saveRecordedFixtures(repoRoot, since)} response(s) to evals/fixtures/provider/. Replaying with the fake provider…`,
      );
      process.env['MODEL_PROVIDER'] = 'fake';
    }
    const report = await runGolden(repoRoot, { only });
    mkdirSync(join(repoRoot, 'evals', 'reports'), { recursive: true });
    if (!only.length)
      writeFileSync(join(repoRoot, 'evals', 'reports', 'golden-latest.json'), `${JSON.stringify(report, null, 2)}\n`);
    const m = report.metrics;
    const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
    console.log('');
    console.log(`Briefs passing:      ${m.briefsPassing}/${report.briefs}`);
    console.log(`First-pass QA rate:  ${pct(m.firstPassRate)} (target ≥ 80%)`);
    console.log(`Rule violation rate: ${m.ruleViolationRate.toFixed(2)} per screen (target < 0.5)`);
    console.log(`Retry rate:          ${pct(m.retryRate)}`);
    console.log(`Escalation rate:     ${pct(m.escalationRate)} (target < 10%)`);
    console.log(
      `Context size:        max ${pct(m.maxContextShare)} of rule text (target < 30%); precision ${pct(m.meanContextPrecision)}`,
    );
    console.log(report.gate.passed ? 'Gate: passed' : `Gate: FAILED — ${report.gate.failures.join('; ')}`);
    process.exit(report.gate.passed ? 0 : 1);
  })().catch((err: unknown) => {
    console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
    process.exit(1);
  });
}
