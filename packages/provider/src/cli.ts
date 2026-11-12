import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SpawnSyncReturns } from 'node:child_process';
import type { ModelProvider, CompleteOptions, CompleteResult } from './types.js';

const RATE_LIMIT_PATTERNS = /rate.?limit|429|too many requests|overloaded/i;

type Spawner = (
  cmd: string,
  args: string[],
  opts: Parameters<typeof spawnSync>[2],
) => SpawnSyncReturns<string>;

export class ClaudeCliProvider implements ModelProvider {
  private readonly spawner: Spawner;

  constructor(spawner?: Spawner) {
    this.spawner = spawner ?? (spawnSync as Spawner);
  }

  async complete(prompt: string, opts: CompleteOptions): Promise<CompleteResult> {
    // Temp empty dir as cwd so CLAUDE.md auto-discovery finds nothing.
    const tmpDir = mkdtempSync(join(tmpdir(), 'claude-cli-'));
    try {
      const result = this.spawner(
        'claude',
        [
          '-p',
          '--bare',          // skip hooks, CLAUDE.md auto-discovery, LSP, plugins, auto-memory
          '--tools', '',     // disable all built-in tools
          '--output-format', 'text',
          '--model', opts.model,
        ],
        {
          input: prompt,     // prompt via stdin, not as a CLI argument
          encoding: 'utf8',
          cwd: tmpDir,
          timeout: 120_000,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      if (result.error) {
        throw new Error(`ClaudeCliProvider: failed to spawn claude: ${result.error.message}`);
      }

      const stderr = result.stderr?.trim() ?? '';
      const stdout = (result.stdout ?? '').trim();

      if (RATE_LIMIT_PATTERNS.test(stdout) || RATE_LIMIT_PATTERNS.test(stderr)) {
        throw new Error(`ClaudeCliProvider: rate limit detected. stdout: ${stdout} stderr: ${stderr}`);
      }

      if (result.status !== 0) {
        throw new Error(
          `ClaudeCliProvider: claude exited with status ${result.status ?? 'null'}. ` +
            (stderr ? `stderr: ${stderr}` : 'No stderr output.'),
        );
      }

      if (!stdout) {
        throw new Error('ClaudeCliProvider: claude returned empty output');
      }

      return { text: stdout, costUsd: 0 };
    } finally {
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore cleanup errors */ }
    }
  }
}
