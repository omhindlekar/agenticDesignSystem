/**
 * Records fake-provider fixtures for one brief from hand-written responses.
 *
 *   tsx scripts/record-fixture.ts <composer-response.json> <builder-response.tsx> "<brief>"
 *
 * It builds the exact Composer and Builder prompts the agents will send for this
 * brief (same context pack, task id, model and max tokens) and writes each response
 * to evals/fixtures/provider/<sha256>.json. Re-run it whenever a prompt template,
 * the model in config/defaults.json, the token set or component metadata changes;
 * the generate test fails with "no fixture" when the fixtures are stale.
 *
 * Demo fixtures: npm run fixtures:demo
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashKey } from '../packages/provider/src/fake.js';
import { loadDataStore, runContextAgent } from '../agents/context/index.js';
import { buildComposerPrompt, parseComposerResponse } from '../agents/composer/tools.js';
import { COMPOSER_MAX_TOKENS } from '../agents/composer/index.js';
import { buildBuilderPrompt, loadComponentApis, parseBuilderResponse } from '../agents/builder/tools.js';
import { BUILDER_MAX_TOKENS } from '../agents/builder/index.js';
import { taskIdForBrief } from './generate.js';

export async function recordFixtures(
  repoRoot: string,
  brief: string,
  composerResponse: string,
  builderResponse: string,
): Promise<string[]> {
  const { model } = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as { model: string };
  const fixturesDir = join(repoRoot, 'evals', 'fixtures', 'provider');
  const taskId = taskIdForBrief(brief);
  const contextPack = runContextAgent({ taskId, task: brief }, await loadDataStore(repoRoot));

  const composerPrompt = buildComposerPrompt({ taskId, brief, contextPack });
  // Parse exactly as the Composer does, so an invalid spec fails here rather than at replay.
  const spec = parseComposerResponse(taskId, composerResponse, contextPack);

  const apis = loadComponentApis(repoRoot, contextPack.componentIds.map((c) => c.id));
  const builderPrompt = buildBuilderPrompt({ taskId, spec, contextPack }, undefined, apis);
  parseBuilderResponse(builderResponse);

  const written: string[] = [];
  for (const [prompt, maxTokens, text] of [
    [composerPrompt, COMPOSER_MAX_TOKENS, composerResponse],
    [builderPrompt, BUILDER_MAX_TOKENS, builderResponse],
  ] as const) {
    const path = join(fixturesDir, `${hashKey(model, maxTokens, prompt)}.json`);
    writeFileSync(path, `${JSON.stringify({ text, costUsd: 0 })}\n`, 'utf8');
    written.push(path);
  }
  return written;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const [composerFile, builderFile, ...briefParts] = process.argv.slice(2);
  const brief = briefParts.join(' ').trim();
  if (!composerFile || !builderFile || !brief) {
    console.error('Usage: tsx scripts/record-fixture.ts <composer-response.json> <builder-response.tsx> "<brief>"');
    process.exit(2);
  }
  const repoRoot = join(dirname(thisFile), '..');
  recordFixtures(repoRoot, brief, readFileSync(composerFile, 'utf8'), readFileSync(builderFile, 'utf8'))
    .then((paths) => {
      for (const p of paths) console.log(`wrote ${relative(process.cwd(), p)}`);
    })
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    });
}
