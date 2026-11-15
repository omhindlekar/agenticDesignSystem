import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './banner';
import { Button } from '../button/button';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: { title: 'Scheduled maintenance', children: 'The editor will be read-only on Sunday from 02:00 to 03:00 UTC.', onDismiss: () => {} },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: 'info' }, parameters: { ads: { variant: 'info' } } };
export const Success: Story = { args: { tone: 'success', title: 'Published', children: 'Your changes are live.' }, parameters: { ads: { variant: 'success' } } };
export const Warning: Story = { args: { tone: 'warning', title: 'Storage almost full', children: 'You have used 92% of your plan.' }, parameters: { ads: { variant: 'warning' } } };
export const Danger: Story = {
  args: { tone: 'danger', title: 'Sync failed', children: 'We could not reach the server.', actions: <Button label="Retry" variant="outlined" tone="danger" size="sm" /> },
  parameters: { ads: { variant: 'danger' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
