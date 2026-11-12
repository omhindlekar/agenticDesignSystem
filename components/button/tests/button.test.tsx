// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

afterEach(cleanup);

describe('Button', () => {
  it('NFR-9: renders a native button with its label as accessible name', () => {
    render(<Button label="Save" />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('NFR-9: defaults to type="button" so it never submits forms by accident', () => {
    render(<Button label="Save" />);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('NFR-9: activates with Enter and Space', async () => {
    const onClick = vi.fn();
    render(<Button label="Save" onClick={onClick} />);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('NFR-9: disabled stays focusable, sets aria-disabled and does not fire onClick', async () => {
    const onClick = vi.fn();
    render(<Button label="Save" disabled onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(btn);
    await user.click(btn);
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('NFR-9: loading sets aria-busy, keeps the label and blocks clicks', async () => {
    const onClick = vi.fn();
    render(<Button label="Save" loading onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /Save/ });
    expect(btn.getAttribute('aria-busy')).toBe('true');
    await userEvent.setup().click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('FR-3: exposes variant and state as data attributes', () => {
    render(<Button label="Delete" variant="danger" disabled />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('danger');
    expect(btn.getAttribute('data-state')).toBe('disabled');
  });
});
