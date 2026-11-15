import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './card';
import { Button } from '../button/button';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: { children: 'Pro plan · Unlimited projects and priority support' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// The card's name comes from its visible content (WCAG 2.5.3); no aria-label replaces it.
const interactive = { variant: 'interactive' as const, onClick: () => {} };

export const DefaultVariant: Story = { args: { variant: 'default' }, parameters: { ads: { variant: 'default' } } };
export const Interactive: Story = { args: interactive, parameters: { ads: { variant: 'interactive' } } };
export const Flat: Story = { args: { variant: 'flat' }, parameters: { ads: { variant: 'flat' } } };
export const WithHeaderAndActions: Story = {
  args: {
    title: 'Pro plan',
    subtitle: 'Billed yearly',
    children: 'Unlimited projects, priority support and audit logs.',
    actions: (
      <>
        <Button label="Choose plan" />
        <Button label="Compare" variant="text" />
      </>
    ),
  },
  parameters: { ads: { variant: 'default' } },
};
export const InteractiveWithHeader: Story = {
  args: { ...interactive, title: 'Pro plan', subtitle: 'Billed yearly', children: 'Unlimited projects and priority support' },
  parameters: { ads: { variant: 'interactive' } },
};
export const LargePadding: Story = {
  args: { padding: 'lg', title: 'Pro plan', children: 'Unlimited projects and priority support' },
  parameters: { ads: { variant: 'default' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { args: interactive, parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { args: interactive, parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Selected: Story = { args: { ...interactive, selected: true }, parameters: { ads: { state: 'selected' } } };
export const Disabled: Story = { args: { ...interactive, disabled: true }, parameters: { ads: { state: 'disabled' } } };
