// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../select';

afterEach(cleanup);

const options = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'in', label: 'India' },
  { value: 'xx', label: 'Unavailable', disabled: true },
];

describe('Select', () => {
  it('NFR-9: native combobox with an associated label', () => {
    render(<Select label="Country" options={options} />);
    expect(screen.getByRole('combobox', { name: 'Country' }).tagName).toBe('SELECT');
  });

  it('NFR-9: placeholder is a disabled empty option', () => {
    render(<Select label="Country" options={options} placeholder="Choose…" />);
    const placeholder = screen.getByRole('option', { name: 'Choose…' }) as HTMLOptionElement;
    expect(placeholder.value).toBe('');
    expect(placeholder.disabled).toBe(true);
  });

  it('NFR-9: error sets aria-invalid and describes the field', () => {
    render(<Select label="Country" options={options} errorMessage="Required" />);
    const field = screen.getByRole('combobox');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(field.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Required');
  });

  it('calls onChange with the selected value and marks state selected', async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={options} onChange={onChange} />);
    const field = screen.getByRole('combobox');
    await userEvent.setup().selectOptions(field, 'in');
    expect(onChange).toHaveBeenCalledWith('in');
    expect(field.closest('[data-state]')?.getAttribute('data-state')).toContain('selected');
  });

  it('disabled options cannot be chosen', () => {
    render(<Select label="Country" options={options} />);
    expect((screen.getByRole('option', { name: 'Unavailable' }) as HTMLOptionElement).disabled).toBe(true);
  });
});
