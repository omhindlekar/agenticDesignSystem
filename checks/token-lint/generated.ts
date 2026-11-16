/**
 * DS-P-004 (FR-21): a generated screen takes its layout, spacing and backgrounds from layout
 * components and page templates, never from inline styles or style blocks — even tokenised
 * ones, because inline layout is how screens drift into bare, unstructured stacks.
 */
export interface LayoutViolation {
  line: number;
  column: number;
  pattern: 'inline-layout' | 'style-element';
  match: string;
  ruleRef: 'DS-P-004';
}

const LAYOUT_PROP =
  /^(display|gap|rowGap|columnGap|margin\w*|padding\w*|width|minWidth|maxWidth|height|minHeight|maxHeight|inlineSize|blockSize|minInlineSize|maxInlineSize|flex\w*|grid\w*|justify\w*|align\w*|place\w*|order|position|inset\w*|top|right|bottom|left|float|background\w*)$/;

export function lintGeneratedLayout(tsx: string): LayoutViolation[] {
  const out: LayoutViolation[] = [];
  const at = (index: number) => {
    const before = tsx.slice(0, index).split('\n');
    return { line: before.length, column: before[before.length - 1]!.length + 1 };
  };
  for (const m of tsx.matchAll(/style=\{\{([\s\S]*?)\}\}/g)) {
    const body = m[1] ?? '';
    const start = (m.index ?? 0) + m[0].indexOf(body);
    for (const p of body.matchAll(/(?:^|[,{\s])['"]?([A-Za-z-]+)['"]?\s*:/g)) {
      const name = (p[1] ?? '').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      if (LAYOUT_PROP.test(name))
        out.push({ ...at(start + (p.index ?? 0) + p[0].indexOf(p[1]!)), pattern: 'inline-layout', match: p[1]!, ruleRef: 'DS-P-004' });
    }
  }
  for (const m of tsx.matchAll(/<style[\s>]/g)) out.push({ ...at(m.index ?? 0), pattern: 'style-element', match: '<style>', ruleRef: 'DS-P-004' });
  return out;
}
