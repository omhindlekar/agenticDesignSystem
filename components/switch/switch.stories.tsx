import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Email alerts' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { parameters: { ads: { variant: 'default' } } };

export const Unchecked: Story = { parameters: { ads: { state: 'unchecked' } } };
export const Checked: Story = { args: { defaultChecked: true }, parameters: { ads: { state: 'checked' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { args: { defaultChecked: true }, parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true }, parameters: { ads: { state: 'disabled' } } };
