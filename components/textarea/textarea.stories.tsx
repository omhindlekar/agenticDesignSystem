import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { label: 'Description', placeholder: 'What is this project about?', helperText: 'Shown to everyone on the team' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = { args: { errorMessage: 'Add a description' }, parameters: { ads: { variant: 'error' } } };
export const WithCount: Story = {
  args: { maxLength: 200, defaultValue: 'A multi-agent design system for the POC.' },
  parameters: { ads: { state: 'filled' } },
};

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
export const Filled: Story = { args: { defaultValue: 'Tokens, components and rules in one repo.' }, parameters: { ads: { state: 'filled' } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { errorMessage: 'Add a description' }, parameters: { ads: { state: 'error' } } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'Locked by the owner.' }, parameters: { ads: { state: 'read-only' } } };
