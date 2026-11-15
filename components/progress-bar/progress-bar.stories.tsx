import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './progress-bar';

const meta = { title: 'Components/ProgressBar', component: ProgressBar, args: { label: 'Uploading files', value: 64 } } satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = { parameters: { ads: { variant: 'determinate' } } };
export const Indeterminate: Story = { args: { label: 'Preparing export', indeterminate: true }, parameters: { ads: { variant: 'indeterminate' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
