import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './avatar';

const meta = { title: 'Components/Avatar', component: Avatar, args: { name: 'Om Hindlekar' } } satisfies Meta<
  typeof Avatar
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'sm' } } };
export const Medium: Story = { args: { size: 'md', name: 'Ada Lovelace' }, parameters: { ads: { variant: 'md' } } };
export const Large: Story = { args: { size: 'lg', name: 'Grace Hopper' }, parameters: { ads: { variant: 'lg' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
