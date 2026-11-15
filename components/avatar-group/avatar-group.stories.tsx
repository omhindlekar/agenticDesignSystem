import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarGroup } from './avatar-group';

const people = [
  'Om Hindlekar',
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Edsger Dijkstra',
].map((name) => ({ name }));
const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  args: { label: 'Project members', people, max: 4 },
} satisfies Meta<typeof AvatarGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'sm' } } };
export const Medium: Story = { args: { size: 'md' }, parameters: { ads: { variant: 'md' } } };
export const Large: Story = { args: { size: 'lg' }, parameters: { ads: { variant: 'lg' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
