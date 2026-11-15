import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './table';
import { Badge } from '../badge/badge';

const columns = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'owner', label: 'Owner' },
  { id: 'status', label: 'Status' },
  { id: 'updated', label: 'Updated', sortable: true, align: 'end' as const },
];
const data = [
  { id: 'tokens', name: 'Tokens', owner: 'Om', status: 'Live', updated: '2026-11-12' },
  { id: 'rules', name: 'Rules', owner: 'Om', status: 'Draft', updated: '2026-11-14' },
  { id: 'agents', name: 'Agents', owner: 'Team', status: 'Live', updated: '2026-11-09' },
];
const rows = data.map((d) => ({
  id: d.id,
  cells: {
    name: d.name,
    owner: d.owner,
    updated: d.updated,
    status: <Badge label={d.status} tone={d.status === 'Live' ? 'success' : 'warning'} />,
  },
}));

function Sortable(props: { selectionMode: 'none' | 'multiple' }) {
  const [sort, setSort] = useState<{ column: string; direction: 'ascending' | 'descending' }>({
    column: 'name',
    direction: 'ascending',
  });
  const sorted = [...data].sort((a, b) => {
    const k = sort.column as 'name' | 'updated';
    const r = a[k].localeCompare(b[k]);
    return sort.direction === 'ascending' ? r : -r;
  });
  const sortedRows = sorted.map((d) => rows.find((r) => r.id === d.id)!);
  return (
    <Table
      label="Projects"
      columns={columns}
      rows={sortedRows}
      sortColumn={sort.column}
      sortDirection={sort.direction}
      onSortChange={(column, direction) => setSort({ column, direction })}
      selectionMode={props.selectionMode}
      selectedKeys={props.selectionMode === 'multiple' ? ['rules'] : []}
    />
  );
}

const meta = { title: 'Components/Table', component: Table, args: { label: 'Projects', columns, rows } } satisfies Meta<
  typeof Table
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { selectionMode: 'none' },
  render: () => <Sortable selectionMode="none" />,
  parameters: { ads: { variant: 'none' } },
};
export const SingleSelection: Story = { args: { selectionMode: 'single' }, parameters: { ads: { variant: 'single' } } };
export const MultipleSelection: Story = {
  args: { selectionMode: 'multiple' },
  render: () => <Sortable selectionMode="multiple" />,
  parameters: { ads: { variant: 'multiple' } },
};
export const Empty: Story = {
  args: { rows: [], emptyState: 'No projects yet' },
  parameters: { ads: { variant: 'none' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
