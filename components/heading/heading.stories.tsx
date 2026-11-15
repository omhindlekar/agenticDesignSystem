import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './heading';

const meta = { title: 'Components/Heading', component: Heading, args: { children: 'Project settings' } } satisfies Meta<
  typeof Heading
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Display: Story = {
  args: { level: 1, appearance: 'display' },
  parameters: { ads: { variant: 'display' } },
};
export const H1: Story = { args: { level: 1 }, parameters: { ads: { variant: 'h1' } } };
export const H2: Story = { args: { level: 2 }, parameters: { ads: { variant: 'h2' } } };
export const H3: Story = { args: { level: 3 }, parameters: { ads: { variant: 'h3' } } };
export const H4: Story = { args: { level: 4 }, parameters: { ads: { variant: 'h4' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
