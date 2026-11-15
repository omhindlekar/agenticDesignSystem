// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../date-picker';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('DatePicker keyboard', () => {
  it('NFR-9: APG date picker dialog + spin buttons: Arrow Up, Arrow Down — step the focused segment', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Start date" defaultValue="2026-03-10" onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowUp}');
    const up = onChange.mock.calls.at(-1)?.[0] as string;
    await user.keyboard('{ArrowDown}');
    const down = onChange.mock.calls.at(-1)?.[0] as string;
    expect(up).not.toBe('2026-03-10');
    expect(down).toBe('2026-03-10');
  });
  it('NFR-9: APG date picker dialog + spin buttons: Arrow Right, Enter, Escape — move in the calendar, choose, close', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Start date" defaultValue="2026-03-10" onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /calendar/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-03-11');
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: /calendar/i }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
