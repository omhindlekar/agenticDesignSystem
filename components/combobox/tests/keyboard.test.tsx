// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from '../combobox';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Combobox keyboard', () => {
  const options = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'in', label: 'India' },
    { value: 'us', label: 'United States' },
  ];
  it('NFR-9: APG combobox: Arrow Down, Arrow Up, Enter — open, move and choose', async () => {
    const onChange = vi.fn();
    render(<Combobox label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('in');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('NFR-9: APG combobox: Escape — closes the list', async () => {
    render(<Combobox label="Country" options={options} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
