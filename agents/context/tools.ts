import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load as yamlLoad } from 'js-yaml';
import { TokenSchema } from '../../packages/schemas/src/token.js';
import { ComponentMetadataSchema } from '../../packages/schemas/src/component-metadata.js';
import { RuleSchema } from '../../packages/schemas/src/rule.js';
import { ContextPackSchema } from '../../packages/schemas/src/context-pack.js';
import type { Token } from '../../packages/schemas/src/token.js';
import type { ComponentMetadata } from '../../packages/schemas/src/component-metadata.js';
import type { Rule } from '../../packages/schemas/src/rule.js';
import type { ContextPack } from '../../packages/schemas/src/context-pack.js';
import type { ContextInput } from './schema.js';

export interface DataStore {
  tokens: Token[];
  components: ComponentMetadata[];
  rules: Rule[];
}

export async function loadDataStore(repoRoot: string): Promise<DataStore> {
  return {
    tokens: loadTokens(repoRoot),
    components: loadComponents(repoRoot),
    rules: loadRules(repoRoot),
  };
}

function loadTokens(repoRoot: string): Token[] {
  const tokens: Token[] = [];
  for (const file of ['primitives.json', 'semantic.json']) {
    const path = join(repoRoot, 'tokens', file);
    if (!existsSync(path)) continue;
    const { tokens: raw } = JSON.parse(readFileSync(path, 'utf8')) as { tokens: unknown[] };
    for (const t of raw) tokens.push(TokenSchema.parse(t));
  }
  return tokens;
}

function loadComponents(repoRoot: string): ComponentMetadata[] {
  const componentsDir = join(repoRoot, 'components');
  if (!existsSync(componentsDir)) return [];
  const components: ComponentMetadata[] = [];
  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metaPath = join(componentsDir, entry.name, `${entry.name}.meta.json`);
    if (!existsSync(metaPath)) continue;
    components.push(ComponentMetadataSchema.parse(JSON.parse(readFileSync(metaPath, 'utf8'))));
  }
  return components;
}

function loadRules(repoRoot: string): Rule[] {
  const rulesPath = join(repoRoot, 'rules', 'rules.yaml');
  if (!existsSync(rulesPath)) return [];
  const parsed = yamlLoad(readFileSync(rulesPath, 'utf8')) as { rules: unknown[] };
  return parsed.rules.map((r) => RuleSchema.parse(r));
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'in', 'of', 'with',
  'on', 'at', 'is', 'it', 'this', 'that', 'be', 'as', 'by', 'from',
  'up', 'do', 'if', 'no', 'so', 'we', 'my', 'us', 'me',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.:;()\-/'"!?]+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

function scoreComponent(component: ComponentMetadata, keywords: string[]): number {
  // Use id, purpose and variants only — whenToUse freely cross-references other
  // component names and would cause cascade matches for unrelated tasks.
  const haystack = [component.id, component.purpose, ...component.variants]
    .join(' ')
    .toLowerCase();
  return keywords.filter((k) => haystack.includes(k)).length;
}

export function selectContext(input: ContextInput, store: DataStore): ContextPack {
  if (!input.task.trim()) {
    return ContextPackSchema.parse({
      taskId: input.taskId,
      tokenIds: [],
      componentIds: [],
      ruleIds: [],
    });
  }

  const keywords = tokenise(input.task);

  // 1. Select relevant components
  const selectedComponents = store.components
    .map((c) => ({ component: c, score: scoreComponent(c, keywords) }))
    .filter(({ score }) => score > 0)
    .map(({ component, score }) => ({
      id: component.id,
      reason: `Task contains keyword(s) matching component purpose or usage (score ${score})`,
    }));

  const selectedComponentIds = new Set(selectedComponents.map((c) => c.id));

  // 2. Select tokens from selected components' tokensUsed
  const tokenIdsSeen = new Set<string>();
  const selectedTokens: Array<{ id: string; reason: string }> = [];

  for (const { id: compId } of selectedComponents) {
    const comp = store.components.find((c) => c.id === compId);
    if (!comp) continue;
    for (const tokenId of comp.tokensUsed) {
      if (!tokenIdsSeen.has(tokenId)) {
        tokenIdsSeen.add(tokenId);
        selectedTokens.push({ id: tokenId, reason: `Used by component: ${compId}` });
      }
    }
  }

  // 3. Select rules with ≥50% of their appliesTo in the selected component set.
  // This prevents universal rules (applying to all 6 components) from flooding the
  // context pack when only one or two components are relevant (FR-5 / NFR-6).
  const selectedRules = store.rules
    .filter((r) => {
      const matching = r.appliesTo.filter((a) => selectedComponentIds.has(a));
      return matching.length / r.appliesTo.length >= 0.5;
    })
    .map((r) => {
      const matching = r.appliesTo.filter((a) => selectedComponentIds.has(a));
      return {
        id: r.id,
        reason: `Applies to: ${matching.join(', ')}`,
      };
    });

  return ContextPackSchema.parse({
    taskId: input.taskId,
    tokenIds: selectedTokens,
    componentIds: selectedComponents,
    ruleIds: selectedRules,
  });
}
