import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './section';
import { Button } from '../button/button';
import { Input } from '../input/input';

const meta = {
  title: 'Layout/Section',
  component: Section,
  args: {
    title: 'Profile',
    description: 'This is how other people in your business see you.',
    children: (
      <>
        <Input label="Full name" defaultValue="Alex Morgan" />
        <Input label="Email address" type="email" defaultValue="alex@yourbusiness.com" />
      </>
    ),
  },
} satisfies Meta<typeof Section>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = { args: { variant: 'plain' }, parameters: { ads: { variant: 'plain' } } };
export const Surface: Story = {
  args: { variant: 'surface', actions: <Button label="Edit" variant="outlined" size="sm" /> },
  parameters: { ads: { variant: 'surface' } },
};
export const DangerZone: Story = {
  args: {
    variant: 'danger',
    title: 'Delete account',
    description: 'This permanently deletes your account and its data. It cannot be undone.',
    children: <div><Button label="Delete account" variant="contained" tone="danger" /></div>,
  },
  parameters: { ads: { variant: 'danger' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
