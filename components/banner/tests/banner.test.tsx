// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from '../banner';

afterEach(cleanup);

describe('Banner', () => {
  it.each([
    ['danger', 'alert'],
    ['warning', 'alert'],
    ['info', 'status'],
    ['success', 'status'],
  ] as const)('NFR-9: %s tone uses role %s', (tone, role) => {
    render(<Banner tone={tone} title="Heads up">Body</Banner>);
    expect(screen.getByRole(role).textContent).toContain('Heads up');
  });
  it('NFR-9: the dismiss button is named and calls onDismiss', async () => {
    const onDismiss = vi.fn();
    render(<Banner tone="info" title="T" onDismiss={onDismiss}>B</Banner>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
  });
  it('FR-1: renders actions and exposes the tone as its variant', () => {
    const { container } = render(<Banner tone="success" title="Saved" actions={<button type="button">Undo</button>}>Done</Banner>);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('success');
  });
});
