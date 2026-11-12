import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Remember me' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { parameters: { ads: { variant: 'default' } } };
export const IndeterminateVariant: Story = {
  args: { label: 'Select all', indeterminate: true },
  parameters: { ads: { variant: 'indeterminate' } },
};

export const Unchecked: Story = { parameters: { ads: { state: 'unchecked' } } };
export const Checked: Story = { args: { defaultChecked: true }, parameters: { ads: { state: 'checked' } } };
export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
  parameters: { ads: { state: 'indeterminate' } },
};
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = {
  args: { label: 'I accept the terms', required: true, errorMessage: 'You must accept the terms' },
  parameters: { ads: { state: 'error' } },
};
