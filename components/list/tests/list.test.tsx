// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { List } from '../list';

afterEach(cleanup);
const items = [
  { id: 'a', title: 'Tokens', description: 'Updated 2 days ago', icon: 'settings' as const },
  { id: 'b', title: 'Rules', description: 'Updated today', meta: '15' },
];

describe('List', () => {
  it('NFR-9: a static list is a list of list items', () => {
    render(<List label="Recent" items={items} />);
    expect(screen.getByRole('list', { name: 'Recent' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
  it('NFR-9: an interactive list is a grid list with selectable rows', async () => {
    const onSelectionChange = vi.fn();
    render(<List label="Recent" items={items} selectionMode="single" onSelectionChange={onSelectionChange} />);
    expect(screen.getByRole('grid', { name: 'Recent' })).toBeTruthy();
    await userEvent.setup().click(screen.getByText('Rules'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['b']);
  });
});
