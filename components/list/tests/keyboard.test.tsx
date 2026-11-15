// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { List } from '../list';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('List keyboard', () => {
  const items = [
    { id: 'tokens', title: 'Tokens' },
    { id: 'rules', title: 'Rules' },
    { id: 'components', title: 'Components' },
  ];
  const focused = () => document.activeElement?.textContent;
  it('NFR-9: APG grid (interactive lists): Arrow Down, Arrow Up, Home, End — move between items', async () => {
    render(<List label="Recent" items={items} onAction={() => {}} />);
    const user = userEvent.setup();
    await user.tab();
    expect(focused()).toContain('Tokens');
    await user.keyboard('{ArrowDown}');
    expect(focused()).toContain('Rules');
    await user.keyboard('{ArrowUp}');
    expect(focused()).toContain('Tokens');
    await user.keyboard('{End}');
    expect(focused()).toContain('Components');
    await user.keyboard('{Home}');
    expect(focused()).toContain('Tokens');
  });
  it('NFR-9: APG grid (interactive lists): Space, Enter — select and open', async () => {
    const onSelectionChange = vi.fn();
    const onAction = vi.fn();
    render(
      <List
        label="Recent"
        items={items}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        onAction={onAction}
      />,
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['tokens']);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('rules');
  });
});
