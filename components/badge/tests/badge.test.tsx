// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Badge } from '../badge';

afterEach(cleanup);

describe('Badge', () => {
  it('FR-1: a count above max shows max+', () => {
    render(<Badge variant="count" count={120} max={99} label="unread messages" />);
    expect(screen.getByText('99+')).toBeTruthy();
  });
  it('NFR-9: a count reads as the full number and label, not the capped digits', () => {
    const { container } = render(<Badge variant="count" count={120} max={99} label="unread messages" />);
    expect(container.firstElementChild?.hasAttribute('aria-label')).toBe(false);
    expect(container.firstElementChild?.textContent).toContain('120 unread messages');
    expect(screen.getByText('99+').getAttribute('aria-hidden')).toBe('true');
  });
  it('NFR-9: a dot is an image named by its label', () => {
    render(<Badge variant="dot" label="Online" tone="success" />);
    expect(screen.getByRole('img', { name: 'Online' })).toBeTruthy();
  });
  it('FR-1: a status badge shows its label with the tone', () => {
    const { container } = render(<Badge variant="status" label="Draft" tone="warning" />);
    expect(container.firstElementChild?.textContent).toBe('Draft');
    expect(container.firstElementChild?.getAttribute('data-tone')).toBe('warning');
  });
});
