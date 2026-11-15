import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './divider';

const meta = { title: 'Components/Divider', component: Divider } satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  parameters: { ads: { variant: 'horizontal' } },
};
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  decorators: [
    (S) => (
      <div style={{ display: 'flex', height: 'var(--size-control-lg)', gap: 'var(--space-component-gap-md)' }}>
        {S()}
      </div>
    ),
  ],
  parameters: { ads: { variant: 'vertical' } },
};
export const Inset: Story = {
  args: { orientation: 'horizontal', inset: true },
  parameters: { ads: { variant: 'horizontal' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
