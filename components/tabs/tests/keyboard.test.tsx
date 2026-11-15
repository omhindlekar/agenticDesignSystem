// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../tabs';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Tabs keyboard', () => {
  const tabs = [
    { id: 'overview', label: 'Overview', content: 'Overview panel' },
    { id: 'activity', label: 'Activity', content: 'Activity panel' },
    { id: 'settings', label: 'Settings', content: 'Settings panel' },
  ];
  const selected = () =>
    screen.getAllByRole('tab').find((t) => t.getAttribute('aria-selected') === 'true')?.textContent;
  it('NFR-9: APG tabs: Arrow Right, Arrow Left, Home, End — move and select (automatic activation)', async () => {
    render(<Tabs label="Project" tabs={tabs} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(selected()).toBe('Activity');
    await user.keyboard('{ArrowLeft}');
    expect(selected()).toBe('Overview');
    await user.keyboard('{End}');
    expect(selected()).toBe('Settings');
    await user.keyboard('{Home}');
    expect(selected()).toBe('Overview');
  });
  it('NFR-9: APG tabs: Enter — selects the focused tab (manual activation)', async () => {
    render(<Tabs label="Project" tabs={tabs} keyboardActivation="manual" />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(selected()).toBe('Overview');
    await user.keyboard('{Enter}');
    expect(selected()).toBe('Activity');
  });
});
