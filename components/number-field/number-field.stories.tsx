import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberField } from './number-field';

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  args: { label: 'Seats', minValue: 1, maxValue: 50, helperText: 'Between 1 and 50' },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { args: { defaultValue: 4 }, parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = {
  args: { defaultValue: 60, errorMessage: 'Your plan allows up to 50 seats' },
  parameters: { ads: { variant: 'error' } },
};
export const Currency: Story = {
  args: { label: 'Budget', defaultValue: 1200, step: 100, minValue: 0, maxValue: 10000, formatOptions: { style: 'currency', currency: 'GBP' }, helperText: 'Monthly' },
  parameters: { ads: { variant: 'default' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { args: { defaultValue: 4 }, parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { args: { defaultValue: 4 }, parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Filled: Story = { args: { defaultValue: 4 }, parameters: { ads: { state: 'filled' } } };
export const Disabled: Story = { args: { defaultValue: 4, disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { defaultValue: 60, errorMessage: 'Your plan allows up to 50 seats' }, parameters: { ads: { state: 'error' } } };
