// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from '../icon-button';

afterEach(cleanup);

describe('IconButton', () => {
  it('NFR-9: is a native button named by its required label; the icon is decorative', () => {
    const { container } = render(<IconButton icon="close" label="Close dialog" />);
    const btn = screen.getByRole('button', { name: 'Close dialog' });
    expect(btn.getAttribute('type')).toBe('button');
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('NFR-9: activates with click, Enter and Space', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="search" label="Search" onClick={onClick} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('NFR-9: disabled stays focusable with aria-disabled and ignores activation', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="delete" label="Delete" disabled onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(false);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(btn);
    await user.click(btn);
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('NFR-9: a toggle exposes aria-pressed; a plain button does not', () => {
    render(
      <>
        <IconButton icon="visibility" label="Show password" pressed={false} />
        <IconButton icon="close" label="Close" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Show password' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Close' }).hasAttribute('aria-pressed')).toBe(false);
  });

  it('NFR-9: loading is aria-disabled, keeps its name, shows a Loading progress bar and blocks activation', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="download" label="Download" loading onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /Download/ });
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeTruthy();
    await userEvent.setup().click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    ['sm', 'md'],
    ['md', 'md'],
    ['lg', 'lg'],
  ] as const)('FR-1: size %s draws the %s icon', (size, iconSize) => {
    const { container } = render(<IconButton icon="add" label="Add" size={size} />);
    expect(container.querySelector('button')?.getAttribute('data-size')).toBe(size);
    expect(container.querySelector('svg')?.getAttribute('data-size')).toBe(iconSize);
  });

  it('FR-3: exposes variant, tone and state as data attributes', () => {
    const { container } = render(<IconButton icon="delete" label="Delete" variant="outlined" tone="danger" pressed />);
    const btn = container.querySelector('button');
    expect(btn?.getAttribute('data-variant')).toBe('outlined');
    expect(btn?.getAttribute('data-tone')).toBe('danger');
    expect(btn?.getAttribute('data-state')).toBe('selected');
  });
});
