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

  it('NFR-9: disabled uses aria-disabled="true", not the native disabled attribute', () => {
    render(<Button label="Save" disabled />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(false);
  });

  it('NFR-9: disabled ignores Space as well as Enter and click', async () => {
    const onClick = vi.fn();
    render(<Button label="Save" disabled onClick={onClick} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('NFR-9: a disabled submit button does not submit its form', async () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent)}>
        <Button label="Send" type="submit" disabled />
      </form>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('NFR-9: loading stays focusable, is aria-disabled, shows a Loading progress bar, keeps the label and blocks clicks', async () => {
    const onClick = vi.fn();
    render(<Button label="Save" loading onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /Save/ });
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(false);
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeTruthy();
    await userEvent.setup().click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('FR-3: exposes variant, tone and state as data attributes', () => {
    render(<Button label="Delete" variant="outlined" tone="danger" disabled />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('outlined');
    expect(btn.getAttribute('data-tone')).toBe('danger');
    expect(btn.getAttribute('data-state')).toBe('disabled');
  });

  it.each([
    ['primary', 'contained', 'primary'],
    ['secondary', 'outlined', 'primary'],
    ['ghost', 'text', 'primary'],
    ['danger', 'contained', 'danger'],
  ] as const)('FR-3: deprecated variant "%s" still renders, as %s with %s tone', (legacy, variant, tone) => {
    render(<Button label="Go" variant={legacy} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe(variant);
    expect(btn.getAttribute('data-tone')).toBe(tone);
  });

  it('FR-1: defaults to a contained, primary-tone, medium button', () => {
    render(<Button label="Save" />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('contained');
    expect(btn.getAttribute('data-tone')).toBe('primary');
    expect(btn.getAttribute('data-size')).toBe('md');
  });

  it('FR-1: loading keeps the label in the DOM (so the width holds) and shows a progress indicator', () => {
    render(<Button label="Save" loading iconStart={<span data-testid="icon" />} />);
    const btn = screen.getByRole('button', { name: /Save/ });
    expect(btn.querySelector('.ads-button__label')?.textContent).toBe('Save');
    expect(btn.querySelector('.ads-button__progress .ads-spinner')).not.toBeNull();
    expect(screen.getByTestId('icon')).toBeTruthy();
  });
});
