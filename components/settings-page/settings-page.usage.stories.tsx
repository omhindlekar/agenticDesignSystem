import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './settings-page.meta.json';
import { Button } from '../button/button';
import { Section } from '../section/section';
import { Switch } from '../switch/switch';

/** Do and don't examples for the SettingsPage usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep destructive actions in the danger zone, last on the page.',
        example: (
          <Section variant="danger" title="Delete account" description="This permanently deletes your account. You can’t undo it.">
            <div>
              <Button label="Delete account" variant="outlined" tone="danger" />
            </div>
          </Section>
        ),
      },
      dont: {
        caption: "Don't mix a destructive action into everyday settings.",
        antiPattern: 'Destructive actions outside the danger zone',
        example: (
          <Section variant="surface" title="Notifications">
            <Switch label="Email me a weekly summary" defaultChecked />
            <div>
              <Button label="Delete account" variant="outlined" tone="danger" />
            </div>
          </Section>
        ),
      },
    },
  ],
  textOnly: {
    'One long section mixing unrelated settings': 'It needs a full page of settings to show the problem.',
  },
};

const meta = {
  title: 'Usage/SettingsPage',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
