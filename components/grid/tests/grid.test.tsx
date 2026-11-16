// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Grid } from '../grid';

afterEach(cleanup);
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../grid.css'), 'utf8');

describe('Grid', () => {
  it('FR-1: sets the column cap and minimum item width as data attributes', () => {
    const { container } = render(<Grid columns={4} minItemWidth="sm"><p>a</p></Grid>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset).toMatchObject({ columns: '4', min: 'sm' });
    expect(root.getAttribute('style')).toBeNull();
  });

  it.each([1, 2, 3, 4, 6, 12])('FR-1: has a column rule for %i columns at both minimum widths', (n) => {
    for (const min of ['sm', 'md']) {
      expect(css).toContain(`.ads-grid[data-min="${min}"][data-columns="${n}"]`);
    }
  });

  it('FR-1: columns collapse by minimum width, not by fixed breakpoints', () => {
    expect(css).not.toMatch(/@media[^{]*width/);
    expect(css).toMatch(/minmax\(min\(100%, max\(var\(--size-grid-item-md\)/);
  });
});
