import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './grid.meta.json';
import { Grid } from './grid';
import { Card } from '../card/card';
import { Text } from '../text/text';

/** Do and don't examples for the Grid usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use a grid for a set of equal items, such as KPI tiles.',
        example: (
          <Grid columns={3} minItemWidth="sm">
            <Card variant="flat" padding="sm"><Text>Balance</Text></Card>
            <Card variant="flat" padding="sm"><Text>Money in</Text></Card>
            <Card variant="flat" padding="sm"><Text>Money out</Text></Card>
          </Grid>
        ),
      },
      dont: {
        caption: "Don't give the main content and a minor note equal cells.",
        antiPattern: 'Placing items of very different importance in equal cells',
        example: (
          <Grid columns={2} minItemWidth="sm">
            <Card variant="flat" padding="sm"><Text>Recent transactions and the full statement</Text></Card>
            <Card variant="flat" padding="sm"><Text>Tip of the day</Text></Card>
          </Grid>
        ),
      },
    },
  ],
  textOnly: {
    'Fixed pixel column widths': 'Fixed widths look fine at one screen size; the failure only shows when the screen narrows.',
  },
};

const meta = {
  title: 'Usage/Grid',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
