import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Email address', type: 'email', placeholder: 'name@example.com' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { args: { variant: 'default' }, parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = {
  args: { variant: 'error', errorMessage: 'Enter a valid email address' },
  parameters: { ads: { variant: 'error' } },
};
export const SuccessVariant: Story = {
  args: { variant: 'success', defaultValue: 'om@example.com', helperText: 'Looks good' },
  parameters: { ads: { variant: 'success' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Filled: Story = { args: { defaultValue: 'om@example.com' }, parameters: { ads: { state: 'filled' } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { errorMessage: 'Enter a valid email address' }, parameters: { ads: { state: 'error' } } };
export const Success: Story = {
  args: { variant: 'success', defaultValue: 'om@example.com' },
  parameters: { ads: { state: 'success' } },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'om@example.com' },
  parameters: { ads: { state: 'read-only' } },
};
