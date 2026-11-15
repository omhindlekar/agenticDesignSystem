import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { label: 'Volume', defaultValue: [40] },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { parameters: { ads: { variant: 'single' } } };
export const Range: Story = {
  args: { label: 'Price', defaultValue: [20, 80], formatOptions: { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 } },
  parameters: { ads: { variant: 'range' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Active: Story = { parameters: { ads: { state: 'active' }, pseudo: { active: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
