// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from '../link';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Link keyboard', () => {
  it('NFR-9: APG link: Enter — follows the link (a native link; Enter is left to the browser)', async () => {
    render(<Link href="/release-notes">Read the release notes</Link>);
    await userEvent.setup().tab();
    const link = screen.getByRole('link', { name: 'Read the release notes' });
    expect(document.activeElement).toBe(link);
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/release-notes');
    // fireEvent returns false when a handler prevented the default action.
    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(true);
  });
});
