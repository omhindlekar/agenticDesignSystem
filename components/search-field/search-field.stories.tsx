import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchField } from './search-field';

const meta = {
  title: 'Components/SearchField',
  component: SearchField,
  args: { label: 'Search projects', placeholder: 'Search projects' },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { parameters: { ads: { variant: 'default' } } };
export const HiddenLabel: Story = { args: { hideLabel: true }, parameters: { ads: { variant: 'default' } } };

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Filled: Story = { args: { defaultValue: 'tokens' }, parameters: { ads: { state: 'filled' } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
