// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tree } from '../tree';
import type { TreeNode } from '../tree';

afterEach(cleanup);
const items: TreeNode[] = [
  { id: 'components', label: 'components', icon: 'filter_list', children: [
    { id: 'button', label: 'button' },
    { id: 'card', label: 'card' },
  ] },
  { id: 'tokens', label: 'tokens', icon: 'settings' },
];

describe('Tree', () => {
  it('NFR-9: a named tree grid whose parent rows report expanded state', () => {
    render(<Tree label="Files" items={items} />);
    expect(screen.getByRole('treegrid', { name: 'Files' })).toBeTruthy();
    const parent = screen.getByRole('row', { name: /components/ });
    expect(parent.getAttribute('aria-expanded')).toBe('false');
  });
  it('NFR-9: Arrow Right expands a parent; Enter runs onAction on a child', async () => {
    const onAction = vi.fn();
    render(<Tree label="Files" items={items} onAction={onAction} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('row', { name: /components/ }).getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('button');
  });
});
