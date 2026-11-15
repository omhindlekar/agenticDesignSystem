// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu } from '../menu';
import type { MenuEntry } from '../menu';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Menu keyboard', () => {
  const items: MenuEntry[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'duplicate', label: 'Duplicate' },
    {
      id: 'move',
      label: 'Move to',
      children: [
        { id: 'archive', label: 'Archive' },
        { id: 'trash', label: 'Trash' },
      ],
    },
    { id: 'delete', label: 'Delete', danger: true },
  ];
  const focused = () => document.activeElement?.textContent;
  it('NFR-9: APG menu button: Enter, Arrow Down, Arrow Up, Home, End — open on the first item and move', async () => {
    render(<Menu label="Actions" items={items} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(focused()).toContain('Edit');
    await user.keyboard('{ArrowDown}');
    expect(focused()).toContain('Duplicate');
    await user.keyboard('{ArrowUp}');
    expect(focused()).toContain('Edit');
    await user.keyboard('{End}');
    expect(focused()).toContain('Delete');
    await user.keyboard('{Home}');
    expect(focused()).toContain('Edit');
  });
  it('NFR-9: APG menu button: Space, Escape — open, then close and return focus', async () => {
    render(<Menu label="Actions" items={items} />);
    const user = userEvent.setup();
    await user.tab();
    const trigger = document.activeElement;
    await user.keyboard(' ');
    expect(screen.getByRole('menu')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
  it('NFR-9: APG menu button: Arrow Right — opens a submenu', async () => {
    const onAction = vi.fn();
    render(<Menu label="Actions" items={items} onAction={onAction} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}{ArrowDown}{ArrowDown}{ArrowRight}');
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    expect(focused()).toContain('Archive');
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('archive');
  });
});
