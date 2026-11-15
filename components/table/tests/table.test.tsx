// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../table';

afterEach(cleanup);
const columns = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'owner', label: 'Owner' },
  { id: 'updated', label: 'Updated', sortable: true, align: 'end' as const },
];
const rows = [
  { id: 'a', cells: { name: 'Tokens', owner: 'Om', updated: '2 days ago' } },
  { id: 'b', cells: { name: 'Rules', owner: 'Om', updated: 'Today' } },
];

describe('Table', () => {
  it('NFR-9: a named grid with column headers and rows', () => {
    render(<Table label="Projects" columns={columns} rows={rows} />);
    const grid = screen.getByRole('grid', { name: 'Projects' });
    expect(within(grid).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Name', 'Owner', 'Updated']);
    expect(within(grid).getAllByRole('row')).toHaveLength(3);
  });
  it('NFR-9: a sortable column reports aria-sort and calls onSortChange', async () => {
    const onSortChange = vi.fn();
    render(<Table label="Projects" columns={columns} rows={rows} sortColumn="name" sortDirection="ascending" onSortChange={onSortChange} />);
    expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBe('ascending');
    await userEvent.setup().click(screen.getByRole('columnheader', { name: /Updated/ }));
    expect(onSortChange).toHaveBeenCalledWith('updated', 'ascending');
  });
  it('NFR-9: multiple selection adds row checkboxes', async () => {
    const onSelectionChange = vi.fn();
    render(<Table label="Projects" columns={columns} rows={rows} selectionMode="multiple" onSelectionChange={onSelectionChange} />);
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.length).toBe(3);
    await userEvent.setup().click(boxes[1]!);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['a']);
  });
  it('FR-1: shows the empty state when there are no rows', () => {
    render(<Table label="Projects" columns={columns} rows={[]} emptyState="No projects yet" />);
    expect(screen.getByText('No projects yet')).toBeTruthy();
  });
});
