import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './app-header';
import { IconButton } from '../icon-button/icon-button';
import { SearchField } from '../search-field/search-field';

const meta = {
  title: 'Components/AppHeader',
  component: AppHeader,
  args: {
    title: 'Agentic DS',
    nav: [
      { label: 'Projects', href: '#', current: true },
      { label: 'Components', href: '#' },
      { label: 'Docs', href: '#' },
    ],
    search: <SearchField label="Search" hideLabel placeholder="Search" />,
    actions: (
      <>
        <IconButton icon="help" label="Help" />
        <IconButton icon="settings" label="Settings" />
        <IconButton icon="person" label="Account" />
      </>
    ),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Wide: Story = { args: { layout: 'wide' }, parameters: { ads: { variant: 'wide' } } };
export const Compact: Story = { args: { layout: 'compact' }, parameters: { ads: { variant: 'compact' } } };
export const Default: Story = { args: { layout: 'wide' }, parameters: { ads: { state: 'default' } } };
