import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './date-picker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: { label: 'Start date', helperText: 'Weekdays only' },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const weekend = (iso: string): boolean => [0, 6].includes(new Date(`${iso}T12:00:00Z`).getUTCDay());

export const DefaultVariant: Story = { args: { defaultValue: '2026-11-16', isDateUnavailable: weekend }, parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = { args: { defaultValue: '2026-11-15', errorMessage: 'Choose a weekday' }, parameters: { ads: { variant: 'error' } } };
export const WithLimits: Story = {
  args: { defaultValue: '2026-11-16', minValue: '2026-11-10', maxValue: '2026-11-27', helperText: 'Within the next two weeks' },
  parameters: { ads: { variant: 'default' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { args: { defaultValue: '2026-11-16' }, parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Filled: Story = { args: { defaultValue: '2026-11-16' }, parameters: { ads: { state: 'filled' } } };
export const Disabled: Story = { args: { defaultValue: '2026-11-16', disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { defaultValue: '2026-11-15', errorMessage: 'Choose a weekday' }, parameters: { ads: { state: 'error' } } };
