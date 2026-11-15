// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../select';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Select keyboard', () => {
  const options = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'in', label: 'India' },
    { value: 'us', label: 'United States' },
  ];
  it('NFR-9: APG select-only combobox: Enter, Arrow Down, Arrow Up — open, move and choose', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('in');
  });
  it('NFR-9: APG select-only combobox: Escape — closes without changing the value', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
  it('NFR-9: APG select-only combobox: Type-ahead — typing chooses the matching option', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('Un');
    expect(onChange).toHaveBeenLastCalledWith('uk');
  });
});
