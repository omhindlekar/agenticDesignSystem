import type { Meta, StoryObj } from '@storybook/react-vite';
import { List } from './list';

const items = [
  { id: 'tokens', title: 'Tokens', description: 'Updated 2 days ago', meta: '161', icon: 'settings' as const },
  { id: 'rules', title: 'Rules', description: 'Updated today', meta: '22', icon: 'filter_list' as const },
  { id: 'components', title: 'Components', description: 'Updated today', meta: '41', icon: 'content_copy' as const },
];
const meta = { title: 'Components/List', component: List, args: { label: 'Recent', items } } satisfies Meta<
  typeof List
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = { parameters: { ads: { variant: 'static' } } };
export const Interactive: Story = {
  args: { selectionMode: 'single', selectedKeys: ['rules'] },
  parameters: { ads: { variant: 'interactive' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
