import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tree } from './tree';
import type { TreeNode } from './tree';

const items: TreeNode[] = [
  {
    id: 'components',
    label: 'components',
    icon: 'filter_list',
    children: [
      {
        id: 'button',
        label: 'button',
        children: [
          { id: 'button.tsx', label: 'button.tsx' },
          { id: 'button.css', label: 'button.css' },
        ],
      },
      { id: 'card', label: 'card' },
    ],
  },
  {
    id: 'tokens',
    label: 'tokens',
    icon: 'settings',
    children: [
      { id: 'primitives', label: 'primitives.json' },
      { id: 'semantic', label: 'semantic.json' },
    ],
  },
  { id: 'readme', label: 'README.md', icon: 'info' },
];
const meta = {
  title: 'Components/Tree',
  component: Tree,
  args: { label: 'Files', items, defaultExpandedKeys: ['components', 'button'] },
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Browse: Story = { args: { selectionMode: 'none' }, parameters: { ads: { variant: 'none' } } };
export const SingleSelection: Story = { args: { selectionMode: 'single' }, parameters: { ads: { variant: 'single' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
