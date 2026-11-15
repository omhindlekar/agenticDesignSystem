import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta = { title: 'Components/Badge', component: Badge, args: { label: 'Draft' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Status: Story = { args: { variant: 'status', tone: 'warning' }, parameters: { ads: { variant: 'status' } } };
export const StatusSuccess: Story = { args: { variant: 'status', tone: 'success', label: 'Live' }, parameters: { ads: { variant: 'status' } } };
export const Count: Story = { args: { variant: 'count', tone: 'danger', count: 128, label: 'unread messages' }, parameters: { ads: { variant: 'count' } } };
export const Dot: Story = { args: { variant: 'dot', tone: 'success', label: 'Online' }, parameters: { ads: { variant: 'dot' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
