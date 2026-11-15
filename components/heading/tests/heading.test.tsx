// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Heading } from '../heading';

afterEach(cleanup);

describe('Heading', () => {
  it('NFR-9: renders the semantic level and its type role', () => {
    const { container } = render(<Heading level={2}>Projects</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('h2');
  });
  it('FR-1: the look can differ from the level (appearance) without changing semantics', () => {
    const { container } = render(<Heading level={2} appearance="h4">Settings</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('h4');
  });
});
