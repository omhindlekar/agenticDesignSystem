/**
 * Least-privilege writes for agents (NFR-7, PRD governance). Every file an agent or QA check
 * writes goes through guardedFs(agent): a path must match one of the agent's `write` globs in
 * config/permissions.json and none of its `never` globs. Scratch files under the OS temp
 * directory are allowed for every agent. Anything else throws PermissionError.
 */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve, isAbsolute, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PermissionsSchema } from '../../schemas/src/permissions.js';
import type { Permissions } from '../../schemas/src/permissions.js';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export class PermissionError extends Error {
  constructor(agent: string, path: string, why: string) {
    super(`${agent} may not write ${path}: ${why}`);
    this.name = 'PermissionError';
  }
}

const cache = new Map<string, Permissions>();
export function loadPermissions(repoRoot = REPO_ROOT): Permissions {
  if (!cache.has(repoRoot))
    cache.set(
      repoRoot,
      PermissionsSchema.parse(JSON.parse(readFileSync(join(repoRoot, 'config', 'permissions.json'), 'utf8'))),
    );
  return cache.get(repoRoot)!;
}

/** Glob to RegExp: ** any depth, * one path segment. */
export function globToRegExp(glob: string): RegExp {
  const re = glob
    .split('/')
    .map((seg) => (seg === '**' ? '(?:.*)' : seg.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')))
    .join('/')
    .replace(/\/\(\?:\.\*\)$/, '(?:/.*)?')
    .replace(/^\(\?:\.\*\)\//, '(?:.*/)?');
  return new RegExp(`^${re}$`);
}

const isTemp = (abs: string) => {
  const t = resolve(tmpdir());
  return (
    abs === t ||
    abs.startsWith(t + sep) ||
    abs.startsWith('/private' + t + sep) ||
    abs.startsWith(t.replace(/^\/private/, '') + sep)
  );
};

/** Throws unless `agent` may write `path` (absolute or repo-relative). */
export function assertCanWrite(
  agent: string,
  path: string,
  repoRoot = REPO_ROOT,
  permissions = loadPermissions(repoRoot),
): void {
  const abs = isAbsolute(path) ? resolve(path) : resolve(repoRoot, path);
  const perms = permissions.agents[agent];
  if (!perms) throw new PermissionError(agent, path, 'the agent has no entry in config/permissions.json');
  const rel = relative(resolve(repoRoot), abs).split(sep).join('/');
  const inRepo = rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
  if (!inRepo) {
    if (isTemp(abs)) return;
    throw new PermissionError(agent, path, 'it is outside the repository and the temp directory');
  }
  if (perms.never.some((g) => globToRegExp(g).test(rel)))
    throw new PermissionError(agent, rel, 'it matches a never-write path');
  if (!perms.write.some((g) => globToRegExp(g).test(rel)))
    throw new PermissionError(agent, rel, "it is not in the agent's write paths");
}

export interface GuardedFs {
  writeFile: (path: string, data: string | Uint8Array) => void;
  appendFile: (path: string, data: string) => void;
  mkdir: (path: string) => void;
  mkdtemp: (prefix: string) => string;
  rm: (path: string) => void;
}

export function guardedFs(agent: string, repoRoot = REPO_ROOT): GuardedFs {
  const check = (p: string) => assertCanWrite(agent, p, repoRoot);
  return {
    writeFile: (p, data) => (check(p), writeFileSync(p, data)),
    appendFile: (p, data) => (check(p), appendFileSync(p, data, 'utf8')),
    mkdir: (p) => (check(join(p, '.probe')), mkdirSync(p, { recursive: true })),
    mkdtemp: (prefix) => (check(`${prefix}x/.probe`), mkdtempSync(prefix)),
    rm: (p) => (check(join(p, '.probe')), rmSync(p, { recursive: true, force: true })),
  };
}
