import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagGroup } from './tag-group';

const tags = [
  { id: 'react', label: 'React' },
  { id: 'tokens', label: 'Tokens', tone: 'info' as const },
  { id: 'a11y', label: 'Accessibility', tone: 'success' as const },
  { id: 'beta', label: 'Beta', tone: 'warning' as const },
];
const meta = { title: 'Components/TagGroup', component: TagGroup, args: { label: 'Topics', tags } } satisfies Meta<
  typeof TagGroup
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = { parameters: { ads: { variant: 'static' } } };
export const Selectable: Story = {
  args: { selectionMode: 'multiple', selectedKeys: ['tokens'], showLabel: true, label: 'Filter by topic' },
  parameters: { ads: { variant: 'selectable' } },
};
export const Removable: Story = { args: { onRemove: () => {} }, parameters: { ads: { variant: 'removable' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
