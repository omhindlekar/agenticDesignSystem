// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumbs } from '../breadcrumbs';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Breadcrumbs keyboard', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Design system', href: '/projects/ds' },
    { label: 'Components', href: '/projects/ds/components' },
    { label: 'Button' },
  ];
  it('NFR-9: APG breadcrumb: Tab, Enter — move through the links; the current page is not a stop; Enter is left to the browser', async () => {
    render(<Breadcrumbs items={items} maxItems={10} />);
    const user = userEvent.setup();
    const stops: string[] = [];
    for (let i = 0; i < 5; i++) {
      await user.tab();
      if (document.activeElement && document.activeElement !== document.body)
        stops.push(document.activeElement.textContent ?? '');
    }
    expect(stops.slice(0, 4)).toEqual(['Home', 'Projects', 'Design system', 'Components']);
    expect(stops).not.toContain('Button');
    const link = screen.getByRole('link', { name: 'Projects' });
    expect(link.getAttribute('href')).toBe('/projects');
    // fireEvent returns false when a handler prevented the default action.
    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(true);
  });
  it('NFR-9: APG breadcrumb: Enter — on the collapsed item, shows the full path', async () => {
    render(<Breadcrumbs items={items} maxItems={3} />);
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Show full path');
    await user.keyboard('{Enter}');
    expect(screen.getByText('Projects')).toBeTruthy();
  });
});
