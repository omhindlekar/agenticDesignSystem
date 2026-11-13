import type { Meta, StoryObj } from '@storybook/react-vite';
import './foundations.css';

const LEVELS = [
  [0, 'Flat surfaces, flat cards'],
  [1, 'Cards'],
  [2, 'Menus, hovered interactive cards'],
  [3, 'Raised overlays'],
  [4, 'Modals'],
] as const;

const meta = {
  title: 'Foundations/Elevation',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Elevation: StoryObj = {
  render: () => (
    <div className="fd-page">
      <section className="fd-section">
        <h2 className="fd-section__heading">Elevation</h2>
        <p className="fd-note">Square, blue 900 tinted shadows at low opacity. Cards also keep their 1px border.</p>
        <div className="fd-elevation">
          {LEVELS.map(([level, use]) => (
            <div key={level} className="fd-elevation__tile" data-level={level}>
              <span className="fd-token__name">elevation-{level}</span>
              <span className="fd-mono">{use}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
