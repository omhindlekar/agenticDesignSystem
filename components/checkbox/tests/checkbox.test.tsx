// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

afterEach(cleanup);

describe('Checkbox', () => {
  it('NFR-9: native checkbox with an associated label', () => {
    render(<Checkbox label="Remember me" />);
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeTruthy();
  });

  it('NFR-9: Space toggles it and onChange receives the boolean', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });

  it('NFR-9: indeterminate is set on the DOM node so it is announced as mixed', () => {
    render(<Checkbox label="All" indeterminate />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
  });

  it('NFR-9: error sets aria-invalid and is described', () => {
    render(<Checkbox label="Accept terms" errorMessage="You must accept" />);
    const box = screen.getByRole('checkbox');
    expect(box.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(box.getAttribute('aria-describedby') ?? '')?.textContent).toBe('You must accept');
  });

  it('disabled cannot be toggled', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="X" disabled onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
