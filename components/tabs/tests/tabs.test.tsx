// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../tabs';

afterEach(cleanup);
const tabs = [
  { id: 'overview', label: 'Overview', content: 'Overview panel' },
  { id: 'activity', label: 'Activity', content: 'Activity panel' },
  { id: 'settings', label: 'Settings', content: 'Settings panel' },
];

describe('Tabs', () => {
  it('NFR-9: a named tablist with tabs and the selected panel', () => {
    render(<Tabs label="Project" tabs={tabs} />);
    expect(screen.getByRole('tablist', { name: 'Project' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Overview panel');
  });
  it('NFR-9: automatic activation: arrow keys select the next tab', async () => {
    const onChange = vi.fn();
    render(<Tabs label="Project" tabs={tabs} onSelectionChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('activity');
    expect(screen.getByRole('tabpanel').textContent).toBe('Activity panel');
  });
  it('NFR-9: manual activation: arrows move focus, Enter selects', async () => {
    render(<Tabs label="Project" tabs={tabs} keyboardActivation="manual" />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected')).toBe('false');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected')).toBe('true');
  });
});
