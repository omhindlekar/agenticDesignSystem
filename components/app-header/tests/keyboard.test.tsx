// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppHeader } from '../app-header';
import { IconButton } from '../../icon-button/icon-button';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('AppHeader keyboard', () => {
  const nav = [
    { label: 'Projects', href: '/projects', current: true },
    { label: 'Docs', href: '/docs' },
  ];
  it('NFR-9: APG landmarks + menu button: Tab — moves through navigation and actions in reading order', async () => {
    render(
      <AppHeader
        title="Agentic DS"
        nav={nav}
        layout="wide"
        actions={<IconButton icon="settings" label="Settings" />}
      />,
    );
    const user = userEvent.setup();
    const stops: string[] = [];
    for (let i = 0; i < 3; i++) {
      await user.tab();
      stops.push(document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? '');
    }
    expect(stops).toEqual(['Projects', 'Docs', 'Settings']);
  });
  it('NFR-9: APG landmarks + menu button: Enter — on narrow layouts opens the navigation menu', async () => {
    render(<AppHeader title="Agentic DS" nav={nav} layout="compact" />);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Navigation');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeTruthy();
  });
});
