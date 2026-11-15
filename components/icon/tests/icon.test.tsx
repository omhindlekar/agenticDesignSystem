// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Icon } from '../icon';
import { ICON_NAMES, ICON_PATHS } from '../icons.generated';

afterEach(cleanup);
const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('Icon', () => {
  it('NFR-9: without a label it is decorative: aria-hidden and not focusable', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.getAttribute('role')).toBeNull();
    expect(svg?.getAttribute('data-variant')).toBe('decorative');
  });

  it('NFR-9: with a label it is an image with that accessible name', () => {
    render(<Icon name="warning" label="Warning" />);
    const img = screen.getByRole('img', { name: 'Warning' });
    expect(img.getAttribute('aria-hidden')).toBeNull();
    expect(img.getAttribute('data-variant')).toBe('labelled');
  });

  it('FR-1: draws the generated path in currentColor at the token size', () => {
    const { container } = render(<Icon name="close" size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 -960 960 960');
    expect(svg?.getAttribute('data-size')).toBe('lg');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe(ICON_PATHS.close);
    expect(svg?.getAttribute('fill')).toBe('currentColor');
  });

  it('FR-1: defaults to the medium (20px) size', () => {
    const { container } = render(<Icon name="add" />);
    expect(container.querySelector('svg')?.getAttribute('data-size')).toBe('md');
  });

  it('FR-3: metadata lists exactly the generated icon names, so agents see every allowed name', () => {
    const meta = JSON.parse(readFileSync(join(root, 'components/icon/icon.meta.json'), 'utf8')) as {
      props: Array<{ name: string; description: string }>;
    };
    const desc = meta.props.find((p) => p.name === 'name')?.description ?? '';
    const listed = /One of: (.*)\.$/.exec(desc)?.[1]?.split(', ') ?? [];
    expect(listed).toEqual([...ICON_NAMES]);
  });
});
