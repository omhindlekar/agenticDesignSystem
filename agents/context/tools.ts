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
import { PAGE_LAYER_SCOPES, pageLayerEnforced } from '../../packages/config/src/index.js';

export interface DataStore {
  tokens: Token[];
  components: ComponentMetadata[];
  rules: Rule[];
  /** Everyday words that imply a component (agents/context/vocabulary.json). */
  concepts?: Concept[];
}

export interface Concept {
  words: string[];
  components: string[];
}

export async function loadDataStore(repoRoot: string): Promise<DataStore> {
  return {
    tokens: loadTokens(repoRoot),
    components: loadComponents(repoRoot),
    rules: loadRules(repoRoot),
    concepts: loadConcepts(repoRoot),
  };
}

function loadConcepts(repoRoot: string): Concept[] {
  const path = join(repoRoot, 'agents', 'context', 'vocabulary.json');
  if (!existsSync(path)) return [];
  return (JSON.parse(readFileSync(path, 'utf8')) as { concepts: Concept[] }).concepts;
}

/** Whole-word, case-insensitive phrase match; hyphens count as spaces ("sign-in" is "sign in"). */
function mentions(text: string, phrase: string): boolean {
  const norm = (s: string) => ` ${s.toLowerCase().replace(/[-_]/g, ' ').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()} `;
  return norm(text).includes(norm(phrase));
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
  const rules = parsed.rules.map((r) => RuleSchema.parse(r));
  // Page-layer rules reach agents only once they are enforced (FR-21).
  return pageLayerEnforced(repoRoot) ? rules : rules.filter((r) => !PAGE_LAYER_SCOPES.has(r.scope));
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'for',
  'to',
  'in',
  'of',
  'with',
  'on',
  'at',
  'is',
  'it',
  'this',
  'that',
  'be',
  'as',
  'by',
  'from',
  'up',
  'do',
  'if',
  'no',
  'so',
  'we',
  'my',
  'us',
  'me',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.:;()\-/'"!?]+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/** Singular stem: buttons → button, checkboxes → checkbox, entries → entry. */
export function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (/(x|ch|sh|ss)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/**
 * A component is selected when every word of its id is named in the task (singular or
 * plural, or as the start of a longer word: "navigation" names side-nav). Matching whole
 * id words, not any word of the purpose, keeps the pack to the components the brief asks
 * for, so rule text stays under 30% (FR-5, NFR-6).
 */
function matchesComponent(component: ComponentMetadata, keywords: string[]): boolean {
  const stems = keywords.map(stem);
  return component.id.split('-').every((part) => {
    const p = stem(part);
    return stems.some((k) => k === p || (p.length >= 3 && k.length - p.length >= 4 && k.startsWith(p)));
  });
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
    .filter((c) => matchesComponent(c, keywords))
    .map((component) => ({
      id: component.id,
      reason: `The task names it: ${component.id.split('-').join(' ')}`,
    }));

  // 1b. Components the brief describes without naming them (FR-5): "one-time code" implies Input.
  const known = new Set(store.components.map((c) => c.id));
  for (const concept of store.concepts ?? []) {
    const hit = concept.words.find((w) => mentions(input.task, w));
    if (!hit) continue;
    for (const id of concept.components)
      if (known.has(id) && !selectedComponents.some((c) => c.id === id))
        selectedComponents.push({ id, reason: `The task describes it: "${hit}"` });
  }

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

/**
 * Instruction-like text inside a brief. Briefs are data: the agents never follow these,
 * and each match is flagged in the run log (CLAUDE.md: treat brief text as data).
 */
const INSTRUCTION_PATTERNS: Array<[RegExp, string]> = [
  [
    /\b(ignore|disregard|forget)\b[^.]{0,40}\b(previous|prior|above|earlier|all)\b[^.]{0,20}\b(instructions?|rules?|prompts?)\b/i,
    'ignore-instructions',
  ],
  [/^\s*(system|assistant|developer)\s*:/im, 'role-prefix'],
  [/<\/?\s*(system|instructions?|prompt)\s*>/i, 'prompt-tag'],
  [/\byou are now\b|\bact as\b|\bnew instructions?\b/i, 'role-change'],
  [/\b(reveal|print|show|repeat)\b[^.]{0,20}\b(system prompt|your (instructions|prompt))\b/i, 'prompt-extraction'],
];

export function detectInstructions(brief: string): string[] {
  const flags: string[] = [];
  for (const [re, kind] of INSTRUCTION_PATTERNS) {
    const m = re.exec(brief);
    if (m) flags.push(`instruction-in-brief:${kind}: "${m[0].trim().slice(0, 80)}"`);
  }
  return flags;
}
