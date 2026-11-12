// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../card';

afterEach(cleanup);

describe('Card', () => {
  it('NFR-9: static card is not focusable and has no interactive role', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector('button, a')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('NFR-9: card with onClick is a button and works with the keyboard', async () => {
    const onClick = vi.fn();
    render(<Card variant="interactive" onClick={onClick} aria-label="Open plan">Plan</Card>);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open plan' }));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('NFR-9: card with href is a link', () => {
    render(<Card variant="interactive" href="/plans">Plans</Card>);
    expect(screen.getByRole('link', { name: 'Plans' }).getAttribute('href')).toBe('/plans');
  });

  it('NFR-9: selected interactive card exposes aria-pressed', () => {
    render(<Card variant="interactive" onClick={() => {}} selected>Plan</Card>);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('NFR-9: disabled interactive card sets aria-disabled and ignores clicks', async () => {
    const onClick = vi.fn();
    render(<Card variant="interactive" onClick={onClick} disabled>Plan</Card>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    await userEvent.setup().click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the element given by `as` for static cards', () => {
    const { container } = render(<Card as="section">Body</Card>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });
});
