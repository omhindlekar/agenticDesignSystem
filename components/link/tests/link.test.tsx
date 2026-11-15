// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Link } from '../link';

afterEach(cleanup);

describe('Link', () => {
  it('NFR-9: is a link with its text as the name', () => {
    render(<Link href="/docs">Read the docs</Link>);
    expect(screen.getByRole('link', { name: 'Read the docs' }).getAttribute('href')).toBe('/docs');
  });
  it('NFR-9: an external link opens in a new tab safely and says so', () => {
    const { container } = render(<Link href="https://example.com" external>Status page</Link>);
    const a = screen.getByRole('link', { name: /Status page/ });
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.textContent).toContain('(opens in a new tab)');
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
  it('FR-1: inline is the default variant; standalone is available', () => {
    const { container, rerender } = render(<Link href="/a">A</Link>);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('inline');
    rerender(<Link href="/a" variant="standalone">A</Link>);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('standalone');
  });
});
