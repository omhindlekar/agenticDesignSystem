import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './icon';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'search' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = { parameters: { ads: { variant: 'decorative' } } };
export const Labelled: Story = { args: { name: 'warning', label: 'Warning' }, parameters: { ads: { variant: 'labelled' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'decorative' } } };
export const Large: Story = { args: { size: 'lg' }, parameters: { ads: { variant: 'decorative' } } };

