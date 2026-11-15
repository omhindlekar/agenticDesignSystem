// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Spinner } from '../spinner';

afterEach(cleanup);

describe('Spinner', () => {
  it('NFR-9: is a status announced by its label', () => {
    render(<Spinner label="Saving" />);
    expect(screen.getByRole('status').textContent).toContain('Saving');
  });
  it('FR-1: defaults to md and the "Loading" label', () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('md');
    expect(screen.getByRole('status').textContent).toContain('Loading');
  });
});
