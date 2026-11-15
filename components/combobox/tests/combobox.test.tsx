// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from '../combobox';

afterEach(cleanup);

const options = [
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'in', label: 'India' },
  { value: 'ie', label: 'Ireland' },
];

describe('Combobox', () => {
  it('NFR-9: is a combobox named by its label', () => {
    render(<Combobox label="Country" options={options} />);
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeTruthy();
  });

  it('NFR-9: typing filters the list; Arrow Down and Enter choose an option', async () => {
    const onChange = vi.fn();
    render(<Combobox label="Country" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox'), 'uni');
    const names = screen.getAllByRole('option').map((o) => o.textContent);
    expect(names).toEqual(['United Kingdom', 'United States']);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('us');
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('United States');
  });

  it('NFR-9: Escape closes the list', async () => {
    render(<Combobox label="Country" options={options} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox'), 'i');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('FR-1: shows an empty state when nothing matches', async () => {
    render(<Combobox label="Country" options={options} />);
    await userEvent.setup().type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('No results')).toBeTruthy();
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = render(<Combobox label="A" options={options} defaultValue="in" errorMessage="x" />);
    const root = container.querySelector('.ads-combobox');
    expect(root?.getAttribute('data-variant')).toBe('error');
    expect(root?.getAttribute('data-state')).toBe('filled error');
  });
});
