import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
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
    await mkdir(runDir, { recursive: true });
    const line = JSON.stringify(entry) + '\n';
    await appendFile(join(runDir, 'log.jsonl'), line, 'utf8');
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
