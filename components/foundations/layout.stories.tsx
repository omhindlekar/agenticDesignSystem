import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { resolved } from './tokens';
import './foundations.css';

const BREAKPOINTS = [
  ['breakpoint-sm', 'Tablets in portrait', 'layout-columns-md'],
  ['breakpoint-md', 'Tablets in landscape, small laptops', 'layout-columns-lg'],
  ['breakpoint-lg', 'Laptops and desktops', 'layout-columns-lg'],
  ['breakpoint-xl', 'Wide desktops', 'layout-columns-lg'],
] as const;

const meta = {
  title: 'Foundations/Layout',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

function DensitySample({ density }: { density: 'comfortable' | 'compact' }) {
  return (
    <div className="fd-density" {...(density === 'compact' ? { 'data-density': 'compact' } : {})}>
      <span className="fd-overline">{density}</span>
      <Input label="Project name" defaultValue="Design system" />
      <div className="fd-density__row">
        <Button label="Save" />
        <Button label="Cancel" variant="outlined" />
      </div>
    </div>
  );
}

export const Layout: StoryObj = {
  render: () => (
    <div className="fd-page">
      <section className="fd-section">
        <h2 className="fd-section__heading">Breakpoints</h2>
        <p className="fd-note">
          Mobile first: each breakpoint applies from its width up. CSS media queries cannot read custom properties, so code
          reads these from styles/tokens.json.
        </p>
        <table className="fd-table">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">From</th>
              <th scope="col">Typical screens</th>
              <th scope="col">Columns</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">below breakpoint-sm</th>
              <td>0</td>
              <td>Phones</td>
              <td>layout-columns-sm · {resolved.get('layout-columns-sm')}</td>
            </tr>
            {BREAKPOINTS.map(([token, screens, cols]) => (
              <tr key={token}>
                <th scope="row">{token}</th>
                <td>{resolved.get(token)}</td>
                <td>{screens}</td>
                <td>
                  {cols} · {resolved.get(cols)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="fd-section">
        <h2 className="fd-section__heading">Grid</h2>
        <p className="fd-note">
          12 columns from breakpoint-md, with layout-gutter-lg ({resolved.get('layout-gutter-lg')}) between columns and
          layout-margin-md ({resolved.get('layout-margin-md')}) at the sides.
        </p>
        <div className="fd-grid-demo">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="fd-grid-demo__col">
              {i + 1}
            </span>
          ))}
        </div>
      </section>

      <section className="fd-section">
        <h2 className="fd-section__heading">Density</h2>
        <p className="fd-note">
          Compact steps every control down one size (40 to 32px, 32 to 28px) and tightens padding. Apply
          data-density="compact" to the page or to one container, such as a table toolbar. Targets stay at least 24px.
        </p>
        <div className="fd-density-pair">
          <DensitySample density="comfortable" />
          <DensitySample density="compact" />
        </div>
      </section>
    </div>
  ),
};
