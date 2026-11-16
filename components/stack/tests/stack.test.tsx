// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Stack } from '../stack';

afterEach(cleanup);

describe('Stack', () => {
  it('FR-1: stacks vertically with the md gap by default', () => {
    const { container } = render(<Stack><p>a</p><p>b</p></Stack>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset['variant']).toBe('vertical');
    expect(root.dataset['gap']).toBe('md');
    expect(root.dataset['wrap']).toBeUndefined();
  });

  it('FR-1: exposes direction, gap, alignment and wrapping as data attributes the CSS maps to tokens', () => {
    const { container } = render(
      <Stack direction="horizontal" gap="section" align="center" justify="between" wrap>
        <p>a</p>
      </Stack>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset).toMatchObject({ variant: 'horizontal', gap: 'section', align: 'center', justify: 'between', wrap: 'true' });
  });

  it('FR-1: adds no semantics of its own', () => {
    render(<Stack><button type="button">Go</button></Stack>);
    expect(screen.getByRole('button').parentElement?.getAttribute('role')).toBeNull();
  });
});
