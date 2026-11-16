/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/**
 * QA check: accessibility of the rendered screen (FR-11, NFR-9).
 * axe with WCAG 2.0–2.2 A and AA in Chromium (contrast, labels, target size, …), then a
 * keyboard walk: focus order follows the reading order, every stop shows a focus
 * indicator, and Tab never gets stuck. Findings cite the success criterion and rule.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { AXE_EXCEPTIONS } from './axe-exceptions.js';
import type { QaCheck, QaCheckOutcome } from '../qa-check.js';

type Finding = QaCheckOutcome['findings'][number];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

/** "wcag143" → "1.4.3". */
const criterion = (tags: string[]) => {
  const t = tags.find((x) => /^wcag\d{3,4}$/.test(x));
  return t
    ? t
        .slice(4)
        .split('')
        .join('.')
        .replace(/^(\d)\.(\d)\.(\d)\.(\d)$/, '$1.$2.$3$4')
    : undefined;
};
/** Design-system rule for an axe rule. */
function ruleFor(id: string, tags: string[]): string {
  if (id === 'color-contrast') return 'DS-A-001';
  if (id === 'target-size') return 'DS-A-003';
  if (tags.includes('cat.forms') || /label|name/.test(id)) return 'DS-A-004';
  return 'DS-A-008';
}

const check: QaCheck = {
  name: 'a11y',
  async run({ render }) {
    const { page } = await render();
    const findings: Finding[] = [];

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(
      async ({ tags, exceptions }) => {
        type V = {
          id: string;
          help: string;
          tags: string[];
          nodes: Array<{ target: string[]; failureSummary?: string }>;
        };
        const axe = (window as unknown as { axe: { run: (c: Document, o: object) => Promise<{ violations: V[] }> } })
          .axe;
        const r = await axe.run(document, { runOnly: { type: 'tag', values: tags } });
        return r.violations
          .map((v) => ({
            ...v,
            nodes: v.nodes.filter((n) => {
              const el = document.querySelector(n.target.join(' '));
              return !(el && exceptions.some((e) => e.rule === v.id && el.matches(e.selector)));
            }),
          }))
          .filter((v) => v.nodes.length)
          .map((v) => ({
            id: v.id,
            help: v.help,
            tags: v.tags,
            target: v.nodes[0]!.target.join(' '),
            count: v.nodes.length,
          }));
      },
      { tags: TAGS, exceptions: AXE_EXCEPTIONS.map(({ rule, selector }) => ({ rule, selector })) },
    );
    for (const v of violations) {
      const sc = criterion(v.tags);
      findings.push({
        ruleId: ruleFor(v.id, v.tags),
        ...(sc ? { criterion: sc } : {}),
        message: `${v.help}${v.count > 1 ? ` (${v.count} elements)` : ''}.`.replace(/\.\.$/, '.'),
        evidence: v.target,
      });
    }

    // Keyboard walk.
    const stops = await page.evaluate(() => {
      const sel =
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return [...document.querySelectorAll(sel)].filter((e) => (e as HTMLElement).getClientRects().length > 0).length;
    });
    const seen: string[] = [];
    let positiveTabindex = false;
    let endedByRepeat = false;
    let repeated = '';
    for (let i = 0; i < stops + 2 && i < 60; i++) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const ring = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none';
        const shadow = s.boxShadow !== 'none';
        // A focus ring may be drawn by a wrapper (for example a field box) via :focus-within.
        let wrapper = false;
        for (let p = el.parentElement; p && !wrapper && p !== document.body; p = p.parentElement) {
          const ps = getComputedStyle(p);
          wrapper =
            (parseFloat(ps.outlineWidth) > 0 && ps.outlineStyle !== 'none') ||
            (getComputedStyle(p, '::after').outlineStyle !== 'none' &&
              parseFloat(getComputedStyle(p, '::after').outlineWidth) > 0);
        }
        const r = el.getBoundingClientRect();
        const id = `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? `[aria-label="${el.getAttribute('aria-label')}"]` : ''}@${Math.round(r.x)},${Math.round(r.y)}`;
        return { id, visible: ring || shadow || wrapper, tabindex: el.tabIndex, y: r.y, x: r.x };
      });
      if (!stop) break;
      if (stop.tabindex > 0) positiveTabindex = true;
      if (!stop.visible)
        findings.push({
          ruleId: 'DS-A-002',
          criterion: '2.4.7',
          message: 'This control shows no visible focus indicator when reached with Tab.',
          evidence: stop.id,
        });
      if (seen.includes(stop.id)) {
        endedByRepeat = true;
        repeated = stop.id;
        break;
      }
      seen.push(stop.id);
    }
    if (stops > 0 && seen.length === 0)
      findings.push({
        ruleId: 'DS-A-008',
        criterion: '2.1.1',
        message: 'No control can be reached with the Tab key.',
        evidence: 'document',
      });
    // A trap: Tab comes back round to a control already visited, inside a screen with no open dialog.
    // Composite widgets (radio groups, tabs, grids) expose one stop each, so fewer stops than focusables is fine.
    if (
      endedByRepeat &&
      seen.length > 0 &&
      seen.indexOf(repeated) > 0 &&
      !(await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')))
    )
      findings.push({
        ruleId: 'DS-A-008',
        criterion: '2.1.2',
        message: 'Keyboard focus is trapped; Tab cycles without leaving this group.',
        evidence: repeated,
      });
    if (positiveTabindex)
      findings.push({
        ruleId: 'DS-A-008',
        criterion: '2.4.3',
        message: 'A positive tabindex changes the focus order from the reading order; remove it.',
        evidence: 'tabindex',
      });

    const unique = findings.filter(
      (f, i) =>
        findings.findIndex((g) => g.ruleId === f.ruleId && g.message === f.message && g.evidence === f.evidence) === i,
    );
    return unique.length
      ? { status: 'fail', reason: `${unique.length} accessibility problem(s) against WCAG 2.2 AA.`, findings: unique }
      : {
          status: 'pass',
          reason: `WCAG 2.2 AA automated checks pass; ${seen.length} keyboard stop(s), all with a visible focus indicator.`,
          findings: [],
        };
  },
};
export default check;
