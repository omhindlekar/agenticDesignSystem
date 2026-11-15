import type { Meta, StoryObj } from '@storybook/react-vite';
import { SideNav } from './side-nav';
import type { SideNavEntry } from './side-nav';

const items: SideNavEntry[] = [
  { id: 'home', label: 'Home', href: '#', icon: 'menu' },
  { id: 'projects', label: 'Projects', href: '#', icon: 'filter_list' },
  {
    type: 'group', id: 'library', label: 'Library', icon: 'content_copy', items: [
      { id: 'components', label: 'Components', href: '#' },
      { id: 'tokens', label: 'Tokens', href: '#' },
    ],
  },
  { id: 'people', label: 'People', href: '#', icon: 'person' },
  { id: 'settings', label: 'Settings', href: '#', icon: 'settings' },
];
const meta = {
  title: 'Components/SideNav',
  component: SideNav,
  args: { label: 'Main', items, currentId: 'components' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SideNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = { parameters: { ads: { variant: 'expanded' } } };
export const Rail: Story = { args: { collapsed: true, currentId: 'settings' }, parameters: { ads: { variant: 'rail' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
