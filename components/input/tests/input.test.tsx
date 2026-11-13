// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

afterEach(cleanup);

describe('Input', () => {
  it('NFR-9: label is programmatically associated with the field', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText('Email').tagName).toBe('INPUT');
  });

  it('NFR-9: error message sets aria-invalid and is linked by aria-describedby', () => {
    render(<Input label="Email" errorMessage="Enter a valid email" />);
    const field = screen.getByLabelText('Email');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const describedBy = field.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe('Enter a valid email');
  });

  it('NFR-9: helper text is linked by aria-describedby', () => {
    render(<Input label="Name" helperText="As on your passport" />);
    const id = screen.getByLabelText('Name').getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(id)?.textContent).toBe('As on your passport');
  });

  it('NFR-9: required is exposed to assistive tech', () => {
    render(<Input label="Name" required />);
    expect((screen.getByLabelText(/Name/) as HTMLInputElement).required).toBe(true);
  });

  it('calls onChange with the string value and marks state filled', async () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    const field = screen.getByLabelText('Name');
    await userEvent.setup().type(field, 'Om');
    expect(onChange).toHaveBeenLastCalledWith('Om');
    expect(field.closest('[data-state]')?.getAttribute('data-state')).toContain('filled');
  });

  it('read-only and disabled are applied to the field', () => {
    render(<><Input label="A" readOnly /><Input label="B" disabled /></>);
    expect((screen.getByLabelText('A') as HTMLInputElement).readOnly).toBe(true);
    expect((screen.getByLabelText('B') as HTMLInputElement).disabled).toBe(true);
  });
});
