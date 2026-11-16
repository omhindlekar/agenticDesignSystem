import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardPage } from './dashboard-page';
import { AppHeader } from '../app-header/app-header';
import { Button } from '../button/button';
import { Card } from '../card/card';
import { DatePicker } from '../date-picker/date-picker';
import { Menu } from '../menu/menu';
import { SearchField } from '../search-field/search-field';
import { Text } from '../text/text';

const kpi = (label: string, value: string, period: string) => (
  <Card padding="md">
    <Text variant="overline" tone="secondary">
      {label}
    </Text>
    <Text variant="h2" tone="heading">
      {value}
    </Text>
    <Text variant="caption" tone="secondary">
      {period}
    </Text>
  </Card>
);

const meta = {
  title: 'Templates/DashboardPage',
  component: DashboardPage,
  parameters: { layout: 'fullscreen' },
  args: {
    header: (
      <AppHeader
        title="Agentic DS"
        nav={[
          { label: 'Overview', href: '#overview', current: true },
          { label: 'Payments', href: '#payments' },
        ]}
      />
    ),
    title: 'Overview',
    description: 'How your business is doing this month.',
    filters: (
      <>
        <SearchField label="Search transactions" placeholder="Name or reference" />
        <DatePicker label="From" defaultValue="2026-11-01" />
        <DatePicker label="To" defaultValue="2026-11-16" />
        <Menu
          label="Filter"
          selectionMode="multiple"
          items={[
            { id: 'in', label: 'Money in' },
            { id: 'out', label: 'Money out' },
            { id: 'pending', label: 'Pending' },
          ]}
        />
      </>
    ),
    actions: <Button label="Export" variant="outlined" />,
    kpis: (
      <>
        {kpi('Balance', '£12,400', 'Today')}
        {kpi('Money in', '£8,120', 'This month')}
        {kpi('Money out', '£5,310', 'This month')}
        {kpi('Pending', '3', 'Payments')}
      </>
    ),
    children: <Text>Recent transactions</Text>,
  },
} satisfies Meta<typeof DashboardPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = { parameters: { ads: { variant: 'default' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
