import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './select';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Country',
    placeholder: 'Choose a country',
    options: [
      { value: 'uk', label: 'United Kingdom' },
      { value: 'in', label: 'India' },
      { value: 'us', label: 'United States' },
      { value: 'xx', label: 'Unavailable', disabled: true },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { args: { variant: 'default' }, parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = {
  args: { variant: 'error', errorMessage: 'Choose a country' },
  parameters: { ads: { variant: 'error' } },
};
export const SuccessVariant: Story = {
  args: { variant: 'success', defaultValue: 'uk' },
  parameters: { ads: { variant: 'success' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Selected: Story = { args: { defaultValue: 'in' }, parameters: { ads: { state: 'selected' } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { errorMessage: 'Choose a country' }, parameters: { ads: { state: 'error' } } };
export const Success: Story = {
  args: { variant: 'success', defaultValue: 'uk' },
  parameters: { ads: { state: 'success' } },
};
