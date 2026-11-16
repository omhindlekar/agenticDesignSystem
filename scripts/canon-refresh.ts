/**
 * npm run canon:refresh [-- <id…>]
 *
 * Researches the principles in canon/seed-list.json (all, or only the ids given) with the real
 * model's WebSearch and WebFetch tools, and writes drafts to canon/drafts/ plus report.json.
 * Explicit only: briefs never trigger it. Uses the claude CLI on your subscription unless
 * MODEL_PROVIDER says otherwise, and never the response cache (the copy guard needs the pages).
 * Om promotes drafts to canon/ by pull request (FR-23, FR-24, NFR-13).
 */
import { readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProvider, resolveProviderName } from '../packages/provider/src/index.js';
import { guardedFs } from '../packages/permissions/src/index.js';
import { loadResearchConfig, runCanonRefresh } from '../agents/strategist/research.js';
import type { Seed } from '../agents/strategist/research.js';

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const repoRoot = join(dirname(thisFile), '..');
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const all = (JSON.parse(readFileSync(join(repoRoot, 'canon', 'seed-list.json'), 'utf8')) as { seeds: Seed[] }).seeds;
  const seeds = only.length ? all.filter((s) => only.includes(s.id)) : all;
  const unknown = only.filter((id) => !all.some((s) => s.id === id));
  if (unknown.length) {
    console.error(`Not in canon/seed-list.json: ${unknown.join(', ')}`);
    process.exit(1);
  }
  process.env['MODEL_PROVIDER'] ??= 'cli';
  const cfg = loadResearchConfig(repoRoot);
  const provider = createProvider({ model: cfg.model, provider: 'cli', cache: { enabled: false } }, repoRoot);
  const fs = guardedFs('strategist', repoRoot);
  console.log(
    `Researching ${seeds.length} principle(s) in ${Math.ceil(seeds.length / cfg.batchSize)} call(s) with ${cfg.model} via ${resolveProviderName({ model: cfg.model })}…`,
  );
  runCanonRefresh({ repoRoot, provider, seeds, write: (p, d) => fs.writeFile(p, d) })
    .then((r) => {
      console.log(`Drafts written: ${r.accepted.length} (${r.accepted.join(', ') || 'none'})`);
      for (const x of r.rejected) console.log(`Rejected ${x.id}: ${x.issues.join('; ')}`);
      if (r.missing.length) console.log(`Not returned by the model: ${r.missing.join(', ')}`);
      if (r.unpreferredSources.length) console.log(`Pages outside the preferred publishers: ${r.unpreferredSources.length}`);
      if (r.flags.length) console.log(`Instruction-like text in fetched pages (ignored, recorded): ${r.flags.length}`);
      console.log(`Calls: ${r.calls}; API-equivalent cost $${r.apiEquivalentUsd.toFixed(2)} (on a subscription: usage, not money)`);
      console.log('Review canon/drafts/, then move accepted files to canon/ in a pull request.');
    })
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    });
}
