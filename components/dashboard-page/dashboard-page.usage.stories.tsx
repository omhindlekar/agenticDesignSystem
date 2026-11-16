import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './dashboard-page.meta.json';
import { Button } from '../button/button';
import { Stack } from '../stack/stack';

/** Do and don't examples for the DashboardPage usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'At most one contained action in the header row.',
        example: (
          <Stack direction="horizontal" gap="sm" wrap>
            <Button label="Export" variant="outlined" />
            <Button label="New payment" variant="contained" />
          </Stack>
        ),
      },
      dont: {
        caption: "Don't give every header action equal weight.",
        antiPattern: 'More than one primary action in the header row',
        example: (
          <Stack direction="horizontal" gap="sm" wrap>
            <Button label="Export" variant="contained" />
            <Button label="New payment" variant="contained" />
          </Stack>
        ),
      },
    },
  ],
  textOnly: {
    'Filters scattered through the content instead of the header row': 'It needs a full page to show; DashboardPage gives filters one place.',
  },
};

const meta = {
  title: 'Usage/DashboardPage',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
