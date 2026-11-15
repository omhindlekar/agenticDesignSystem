import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './field';

import type { FieldControlProps } from './field';

/** A stand-in custom control: a native range input. */
const volume = (control: FieldControlProps) => <input type="range" min={0} max={10} defaultValue={4} {...control} />;

const meta = {
  title: 'Components/Field',
  component: Field,
  args: { label: 'Volume', helperText: 'Applies to all notifications', children: volume },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { parameters: { ads: { variant: 'default' } } };
export const ErrorVariant: Story = { args: { errorMessage: 'Turn the volume up to hear alerts' }, parameters: { ads: { variant: 'error' } } };

export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Disabled: Story = { args: { disabled: true }, parameters: { ads: { state: 'disabled' } } };
export const Error: Story = { args: { errorMessage: 'Turn the volume up to hear alerts' }, parameters: { ads: { state: 'error' } } };
