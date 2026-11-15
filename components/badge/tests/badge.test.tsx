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
  it('NFR-9: a count carries an accessible label with the full number', () => {
    const { container } = render(<Badge variant="count" count={3} label="unread messages" />);
    expect(container.firstElementChild?.getAttribute('aria-label')).toBe('3 unread messages');
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
