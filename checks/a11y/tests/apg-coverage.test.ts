import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APG_CONTRACT, isInteractive } from '../apg.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const componentIds = readdirSync(join(root, 'components')).filter((id) =>
  existsSync(join(root, 'components', id, `${id}.meta.json`)),
);

/** Keys claimed by test names of the form `APG <pattern>: <key>, <key> — …`. */
export function keysTested(testSource: string, pattern: string): Set<string> {
  const keys = new Set<string>();
  const names = [...testSource.matchAll(/\bit\(\s*(['"`])((?:(?!\1).)*)\1/g)].map((m) => m[2] ?? '');
  const prefix = `APG ${pattern}: `;
  for (const name of names) {
    const at = name.indexOf(prefix);
    if (at === -1) continue;
    const list = name.slice(at + prefix.length).split(' — ')[0] ?? '';
    for (const key of list.split(',')) keys.add(key.trim());
  }
  return keys;
}

function testSource(id: string): string {
  const dir = join(root, 'components', id, 'tests');
  if (!existsSync(dir)) return '';
  return readdirSync(dir)
    .filter((f) => /\.test\.tsx?$/.test(f))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
}

describe('NFR-9 keyboard per WAI-ARIA Authoring Practices', () => {
  it('NFR-9: every component has a keyboard contract (a pattern with keys, or a stated exemption)', () => {
    expect(componentIds.filter((id) => !(id in APG_CONTRACT))).toEqual([]);
    expect(Object.keys(APG_CONTRACT).filter((id) => !componentIds.includes(id))).toEqual([]);
  });

  it.each(componentIds)('NFR-9: %s tests every key its APG pattern requires', (id) => {
    const entry = APG_CONTRACT[id];
    if (!entry || !isInteractive(entry)) return;
    const tested = keysTested(testSource(id), entry.pattern);
    const missing = entry.keys.map((k) => k.key).filter((k) => !tested.has(k));
    expect(missing, `name tests "APG ${entry.pattern}: <key>" in components/${id}/tests`).toEqual([]);
  });

  it('NFR-9: test names are parsed into keys', () => {
    const src = "it('NFR-9: APG tabs: Arrow Right, Home — moves focus', () => {})";
    expect([...keysTested(src, 'tabs')]).toEqual(['Arrow Right', 'Home']);
  });
});
