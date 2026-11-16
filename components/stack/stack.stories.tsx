import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './stack';
import { Card } from '../card/card';
import { Text } from '../text/text';

const items = (
  <>
      <Card variant="flat" padding="sm"><Text>Item 1</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 2</Text></Card>
      <Card variant="flat" padding="sm"><Text>Item 3</Text></Card>
  </>
);
const meta = { title: 'Layout/Stack', component: Stack, args: { children: items } } satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = { args: { direction: 'vertical' }, parameters: { ads: { variant: 'vertical' } } };
export const Horizontal: Story = { args: { direction: 'horizontal' }, parameters: { ads: { variant: 'horizontal' } } };
export const SectionGap: Story = { args: { gap: 'section' }, parameters: { ads: { variant: 'vertical' } } };
export const SpaceBetween: Story = {
  args: { direction: 'horizontal', justify: 'between', align: 'center', wrap: true },
  parameters: { ads: { variant: 'horizontal' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
