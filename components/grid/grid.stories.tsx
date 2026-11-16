import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './grid';
import { Card } from '../card/card';
import { Text } from '../text/text';

const items = (
  <>
      <Card variant="flat" padding="sm"><Text>Item 1</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 2</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 3</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 4</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 5</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 6</Text></Card>
  </>
);
const meta = { title: 'Layout/Grid', component: Grid, args: { children: items } } satisfies Meta<typeof Grid>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Resize the canvas: columns drop when an item would be narrower than its minimum width. */
export const ThreeColumns: Story = { args: { columns: 3 }, parameters: { ads: { variant: 'default' } } };
export const KpiTiles: Story = { args: { columns: 4, minItemWidth: 'sm' }, parameters: { ads: { variant: 'default' } } };
export const TwoColumns: Story = { args: { columns: 2 }, parameters: { ads: { variant: 'default' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
