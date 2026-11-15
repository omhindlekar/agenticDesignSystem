import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './tooltip';
import { IconButton } from '../icon-button/icon-button';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Copy link to clipboard', children: <IconButton icon="content_copy" label="Copy link" variant="outlined" /> },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = { args: { placement: 'top' }, parameters: { ads: { variant: 'top' } } };
export const Bottom: Story = { args: { placement: 'bottom' }, parameters: { ads: { variant: 'bottom' } } };
export const Start: Story = { args: { placement: 'start' }, parameters: { ads: { variant: 'start' } } };
export const End: Story = { args: { placement: 'end' }, parameters: { ads: { variant: 'end' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
