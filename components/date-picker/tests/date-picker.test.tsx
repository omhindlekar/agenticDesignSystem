// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from 'react-aria-components';
import type { ReactElement } from 'react';
import { DatePicker } from '../date-picker';

afterEach(cleanup);
const gb = (ui: ReactElement) => render(<I18nProvider locale="en-GB">{ui}</I18nProvider>);

describe('DatePicker', () => {
  it('NFR-9: is a group named by its label, with day, month and year spin buttons in locale order', () => {
    gb(<DatePicker label="Start date" defaultValue="2026-03-15" />);
    expect(screen.getByRole('group', { name: 'Start date' })).toBeTruthy();
    const segments = screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label')?.split(',')[0]);
    expect(segments).toEqual(['day', 'month', 'year']);
  });

  it('NFR-9: Arrow Up on a segment steps it and reports an ISO date', async () => {
    const onChange = vi.fn();
    gb(<DatePicker label="Start date" defaultValue="2026-03-15" onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('spinbutton')[0]!);
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('2026-03-16');
  });

  it('NFR-9: the calendar button opens a dialog with a grid; arrows move and Enter chooses', async () => {
    const onChange = vi.fn();
    gb(<DatePicker label="Start date" defaultValue="2026-03-15" onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Calendar/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('grid')).toBeTruthy();
    expect(within(dialog).getByRole('heading').textContent).toBe('March 2026');
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-03-16');
  });

  it('NFR-9: dates outside min and max are unavailable', async () => {
    gb(<DatePicker label="Start date" defaultValue="2026-03-15" minValue="2026-03-10" maxValue="2026-03-20" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Calendar/ }));
    const cell = screen.getByRole('button', { name: /Monday, 9 March 2026/ });
    expect(cell.getAttribute('aria-disabled')).toBe('true');
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = gb(<DatePicker label="A" defaultValue="2026-03-15" errorMessage="Pick a weekday" />);
    const root = container.querySelector('.ads-date-picker');
    expect(root?.getAttribute('data-variant')).toBe('error');
    expect(root?.getAttribute('data-state')).toBe('filled error');
  });
});
