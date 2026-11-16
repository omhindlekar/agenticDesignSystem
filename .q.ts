import { resolve } from 'node:path';
import { runGenerate, DEMO_BRIEF } from './scripts/generate.js';
const abs = resolve('.');
for (const [label, opts] of [
  ['abs default dirs', { repoRoot: abs }],
  ['abs runs/q', { repoRoot: abs, runsDir: abs + '/runs/q', outDir: abs + '/generated/q' }],
  ['rel default', { repoRoot: '.' }],
] as const) {
  const { result } = await runGenerate(DEMO_BRIEF, { ...opts, print: () => {} });
  console.log(label, result.outcome, result.error?.slice(60, 120) ?? '');
}
