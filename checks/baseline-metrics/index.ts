import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TokenSchema } from '../../packages/schemas/src/token.js';
import { lintDirectory } from '../token-lint/index.js';

export interface BaselineMetrics {
  phase: string;
  collectedAt: string;
  tokenCount: number;
  primitiveTokenCount: number;
  semanticTokenCount: number;
  ruleCount: number;
  componentCount: number;
  lintViolations: number;
}

async function countTokens(tokensDir: string) {
  let primitive = 0;
  let semantic = 0;

  for (const filename of ['primitives.json', 'semantic.json']) {
    const filePath = join(tokensDir, filename);
    if (!existsSync(filePath)) continue;
    const raw = await readFile(filePath, 'utf8');
    const { tokens } = JSON.parse(raw) as { tokens: unknown[] };
    for (const t of tokens) {
      const parsed = TokenSchema.safeParse(t);
      if (parsed.success) {
        if (parsed.data.tier === 'primitive') primitive++;
        else semantic++;
      }
    }
  }

  return { primitive, semantic };
}

async function countRules(rulesDir: string): Promise<number> {
  const rulesFile = join(rulesDir, 'rules.yaml');
  if (!existsSync(rulesFile)) return 0;
  const raw = await readFile(rulesFile, 'utf8');
  // Count lines starting with "- id:" as a simple rule count
  return (raw.match(/^\s*-\s+id:/gm) ?? []).length;
}

async function countComponents(componentsDir: string): Promise<number> {
  if (!existsSync(componentsDir)) return 0;
  const entries = await readdir(componentsDir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).length;
}

export async function collectMetrics(repoRoot: string): Promise<BaselineMetrics> {
  const { primitive, semantic } = await countTokens(join(repoRoot, 'tokens'));
  const ruleCount = await countRules(join(repoRoot, 'rules'));
  const componentCount = await countComponents(join(repoRoot, 'components'));
  const violations = await lintDirectory(join(repoRoot, 'components'), ['.tsx', '.ts', '.css', '.scss']);

  return {
    phase: '0',
    collectedAt: new Date().toISOString(),
    tokenCount: primitive + semantic,
    primitiveTokenCount: primitive,
    semanticTokenCount: semantic,
    ruleCount,
    componentCount,
    lintViolations: violations.length,
  };
}

export async function writeMetrics(repoRoot: string): Promise<BaselineMetrics> {
  const metrics = await collectMetrics(repoRoot);
  const outputDir = join(repoRoot, 'evals', 'baselines');
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'metrics.json'), JSON.stringify(metrics, null, 2) + '\n', 'utf8');
  return metrics;
}

// CLI entrypoint
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(new URL(import.meta.url).pathname).ino) {
  const repoRoot = process.argv[2] ?? '.';
  writeMetrics(repoRoot).then((metrics) => {
    console.log('Baseline metrics written to evals/baselines/metrics.json');
    console.log(JSON.stringify(metrics, null, 2));
  });
}
