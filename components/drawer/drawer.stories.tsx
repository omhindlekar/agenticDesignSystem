import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from './drawer';
import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';

function Demo(props: { side: 'start' | 'end'; size: 'sm' | 'md' | 'lg'; open: boolean }) {
  const [open, setOpen] = useState(props.open);
  return (
    <Drawer
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Filters"
      side={props.side}
      size={props.size}
      footer={
        <>
          <Button label="Reset" variant="text" />
          <Button label="Apply" />
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-component-gap-sm)' }}>
        <Checkbox label="Only my projects" defaultChecked />
        <Checkbox label="Include archived" />
      </div>
    </Drawer>
  );
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: { isOpen: true, onClose: () => {}, title: 'Filters', children: null },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const End: Story = { args: { side: 'end' }, render: () => <Demo side="end" size="md" open />, parameters: { ads: { variant: 'end' } } };
export const Start: Story = { args: { side: 'start' }, render: () => <Demo side="start" size="sm" open />, parameters: { ads: { variant: 'start' } } };
export const Default: Story = { render: () => <Demo side="end" size="md" open />, parameters: { ads: { state: 'default' } } };
