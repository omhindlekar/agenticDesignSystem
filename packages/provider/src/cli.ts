import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SpawnSyncReturns } from 'node:child_process';
import { WEB_TOOLS } from './types.js';
import type { ModelProvider, CompleteOptions, CompleteResult, ToolEvent, WebTool } from './types.js';

/** A fetch that reports an HTTP error or failure in its text, rather than as is_error. */
const FETCH_FAILED = /^(?:The server returned HTTP (\d{3})|Failed to fetch|Unable to fetch|Error fetching|Request failed)/i;

const textOf = (content: unknown): string =>
  typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((c) => (c && typeof c === 'object' && 'text' in c ? String((c as { text: unknown }).text) : '')).join('\n')
      : '';

/**
 * Parses the claude CLI's stream-json transcript (one JSON event per line): the final answer,
 * every WebSearch and WebFetch with whether the fetch succeeded, token usage, and the text of
 * pages actually read (in memory only, for the copy guard; FR-24).
 */
export function parseStreamJson(stdout: string): Required<Pick<CompleteResult, 'text' | 'toolLog' | 'fetched'>> & Pick<CompleteResult, 'usage'> {
  const calls = new Map<string, { tool: WebTool; input: string }>();
  const toolLog: ToolEvent[] = [];
  const fetched: Record<string, string> = {};
  let text = '';
  let usage: CompleteResult['usage'];
  for (const raw of stdout.split('\n')) {
    if (!raw.trim()) continue;
    let e: Record<string, unknown>;
    try {
      e = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }
    const content = ((e['message'] as { content?: unknown } | undefined)?.content ?? []) as Array<Record<string, unknown>>;
    if (e['type'] === 'assistant' && Array.isArray(content))
      for (const c of content)
        if (c['type'] === 'tool_use' && (c['name'] === 'WebSearch' || c['name'] === 'WebFetch')) {
          const input = c['input'] as { query?: string; url?: string };
          calls.set(String(c['id']), { tool: c['name'] as WebTool, input: String(input.query ?? input.url ?? '') });
        }
    if (e['type'] === 'user' && Array.isArray(content))
      for (const c of content) {
        if (c['type'] !== 'tool_result') continue;
        const call = calls.get(String(c['tool_use_id']));
        if (!call) continue;
        const body = textOf(c['content']);
        const failed = c['is_error'] === true || FETCH_FAILED.exec(body.trim());
        const status = failed && typeof failed !== 'boolean' && failed[1] ? Number(failed[1]) : undefined;
        const ok = call.tool === 'WebSearch' ? c['is_error'] !== true : !failed;
        toolLog.push({ tool: call.tool, input: call.input, ok, ...(status !== undefined ? { status } : {}) });
        if (call.tool === 'WebFetch' && ok) fetched[call.input] = body;
      }
    if (e['type'] === 'result') {
      text = String(e['result'] ?? '').trim();
      const u = e['usage'] as Record<string, number> | undefined;
      if (u)
        usage = {
          inputTokens: (u['input_tokens'] ?? 0) + (u['cache_read_input_tokens'] ?? 0) + (u['cache_creation_input_tokens'] ?? 0),
          outputTokens: u['output_tokens'] ?? 0,
          ...(typeof e['total_cost_usd'] === 'number' ? { apiEquivalentUsd: e['total_cost_usd'] } : {}),
        };
    }
  }
  return { text, toolLog, fetched, ...(usage ? { usage } : {}) };
}

// Rate-limit signals come from the CLI layer (stderr / non-zero exit), never from model output.
const RATE_LIMIT_PATTERNS = /rate.?limit|429|too many requests|overloaded/i;

type Spawner = (cmd: string, args: string[], opts: Parameters<typeof spawnSync>[2]) => SpawnSyncReturns<string>;

export class ClaudeCliProvider implements ModelProvider {
  private readonly spawner: Spawner;

  constructor(spawner?: Spawner) {
    this.spawner = spawner ?? (spawnSync as Spawner);
  }

  async complete(prompt: string, opts: CompleteOptions): Promise<CompleteResult> {
    const tools = opts.tools ?? [];
    for (const t of tools)
      if (!WEB_TOOLS.includes(t)) throw new Error(`ClaudeCliProvider: only ${WEB_TOOLS.join(', ')} can be granted, not "${t}"`);
    // Temp empty dir as cwd: no CLAUDE.md present, so auto-discovery finds nothing.
    // Note: --bare is intentionally omitted — it forces ANTHROPIC_API_KEY auth and
    // breaks subscription (Claude Max / Pro) logins.
    const tmpDir = mkdtempSync(join(tmpdir(), 'claude-cli-'));
    try {
      const result = this.spawner(
        'claude',
        tools.length
          ? [
              '-p',
              '--strict-mcp-config', // no claude.ai connectors or MCP servers (NFR-7)
              '--tools',
              tools.join(','), // only the web tools asked for: no file, shell or edit tools
              '--allowedTools',
              tools.join(','),
              '--output-format',
              'stream-json',
              '--verbose', // required by the CLI for stream-json in print mode
              '--model',
              opts.model,
            ]
          : [
              '-p',
              '--strict-mcp-config', // no claude.ai connectors or MCP servers (NFR-7)
              '--tools',
              '', // disable all built-in tools
              '--output-format',
              'text',
              '--model',
              opts.model,
            ],
        {
          input: prompt, // prompt via stdin, not as a CLI argument
          encoding: 'utf8',
          cwd: tmpDir, // empty dir — no CLAUDE.md to load
          timeout: opts.timeoutMs ?? 120_000,
          maxBuffer: 64 * 1024 * 1024,
        },
      );

      if (result.error) {
        throw new Error(`ClaudeCliProvider: failed to spawn claude: ${result.error.message}`);
      }

      const stderr = result.stderr?.trim() ?? '';

      // Rate-limit signals live in stderr or non-zero exit only — never inspect stdout
      // for rate-limit strings, since the model itself may legitimately output them.
      if (result.status !== 0 && RATE_LIMIT_PATTERNS.test(stderr)) {
        throw new Error(`ClaudeCliProvider: rate limit detected. stderr: ${stderr}`);
      }

      if (result.status !== 0) {
        throw new Error(
          `ClaudeCliProvider: claude exited with status ${result.status ?? 'null'}. ` +
            (stderr ? `stderr: ${stderr}` : 'No stderr output.') +
            // On a failed exit, stdout is the CLI's own message (for example a usage limit), not model output.
            ((result.stdout ?? '').trim() ? ` stdout: ${(result.stdout ?? '').trim().slice(0, 300)}` : ''),
        );
      }

      const stdout = (result.stdout ?? '').trim();
      if (tools.length) {
        const parsed = parseStreamJson(stdout);
        if (!parsed.text) throw new Error('ClaudeCliProvider: the research call returned no final answer');
        return { ...parsed, costUsd: 0 };
      }
      if (!stdout) {
        throw new Error('ClaudeCliProvider: claude returned empty output');
      }

      return { text: stdout, costUsd: 0 };
    } finally {
      try {
        rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        /* ignore cleanup errors */
      }
    }
  }
}
