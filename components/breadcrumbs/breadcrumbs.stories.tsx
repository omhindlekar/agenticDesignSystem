import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './breadcrumbs';

const items = [
  { label: 'Home', href: '#' },
  { label: 'Projects', href: '#' },
  { label: 'Design system', href: '#' },
  { label: 'Components', href: '#' },
  { label: 'Button' },
];
const meta = { title: 'Components/Breadcrumbs', component: Breadcrumbs, args: { items } } satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = { args: { maxItems: 10 }, parameters: { ads: { variant: 'full' } } };
export const Collapsed: Story = { args: { maxItems: 3 }, parameters: { ads: { variant: 'collapsed' } } };
export const Default: Story = { args: { maxItems: 10 }, parameters: { ads: { state: 'default' } } };
