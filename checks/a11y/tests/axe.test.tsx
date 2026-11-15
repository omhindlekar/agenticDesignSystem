// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { composeStories, setProjectAnnotations } from '@storybook/react';
import type { Meta } from '@storybook/react';
import type { ComponentType } from 'react';
import axe from 'axe-core';
import preview from '../../../.storybook/preview';
import { isExcepted } from '../axe-exceptions';

setProjectAnnotations(preview);
// jsdom has no canvas; axe probes it for icon glyphs and only needs it to be absent.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
afterEach(cleanup);

/**
 * Every story of every component, checked with axe against WCAG 2.0–2.2 A and AA.
 * jsdom has no layout, so colour contrast is checked elsewhere: the token contrast
 * check per theme and the Playwright pass (`npm run a11y`).
 */
const modules = import.meta.glob<{ default: Meta }>('../../../components/*/*.stories.tsx', { eager: true });

const RUN_ONLY = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function violations(): Promise<string[]> {
  const result = await axe.run(document.body, {
    runOnly: { type: 'tag', values: RUN_ONLY },
    rules: { 'color-contrast': { enabled: false } },
  });
  return result.violations.flatMap((v) => {
    const nodes = v.nodes.filter((n) => {
      const el = document.querySelector(n.target.join(' '));
      return !(el && isExcepted(v.id, el));
    });
    return nodes.length
      ? [
          `${v.id}: ${v.help} — ${nodes
            .map((n) => n.target.join(' '))
            .slice(0, 3)
            .join(', ')}`,
        ]
      : [];
  });
}

for (const [path, mod] of Object.entries(modules)) {
  const component = path.split('/').at(-2)!;
  const stories = composeStories(mod as Parameters<typeof composeStories>[0]) as unknown as Record<
    string,
    ComponentType
  >;
  describe(`NFR-9 axe: ${component}`, () => {
    for (const [name, Story] of Object.entries(stories)) {
      it(`NFR-9: ${component} / ${name} has no axe violations`, async () => {
        await act(async () => {
          render(<Story />);
        });
        expect(await violations()).toEqual([]);
      });
    }
  });
}
