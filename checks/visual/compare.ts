/** Pixel comparison against an approved baseline (FR-10). */
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export interface VisualConfig {
  /** Per-pixel colour distance (0–1) that counts as a change. */
  pixelThreshold: number;
  /** Share of changed pixels (0–1) above which the run fails. */
  maxDiffRatio: number;
}

export interface Comparison {
  changedPixels: number;
  ratio: number;
  sizeChanged: boolean;
  diffPng?: Buffer;
}

export function comparePngs(actual: Buffer, baseline: Buffer, cfg: VisualConfig): Comparison {
  const a = PNG.sync.read(actual);
  const b = PNG.sync.read(baseline);
  if (a.width !== b.width || a.height !== b.height)
    return { changedPixels: a.width * a.height, ratio: 1, sizeChanged: true };
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: cfg.pixelThreshold });
  return {
    changedPixels: changed,
    ratio: changed / (a.width * a.height),
    sizeChanged: false,
    diffPng: PNG.sync.write(diff),
  };
}
