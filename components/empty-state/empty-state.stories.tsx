import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './empty-state';
import { Button } from '../button/button';
import { Link } from '../link/link';

const meta = {
  title: 'Templates/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: {
    icon: 'mail',
    title: 'No invoices yet',
    description: 'Invoices you send appear here, with their status.',
    primaryAction: <Button label="Create invoice" variant="contained" />,
    secondaryAction: <Link href="#learn">Learn about invoices</Link>,
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = { args: { variant: 'inline' }, parameters: { ads: { variant: 'inline' } } };
export const Page: Story = { args: { variant: 'page' }, parameters: { layout: 'fullscreen', ads: { variant: 'page' } } };
export const NoResults: Story = {
  args: {
    variant: 'inline',
    icon: 'search',
    title: 'No results for “lamp”',
    description: 'Check the spelling, or try a broader search.',
    primaryAction: <Button label="Clear search" variant="outlined" />,
    secondaryAction: undefined,
  },
  parameters: { ads: { variant: 'inline' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
