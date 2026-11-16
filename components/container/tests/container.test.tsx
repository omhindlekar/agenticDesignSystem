// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Container } from '../container';

afterEach(cleanup);

describe('Container', () => {
  it('FR-1: renders its children inside a width-capped column of the requested size', () => {
    const { container } = render(<Container size="sm"><p>Content</p></Container>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset['variant']).toBe('sm');
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('FR-1: defaults to the lg width', () => {
    const { container } = render(<Container><p>x</p></Container>);
    expect((container.firstElementChild as HTMLElement).dataset['variant']).toBe('lg');
  });
});
