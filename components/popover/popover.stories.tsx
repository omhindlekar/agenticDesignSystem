import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './popover';
import { Button } from '../button/button';
import { Switch } from '../switch/switch';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    title: 'Share project',
    trigger: <Button label="Share" variant="outlined" />,
    children: (
      <>
        <p style={{ margin: 0 }}>Anyone with the link can view this project.</p>
        <Switch label="Allow comments" defaultChecked />
      </>
    ),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = { args: { placement: 'bottom' }, parameters: { ads: { variant: 'bottom' } } };
export const Top: Story = { args: { placement: 'top' }, parameters: { ads: { variant: 'top' } } };
export const Start: Story = { args: { placement: 'start' }, parameters: { ads: { variant: 'start' } } };
export const End: Story = { args: { placement: 'end' }, parameters: { ads: { variant: 'end' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
