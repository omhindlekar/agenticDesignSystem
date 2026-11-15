import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu } from './menu';
import type { MenuEntry } from './menu';
import { IconButton } from '../icon-button/icon-button';

const actions: MenuEntry[] = [
  { id: 'edit', label: 'Edit', icon: 'edit', shortcut: '⌘E' },
  { id: 'duplicate', label: 'Duplicate', icon: 'content_copy', shortcut: '⌘D' },
  { id: 'move', label: 'Move to', icon: 'arrow_forward', children: [{ id: 'archive', label: 'Archive' }, { id: 'drafts', label: 'Drafts' }] },
  { type: 'separator' },
  { type: 'section', title: 'Danger zone', items: [{ id: 'delete', label: 'Delete', icon: 'delete', danger: true, description: 'Cannot be undone' }] },
];

const meta = {
  title: 'Components/Menu',
  component: Menu,
  args: { label: 'Actions', items: actions },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ActionMenu: Story = { args: { selectionMode: 'none' }, parameters: { ads: { variant: 'none' } } };
export const IconTrigger: Story = {
  args: { trigger: <IconButton icon="more_vert" label="More actions" /> },
  parameters: { ads: { variant: 'none' } },
};
export const SingleSelection: Story = {
  args: {
    label: 'Sort by',
    selectionMode: 'single',
    selectedKeys: ['updated'],
    items: [{ id: 'name', label: 'Name' }, { id: 'updated', label: 'Last updated' }, { id: 'owner', label: 'Owner' }],
  },
  parameters: { ads: { variant: 'single' } },
};
export const MultipleSelection: Story = {
  args: {
    label: 'Columns',
    selectionMode: 'multiple',
    selectedKeys: ['name', 'owner'],
    items: [{ id: 'name', label: 'Name' }, { id: 'updated', label: 'Last updated' }, { id: 'owner', label: 'Owner' }],
  },
  parameters: { ads: { variant: 'multiple' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
