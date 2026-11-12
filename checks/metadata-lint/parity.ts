/**
 * FR-3 parity check: a component's code, CSS and stories must match its metadata.
 *
 * - Props: names, required/optional and type text match in both directions.
 * - Variants: the `variant` prop's literal union equals metadata.variants
 *   (components without a `variant` prop are covered by the story render check).
 * - States: hover/active/focus need a matching CSS pseudo-class; every other
 *   state needs a `[data-state~="<state>"]` selector (except "default").
 *   Every data-state value in the CSS must be a metadata state.
 * - Stories: the `parameters.ads` tags across all stories cover exactly the
 *   metadata variants and states, and each non-pseudo story actually renders
 *   the tagged data-variant / data-state on the component's root element.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { createElement } from 'react';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
}

export interface MetaLike {
  id: string;
  variants: string[];
  states: string[];
  props: PropInfo[];
}

export interface ParityIssue {
  component: string;
  kind: 'prop' | 'variant' | 'state' | 'story';
  message: string;
}

export interface RootAttributes {
  variant: string | undefined;
  states: string[];
}

export interface StoryCoverage {
  name: string;
  ads: { variant?: string; state?: string };
  root: RootAttributes;
}

const PSEUDO_STATES: Record<string, RegExp> = {
  hover: /:hover\b/,
  active: /:active\b/,
  focus: /:focus(?:-visible|-within)?\b/,
};

const normalise = (s: string): string => s.replace(/\s+/g, ' ').replace(/;\s*}/g, ' }').trim();

function issue(component: string, kind: ParityIssue['kind'], message: string): ParityIssue {
  return { component, kind, message };
}

function pascalCase(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Reads the members of `interface <name>` from a TSX file with the TypeScript compiler API. */
export function extractProps(tsxPath: string, interfaceName: string): PropInfo[] {
  const source = ts.createSourceFile(tsxPath, readFileSync(tsxPath, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found: ts.InterfaceDeclaration | undefined;
  source.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) found = node;
  });
  if (!found) throw new Error(`interface ${interfaceName} not found in ${tsxPath}`);

  return found.members.filter(ts.isPropertySignature).map((member) => {
    const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : member.name.getText(source);
    return {
      name,
      type: member.type ? normalise(member.type.getText(source)) : 'any',
      required: member.questionToken === undefined,
    };
  });
}

export function checkProps(meta: MetaLike, props: PropInfo[]): ParityIssue[] {
  const issues: ParityIssue[] = [];
  const code = new Map(props.map((p) => [p.name, p]));
  const declared = new Map(meta.props.map((p) => [p.name, p]));

  for (const [name, m] of declared) {
    const c = code.get(name);
    if (!c) {
      issues.push(issue(meta.id, 'prop', `prop "${name}" is in metadata but missing from component`));
      continue;
    }
    if (c.required !== m.required) {
      issues.push(issue(meta.id, 'prop', `prop "${name}": metadata required=${m.required}, component required=${c.required}`));
    }
    if (normalise(c.type) !== normalise(m.type)) {
      issues.push(issue(meta.id, 'prop', `prop "${name}": metadata type "${m.type}" ≠ component type "${c.type}"`));
    }
  }
  for (const name of code.keys()) {
    if (!declared.has(name)) issues.push(issue(meta.id, 'prop', `prop "${name}" is in component but not in metadata`));
  }
  return issues;
}

function stringLiterals(typeText: string): string[] {
  return [...typeText.matchAll(/'([^']*)'|"([^"]*)"/g)].map((m) => m[1] ?? m[2] ?? '');
}

export function checkVariants(meta: MetaLike, props: PropInfo[]): ParityIssue[] {
  const variantProp = props.find((p) => p.name === 'variant');
  if (!variantProp) return []; // covered by the story render check
  const code = new Set(stringLiterals(variantProp.type));
  const issues: ParityIssue[] = [];
  for (const v of meta.variants) {
    if (!code.has(v)) issues.push(issue(meta.id, 'variant', `variant "${v}" is in metadata but missing from component`));
  }
  for (const v of code) {
    if (!meta.variants.includes(v)) issues.push(issue(meta.id, 'variant', `variant "${v}" is in component but not in metadata`));
  }
  return issues;
}

export function checkCssStates(meta: MetaLike, css: string): ParityIssue[] {
  const issues: ParityIssue[] = [];
  const cssStates = new Set([...css.matchAll(/\[data-state~?=["']([^"']+)["']\]/g)].map((m) => m[1] ?? ''));

  for (const state of meta.states) {
    const pseudo = PSEUDO_STATES[state];
    if (pseudo) {
      if (!pseudo.test(css)) issues.push(issue(meta.id, 'state', `state "${state}" has no CSS selector (expected ${pseudo.source})`));
    } else if (state !== 'default' && !cssStates.has(state)) {
      issues.push(issue(meta.id, 'state', `state "${state}" has no CSS selector [data-state~="${state}"]`));
    }
  }
  for (const state of cssStates) {
    if (!meta.states.includes(state)) issues.push(issue(meta.id, 'state', `CSS styles data-state "${state}" which is not in metadata`));
  }
  return issues;
}

export function checkStories(meta: MetaLike, stories: StoryCoverage[]): ParityIssue[] {
  const issues: ParityIssue[] = [];
  const coveredVariants = new Set<string>();
  const coveredStates = new Set<string>();

  for (const story of stories) {
    const { variant, state } = story.ads;
    if (variant === undefined && state === undefined) {
      issues.push(issue(meta.id, 'story', `story "${story.name}" has no parameters.ads variant or state tag`));
      continue;
    }
    if (variant !== undefined) {
      coveredVariants.add(variant);
      if (!meta.variants.includes(variant)) {
        issues.push(issue(meta.id, 'story', `story "${story.name}": variant "${variant}" not in metadata`));
      } else if (story.root.variant !== variant) {
        issues.push(issue(meta.id, 'story', `story "${story.name}" does not render data-variant "${variant}" (got "${story.root.variant}")`));
      }
    }
    if (state !== undefined) {
      coveredStates.add(state);
      if (!meta.states.includes(state)) {
        issues.push(issue(meta.id, 'story', `story "${story.name}": state "${state}" not in metadata`));
      } else if (!(state in PSEUDO_STATES) && !story.root.states.includes(state)) {
        issues.push(issue(meta.id, 'story', `story "${story.name}" does not render data-state "${state}" (got "${story.root.states.join(' ')}")`));
      }
    }
    if (story.root.variant !== undefined && !meta.variants.includes(story.root.variant)) {
      issues.push(issue(meta.id, 'story', `story "${story.name}" renders data-variant "${story.root.variant}" which is not in metadata`));
    }
    for (const s of story.root.states) {
      if (!meta.states.includes(s)) {
        issues.push(issue(meta.id, 'story', `story "${story.name}" renders data-state "${s}" which is not in metadata`));
      }
    }
  }

  for (const v of meta.variants) {
    if (!coveredVariants.has(v)) issues.push(issue(meta.id, 'story', `variant "${v}" has no story`));
  }
  for (const s of meta.states) {
    if (!coveredStates.has(s)) issues.push(issue(meta.id, 'story', `state "${s}" has no story`));
  }
  return issues;
}

/** data-variant and data-state of the first (root) element in rendered markup. */
export function parseRootAttributes(markup: string): RootAttributes {
  const tag = /^\s*<[a-zA-Z][^>]*>/.exec(markup)?.[0] ?? '';
  const variant = /\sdata-variant="([^"]*)"/.exec(tag)?.[1];
  const state = /\sdata-state="([^"]*)"/.exec(tag)?.[1] ?? '';
  return { variant, states: state.split(/\s+/).filter(Boolean) };
}

interface StoryModule {
  default: { component: ComponentType<Record<string, unknown>>; args?: Record<string, unknown> };
  [name: string]: unknown;
}

interface StoryObject {
  args?: Record<string, unknown>;
  parameters?: { ads?: { variant?: string; state?: string } };
}

async function loadStories(storiesPath: string): Promise<StoryCoverage[]> {
  const mod = (await import(pathToFileURL(storiesPath).href)) as StoryModule;
  const { component, args: metaArgs = {} } = mod.default;
  const stories: StoryCoverage[] = [];
  for (const [name, value] of Object.entries(mod)) {
    if (name === 'default' || name === '__namedExportsOrder') continue;
    const story = value as StoryObject;
    const markup = renderToStaticMarkup(createElement(component, { ...metaArgs, ...story.args }));
    stories.push({ name, ads: story.parameters?.ads ?? {}, root: parseRootAttributes(markup) });
  }
  return stories;
}

/** Runs every parity check for one component directory containing <id>.meta.json. */
export async function checkComponent(dir: string): Promise<ParityIssue[]> {
  const metaFile = readdirSync(dir).find((f) => f.endsWith('.meta.json'));
  if (!metaFile) throw new Error(`no *.meta.json in ${dir}`);
  const meta = JSON.parse(readFileSync(join(dir, metaFile), 'utf8')) as MetaLike;
  const id = basename(metaFile, '.meta.json');
  const issues: ParityIssue[] = [];

  const tsxPath = join(dir, `${id}.tsx`);
  const cssPath = join(dir, `${id}.css`);
  const storiesPath = join(dir, `${id}.stories.tsx`);

  if (!existsSync(tsxPath)) return [issue(meta.id, 'prop', `component file ${id}.tsx is missing`)];
  const props = extractProps(tsxPath, `${pascalCase(id)}Props`);
  issues.push(...checkProps(meta, props), ...checkVariants(meta, props));

  if (existsSync(cssPath)) issues.push(...checkCssStates(meta, readFileSync(cssPath, 'utf8')));
  else issues.push(issue(meta.id, 'state', `stylesheet ${id}.css is missing`));

  if (existsSync(storiesPath)) issues.push(...checkStories(meta, await loadStories(storiesPath)));
  else issues.push(issue(meta.id, 'story', `stories file ${id}.stories.tsx is missing`));

  return issues;
}
