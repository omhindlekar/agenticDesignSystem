// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

afterEach(cleanup);

describe('Textarea', () => {
  it('NFR-9: is a multi-line text box named by its label', () => {
    render(<Textarea label="Description" />);
    const box = screen.getByRole('textbox', { name: 'Description' });
    expect(box.tagName).toBe('TEXTAREA');
  });

  it('NFR-9: helper and error text are linked by aria-describedby; error sets aria-invalid', () => {
    render(<Textarea label="Bio" helperText="Shown on your profile" errorMessage="Too short" />);
    const box = screen.getByRole('textbox', { name: 'Bio' });
    expect(box.getAttribute('aria-invalid')).toBe('true');
    const text = (box.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' | ');
    expect(text).toContain('Shown on your profile');
    expect(text).toContain('Too short');
  });

  it('FR-1: with maxLength it shows a live count that the field describes', async () => {
    const onChange = vi.fn();
    render(<Textarea label="Note" maxLength={20} onChange={onChange} />);
    const box = screen.getByRole('textbox', { name: 'Note' });
    await userEvent.setup().type(box, 'Hello');
    expect(onChange).toHaveBeenLastCalledWith('Hello');
    const described = (box.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '');
    expect(described.join(' ')).toContain('5/20');
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = render(<Textarea label="A" defaultValue="x" disabled />);
    const rootEl = container.firstElementChild;
    expect(rootEl?.getAttribute('data-variant')).toBe('default');
    expect(rootEl?.getAttribute('data-state')).toBe('filled disabled');
  });
});
