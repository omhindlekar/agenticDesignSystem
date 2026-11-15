import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './divider.meta.json';
import { Divider } from './divider';
import { Text } from '../text/text';

/** Do and don't examples for the Divider usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'One divider between groups that spacing alone does not separate.',
        example: (
          <div style={{ display: 'grid', gap: 'var(--space-component-gap-md)', width: '100%' }}>
            <Text>Account</Text>
            <Divider />
            <Text>Notifications</Text>
          </div>
        ),
      },
      dont: {
        caption: "Don't stack dividers.",
        antiPattern: 'Stacking several dividers',
        example: (
          <div style={{ display: 'grid', gap: 'var(--space-component-gap-sm)', width: '100%' }}>
            <Text>Account</Text>
            <Divider />
            <Divider />
            <Divider />
            <Text>Notifications</Text>
          </div>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Divider',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
