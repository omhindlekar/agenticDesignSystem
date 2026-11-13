import type { Meta, StoryObj } from '@storybook/react-vite';
import { TYPE_ROLES, resolved } from './tokens';
import './foundations.css';

const SAMPLE: Record<(typeof TYPE_ROLES)[number], string> = {
  display: 'Design once, ship everywhere',
  h1: 'Heading one',
  h2: 'Heading two',
  h3: 'Heading three',
  h4: 'Heading four',
  subtitle: 'A subtitle introduces a section',
  body1: 'Body 1 is the default reading size for paragraphs and form values.',
  body2: 'Body 2 is for dense content such as cards, tables and checkbox labels.',
  button: 'Save changes',
  label: 'Email address',
  caption: 'Helper and error text use the caption size.',
  overline: 'Overline',
};

function spec(role: string): string {
  const px = Math.round(parseFloat(resolved.get(`type-${role}-size`) ?? '0') * 16);
  const family = (resolved.get(`type-${role}-family`) ?? '').split(',')[0]?.replace(/'/g, '');
  return `${px}px · ${resolved.get(`type-${role}-weight`)} · ${resolved.get(`type-${role}-line-height`)} · ${resolved.get(`type-${role}-letter-spacing`)} · ${family}`;
}

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Typography: StoryObj = {
  render: () => (
    <div className="fd-page">
      <section className="fd-section">
        <h2 className="fd-section__heading">Type scale</h2>
        <p className="fd-note">
          Saira SemiCondensed for display, headings, buttons, labels and overlines; Saira for subtitle, body and captions.
          Size · weight · line height · letter spacing · family.
        </p>
        <div>
          {TYPE_ROLES.map((role) => (
            <div key={role} className="fd-type-row">
              <p className="fd-type-sample" data-role={role}>
                {SAMPLE[role]}
              </p>
              <span className="fd-token__text">
                <span className="fd-token__name">type-{role}</span>
                <span className="fd-mono">{spec(role)}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
