import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './spinner';

const meta = { title: 'Components/Spinner', component: Spinner, args: { label: 'Loading projects' } } satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: 'sm' }, parameters: { ads: { variant: 'sm' } } };
export const Medium: Story = { args: { size: 'md' }, parameters: { ads: { variant: 'md' } } };
export const Large: Story = { args: { size: 'lg' }, parameters: { ads: { variant: 'lg' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
