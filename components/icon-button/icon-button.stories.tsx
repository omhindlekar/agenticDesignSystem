import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './icon-button';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: 'more_vert', label: 'More options' },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Standard: Story = { args: { variant: 'standard' }, parameters: { ads: { variant: 'standard' } } };
export const Outlined: Story = { args: { variant: 'outlined', icon: 'edit', label: 'Edit' }, parameters: { ads: { variant: 'outlined' } } };
export const Contained: Story = { args: { variant: 'contained', icon: 'add', label: 'Add item' }, parameters: { ads: { variant: 'contained' } } };
export const StandardDanger: Story = {
  args: { variant: 'standard', tone: 'danger', icon: 'delete', label: 'Delete' },
  parameters: { ads: { variant: 'standard' } },
};

// Sizes
export const Small: Story = { args: { size: 'sm', icon: 'close', label: 'Close' }, parameters: { ads: { variant: 'standard' } } };
export const Large: Story = { args: { size: 'lg', icon: 'search', label: 'Search' }, parameters: { ads: { variant: 'standard' } } };

// States
export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Active: Story = { parameters: { ads: { state: 'active' }, pseudo: { active: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Selected: Story = {
  args: { icon: 'visibility', label: 'Show password', pressed: true },
  parameters: { ads: { state: 'selected' } },
};
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Loading: Story = { args: { loading: true, icon: 'download', label: 'Download' }, parameters: { ads: { state: 'loading' } } };
