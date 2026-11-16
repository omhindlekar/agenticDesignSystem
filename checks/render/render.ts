/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/**
 * Renders a generated screen in Chromium for the accessibility and visual checks.
 *
 * esbuild bundles the screen with the design-system components, tokens and fonts into a
 * static page (no server, no network); Playwright loads it at a fixed viewport, light
 * theme, comfortable density, reduced motion, with fonts loaded, so the same screen
 * always renders the same pixels (NFR-5).
 */
import { existsSync } from 'node:fs';
import { guardedFs } from '../../packages/permissions/src/index.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';

export const VIEWPORT = { width: 1280, height: 800 };

export interface RenderedScreen {
  page: Page;
  /** PNG of the full page. */
  screenshot: () => Promise<Buffer>;
  close: () => Promise<void>;
}

let browser: Browser | undefined;
async function sharedBrowser(): Promise<Browser> {
  browser ??= await chromium.launch();
  return browser;
}

/** Closes the shared browser (call once at the end of a batch). */
export async function closeRenderer(): Promise<void> {
  await browser?.close();
  browser = undefined;
}

/** Finds the component a generated module renders: its default export, or `Screen`. */
const ENTRY = `
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import '__REPO__/styles/tokens.css';
import '__REPO__/components/shared/fonts.css';
import * as mod from './screen';
const Screen = (mod as Record<string, unknown>).default ?? (mod as Record<string, unknown>).Screen;
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-density', 'comfortable');
const root = document.getElementById('root')!;
if (typeof Screen !== 'function') { root.setAttribute('data-render-error', 'The screen module has no default export or Screen export.'); }
else { createRoot(root).render(createElement(Screen as () => null)); }
`;

export async function renderScreen(tsx: string, repoRoot: string): Promise<RenderedScreen> {
  const fs = guardedFs('qa', repoRoot);
  const dir = fs.mkdtemp(join(tmpdir(), 'ads-render-'));
  fs.writeFile(join(dir, 'screen.tsx'), tsx);
  fs.writeFile(join(dir, 'entry.tsx'), ENTRY.replaceAll('__REPO__', repoRoot));
  await build({
    entryPoints: [join(dir, 'entry.tsx')],
    bundle: true,
    outdir: join(dir, 'out'),
    format: 'iife',
    jsx: 'automatic',
    platform: 'browser',
    logLevel: 'silent',
    alias: { '@ads/components': join(repoRoot, 'components', 'index.ts') },
    nodePaths: [join(repoRoot, 'node_modules')],
    loader: { '.woff2': 'file', '.woff': 'file', '.svg': 'file', '.png': 'file', '.json': 'json' },
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const css = existsSync(join(dir, 'out', 'entry.css')) ? '<link rel="stylesheet" href="out/entry.css">' : '';
  fs.writeFile(
    join(dir, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Generated screen</title>${css}` +
      `<style>body{margin:0;padding:24px;background:var(--color-background-page)}</style></head>` +
      `<body><main id="root"></main><script src="out/entry.js"></script></body></html>`,
  );
  const b = await sharedBrowser();
  const context = await b.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(join(dir, 'index.html')).href);
  await page
    .waitForFunction(
      () =>
        document.getElementById('root')!.childElementCount > 0 ||
        document.getElementById('root')!.hasAttribute('data-render-error'),
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  const renderError = await page.evaluate(() => document.getElementById('root')!.getAttribute('data-render-error'));
  if (renderError || errors.length) {
    await context.close();
    fs.rm(dir);
    throw new Error(`The screen did not render: ${renderError ?? errors[0]}`);
  }
  return {
    page,
    screenshot: () => page.screenshot({ fullPage: true }),
    close: async () => {
      await context.close();
      fs.rm(dir);
    },
  };
}
