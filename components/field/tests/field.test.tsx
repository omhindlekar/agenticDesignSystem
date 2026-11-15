// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Field } from '../field';

afterEach(cleanup);

describe('Field', () => {
  it('NFR-9: labels a custom control and links helper and error text to it', () => {
    render(
      <Field label="Colour" helperText="Pick a brand colour" errorMessage="Required" required>
        {(control) => <input {...control} />}
      </Field>,
    );
    const input = screen.getByLabelText(/Colour/);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');
    const text = (input.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' | ');
    expect(text).toContain('Pick a brand colour');
    expect(text).toContain('Required');
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = render(
      <Field label="A" errorMessage="Bad" disabled>
        {(control) => <input {...control} />}
      </Field>,
    );
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('error');
    expect(container.firstElementChild?.getAttribute('data-state')).toBe('disabled error');
    expect((screen.getByLabelText('A') as HTMLInputElement).disabled).toBe(true);
  });
});
