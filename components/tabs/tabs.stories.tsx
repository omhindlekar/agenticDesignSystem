import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './tabs';

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'info' as const, content: 'Tokens, components and rules for the POC.' },
  { id: 'activity', label: 'Activity', icon: 'calendar_today' as const, content: '12 changes this week.' },
  { id: 'settings', label: 'Settings', icon: 'settings' as const, content: 'Owner: Om.' },
  { id: 'billing', label: 'Billing', disabled: true, content: 'Not available on this plan.' },
];
const meta = { title: 'Components/Tabs', component: Tabs, args: { label: 'Project', tabs } } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = { parameters: { ads: { variant: 'horizontal' } } };
export const Vertical: Story = { args: { orientation: 'vertical' }, parameters: { ads: { variant: 'vertical' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
