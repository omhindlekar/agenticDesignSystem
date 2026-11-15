import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './segmented-control';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: {
    label: 'View',
    defaultValue: ['week'],
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ],
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { parameters: { ads: { variant: 'single' } } };
export const Multiple: Story = {
  args: {
    label: 'Notify by',
    selectionMode: 'multiple',
    defaultValue: ['mail'],
    options: [
      { value: 'mail', label: 'Email', icon: 'mail' },
      { value: 'person', label: 'In app', icon: 'person' },
      { value: 'download', label: 'Digest', icon: 'download' },
    ],
  },
  parameters: { ads: { variant: 'multiple' } },
};
export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'single' } } };

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Active: Story = { parameters: { ads: { state: 'active' }, pseudo: { active: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
