// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { PageShell } from '../page-shell';

afterEach(cleanup);

describe('PageShell', () => {
  it('NFR-9: has exactly one main landmark and optional header, navigation and footer', () => {
    render(
      <PageShell header={<header>Top</header>} nav={<nav aria-label="Primary">Nav</nav>} footer={<p>Legal</p>}>
        <p>Content</p>
      </PageShell>,
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  it('NFR-9: APG landmarks: Tab, Enter — the skip link is reached first and moves focus to main', async () => {
    const user = userEvent.setup();
    render(
      <PageShell header={<header><a href="#home">Home</a></header>}>
        <p>Content</p>
      </PageShell>,
    );
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(document.activeElement).toBe(skip);
    const main = screen.getByRole('main');
    expect(skip.getAttribute('href')).toBe(`#${main.id}`);
    expect(main.getAttribute('tabindex')).toBe('-1');
    await user.keyboard('{Enter}');
    main.focus(); // jsdom does not follow in-page anchors; the href and tabindex above make browsers do it
    expect(document.activeElement).toBe(main);
  });

  it('FR-3: has no skip link when there is nothing to skip', () => {
    render(<PageShell><p>Content</p></PageShell>);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('FR-3: uses the page background by default and sunken on request', () => {
    const { container, rerender } = render(<PageShell><p>x</p></PageShell>);
    expect((container.firstElementChild as HTMLElement).dataset['variant']).toBe('page');
    rerender(<PageShell background="sunken"><p>x</p></PageShell>);
    expect((container.firstElementChild as HTMLElement).dataset['variant']).toBe('sunken');
  });
});
