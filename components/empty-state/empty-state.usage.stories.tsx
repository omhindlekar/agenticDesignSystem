import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './empty-state.meta.json';
import { EmptyState } from './empty-state';
import { Button } from '../button/button';
import { Text } from '../text/text';

/** Do and don't examples for the EmptyState usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Say what is empty and give the action that fills it.',
        example: (
          <EmptyState
            icon="mail"
            title="No invoices yet"
            description="Invoices you send appear here."
            primaryAction={<Button label="Create invoice" variant="contained" />}
          />
        ),
      },
      dont: {
        caption: "Don't leave people at a dead end.",
        antiPattern: 'An empty state with no action',
        example: <Text tone="secondary">No data.</Text>,
      },
    },
  ],
  textOnly: {
    'Blaming the user for the empty state': 'It is a matter of wording: say what goes here, not what they failed to do.',
  },
};

const meta = {
  title: 'Usage/EmptyState',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
