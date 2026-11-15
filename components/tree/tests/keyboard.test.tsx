// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tree } from '../tree';
import type { TreeNode } from '../tree';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Tree keyboard', () => {
  const items: TreeNode[] = [
    {
      id: 'components',
      label: 'components',
      children: [
        { id: 'button', label: 'button' },
        { id: 'card', label: 'card' },
      ],
    },
    { id: 'tokens', label: 'tokens', children: [{ id: 'semantic', label: 'semantic.json' }] },
    { id: 'readme', label: 'README.md' },
  ];
  const focused = () => document.activeElement?.textContent?.trim();
  it('NFR-9: APG treeview: Arrow Down, Arrow Up, Home, End — move between visible nodes', async () => {
    render(<Tree label="Files" items={items} />);
    const user = userEvent.setup();
    await user.tab();
    expect(focused()).toBe('components');
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('tokens');
    await user.keyboard('{ArrowUp}');
    expect(focused()).toBe('components');
    await user.keyboard('{End}');
    expect(focused()).toBe('README.md');
    await user.keyboard('{Home}');
    expect(focused()).toBe('components');
  });
  it('NFR-9: APG treeview: Arrow Right, Arrow Left, Enter — expand, collapse and activate', async () => {
    const onAction = vi.fn();
    render(<Tree label="Files" items={items} onAction={onAction} />);
    const user = userEvent.setup();
    await user.tab();
    const parent = screen.getAllByRole('row')[0]!;
    await user.keyboard('{ArrowRight}');
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{ArrowLeft}');
    expect(parent.getAttribute('aria-expanded')).toBe('false');
    await user.keyboard('{End}{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('readme');
  });
});
