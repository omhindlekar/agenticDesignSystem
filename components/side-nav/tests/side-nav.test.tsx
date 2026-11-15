// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SideNav } from '../side-nav';
import type { SideNavEntry } from '../side-nav';

afterEach(cleanup);
const items: SideNavEntry[] = [
  { id: 'home', label: 'Home', href: '/', icon: 'menu' },
  { type: 'group', id: 'library', label: 'Library', icon: 'filter_list', items: [
    { id: 'components', label: 'Components', href: '/components' },
    { id: 'tokens', label: 'Tokens', href: '/tokens' },
  ] },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
];

describe('SideNav', () => {
  it('NFR-9: a named navigation landmark of links; the current page has aria-current', () => {
    render(<SideNav label="Main" items={items} currentId="settings" />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);
  });
  it('NFR-9: a group is a disclosure; it opens to show its links, and opens by default when it holds the current page', async () => {
    const { rerender } = render(<SideNav label="Main" items={items} currentId="home" />);
    const toggle = screen.getByRole('button', { name: 'Library' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await userEvent.setup().click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('link', { name: 'Components' })).toBeTruthy();
    cleanup();
    render(<SideNav label="Main" items={items} currentId="tokens" />);
    expect(screen.getByRole('button', { name: 'Library' }).getAttribute('aria-expanded')).toBe('true');
    void rerender;
  });
  it('NFR-9: rail mode keeps every link named', () => {
    const { container } = render(<SideNav label="Main" items={items} currentId="home" collapsed />);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('rail');
    expect(screen.getByRole('link', { name: 'Settings' })).toBeTruthy();
  });
});
