// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Text } from '../text';

afterEach(cleanup);

describe('Text', () => {
  it('FR-1: renders a type role as the requested element', () => {
    const { container } = render(<Text variant="caption" as="span">Hi</Text>);
    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('caption');
  });
  it('FR-1: defaults to body1 in a paragraph', () => {
    const { container } = render(<Text>Hi</Text>);
    expect(container.firstElementChild?.tagName).toBe('P');
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('body1');
  });
});
