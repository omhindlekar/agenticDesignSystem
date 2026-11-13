// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';
import { ICON_PATHS } from '../../icon/icons.generated';

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

  it('FR-1: error text carries a decorative error icon', () => {
    render(<Input label="Email" errorMessage="Enter a valid email" />);
    const msg = document.querySelector('.ads-field__message[data-tone="error"]');
    expect(msg?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(msg?.textContent).toBe('Enter a valid email');
  });

  it('FR-1: error text uses the report icon and success text the check_circle icon', () => {
    render(
      <>
        <Input label="A" errorMessage="Wrong" />
        <Input label="B" variant="success" helperText="Looks good" />
      </>,
    );
    const err = document.querySelector('.ads-field__message[data-tone="error"] path');
    const ok = document.querySelector('.ads-field__message[data-tone="success"] path');
    expect(err?.getAttribute('d')).toBe(ICON_PATHS.report);
    expect(ok?.getAttribute('d')).toBe(ICON_PATHS.check_circle);
  });

  it('FR-1: startIcon draws a decorative icon inside the field', () => {
    const { container } = render(<Input label="Search" startIcon="search" />);
    const svg = container.querySelector('.ads-input__start svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.ads-input')?.getAttribute('data-start')).toBe('true');
  });

  it('NFR-9: clearable shows a Clear button only when there is a value, clears it and returns focus', async () => {
    const onChange = vi.fn();
    render(<Input label="Name" clearable defaultValue="Om" onChange={onChange} />);
    const field = screen.getByLabelText('Name') as HTMLInputElement;
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Clear Name' }));
    expect(field.value).toBe('');
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(document.activeElement).toBe(field);
    expect(screen.queryByRole('button', { name: 'Clear Name' })).toBeNull();
  });

  it('NFR-9: a password field has a Show password toggle with aria-pressed', async () => {
    render(<Input label="Password" type="password" />);
    const field = screen.getByLabelText('Password') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(field.type).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await userEvent.setup().click(toggle);
    expect(field.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
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
