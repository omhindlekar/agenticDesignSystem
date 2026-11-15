// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Image } from '../image';

afterEach(cleanup);

describe('Image', () => {
  it('NFR-9: renders an image with its alt text and ratio', () => {
    const { container } = render(<Image src="/a.png" alt="Team at the offsite" ratio="16:9" />);
    expect(screen.getByRole('img', { name: 'Team at the offsite' })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('16:9');
  });
  it('NFR-9: an empty alt marks it decorative', () => {
    const { container } = render(<Image src="/a.png" alt="" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('FR-1: a failed load shows a fallback tile that keeps the alt text', () => {
    const { container } = render(<Image src="/missing.png" alt="Team at the offsite" />);
    fireEvent.error(container.querySelector('img')!);
    expect(screen.getByRole('img', { name: 'Team at the offsite' }).tagName).not.toBe('IMG');
  });
  it('FR-1: an empty src shows the fallback straight away', () => {
    const { container } = render(<Image src="" alt="Team at the offsite" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.firstElementChild?.getAttribute('data-state')).toBe('error');
  });
});
