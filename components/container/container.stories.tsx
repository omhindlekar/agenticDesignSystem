import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './container';
import { Card } from '../card/card';
import { Text } from '../text/text';

const body = (
  <Card variant="flat">
    <Text>Content is capped at this width and centred, with the page side margin either side.</Text>
  </Card>
);
const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { children: body },
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'sm' } } };
export const Medium: Story = { args: { size: 'md' }, parameters: { ads: { variant: 'md' } } };
export const Large: Story = { args: { size: 'lg' }, parameters: { ads: { variant: 'lg' } } };
export const Full: Story = { args: { size: 'full' }, parameters: { ads: { variant: 'full' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
