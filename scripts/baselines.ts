/**
 * Visual baselines (FR-10, DS-V-001). Baselines change only through a pull request the
 * design system owner approves, so this script is for people, not agents:
 *
 *   npm run baselines:propose [-- <id…>]   Render each golden screen (recorded responses, no
 *                                          model calls) to generated/baselines/<id>.png and a
 *                                          contact sheet, generated/baselines/index.html.
 *   npm run baselines:approve -- <id…>     Copy those candidates into evals/baselines/. Then
 *                                          commit them in a PR for review.
 *
 * No agent or QA check may import this file (a test enforces it), and config/permissions.json
 * gives no agent write access to evals/baselines/.
 */
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGoldenSet } from './golden.js';
import { runGenerate } from './generate.js';
import { renderScreen, closeRenderer } from '../checks/render/render.js';

export const CANDIDATE_DIR = join('generated', 'baselines');
export const BASELINE_DIR = join('evals', 'baselines');

export async function proposeBaselines(
  repoRoot: string,
  only: string[] = [],
): Promise<Array<{ id: string; ok: boolean; note: string }>> {
  const out = join(repoRoot, CANDIDATE_DIR);
  mkdirSync(out, { recursive: true });
  const results: Array<{ id: string; ok: boolean; note: string }> = [];
  for (const b of loadGoldenSet(repoRoot).filter((x) => !only.length || only.includes(x.id))) {
    const { result } = await runGenerate(b.brief, {
      repoRoot,
      outDir: join(repoRoot, 'generated', 'golden'),
      runsDir: join(repoRoot, 'runs', 'golden'),
      print: () => {},
    });
    if (result.outcome !== 'pass' || !result.tsx) {
      results.push({ id: b.id, ok: false, note: `not proposed: the run ended ${result.outcome}` });
      continue;
    }
    const r = await renderScreen(result.tsx, repoRoot);
    writeFileSync(join(out, `${b.id}.png`), await r.screenshot());
    await r.close();
    results.push({
      id: b.id,
      ok: true,
      note: existsSync(join(repoRoot, BASELINE_DIR, `${b.id}.png`)) ? 'replaces the approved baseline' : 'new',
    });
  }
  await closeRenderer();
  const cells = results
    .map((r) =>
      r.ok
        ? `<figure><img src="${r.id}.png" alt="${r.id}"><figcaption>${r.id} — ${r.note}</figcaption></figure>`
        : `<figure><figcaption>${r.id} — ${r.note}</figcaption></figure>`,
    )
    .join('');
  writeFileSync(
    join(out, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Baseline candidates</title><style>body{font:14px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}img{width:100%;border:1px solid #ccc}</style><h1>Baseline candidates</h1><p>Approve with: npm run baselines:approve -- &lt;id…&gt;</p><main>${cells}</main>`,
  );
  return results;
}

export function approveBaselines(repoRoot: string, ids: string[]): string[] {
  if (!ids.length)
    throw new Error(
      'Name the baselines to approve: npm run baselines:approve -- <id…> (see generated/baselines/index.html).',
    );
  const known = new Set(loadGoldenSet(repoRoot).map((b) => b.id));
  mkdirSync(join(repoRoot, BASELINE_DIR), { recursive: true });
  const approved: string[] = [];
  for (const id of ids) {
    if (!known.has(id)) throw new Error(`"${id}" is not a golden-set id.`);
    const candidate = join(repoRoot, CANDIDATE_DIR, `${id}.png`);
    if (!existsSync(candidate)) throw new Error(`No candidate for "${id}"; run npm run baselines:propose first.`);
    copyFileSync(candidate, join(repoRoot, BASELINE_DIR, `${id}.png`));
    approved.push(id);
  }
  return approved;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const repoRoot = join(dirname(thisFile), '..');
  const [cmd, ...ids] = process.argv.slice(2);
  (async () => {
    if (cmd === 'propose') {
      const results = await proposeBaselines(repoRoot, ids);
      for (const r of results) console.log(`${r.ok ? 'proposed' : 'skipped '} ${r.id}: ${r.note}`);
      console.log(`Look at ${join(CANDIDATE_DIR, 'index.html')}, then: npm run baselines:approve -- <id…>`);
    } else if (cmd === 'approve') {
      const approved = approveBaselines(repoRoot, ids);
      console.log(`Approved ${approved.length} baseline(s) into ${BASELINE_DIR}/: ${approved.join(', ')}.`);
      console.log('Commit them and open a pull request; baselines change only through review.');
    } else {
      console.error('Usage: npm run baselines:propose [-- <id…>] | npm run baselines:approve -- <id…>');
      process.exit(2);
    }
  })().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
