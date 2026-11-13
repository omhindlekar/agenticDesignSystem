/**
 * Token contrast check (FR-11, NFR-9): WCAG 2.2 AA over resolved semantic tokens.
 *
 * - Text (SC 1.4.3): 4.5:1 against every surface it can sit on.
 * - Control boundaries and the focus ring (SC 1.4.11): 3:1 against every surface.
 *
 * Pairs are derived from token names, so a new color-text-* or control border token
 * is checked automatically. Exempt by WCAG: disabled text and decorative borders
 * (color-border-default, color-border-disabled).
 */

export interface ContrastPair {
  fg: string;
  bg: string;
  min: 4.5 | 3;
  ruleRef: 'DS-A-001' | 'DS-A-006';
  /** A state layer composited over `bg` before measuring (hover, focus, pressed). */
  layer?: { color: string; opacity: string };
}

export interface ExemptPair {
  fg: string;
  bg: string;
  ratio: number;
  reason: string;
}

export interface ContrastViolation extends ContrastPair {
  ratio: number;
  fgValue: string;
  bgValue: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function luminance(hex: string): number {
  const channel = (i: number): number => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Composites `fg` at `alpha` over the opaque `bg`. Both are #rrggbb. */
export function blend(fg: string, alpha: number, bg: string): string {
  const ch = (hex: string, i: number): number => parseInt(hex.slice(i, i + 2), 16);
  return (
    '#' +
    [1, 3, 5]
      .map((i) => Math.round(ch(fg, i) * alpha + ch(bg, i) * (1 - alpha)))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function contrastRatio(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const SURFACES = [
  'color-background-page',
  'color-background-surface',
  'color-background-raised',
  'color-background-sunken',
];

/** Text that sits on a specific fill rather than on a page surface. */
const TEXT_ON_FILL_ONLY = new Set(['color-text-disabled', 'color-text-inverse', 'color-text-on-success']);

/** Borders that are decorative or disabled, so SC 1.4.11 does not apply. */
const EXEMPT_BORDERS = new Set(['color-border-default', 'color-border-disabled']);

const ruleFor = (name: string): ContrastPair['ruleRef'] => (name.includes('success') ? 'DS-A-006' : 'DS-A-001');

export function buildContrastPairs(tokens: Map<string, string>): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  const add = (fg: string, bg: string, min: ContrastPair['min'], rule = ruleFor(fg)): void => {
    if (tokens.has(fg) && tokens.has(bg)) pairs.push({ fg, bg, min, ruleRef: rule });
  };
  const names = [...tokens.keys()];

  for (const text of names.filter((n) => n.startsWith('color-text-') && !TEXT_ON_FILL_ONLY.has(n))) {
    for (const s of SURFACES) add(text, s, 4.5);
  }

  const boundaries = [
    ...names.filter((n) => n.startsWith('color-border-') && !EXEMPT_BORDERS.has(n)),
    'color-interactive-focus-ring',
    'color-interactive-default',
  ];
  for (const b of boundaries) for (const s of SURFACES) add(b, s, 3);

  // Status messages: text on its own tinted background.
  for (const tone of ['success', 'danger', 'warning', 'info']) {
    add(`color-status-${tone}-text`, `color-status-${tone}-bg`, 4.5);
  }

  // Focused fields get a light blue tint behind the value.
  add('color-text-primary', 'color-background-focus-tint', 4.5);
  add('color-text-secondary', 'color-background-focus-tint', 4.5);
  add('color-border-interactive', 'color-background-focus-tint', 3);

  // Filled controls.
  for (const fill of ['color-interactive-default', 'color-interactive-hover', 'color-interactive-active', 'color-text-danger', 'color-status-danger-text']) {
    add('color-text-inverse', fill, 4.5);
  }
  add('color-text-on-success', 'color-status-success-fill', 4.5, 'DS-A-006');

  // State layers (hover, focus, pressed) tint the surface under text and borders.
  const layered: Array<[string, string, ContrastPair['min']]> = [
    ['color-text-link', 'color-state-layer', 4.5],
    ['color-text-primary', 'color-state-layer', 4.5],
    // Controls that show a state layer switch their border to the hover token.
    ['color-border-input-hover', 'color-state-layer', 3],
    ['color-interactive-focus-ring', 'color-state-layer', 3],
    // Danger-tone actions use the darker danger-action text, not field error text.
    ['color-text-danger-action', 'color-state-layer-danger', 4.5],
  ];
  for (const opacity of ['opacity-state-hover', 'opacity-state-focus', 'opacity-state-pressed']) {
    for (const [fg, color, min] of layered) {
      for (const s of SURFACES) {
        if (tokens.has(fg) && tokens.has(s) && tokens.has(color) && tokens.has(opacity)) {
          pairs.push({ fg, bg: s, min, ruleRef: ruleFor(fg), layer: { color, opacity } });
        }
      }
    }
  }

  return pairs;
}

function backgroundOf(tokens: Map<string, string>, pair: ContrastPair): string {
  const bg = tokens.get(pair.bg) ?? '';
  if (!pair.layer) return bg;
  const color = tokens.get(pair.layer.color) ?? '';
  const alpha = Number(tokens.get(pair.layer.opacity));
  if (!HEX.test(color) || !HEX.test(bg) || !(alpha >= 0 && alpha <= 1)) return '';
  return blend(color, alpha, bg);
}

/**
 * Disabled content (text at opacity-disabled on the disabled fill) is exempt from
 * WCAG 1.4.3 and 1.4.11. Listed so the ratios stay visible; never reported as failures.
 */
export function exemptPairs(tokens: Map<string, string>): ExemptPair[] {
  const fill = tokens.get('color-interactive-disabled') ?? '';
  const alpha = Number(tokens.get('opacity-disabled'));
  const out: ExemptPair[] = [];
  for (const fg of ['color-text-primary', 'color-text-link', 'color-text-inverse']) {
    const v = tokens.get(fg) ?? '';
    if (!HEX.test(v) || !HEX.test(fill) || !(alpha > 0)) continue;
    const drawn = blend(v, alpha, fill);
    out.push({
      fg: `${fg} @ opacity-disabled`,
      bg: 'color-interactive-disabled',
      ratio: contrastRatio(drawn, fill),
      reason: 'Disabled control: exempt under WCAG 2.2 SC 1.4.3 and 1.4.11',
    });
  }
  return out;
}

export function checkContrast(tokens: Map<string, string>): ContrastViolation[] {
  const out: ContrastViolation[] = [];
  for (const pair of buildContrastPairs(tokens)) {
    const fgValue = tokens.get(pair.fg) ?? '';
    const bgValue = backgroundOf(tokens, pair);
    // A colour the check cannot read is a failure, not a silent pass.
    const ratio = HEX.test(fgValue) && HEX.test(bgValue) ? contrastRatio(fgValue, bgValue) : 0;
    if (ratio < pair.min) out.push({ ...pair, ratio, fgValue, bgValue });
  }
  return out;
}
