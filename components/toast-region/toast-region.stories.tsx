import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastRegion, toast, toastQueue } from './toast-region';
import type { ToastContent } from './toast-region';
import { Button } from '../button/button';

/** Shows the given toasts while the story is open, without timing out, so they can be reviewed. */
function WithToasts({ placement, items }: { placement: 'bottom-end' | 'top-end'; items: ToastContent[] }) {
  useEffect(() => {
    const keys = items.map((t) => toastQueue.add(t));
    return () => keys.forEach((k) => toastQueue.close(k));
  }, [items]);
  return (
    <>
      <ToastRegion placement={placement} />
      <Button label="Show a toast" variant="outlined" onClick={() => toast({ title: 'Link copied', tone: 'success' })} />
    </>
  );
}

const items: ToastContent[] = [
  { title: 'Project saved', description: 'All changes are live.', tone: 'success' },
  { title: 'Item deleted', tone: 'info', action: { label: 'Undo', onAction: () => {} } },
  { title: 'Upload failed', description: 'The file is larger than 10 MB.', tone: 'danger' },
];

const meta = { title: 'Components/ToastRegion', component: ToastRegion, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ToastRegion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BottomEnd: Story = { render: () => <WithToasts placement="bottom-end" items={items} />, parameters: { ads: { variant: 'bottom-end' } } };
export const TopEnd: Story = { args: { placement: 'top-end' }, render: () => <WithToasts placement="top-end" items={items} />, parameters: { ads: { variant: 'top-end' } } };
export const Default: Story = { render: () => <WithToasts placement="bottom-end" items={items} />, parameters: { ads: { state: 'default' } } };
