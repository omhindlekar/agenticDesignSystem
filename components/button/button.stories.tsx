import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

// parameters.ads tags each story with the metadata variant or state it shows.
// The FR-3 parity test requires every variant and state in button.meta.json to be tagged.
const meta = {
  title: 'Components/Button',
  component: Button,
  args: { label: 'Save changes' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' }, parameters: { ads: { variant: 'primary' } } };
export const Secondary: Story = { args: { variant: 'secondary' }, parameters: { ads: { variant: 'secondary' } } };
export const Ghost: Story = { args: { variant: 'ghost' }, parameters: { ads: { variant: 'ghost' } } };
export const Danger: Story = { args: { variant: 'danger', label: 'Delete' }, parameters: { ads: { variant: 'danger' } } };

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Active: Story = { parameters: { ads: { state: 'active' }, pseudo: { active: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Loading: Story = { args: { loading: true }, parameters: { ads: { state: 'loading' } } };
