// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Divider } from '../divider';

afterEach(cleanup);

describe('Divider', () => {
  it('NFR-9: is a separator with its orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
  });
});
