// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AppHeader } from '../app-header';

afterEach(cleanup);
const nav = [
  { label: 'Projects', href: '/projects', current: true },
  { label: 'Docs', href: '/docs' },
];
function mockWidth(wide: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: wide && q.includes('min-width'),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe('AppHeader', () => {
  beforeEach(() => mockWidth(true));
  it('NFR-9: a banner landmark with the product name and a named primary navigation', () => {
    render(<AppHeader title="Design system" nav={nav} />);
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByText('Design system')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('aria-current')).toBe('page');
  });
  it('FR-1: below breakpoint-md the navigation collapses into a menu button', () => {
    mockWidth(false);
    render(<AppHeader title="Design system" nav={nav} />);
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Navigation' })).toBeTruthy();
  });
  it('FR-1: layout forces wide or compact regardless of the viewport', () => {
    mockWidth(false);
    render(<AppHeader title="Design system" nav={nav} layout="wide" />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
  });
});
