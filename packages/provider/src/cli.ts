import { spawnSync } from 'node:child_process';
import type { ModelProvider, CompleteOptions, CompleteResult } from './types.js';

export class ClaudeCliProvider implements ModelProvider {
  async complete(prompt: string, _opts: CompleteOptions): Promise<CompleteResult> {
    // The model flag is not passed to `claude -p` because the CLI uses the
    // account's configured model. The opts.model field is accepted for interface
    // compatibility but ignored here — the subscription determines the model.
    const result = spawnSync('claude', ['-p', prompt], {
      encoding: 'utf8',
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (result.error) {
      throw new Error(`ClaudeCliProvider: failed to spawn claude: ${result.error.message}`);
    }
    if (result.status !== 0) {
      const stderr = result.stderr?.trim() ?? '';
      throw new Error(
        `ClaudeCliProvider: claude exited with status ${result.status ?? 'null'}. ` +
          (stderr ? `stderr: ${stderr}` : 'No stderr output.'),
      );
    }

    const text = (result.stdout ?? '').trim();
    if (!text) {
      throw new Error('ClaudeCliProvider: claude returned empty output');
    }

    // CLI provider uses a subscription — cost is not metered per call.
    return { text, costUsd: 0 };
  }
}
