import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal } from './modal';
import { Button } from '../button/button';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Save changes?',
    children: 'Your edits will be published to everyone on the team.',
    footer: (
      <>
        <Button label="Cancel" variant="outlined" />
        <Button label="Save" />
      </>
    ),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { args: { variant: 'default' }, parameters: { ads: { variant: 'default' } } };
export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Delete project?',
    children: 'This permanently deletes the project and its files.',
    footer: (
      <>
        <Button label="Cancel" variant="outlined" />
        <Button label="Delete" tone="danger" />
      </>
    ),
  },
  parameters: { ads: { variant: 'danger' } },
};
export const Fullscreen: Story = { args: { variant: 'fullscreen' }, parameters: { ads: { variant: 'fullscreen' } } };

export const Open: Story = { parameters: { ads: { state: 'open' } } };
export const Closed: Story = { args: { isOpen: false }, parameters: { ads: { state: 'closed' } } };
export const Loading: Story = { args: { loading: true }, parameters: { ads: { state: 'loading' } } };
