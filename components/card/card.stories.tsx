import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './card';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: { children: 'Pro plan · Unlimited projects and priority support' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const interactive = { variant: 'interactive' as const, onClick: () => {}, 'aria-label': 'Choose the Pro plan' };

export const DefaultVariant: Story = { args: { variant: 'default' }, parameters: { ads: { variant: 'default' } } };
export const Interactive: Story = { args: interactive, parameters: { ads: { variant: 'interactive' } } };
export const Flat: Story = { args: { variant: 'flat' }, parameters: { ads: { variant: 'flat' } } };

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { args: interactive, parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { args: interactive, parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Selected: Story = { args: { ...interactive, selected: true }, parameters: { ads: { state: 'selected' } } };
export const Disabled: Story = { args: { ...interactive, disabled: true }, parameters: { ads: { state: 'disabled' } } };
