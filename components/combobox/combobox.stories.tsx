import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './combobox';

const countries = [
  'Australia', 'Brazil', 'Canada', 'Denmark', 'France', 'Germany', 'India', 'Ireland',
  'Japan', 'Kenya', 'Mexico', 'Netherlands', 'Norway', 'Singapore', 'Spain', 'Sweden',
  'United Kingdom', 'United States',
].map((label) => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }));

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: { label: 'Country', options: countries, placeholder: 'Start typing a country' },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = { args: { errorMessage: 'Choose your country' }, parameters: { ads: { variant: 'error' } } };

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Filled: Story = { args: { defaultValue: 'india' }, parameters: { ads: { state: 'filled' } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { errorMessage: 'Choose your country' }, parameters: { ads: { state: 'error' } } };
