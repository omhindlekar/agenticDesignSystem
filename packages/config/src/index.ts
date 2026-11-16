/**
 * Switches read from config/defaults.json that more than one part of the system needs.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Rule scopes that belong to the page layer (phase 2c): composition, copy and strategy. */
export const PAGE_LAYER_SCOPES = new Set(['composition', 'copy', 'strategy']);

/**
 * Whether the page layer is on: config qa.pageLayer, or ADS_PAGE_LAYER=1 to try it early.
 * While off, the Context agent leaves page-layer rules out of context packs and QA does not
 * enforce them, so screens recorded before the page layer still replay. It turns on when the
 * Composer composes from templates (phase 2c PR 5).
 */
export function pageLayerEnforced(repoRoot: string): boolean {
  if (process.env['ADS_PAGE_LAYER'] === '1') return true;
  const cfg = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as { qa?: { pageLayer?: boolean } };
  return cfg.qa?.pageLayer === true;
}
