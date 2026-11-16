/**
 * Composition (DS-P) and copy (DS-W) rules, judged from the screen spec (FR-21, FR-27).
 * Template slots and their accepted components come from each template's metadata, so a new
 * template needs no change here. Run by the rules-audit QA check when qa.pageLayer is on.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentNode, ScreenSpec } from '../../packages/schemas/src/screen-spec.js';
import type { QaCheckOutcome } from '../qa-check.js';

type Finding = QaCheckOutcome['findings'][number];

export { pageLayerEnforced } from '../../packages/config/src/index.js';
interface Slot {
  name: string;
  required: boolean;
  accepts: string[];
}

const FIELDS = new Set(['input', 'select', 'checkbox', 'radio-group', 'switch', 'textarea', 'combobox', 'date-picker', 'number-field', 'search-field', 'slider']);
const DESTRUCTIVE = /\b(delete|remove|discard|erase|destroy|deactivate|revoke|close account)\b/i;
const BANNED_BUTTONS = /^(submit|ok|okay|click here|here|go|yes|no|button|more|send)$/i;
const PLACEHOLDER = /^(label|title|text|button|heading|placeholder|description|link|item|value|name)$/i;
const PLACEHOLDER_ANYWHERE = /\blorem ipsum\b|\btodo\b|\bxxx\b|\btbd\b/i;
const GENERIC_ERROR = /^(error|invalid|invalid input|required|wrong|incorrect|failed)\.?$/i;
/** Props that hold words people read; other string props (type, name, href) are not copy. */
const COPY_PROPS = ['label', 'title', 'children', 'description', 'subtitle', 'helperText', 'errorMessage', 'content', 'placeholder'];
const GENERIC_TITLE = /\b(screen|page|form|section|title|heading|untitled)$/i;

function loadSlots(repoRoot: string): Map<string, Slot[]> {
  const out = new Map<string, Slot[]>();
  const dir = join(repoRoot, 'components');
  for (const id of readdirSync(dir)) {
    const f = join(dir, id, `${id}.meta.json`);
    if (!existsSync(f)) continue;
    const m = JSON.parse(readFileSync(f, 'utf8')) as { kind?: string; slots?: Slot[] };
    if (m.kind === 'template') out.set(id, m.slots ?? []);
  }
  return out;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const label = (n: ComponentNode) => str(n.props['label']) || str(n.props['children']);
const isPrimaryButton = (n: ComponentNode) =>
  n.component === 'button' && ['contained', 'primary', undefined].includes(n.props['variant'] as string | undefined);
const sentences = (s: string) => s.split(/[.!?](?:\s|$)/).filter((x) => x.trim()).length;

function walk(n: ComponentNode, path: string, anc: ComponentNode[], visit: (n: ComponentNode, path: string, anc: ComponentNode[]) => void) {
  visit(n, path, anc);
  n.children?.forEach((c, i) => walk(c, `${path}.children[${i}]`, [...anc, n], visit));
}

export function auditComposition(spec: ScreenSpec, repoRoot: string): Finding[] {
  const findings: Finding[] = [];
  const add = (ruleId: string, message: string, evidence: string) => findings.push({ ruleId, message, evidence });
  const templates = loadSlots(repoRoot);
  const root = spec.tree;
  const isTemplate = templates.has(root.component);

  // DS-P-001: a template or PageShell at the root.
  if (!isTemplate && root.component !== 'page-shell')
    add('DS-P-001', `The screen's root is ${root.component}; start from a page template or PageShell.`, 'tree');

  // DS-P-007: required slots filled, every child of a template names a slot that accepts it.
  if (isTemplate) {
    const slots = templates.get(root.component)!;
    for (const s of slots.filter((x) => x.required)) {
      const byProp = root.props[s.name] !== undefined && root.props[s.name] !== '';
      const byChild = (root.children ?? []).some((c) => c.slot === s.name);
      if (!byProp && !byChild) add('DS-P-007', `${root.component} needs its "${s.name}" slot filled.`, 'tree');
    }
    (root.children ?? []).forEach((c, i) => {
      const at = `tree.children[${i}]`;
      const slot = slots.find((s) => s.name === c.slot);
      if (!c.slot) add('DS-P-007', `${c.component} sits in ${root.component} without naming a slot.`, at);
      else if (!slot) add('DS-P-007', `${root.component} has no "${c.slot}" slot.`, at);
      else if (!slot.accepts.includes(c.component))
        add('DS-P-007', `The "${c.slot}" slot takes ${slot.accepts.join(', ')}, not ${c.component}.`, at);
    });
  }

  let modals = 0;
  const destructiveOutsideModal: string[] = [];
  const primaryByView = new Map<string, number>();

  walk(root, 'tree', [], (n, path, anc) => {
    const inModal = anc.findIndex((a) => a.component === 'modal');
    const view = inModal === -1 ? 'page' : `modal@${inModal}`;
    if (n.component === 'modal') modals++;

    // DS-P-002: one primary action per view.
    if (isPrimaryButton(n)) {
      const count = (primaryByView.get(view) ?? 0) + 1;
      primaryByView.set(view, count);
      if (count === 2)
        add('DS-P-002', `More than one primary action ${view === 'page' ? 'on the page' : 'in a modal'}; make the others outlined or text.`, path);
    }

    // DS-P-003: the template owns the h1; level-3 sections sit inside a section.
    if (isTemplate && n.component === 'heading' && n.props['level'] === 1)
      add('DS-P-003', 'The page template already provides the h1; use level 2 or 3 here.', path);
    if (n.component === 'section' && n.props['headingLevel'] === 3 && !anc.some((a) => a.component === 'section'))
      add('DS-P-003', 'A level-3 section must sit inside a level-2 section; heading levels must not skip.', path);

    // DS-P-005: the danger zone is last among its siblings; destructive actions live in it or a modal.
    const kids = n.children ?? [];
    const lastNonModal = kids.map((c) => c.component !== 'modal').lastIndexOf(true);
    kids.forEach((c, i) => {
      if (c.component === 'section' && c.props['variant'] === 'danger' && i !== lastNonModal)
        add('DS-P-005', 'The danger zone must come after every other section.', `${path}.children[${i}]`);
    });
    if ((n.component === 'button' || n.component === 'icon-button') && DESTRUCTIVE.test(label(n))) {
      const safe = anc.some((a) => a.component === 'modal' || (a.component === 'section' && a.props['variant'] === 'danger'));
      if (!safe) add('DS-P-005', `"${label(n)}" is destructive; put it in a danger section or a confirmation modal.`, path);
      if (inModal === -1) destructiveOutsideModal.push(path);
    }

    // DS-P-006: more than six fields in one group need sections.
    const fields = kids.filter((c) => FIELDS.has(c.component)).length;
    if (fields > 6) add('DS-P-006', `${fields} fields in one group; split them into titled Sections.`, path);

    // DS-P-008: fields on a bare PageShell sit in a narrow container.
    if (root.component === 'page-shell' && FIELDS.has(n.component)) {
      const narrow = anc.some((a) => a.component === 'container' && ['sm', 'md'].includes(String(a.props['size'])));
      if (!narrow) add('DS-P-008', 'Put fields in a Container of size sm or md so they keep a readable width.', path);
    }

    // Copy (DS-W).
    for (const key of ['title', 'children'] as const) {
      const t = str(n.props[key]);
      const isTitle = key === 'title' || n.component === 'heading';
      if (isTitle && t) {
        const words = t.trim().split(/\s+/);
        if (GENERIC_TITLE.test(t.trim()))
          add('DS-W-001', `"${t}" is generic; say what the page or section is for.`, `${path}.props.${key}`);
        else if (words.length >= 3 && words.every((w) => /^[A-Z]/.test(w)))
          add('DS-W-001', `"${t}" is in title case; use sentence case.`, `${path}.props.${key}`);
      }
    }
    if (n.component === 'button' && BANNED_BUTTONS.test(label(n).trim()))
      add('DS-W-002', `"${label(n)}" doesn't say what happens; start with a verb, such as "Save changes".`, path);
    const err = str(n.props['errorMessage']);
    if (err && (GENERIC_ERROR.test(err.trim()) || sentences(err) > 1 || err.length > 140))
      add('DS-W-004', 'An error message is one sentence that says what went wrong and how to fix it.', `${path}.props.errorMessage`);
    for (const key of COPY_PROPS) {
      const s = str(n.props[key]).trim();
      if (s && (PLACEHOLDER.test(s) || PLACEHOLDER_ANYWHERE.test(s)))
        add('DS-W-005', `"${s}" is placeholder copy; write the real words.`, `${path}.props.${key}`);
    }
    for (const key of ['description', 'subtitle']) {
      const s = str(n.props[key]);
      if (s.length > 140) add('DS-W-006', `The ${key} is ${s.length} characters; keep it to one sentence under 140.`, `${path}.props.${key}`);
    }
  });

  // DS-P-009: destructive actions are confirmed in a modal.
  if (destructiveOutsideModal.length && modals === 0)
    add('DS-P-009', 'A destructive action needs a confirmation Modal before it runs.', destructiveOutsideModal[0]!);

  return findings;
}
