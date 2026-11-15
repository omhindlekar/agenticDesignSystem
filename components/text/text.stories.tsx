import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './text';

const meta = {
  title: 'Components/Text',
  component: Text,
  args: { children: 'Tokens, components and rules in one repository.' },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Display: Story = { args: { variant: 'display' }, parameters: { ads: { variant: 'display' } } };
export const H1: Story = { args: { variant: 'h1' }, parameters: { ads: { variant: 'h1' } } };
export const H2: Story = { args: { variant: 'h2' }, parameters: { ads: { variant: 'h2' } } };
export const H3: Story = { args: { variant: 'h3' }, parameters: { ads: { variant: 'h3' } } };
export const H4: Story = { args: { variant: 'h4' }, parameters: { ads: { variant: 'h4' } } };
export const Subtitle: Story = { args: { variant: 'subtitle' }, parameters: { ads: { variant: 'subtitle' } } };
export const Body1: Story = { args: { variant: 'body1' }, parameters: { ads: { variant: 'body1' } } };
export const Body2: Story = { args: { variant: 'body2' }, parameters: { ads: { variant: 'body2' } } };
export const Label: Story = { args: { variant: 'label' }, parameters: { ads: { variant: 'label' } } };
export const Caption: Story = { args: { variant: 'caption' }, parameters: { ads: { variant: 'caption' } } };
export const Overline: Story = { args: { variant: 'overline' }, parameters: { ads: { variant: 'overline' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
