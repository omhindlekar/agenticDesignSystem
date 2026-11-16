/**
 * QA check: rules audit on the screen spec. Judges the component rules that can be decided
 * from the component tree, and that every node is a design-system component used with the
 * props its metadata lists.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentNode, ScreenSpec } from '../../packages/schemas/src/screen-spec.js';
import type { QaCheck, QaCheckOutcome } from '../qa-check.js';

type Finding = QaCheckOutcome['findings'][number];

const DESTRUCTIVE = /\b(delete|remove|discard|erase|destroy|deactivate|revoke)\b/i;
const INTERACTIVE = new Set([
  'button',
  'icon-button',
  'link',
  'menu',
  'select',
  'combobox',
  'input',
  'checkbox',
  'switch',
]);
/** Props React or the DOM accept on any component wrapper. */
const UNIVERSAL_PROPS = new Set([
  'key',
  'children',
  'id',
  'className',
  'aria-label',
  'aria-describedby',
  'data-testid',
]);

function walk(
  node: ComponentNode,
  path: string,
  ancestors: string[],
  visit: (n: ComponentNode, path: string, ancestors: string[]) => void,
) {
  visit(node, path, ancestors);
  node.children?.forEach((c, i) => walk(c, `${path}.children[${i}]`, [...ancestors, node.component], visit));
}

const label = (n: ComponentNode) => String(n.props['label'] ?? n.props['children'] ?? '');

export function auditSpec(spec: ScreenSpec, repoRoot: string): Finding[] {
  const findings: Finding[] = [];
  const metaProps = new Map<string, Set<string> | null>();
  const propsFor = (id: string) => {
    if (!metaProps.has(id)) {
      const file = join(repoRoot, 'components', id, `${id}.meta.json`);
      metaProps.set(
        id,
        existsSync(file)
          ? new Set(
              (JSON.parse(readFileSync(file, 'utf8')) as { props: Array<{ name: string }> }).props.map((p) => p.name),
            )
          : null,
      );
    }
    return metaProps.get(id);
  };

  walk(spec.tree, 'tree', [], (n, path, ancestors) => {
    const known = propsFor(n.component);
    if (known === null) {
      findings.push({
        ruleId: 'DS-C-009',
        message: `"${n.component}" is not a design-system component; use one from the catalogue.`,
        evidence: path,
      });
      return;
    }
    for (const prop of Object.keys(n.props)) {
      if (!known?.has(prop) && !UNIVERSAL_PROPS.has(prop) && !prop.startsWith('aria-') && !prop.startsWith('on'))
        findings.push({
          ruleId: 'DS-C-009',
          message: `${n.component} has no "${prop}" prop; use only the props its metadata lists.`,
          evidence: `${path}.props.${prop}`,
        });
    }
    if (
      (n.component === 'button' || n.component === 'icon-button') &&
      DESTRUCTIVE.test(label(n)) &&
      n.props['tone'] !== 'danger' &&
      n.props['variant'] !== 'danger'
    )
      findings.push({
        ruleId: 'DS-C-002',
        message: `"${label(n)}" is destructive, so its button needs tone="danger".`,
        evidence: path,
      });
    if (n.component === 'select' && Array.isArray(n.props['options']) && n.props['options'].length < 4)
      findings.push({
        ruleId: 'DS-C-003',
        message: `Select has ${n.props['options'].length} options; use RadioGroup or SegmentedControl for fewer than four.`,
        evidence: path,
      });
    if (n.component === 'card' && ancestors.includes('card'))
      findings.push({
        ruleId: 'DS-C-004',
        message: 'A Card is nested inside another Card; separate them with layout spacing instead.',
        evidence: path,
      });
    if (n.component === 'modal' && ancestors.includes('modal'))
      findings.push({
        ruleId: 'DS-C-005',
        message: 'A Modal is opened inside another Modal; use one modal with steps.',
        evidence: path,
      });
    if (
      n.component === 'tooltip' &&
      (typeof n.props['content'] !== 'string' ||
        (n.children ?? []).some((c, i) => i > 0 && INTERACTIVE.has(c.component)))
    )
      findings.push({
        ruleId: 'DS-C-007',
        message: 'A Tooltip holds interactive or non-text content; use a Popover.',
        evidence: path,
      });
    if (
      n.component === 'menu' &&
      Array.isArray(n.props['items']) &&
      (n.props['items'] as Array<Record<string, unknown>>).some((i) => typeof i === 'object' && i && 'href' in i)
    )
      findings.push({
        ruleId: 'DS-C-008',
        message: 'Menu items link to pages; use SideNav, Tabs or Links for navigation.',
        evidence: path,
      });
  });
  return findings;
}

const check: QaCheck = {
  name: 'rules-audit',
  async run({ spec, repoRoot }) {
    const findings = auditSpec(spec, repoRoot);
    return findings.length
      ? { status: 'fail', reason: `${findings.length} component rule(s) broken.`, findings }
      : { status: 'pass', reason: 'Component rules followed.', findings: [] };
  },
};
export default check;
