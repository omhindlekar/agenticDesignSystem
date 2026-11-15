// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Avatar } from '../avatar';

afterEach(cleanup);

describe('Avatar', () => {
  it('NFR-9: without an image it shows initials and is an image named by the person', () => {
    render(<Avatar name="Om Hindlekar" />);
    const avatar = screen.getByRole('img', { name: 'Om Hindlekar' });
    expect(avatar.textContent).toBe('OH');
  });
  it('NFR-9: with an image it uses the name as alt text, and falls back to initials on error', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' }) as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    fireEvent.error(img);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' }).textContent).toBe('AL');
  });
  it('FR-1: the colour is chosen deterministically from the name', () => {
    const { container, rerender } = render(<Avatar name="Om Hindlekar" />);
    const first = container.firstElementChild?.getAttribute('data-tone');
    rerender(<Avatar name="Om Hindlekar" />);
    expect(container.firstElementChild?.getAttribute('data-tone')).toBe(first);
  });
});
