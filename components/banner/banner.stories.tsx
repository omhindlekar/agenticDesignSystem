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
/** Outlined and text actions take the banner's text colour, so they meet AA on every tone and theme. */
export const InfoWithActions: Story = {
  args: {
    tone: 'info',
    title: 'Need to cancel? You have 30 minutes',
    children: 'You can cancel this payment until 12:12 pm today.',
    actions: (
      <>
        <Button label="Cancel payment" variant="outlined" size="sm" />
        <Button label="Learn more" variant="text" size="sm" />
      </>
    ),
  },
  parameters: { ads: { variant: 'info' } },
};
export const WarningWithAction: Story = {
  args: { tone: 'warning', actions: <Button label="Upgrade plan" variant="outlined" size="sm" /> },
  parameters: { ads: { variant: 'warning' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
