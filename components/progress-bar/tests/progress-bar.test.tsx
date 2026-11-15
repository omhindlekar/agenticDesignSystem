// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ProgressBar } from '../progress-bar';

afterEach(cleanup);

describe('ProgressBar', () => {
  it('NFR-9: is a progressbar named by its label with its value', () => {
    render(<ProgressBar label="Uploading" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.textContent).toContain('40%');
  });
  it('NFR-9: indeterminate has no value', () => {
    const { container } = render(<ProgressBar label="Loading" indeterminate />);
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('indeterminate');
  });
});
