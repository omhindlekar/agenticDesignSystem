/**
 * FR-3: Storybook shows each pseudo-state only in the story that asks for it.
 *
 * storybook-addon-pseudo-states copies a story's `parameters.pseudo` into the user
 * globals, which persist across navigation. Unless every story carries an explicit
 * pseudo config, the last Focus story's `focusVisible: true` leaks into every story
 * opened after it. The preview default (all false) makes each story reset the globals.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import preview from '../../../.storybook/preview.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const ADDON_STATES = ['hover', 'active', 'focusVisible', 'focusWithin', 'focus', 'visited', 'link', 'target'];

describe('FR-3 Storybook pseudo-states', () => {
  it('FR-3: preview defaults every addon pseudo-state to false', () => {
    const pseudo = (preview.parameters as { pseudo?: Record<string, unknown> }).pseudo ?? {};
    for (const state of ADDON_STATES) expect(pseudo[state], state).toBe(false);
  });

  it('FR-3: a story forces only the pseudo-state named by its ads.state tag', () => {
    const map: Record<string, string> = { hover: 'hover', active: 'active', focus: 'focusVisible' };
    const dirs = readdirSync(join(root, 'components'), { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const d of dirs) {
      const file = join(root, 'components', d.name, `${d.name}.stories.tsx`);
      if (!existsSync(file)) continue;
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const forced = [...line.matchAll(/(\w+): true/g)].map((m) => m[1]).filter((k) => ADDON_STATES.includes(k ?? ''));
        if (forced.length === 0) continue;
        const state = /ads: \{[^}]*state: '([\w-]+)'/.exec(line)?.[1] ?? '';
        expect(forced, `${d.name}: ${line.trim()}`).toEqual([map[state]]);
      }
    }
  });
});
