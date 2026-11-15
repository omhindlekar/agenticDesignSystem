/** QA check: token lint on the generated screen (DS-T-*, DS-L-*, DS-I-*, DS-C-006). */
import { lintString } from './index.js';
import type { QaCheck } from '../qa-check.js';

const SENTENCE: Record<string, (m: string) => string> = {
  'hex-color': (m) => `Use a colour token, var(--color-…), instead of ${m}.`,
  'rgb-color': (m) => `Use a colour token, var(--color-…), instead of ${m}).`,
  'hsl-color': (m) => `Use a colour token, var(--color-…), instead of ${m}).`,
  'hardcoded-spacing': (m) => `Use a spacing token, var(--space-…), instead of "${m}".`,
  'hardcoded-radius': (m) => `Corners are square; remove "${m}" or use a radius token.`,
  'non-zero-radius': (m) => `Corners are square; remove "${m}".`,
  'hardcoded-shadow': (m) => `Take shadows from the elevation tokens instead of "${m}".`,
  'hardcoded-font-size': (m) => `Use a type token, var(--type-…-size), instead of "${m}".`,
  'hardcoded-font-weight': (m) => `Use a font-weight token instead of "${m}".`,
  'hardcoded-font-family': (m) => `Use var(--font-family-body) or var(--font-family-display) instead of "${m}".`,
  'hardcoded-line-height': (m) => `Use a line-height token instead of "${m}".`,
  'raw-svg': () => 'Draw icons with the Icon component, not raw SVG.',
  'native-picker': (m) => `Use Select, Combobox or DatePicker instead of "${m}".`,
};

const check: QaCheck = {
  name: 'token-lint',
  async run({ tsx }) {
    const violations = lintString(tsx, 'screen.tsx');
    if (!violations.length) return { status: 'pass', reason: 'No hardcoded design values.', findings: [] };
    return {
      status: 'fail',
      reason: `${violations.length} hardcoded value(s) where a token is required.`,
      findings: violations.map((v) => ({
        ruleId: v.ruleRef ?? 'DS-T-001',
        message: (SENTENCE[v.pattern] ?? ((m: string) => `Replace "${m}" with a design token (${v.pattern}).`))(
          v.match.trim(),
        ),
        evidence: `screen.tsx:${v.line}:${v.column}`,
      })),
    };
  },
};
export default check;
