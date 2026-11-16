import { describe, it, expect } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SpawnSyncReturns } from 'node:child_process';
import { parseStreamJson, ClaudeCliProvider } from '../src/cli.js';
import { CachingProvider } from '../src/cache.js';
import { FakeProvider, hashKey, cacheKey } from '../src/fake.js';
import type { ModelProvider, CompleteResult } from '../src/types.js';

/** A synthetic stream-json transcript in the shape the claude CLI emits (no real page text). */
const line = (o: unknown) => JSON.stringify(o);
const STREAM = [
  line({ type: 'system', subtype: 'init', tools: ['WebSearch', 'WebFetch'] }),
  line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 't1', name: 'WebSearch', input: { query: 'specific arrival time payments' } }] } }),
  line({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: 'Web search results for query: ...' }] } }),
  line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 't2', name: 'WebFetch', input: { url: 'https://example.org/blocked', prompt: 'p' } }] } }),
  line({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't2', content: 'The server returned HTTP 403 Forbidden.' }] } }),
  line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 't3', name: 'WebFetch', input: { url: 'https://example.org/guide', prompt: 'p' } }] } }),
  line({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't3', content: [{ type: 'text', text: 'Tell people the date their money arrives.' }] }] } }),
  line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 't4', name: 'WebFetch', input: { url: 'https://example.org/broken', prompt: 'p' } }] } }),
  line({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't4', is_error: true, content: 'Request failed' }] } }),
  line({ type: 'result', subtype: 'success', result: '{"rule":"Give an exact arrival time."}', usage: { input_tokens: 10, cache_read_input_tokens: 1000, cache_creation_input_tokens: 200, output_tokens: 50 }, total_cost_usd: 0.76 }),
].join('\n');

const spawner = (stdout: string, status = 0) =>
  ((_cmd: string, args: string[]) => {
    spawnedArgs.push(args);
    return { status, stdout, stderr: '', pid: 1, output: [], signal: null } as unknown as SpawnSyncReturns<string>;
  }) as never;
let spawnedArgs: string[][] = [];

describe('FR-24: web research through the provider', () => {
  it('FR-24: parses the final answer, every search and fetch, and whether each fetch succeeded', () => {
    const r = parseStreamJson(STREAM);
    expect(r.text).toBe('{"rule":"Give an exact arrival time."}');
    expect(r.toolLog.map((e) => [e.tool, e.input, e.ok, e.status])).toEqual([
      ['WebSearch', 'specific arrival time payments', true, undefined],
      ['WebFetch', 'https://example.org/blocked', false, 403],
      ['WebFetch', 'https://example.org/guide', true, undefined],
      ['WebFetch', 'https://example.org/broken', false, undefined],
    ]);
    expect(r.usage).toEqual({ inputTokens: 1210, outputTokens: 50, apiEquivalentUsd: 0.76 });
  });

  it('FR-24: fetched page text is returned in memory only, keyed by URL, and only for successful fetches', () => {
    const r = parseStreamJson(STREAM);
    expect(Object.keys(r.fetched)).toEqual(['https://example.org/guide']);
    expect(r.fetched['https://example.org/guide']).toContain('date their money arrives');
  });

  it('FR-24: the CLI is run with only the requested web tools allowed, as stream-json', async () => {
    spawnedArgs = [];
    const p = new ClaudeCliProvider(spawner(STREAM));
    const r = await p.complete('research', { model: 'claude-sonnet-5-5', maxTokens: 4096, tools: ['WebSearch', 'WebFetch'], timeoutMs: 600_000 });
    const args = spawnedArgs[0]!;
    expect(args[args.indexOf('--tools') + 1]).toBe('WebSearch,WebFetch');
    expect(args[args.indexOf('--allowedTools') + 1]).toBe('WebSearch,WebFetch');
    expect(args[args.indexOf('--output-format') + 1]).toBe('stream-json');
    expect(args).toContain('--verbose');
    expect(r.toolLog).toHaveLength(4);
    expect(r.costUsd).toBe(0); // subscription: no money spent; the API-equivalent is in usage
  });

  it('NFR-7: no connectors or MCP servers are loaded, for research or plain calls (least privilege)', async () => {
    spawnedArgs = [];
    await new ClaudeCliProvider(spawner(STREAM)).complete('research', { model: 'm', maxTokens: 1, tools: ['WebSearch', 'WebFetch'] });
    await new ClaudeCliProvider(spawner('plain answer')).complete('plain', { model: 'm', maxTokens: 1 });
    for (const args of spawnedArgs) {
      expect(args).toContain('--strict-mcp-config');
      expect(args).not.toContain('--mcp-config');
    }
  });

  it('FR-24: only WebSearch and WebFetch can be requested', async () => {
    const p = new ClaudeCliProvider(spawner(STREAM));
    await expect(p.complete('x', { model: 'm', maxTokens: 1, tools: ['Bash' as never] })).rejects.toThrow(/WebSearch, WebFetch/);
  });

  it('NFR-5: plain calls keep their cache key; calls with tools get a different one', () => {
    expect(cacheKey('m', 1, 'p')).toBe(hashKey('m', 1, 'p'));
    expect(cacheKey('m', 1, 'p', ['WebSearch', 'WebFetch'])).not.toBe(hashKey('m', 1, 'p'));
    expect(cacheKey('m', 1, 'p', ['WebFetch', 'WebSearch'])).toBe(cacheKey('m', 1, 'p', ['WebSearch', 'WebFetch']));
  });

  it('FR-24, NFR-5: the cache keeps the tool log and usage for replay, but never fetched page text', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ads-cache-'));
    const inner: ModelProvider = { complete: async () => ({ ...parseStreamJson(STREAM), costUsd: 0 }) as CompleteResult };
    const cached = new CachingProvider(inner, dir);
    const opts = { model: 'm', maxTokens: 1, tools: ['WebSearch', 'WebFetch'] as const };
    const first = await cached.complete('p', { ...opts, tools: [...opts.tools] });
    expect(first.fetched).toBeDefined();
    const file = readFileSync(join(dir, readdirSync(dir)[0]!), 'utf8');
    expect(file).not.toContain('date their money arrives');
    expect(JSON.parse(file).toolLog).toHaveLength(4);
    const again = await cached.complete('p', { ...opts, tools: [...opts.tools] });
    expect(again.toolLog).toEqual(first.toolLog);
    expect(again.fetched).toBeUndefined();
    const replay = await new FakeProvider(dir).complete('p', { ...opts, tools: [...opts.tools] });
    expect(replay.toolLog).toEqual(first.toolLog);
  });
});
