// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumbs } from '../breadcrumbs';

afterEach(cleanup);
const items = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Design system', href: '/projects/ds' },
  { label: 'Components', href: '/projects/ds/components' },
  { label: 'Button' },
];

describe('Breadcrumbs', () => {
  it('NFR-9: a navigation landmark whose last item is the current page', () => {
    render(<Breadcrumbs items={items} maxItems={10} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumbs' })).toBeTruthy();
    expect(screen.getByText('Button').closest('[aria-current]')?.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('href')).toBe('/projects');
  });
  it('FR-1: long trails collapse to the first and last items with a button that expands them', async () => {
    render(<Breadcrumbs items={items} maxItems={3} />);
    expect(screen.queryByRole('link', { name: 'Projects' })).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Show full path' }));
    expect(screen.getByRole('link', { name: 'Projects' })).toBeTruthy();
  });
});
