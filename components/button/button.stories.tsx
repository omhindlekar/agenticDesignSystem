import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { CheckIcon } from '../shared/icons';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { label: 'Save changes' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Contained: Story = { args: { variant: 'contained' }, parameters: { ads: { variant: 'contained' } } };
export const Outlined: Story = { args: { variant: 'outlined' }, parameters: { ads: { variant: 'outlined' } } };
export const Text: Story = { args: { variant: 'text' }, parameters: { ads: { variant: 'text' } } };

// Danger tone
export const ContainedDanger: Story = {
  args: { variant: 'contained', tone: 'danger', label: 'Delete' },
  parameters: { ads: { variant: 'contained' } },
};
export const OutlinedDanger: Story = {
  args: { variant: 'outlined', tone: 'danger', label: 'Delete' },
  parameters: { ads: { variant: 'outlined' } },
};
export const TextDanger: Story = {
  args: { variant: 'text', tone: 'danger', label: 'Delete' },
  parameters: { ads: { variant: 'text' } },
};

// Sizes and icon
export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'contained' } } };
export const Large: Story = { args: { size: 'lg' }, parameters: { ads: { variant: 'contained' } } };
export const WithLeadingIcon: Story = {
  args: { variant: 'outlined', iconStart: <CheckIcon /> },
  parameters: { ads: { variant: 'outlined' } },
};

// States
export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const OutlinedHover: Story = { args: { variant: 'outlined' }, parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Active: Story = { parameters: { ads: { state: 'active' }, pseudo: { active: true } } };
export const OutlinedActive: Story = { args: { variant: 'outlined' }, parameters: { ads: { state: 'active' }, pseudo: { active: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const OutlinedDisabled: Story = { args: { variant: 'outlined', disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Loading: Story = { args: { loading: true }, parameters: { ads: { state: 'loading' } } };
