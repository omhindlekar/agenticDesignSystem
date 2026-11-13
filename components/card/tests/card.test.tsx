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

  it('NFR-9: disabled interactive card stays focusable, uses aria-disabled="true" and ignores Enter and Space', async () => {
    const onClick = vi.fn();
    render(<Card variant="interactive" onClick={onClick} disabled>Plan</Card>);
    const btn = screen.getByRole('button');
    expect(btn.hasAttribute('disabled')).toBe(false);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(btn);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('NFR-9: disabled link card stays focusable, uses aria-disabled="true" and has no href to follow', async () => {
    render(<Card variant="interactive" href="/plans" disabled>Plans</Card>);
    const link = screen.getByRole('link', { name: 'Plans' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('href')).toBe(false);
    await userEvent.setup().tab();
    expect(document.activeElement).toBe(link);
  });

  it('FR-1: renders header (title, subtitle), content and actions slots', () => {
    const { container } = render(
      <Card title="Pro plan" subtitle="Billed yearly" actions={<button type="button">Choose</button>}>
        Unlimited projects
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Pro plan' })).toBeTruthy();
    expect(container.querySelector('.ads-card__subtitle')?.textContent).toBe('Billed yearly');
    expect(container.querySelector('.ads-card__content')?.textContent).toBe('Unlimited projects');
    expect(container.querySelector('.ads-card__actions button')).not.toBeNull();
  });

  it('NFR-9: an interactive card renders no actions slot, so controls are never nested', () => {
    render(
      <Card variant="interactive" onClick={() => {}} title="Pro" actions={<button type="button">Choose</button>}>
        Body
      </Card>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('renders the element given by `as` for static cards', () => {
    const { container } = render(<Card as="section">Body</Card>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });
});
