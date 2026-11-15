import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { guardedFs } from '../../permissions/src/index.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { RunLogEntrySchema } from '@ads/schemas';
import type { RunLogEntry } from '@ads/schemas';

export class RunLogWriter {
  constructor(private readonly runsDir: string) {}

  static hashContent(content: string): string {
    const hash = createHash('sha256').update(content).digest('hex');
    return `sha256:${hash}`;
  }

  async write(entry: RunLogEntry): Promise<void> {
    RunLogEntrySchema.parse(entry);
    const runDir = join(this.runsDir, entry.runId);
    // Run logs belong to the orchestrator (config/permissions.json).
    const fs = guardedFs('orchestrator');
    fs.mkdir(runDir);
    fs.appendFile(join(runDir, 'log.jsonl'), JSON.stringify(entry) + '\n');
  }

  async read(runId: string): Promise<RunLogEntry[]> {
    const logPath = join(this.runsDir, runId, 'log.jsonl');
    if (!existsSync(logPath)) return [];
    const raw = await readFile(logPath, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => RunLogEntrySchema.parse(JSON.parse(line)));
  }
}

export type { RunLogEntry };
