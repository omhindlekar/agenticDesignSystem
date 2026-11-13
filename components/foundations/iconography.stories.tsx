import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';
import { ICON_NAMES } from '../icon/icons.generated';
import './foundations.css';

const meta = {
  title: 'Foundations/Iconography',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Iconography: StoryObj = {
  render: () => (
    <div className="fd-page">
      <section className="fd-section">
        <h2 className="fd-section__heading">Iconography</h2>
        <p className="fd-note">
          Material Symbols Sharp, weight 400 (Apache-2.0), drawn as SVG in the surrounding text colour. Sharp corners match
          the square identity. Sizes 16, 20 and 24px. To add an icon, list it in components/icon/icon-list.json and run
          npm run icons:build.
        </p>
      </section>

      <section className="fd-section">
        <h2 className="fd-section__heading">Usage</h2>
        <table className="fd-table">
          <tbody>
            <tr>
              <th scope="row">Decorative</th>
              <td>Next to text that already says the same thing. No label, hidden from assistive tech.</td>
              <td>
                <span className="fd-icon-inline">
                  <Icon name="mail" /> Email
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">Meaningful</th>
              <td>The icon alone carries meaning. Give it a label.</td>
              <td>
                <Icon name="warning" label="Warning" />
              </td>
            </tr>
            <tr>
              <th scope="row">Icon only control</th>
              <td>Use IconButton; its label names the action, not the icon.</td>
              <td>
                <IconButton icon="close" label="Close dialog" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="fd-section">
        <h2 className="fd-section__heading">Set</h2>
        <div className="fd-icon-grid">
          {ICON_NAMES.map((name) => (
            <div key={name} className="fd-icon-cell">
              <span className="fd-icon-sizes">
                <Icon name={name} size="sm" />
                <Icon name={name} size="md" />
                <Icon name={name} size="lg" />
              </span>
              <span className="fd-mono">{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
