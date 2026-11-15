import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './tabs.meta.json';
import { Tabs } from './tabs';

/** Do and don't examples for the Tabs usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Tabs switch between views of the same thing.',
        example: (
          <Tabs
            label="Project"
            tabs={[
              { id: 'o', label: 'Overview', content: 'Overview' },
              { id: 'a', label: 'Activity', content: 'Activity' },
              { id: 's', label: 'Settings', content: 'Settings' },
            ]}
          />
        ),
      },
      dont: {
        caption: "Don't group unrelated pages as tabs.",
        antiPattern: 'Tabs whose panels are unrelated',
        example: (
          <Tabs
            label="Stuff"
            tabs={[
              { id: 'o', label: 'Overview', content: 'Overview' },
              { id: 'b', label: 'Billing', content: 'Billing' },
              { id: 'h', label: 'Help centre', content: 'Help' },
            ]}
          />
        ),
      },
    },
  ],
  textOnly: {
    'Nesting tabs inside tabs': 'Nested tab lists are hard to tell apart and to navigate; shown in words.',
  },
};

const meta = {
  title: 'Usage/Tabs',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
