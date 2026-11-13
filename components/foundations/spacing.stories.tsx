import type { Meta, StoryObj } from '@storybook/react-vite';
import { primitives, resolved } from './tokens';
import './foundations.css';

const SPACES = primitives.filter((t) => /^space-\d+$/.test(t.name) && t.value !== '0px');
const HEIGHTS = ['size-control-sm', 'size-control-md', 'size-control-lg'] as const;

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Spacing: StoryObj = {
  render: () => (
    <div className="fd-page">
      <section className="fd-section">
        <h2 className="fd-section__heading">Spacing scale</h2>
        <p className="fd-note">Every step is a multiple of the 4px base.</p>
        {SPACES.map((t) => (
          <div key={t.name} className="fd-space-row">
            <span className="fd-mono">
              {t.name} · {t.value}
            </span>
            {/* Bar width is the token's own value, read from tokens/primitives.json. */}
            <span className="fd-space-bar" style={{ width: t.value }} />
          </div>
        ))}
      </section>
      <section className="fd-section">
        <h2 className="fd-section__heading">Control heights</h2>
        <p className="fd-note">Buttons, inputs and selects. Small controls such as the checkbox sit in a 40px hit area.</p>
        <div className="fd-heights">
          {HEIGHTS.map((h) => (
            <span key={h} className="fd-height" style={{ height: `var(--${h})` }}>
              {h.replace('size-control-', '')} · {Math.round(parseFloat(resolved.get(h) ?? '0') * 16)}px
            </span>
          ))}
        </div>
      </section>
    </div>
  ),
};
