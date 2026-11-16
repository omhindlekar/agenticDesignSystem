import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorPage } from './error-page';
import { Button } from '../button/button';
import { Link } from '../link/link';

const meta = {
  title: 'Templates/ErrorPage',
  component: ErrorPage,
  parameters: { layout: 'fullscreen' },
  args: { primaryAction: <Button label="Go to the home page" variant="contained" /> },
} satisfies Meta<typeof ErrorPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NotFound: Story = { args: { variant: '404' }, parameters: { ads: { variant: '404' } } };
export const ServerError: Story = {
  args: { variant: '500', primaryAction: <Button label="Try again" variant="contained" />, secondaryAction: <Link href="#support">Contact support</Link> },
  parameters: { ads: { variant: '500' } },
};
export const Offline: Story = {
  args: { variant: 'offline', primaryAction: <Button label="Try again" variant="contained" /> },
  parameters: { ads: { variant: 'offline' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
