// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../select';

afterEach(cleanup);

const options = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'in', label: 'India' },
  { value: 'xx', label: 'Unavailable', disabled: true },
];

describe('Select', () => {
  it('NFR-9: the trigger is a button named by the label and showing the placeholder', () => {
    render(<Select label="Country" options={options} placeholder="Choose a country" />);
    const trigger = screen.getByRole('button', { name: /Country/ });
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.textContent).toContain('Choose a country');
  });

  it('NFR-9: clicking opens a list box; choosing an option calls onChange and closes it', async () => {
    const onChange = vi.fn();
    const { container } = render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Country/ }));
    const listbox = screen.getByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'India' }));
    expect(onChange).toHaveBeenLastCalledWith('in');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(container.querySelector('.ads-select')?.getAttribute('data-state')).toContain('selected');
  });

  it('NFR-9: the keyboard opens the list, arrows move and Enter selects', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('in');
  });

  it('NFR-9: typing on the closed trigger selects by first letters (typeahead)', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('i');
    expect(onChange).toHaveBeenLastCalledWith('in');
  });

  it('NFR-9: disabled options are marked and cannot be chosen', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Country/ }));
    const option = screen.getByRole('option', { name: 'Unavailable' });
    expect(option.getAttribute('aria-disabled')).toBe('true');
    await user.click(option);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('NFR-9: error text describes the trigger', () => {
    render(<Select label="Country" options={options} errorMessage="Required" />);
    const trigger = screen.getByRole('button', { name: /Country/ });
    const text = (trigger.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
    expect(text).toContain('Required');
  });

  it('FR-1: with a name it submits through a hidden native select', () => {
    const { container } = render(<Select label="Country" options={options} name="country" defaultValue="uk" />);
    const hidden = container.querySelector('select[name="country"]') as HTMLSelectElement | null;
    expect(hidden?.value).toBe('uk');
  });
});
