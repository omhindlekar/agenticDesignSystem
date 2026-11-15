// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu } from '../menu';
import type { MenuEntry } from '../menu';

afterEach(cleanup);
const items: MenuEntry[] = [
  { id: 'edit', label: 'Edit', icon: 'edit', shortcut: '⌘E' },
  { id: 'copy', label: 'Duplicate', icon: 'content_copy' },
  { type: 'separator' },
  { type: 'section', title: 'Danger zone', items: [{ id: 'delete', label: 'Delete', icon: 'delete', danger: true }] },
];

describe('Menu', () => {
  it('NFR-9: the default trigger is a button that opens a menu of menu items', async () => {
    render(<Menu label="Actions" items={items} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Actions/ }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent?.replace('⌘E', ''))).toEqual(['Edit', 'Duplicate', 'Delete']);
  });

  it('NFR-9: Enter on the trigger opens it on the first item; arrows move, Enter runs and closes', async () => {
    const onAction = vi.fn();
    render(<Menu label="Actions" items={items} onAction={onAction} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(document.activeElement?.textContent).toContain('Edit');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('copy');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('NFR-9: sections are named groups', async () => {
    render(<Menu label="Actions" items={items} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Actions/ }));
    expect(screen.getByRole('group', { name: 'Danger zone' })).toBeTruthy();
  });

  it('NFR-9: single selection uses menuitemradio with aria-checked', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Menu
        label="Sort by"
        selectionMode="single"
        selectedKeys={['name']}
        onSelectionChange={onSelectionChange}
        items={[{ id: 'name', label: 'Name' }, { id: 'date', label: 'Date' }]}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Sort by/ }));
    expect(screen.getByRole('menuitemradio', { name: 'Name' }).getAttribute('aria-checked')).toBe('true');
    await user.click(screen.getByRole('menuitemradio', { name: 'Date' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['date']);
  });
});
