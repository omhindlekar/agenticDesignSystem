/**
 * Industry-baseline parity check. Reads benchmark/industry-baseline.json and reports,
 * per area, how many baseline capabilities (shipped by at least 3 of Material 3,
 * Carbon, Atlassian, Polaris and Fluent 2) we have done, partly done or missing.
 *
 *   npm run parity
 */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const System = z.enum(['material3', 'carbon', 'atlassian', 'polaris', 'fluent2']);
const Shipped = z.object({
  material3: z.boolean(),
  carbon: z.boolean(),
  atlassian: z.boolean(),
  polaris: z.boolean(),
  fluent2: z.boolean(),
});

export const CapabilitySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  area: z.enum(['foundations', 'actions', 'inputs', 'feedback', 'overlays', 'navigation', 'data-display', 'quality', 'docs-tooling']),
  name: z.string().min(1),
  shippedBy: Shipped,
  baseline: z.boolean(),
  /** true when confirmed against the source index pages; false when from foundation docs and to be spot-checked */
  verified: z.boolean(),
  status: z.enum(['done', 'partial', 'missing']),
  phase: z.string().regex(/^(?:1\.\d+|later)$/),
  evidence: z.array(z.string()),
  theirNames: z.record(System, z.string()).optional(),
  note: z.string().optional(),
});

export const ScorecardSchema = z.object({
  description: z.string(),
  verifiedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sources: z.record(System, z.string()),
  capabilities: z.array(CapabilitySchema),
});

export type Scorecard = z.infer<typeof ScorecardSchema>;

export interface AreaScore {
  baseline: number;
  done: number;
  partial: number;
  missing: number;
  percent: number;
}

export interface ParityReport {
  areas: Record<string, AreaScore>;
  overall: AreaScore;
  gaps: Array<{ id: string; area: string; name: string; status: string; phase: string }>;
}

export function loadScorecard(repoRoot: string): Scorecard {
  return ScorecardSchema.parse(JSON.parse(readFileSync(join(repoRoot, 'benchmark', 'industry-baseline.json'), 'utf8')));
}

function score(items: Scorecard['capabilities']): AreaScore {
  const done = items.filter((c) => c.status === 'done').length;
  const partial = items.filter((c) => c.status === 'partial').length;
  return {
    baseline: items.length,
    done,
    partial,
    missing: items.length - done - partial,
    // Only done counts: partial means the leaders' bar is not met yet.
    percent: items.length === 0 ? 100 : Math.round((done / items.length) * 1000) / 10,
  };
}

export function parityReport(card: Scorecard): ParityReport {
  const baseline = card.capabilities.filter((c) => c.baseline);
  const areas: Record<string, AreaScore> = {};
  for (const area of [...new Set(baseline.map((c) => c.area))]) {
    areas[area] = score(baseline.filter((c) => c.area === area));
  }
  return {
    areas,
    overall: score(baseline),
    gaps: baseline
      .filter((c) => c.status !== 'done')
      .map(({ id, area, name, status, phase }) => ({ id, area, name, status, phase })),
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const card = loadScorecard(process.cwd());
  const report = parityReport(card);
  console.log(`Industry-baseline parity (verified ${card.verifiedOn}): ${report.overall.done}/${report.overall.baseline} = ${report.overall.percent}%\n`);
  for (const [area, s] of Object.entries(report.areas)) {
    console.log(`  ${area.padEnd(14)} ${String(s.percent).padStart(5)}%  done ${s.done}, partial ${s.partial}, missing ${s.missing}`);
  }
  console.log('\nGaps:');
  for (const g of report.gaps) console.log(`  [${g.phase}] ${g.area.padEnd(13)} ${g.status.padEnd(8)} ${g.name}`);
}
