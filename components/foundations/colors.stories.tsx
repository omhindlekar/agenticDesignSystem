import type { Meta, StoryObj } from '@storybook/react-vite';
import { contrastRatio } from '../../checks/token-lint/contrast';
import { RAMPS, STEPS, primitive, resolved, semantic } from './tokens';
import './foundations.css';

const WHITE = primitive('color-white');
const INK = primitive('color-neutral-900');

/** Label text on a swatch: whichever of white or neutral 900 contrasts more. */
function inkFor(bg: string): string {
  return contrastRatio(WHITE, bg) >= contrastRatio(INK, bg) ? WHITE : INK;
}

function Ramps() {
  return (
    <section className="fd-section">
      <h2 className="fd-section__heading">Palette</h2>
      <p className="fd-note">Ratios are against white. 4.5:1 or more is safe for text, 3:1 or more for borders and icons.</p>
      {RAMPS.map((ramp) => (
        <div key={ramp} className="fd-section">
          <span className="fd-overline">{ramp.replace('-', ' ')}</span>
          <div className="fd-ramp">
            {STEPS.map((step) => {
              const value = primitive(`color-${ramp}-${step}`);
              return (
                <div key={step} className="fd-swatch" style={{ backgroundColor: value, color: inkFor(value) }}>
                  <span className="fd-swatch__step">{step}</span>
                  <span>{value}</span>
                  <span>{contrastRatio(value, WHITE).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function SemanticColors() {
  const colors = semantic.filter((t) => t.name.startsWith('color-') && !t.deprecated);
  return (
    <section className="fd-section">
      <h2 className="fd-section__heading">Semantic colours</h2>
      <p className="fd-note">Components use only these names. Each points at a palette step.</p>
      <div className="fd-grid">
        {colors.map((t) => (
          <div key={t.name} className="fd-token">
            <span className="fd-token__chip" style={{ backgroundColor: `var(--${t.name})` }} />
            <span className="fd-token__text">
              <span className="fd-token__name">{t.name}</span>
              <span className="fd-mono">
                {t.reference} · {resolved.get(t.name)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContrastTable() {
  const texts = ['color-text-primary', 'color-text-heading', 'color-text-secondary', 'color-text-link', 'color-text-danger', 'color-text-success', 'color-text-warning', 'color-text-info'];
  const surfaces = ['color-background-page', 'color-background-raised', 'color-background-sunken'];
  return (
    <section className="fd-section">
      <h2 className="fd-section__heading">Text on surfaces</h2>
      <p className="fd-note">WCAG 2.2 AA needs 4.5:1 for body text. Token lint checks these and every border, focus ring and state layer.</p>
      <table className="fd-table">
        <thead>
          <tr>
            <th scope="col">Text</th>
            {surfaces.map((s) => (
              <th key={s} scope="col">
                {s.replace('color-background-', '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {texts.map((t) => (
            <tr key={t}>
              <th scope="row" style={{ color: `var(--${t})` }}>
                {t.replace('color-text-', '')}
              </th>
              {surfaces.map((s) => {
                const ratio = contrastRatio(resolved.get(t) ?? '', resolved.get(s) ?? '');
                return (
                  <td key={s} style={{ backgroundColor: `var(--${s})` }}>
                    <span className={ratio >= 4.5 ? 'fd-pass' : 'fd-fail'}>{ratio.toFixed(2)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Colors: StoryObj = {
  render: () => (
    <div className="fd-page">
      <Ramps />
      <SemanticColors />
      <ContrastTable />
    </div>
  ),
};
