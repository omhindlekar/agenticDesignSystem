/**
 * npm run a11y [-- <storybook-static dir>]
 *
 * Runs axe (WCAG 2.0–2.2 A and AA, colour contrast included) on every story of the
 * static Storybook build in the light, dark and high-contrast themes, in Chromium.
 * Overlay stories (tooltip, popover, menu, toast) are checked again with the overlay
 * open. Complements checks/a11y/tests/axe.test.tsx, which runs in jsdom without layout.
 *
 * Build first: npm run build-storybook. Exit code 0 when there are no violations.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AXE_EXCEPTIONS } from '../checks/a11y/axe-exceptions.js';

const THEMES = ['light', 'dark', 'high-contrast'] as const;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const CONCURRENCY = 4;
const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
};

const root = resolve(process.argv[2] ?? 'storybook-static');
if (!existsSync(join(root, 'index.json'))) {
  console.error(`No Storybook build at ${root}. Run npm run build-storybook first.`);
  process.exit(2);
}
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = join(root, path);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

interface Entry {
  id: string;
  type: string;
}
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8')) as { entries: Record<string, Entry> };
const ids = Object.values(index.entries)
  .filter((e) => e.type === 'story')
  .map((e) => e.id);

const OVERLAY = /^components-(tooltip|popover|menu|toastregion)--/;

async function runAxe(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(
    async ({ tags, exceptions }) => {
      type Result = { violations: Array<{ id: string; nodes: Array<{ target: string[] }> }> };
      const axe = (window as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<Result> } }).axe;
      const result = await axe.run(document, { runOnly: { type: 'tag', values: tags } });
      return result.violations.flatMap((v) => {
        const nodes = v.nodes.filter((n) => {
          const el = document.querySelector(n.target.join(' '));
          return !(el && exceptions.some((e) => e.rule === v.id && el.matches(e.selector)));
        });
        return nodes.length
          ? [
              `${v.id} — ${nodes
                .map((n) => n.target.join(' '))
                .slice(0, 3)
                .join(', ')}`,
            ]
          : [];
      });
    },
    { tags: WCAG_TAGS, exceptions: AXE_EXCEPTIONS.map(({ rule, selector }) => ({ rule, selector })) },
  );
}

async function check(page: Page, id: string, theme: string): Promise<string[]> {
  const out: string[] = [];
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
  await page.waitForSelector('#storybook-root > *', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  for (const v of await runAxe(page)) out.push(`${theme} ${id}: ${v}`);
  const overlay = OVERLAY.exec(id)?.[1];
  if (overlay) {
    if (overlay === 'tooltip') await page.keyboard.press('Tab');
    else await page.click('#storybook-root button', { timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(400);
    for (const v of await runAxe(page)) out.push(`${theme} ${id} (open): ${v}`);
  }
  return out;
}

const browser = await chromium.launch();
const jobs = THEMES.flatMap((theme) => ids.map((id) => ({ id, theme })));
const violations: string[] = [];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    // Reduced motion, so contrast is measured on the settled frame, not mid-transition.
    const page = await browser.newPage({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
    for (let job = jobs.shift(); job; job = jobs.shift()) violations.push(...(await check(page, job.id, job.theme)));
    await page.close();
  }),
);
await browser.close();
server.close();

console.log(`axe: ${ids.length} stories × ${THEMES.length} themes, ${violations.length} violation(s)`);
for (const v of violations.sort()) console.log(` - ${v}`);
process.exit(violations.length ? 1 : 0);
