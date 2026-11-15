// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SideNav } from '../side-nav';
import type { SideNavEntry } from '../side-nav';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('SideNav keyboard', () => {
  const items: SideNavEntry[] = [
    { id: 'home', label: 'Home', href: '/', icon: 'menu' },
    {
      type: 'group',
      id: 'library',
      label: 'Library',
      icon: 'filter_list',
      items: [{ id: 'components', label: 'Components', href: '/components' }],
    },
    { id: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
  ];
  it('NFR-9: APG navigation landmark + disclosure: Tab, Enter — move through links and toggles, expand a group, follow a link', async () => {
    const followed = vi.fn();
    const handler = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a');
      if (a) {
        e.preventDefault();
        followed(a.getAttribute('href'));
      }
    };
    document.addEventListener('click', handler);
    render(<SideNav label="Main" items={items} currentId="home" />);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement?.textContent).toContain('Home');
    await user.tab();
    const toggle = screen.getByRole('button', { name: 'Library' });
    expect(document.activeElement).toBe(toggle);
    await user.keyboard('{Enter}');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await user.tab();
    expect(document.activeElement?.textContent).toContain('Components');
    await user.keyboard('{Enter}');
    expect(followed).toHaveBeenCalledWith('/components');
    document.removeEventListener('click', handler);
  });
});
