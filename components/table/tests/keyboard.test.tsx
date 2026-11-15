// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../table';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Table keyboard', () => {
  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'owner', label: 'Owner' },
  ];
  const rows = [
    { id: 'tokens', cells: { name: 'Tokens', owner: 'Om' } },
    { id: 'rules', cells: { name: 'Rules', owner: 'Team' } },
  ];
  it('NFR-9: APG grid (data grid): Arrow Down, Arrow Up, Arrow Right, Arrow Left — move by row and cell', async () => {
    render(<Table label="Projects" columns={columns} rows={rows} selectionMode="single" />);
    const user = userEvent.setup();
    await user.tab();
    const rowOf = () => document.activeElement?.closest('[role="row"]')?.textContent;
    expect(rowOf()).toContain('Tokens');
    await user.keyboard('{ArrowDown}');
    expect(rowOf()).toContain('Rules');
    await user.keyboard('{ArrowUp}');
    expect(rowOf()).toContain('Tokens');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Tokens');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Om');
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement?.textContent).toBe('Tokens');
  });
  it('NFR-9: APG grid (data grid): Space — selects the focused row', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        label="Projects"
        columns={columns}
        rows={rows}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['tokens']);
  });
  it('NFR-9: APG grid (data grid): Enter — sorts by the focused column header', async () => {
    const onSortChange = vi.fn();
    render(<Table label="Projects" columns={columns} rows={rows} onSortChange={onSortChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement?.getAttribute('role')).toBe('columnheader');
    await user.keyboard('{Enter}');
    expect(onSortChange).toHaveBeenCalledWith('name', 'ascending');
  });
});
