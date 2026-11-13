import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup } from './radio-group';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Plan',
    options: [
      { value: 'starter', label: 'Starter', description: 'One project, community support' },
      { value: 'team', label: 'Team', description: 'Unlimited projects, priority support' },
      { value: 'enterprise', label: 'Enterprise', description: 'Contact sales', disabled: true },
    ],
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { args: { defaultValue: 'team' }, parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = { args: { errorMessage: 'Choose a plan' }, parameters: { ads: { variant: 'error' } } };
export const Horizontal: Story = { args: { orientation: 'horizontal', defaultValue: 'team' }, parameters: { ads: { variant: 'default' } } };

export const Default: Story = { args: { defaultValue: 'team' }, parameters: { ads: { state: 'default' } } };
export const Hover: Story = { args: { defaultValue: 'team' }, parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { args: { defaultValue: 'team' }, parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'team' }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { errorMessage: 'Choose a plan' }, parameters: { ads: { state: 'error' } } };
