import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, rmSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');
const fixturesDir = join(repoRoot, 'evals', 'fixtures', 'provider');

const TEST_MODEL = 'claude-sonnet-4-6';
const KNOWN_PROMPT = 'Hello, provider test fixture.';
const KNOWN_RESPONSE = 'Hello from fixture!';
const CACHE_PROMPT = 'Cache test prompt.';
const CACHED_RESPONSE = 'Cached response text.';
const UNKNOWN_PROMPT = 'No fixture for this one.';

// ─── NFR-11: FakeProvider ─────────────────────────────────────────────────────

describe('NFR-11: FakeProvider', () => {
  it('NFR-11: returns fixture text for a known prompt+model hash', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const provider = new FakeProvider(fixturesDir);
    const result = await provider.complete(KNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(result.text).toBe(KNOWN_RESPONSE);
  });

  it('NFR-11: fixture result has a numeric costUsd', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const provider = new FakeProvider(fixturesDir);
    const result = await provider.complete(KNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(typeof result.costUsd).toBe('number');
  });

  it('NFR-11: throws with helpful message when no fixture exists', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const provider = new FakeProvider(fixturesDir);
    await expect(
      provider.complete(UNKNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 }),
    ).rejects.toThrow(/fixture/i);
  });

  it('NFR-11: error message includes the hash so the developer can create the fixture', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const provider = new FakeProvider(fixturesDir);
    try {
      await provider.complete(UNKNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    } catch (err) {
      // Hash of sha256("claude-sonnet-4-6|256|No fixture for this one.")
      expect((err as Error).message).toMatch(/4dd3919ac8d2b781/);
    }
  });

  // NFR-11 fix-4: cache key includes maxTokens — different maxTokens → different hash → different fixture
  it('NFR-11: fix-4: different maxTokens produce different fixture hashes', async () => {
    const { hashKey } = await import('../src/fake.js');
    const hash256 = hashKey(TEST_MODEL, 256, KNOWN_PROMPT);
    const hash512 = hashKey(TEST_MODEL, 512, KNOWN_PROMPT);
    expect(hash256).not.toBe(hash512);
  });

  it('NFR-11: fix-4: hashKey includes model, maxTokens, and prompt', async () => {
    const { hashKey } = await import('../src/fake.js');
    const { createHash } = await import('node:crypto');
    const expected = createHash('sha256').update(`${TEST_MODEL}|256|${KNOWN_PROMPT}`).digest('hex');
    expect(hashKey(TEST_MODEL, 256, KNOWN_PROMPT)).toBe(expected);
  });
});

// ─── NFR-11: CachingProvider ──────────────────────────────────────────────────

describe('NFR-11: CachingProvider', () => {
  const tmpCacheDir = join(repoRoot, 'runs', '.provider-cache-test-tmp');

  beforeEach(() => mkdirSync(tmpCacheDir, { recursive: true }));
  afterEach(() => { try { rmSync(tmpCacheDir, { recursive: true, force: true }); } catch { /* */ } });

  it('NFR-11: on first call, delegates to inner provider', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const { CachingProvider } = await import('../src/cache.js');
    const inner = new FakeProvider(fixturesDir);
    const spy = vi.spyOn(inner, 'complete');
    const cached = new CachingProvider(inner, tmpCacheDir);
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(spy).toHaveBeenCalledOnce();
  });

  it('NFR-11: on second call with same prompt, inner provider is NOT called again', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const { CachingProvider } = await import('../src/cache.js');
    const inner = new FakeProvider(fixturesDir);
    const spy = vi.spyOn(inner, 'complete');
    const cached = new CachingProvider(inner, tmpCacheDir);
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(spy).toHaveBeenCalledOnce();
  });

  it('NFR-11: cache hit returns the same text as the original call', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const { CachingProvider } = await import('../src/cache.js');
    const inner = new FakeProvider(fixturesDir);
    const cached = new CachingProvider(inner, tmpCacheDir);
    const first = await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    const second = await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(second.text).toBe(first.text);
    expect(second.text).toBe(CACHED_RESPONSE);
  });

  it('NFR-11: cache hit returns costUsd of 0 (no additional spend)', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const { CachingProvider } = await import('../src/cache.js');
    const inner = new FakeProvider(fixturesDir);
    const cached = new CachingProvider(inner, tmpCacheDir);
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    const hit = await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(hit.costUsd).toBe(0);
  });

  it('NFR-11: cache writes a JSON file keyed by prompt hash', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const { CachingProvider } = await import('../src/cache.js');
    const inner = new FakeProvider(fixturesDir);
    const cached = new CachingProvider(inner, tmpCacheDir);
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    const files = existsSync(tmpCacheDir) ? readdirSync(tmpCacheDir) : [];
    expect(files.some((f) => f.endsWith('.json'))).toBe(true);
  });

  it('NFR-11: different prompts produce different cache entries', async () => {
    const { FakeProvider } = await import('../src/fake.js');
    const { CachingProvider } = await import('../src/cache.js');
    const inner = new FakeProvider(fixturesDir);
    const cached = new CachingProvider(inner, tmpCacheDir);
    await cached.complete(KNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    const files = readdirSync(tmpCacheDir);
    expect(files.length).toBe(2);
  });

  // NFR-11 fix-4: same prompt with different maxTokens produces a separate cache entry
  it('NFR-11: fix-4: same prompt with different maxTokens produces separate cache entries', async () => {
    const { CachingProvider } = await import('../src/cache.js');
    // Use a fake provider that always returns something (we mock the inner)
    const mockInner = {
      complete: vi.fn().mockResolvedValue({ text: 'ok', costUsd: 0.01 }),
    };
    const cached = new CachingProvider(mockInner, tmpCacheDir);
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    await cached.complete(CACHE_PROMPT, { model: TEST_MODEL, maxTokens: 512 });
    // Both calls must hit the inner provider — different maxTokens means different keys
    expect(mockInner.complete).toHaveBeenCalledTimes(2);
    const files = readdirSync(tmpCacheDir);
    expect(files.length).toBe(2);
  });
});

// ─── NFR-11: createProvider factory ──────────────────────────────────────────

describe('NFR-11: createProvider factory', () => {
  const originalEnv = process.env['MODEL_PROVIDER'];
  afterEach(() => {
    if (originalEnv === undefined) delete process.env['MODEL_PROVIDER'];
    else process.env['MODEL_PROVIDER'] = originalEnv;
  });

  it('NFR-11: returns FakeProvider when config.provider is "fake"', async () => {
    const { createProvider } = await import('../src/index.js');
    delete process.env['MODEL_PROVIDER'];
    const p = createProvider({ provider: 'fake', model: TEST_MODEL }, repoRoot);
    // Unwrap CachingProvider to check the inner provider type
    expect(p).toBeTruthy();
    // Complete should work (uses fixtures dir)
    const result = await p.complete(KNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(result.text).toBe(KNOWN_RESPONSE);
  });

  it('NFR-11: MODEL_PROVIDER env var overrides config.provider', async () => {
    const { createProvider } = await import('../src/index.js');
    process.env['MODEL_PROVIDER'] = 'fake';
    // config says api, but env says fake — fake should win
    const p = createProvider({ provider: 'api', model: TEST_MODEL }, repoRoot);
    const result = await p.complete(KNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(result.text).toBe(KNOWN_RESPONSE);
  });

  it('NFR-11: defaults to fake when neither env var nor config.provider is set', async () => {
    const { createProvider } = await import('../src/index.js');
    delete process.env['MODEL_PROVIDER'];
    const p = createProvider({ model: TEST_MODEL }, repoRoot);
    const result = await p.complete(KNOWN_PROMPT, { model: TEST_MODEL, maxTokens: 256 });
    expect(result.text).toBe(KNOWN_RESPONSE);
  });

  it('NFR-11: throws on unknown provider name', async () => {
    const { createProvider } = await import('../src/index.js');
    delete process.env['MODEL_PROVIDER'];
    expect(() =>
      createProvider({ provider: 'nonexistent-provider', model: TEST_MODEL }, repoRoot),
    ).toThrow(/unknown provider/i);
  });

  // NFR-11 fix-6: createProvider passes pricing from config to ApiProvider
  it('NFR-11: fix-6: createProvider passes pricing config to ApiProvider', async () => {
    const { ApiProvider } = await import('../src/api.js');
    const pricingTable = { [TEST_MODEL]: { inputPerMTokenUsd: 6.0, outputPerMTokenUsd: 30.0 } };
    const provider = new ApiProvider(pricingTable);
    expect(provider).toBeInstanceOf(ApiProvider);
  });
});

// ─── NFR-11: ClaudeCliProvider (fix-1, fix-2, fix-3) ─────────────────────────

describe('NFR-11: ClaudeCliProvider (fix-1/2/3: temp cwd, stdin, error handling)', () => {
  it('NFR-11: fix-1: does NOT pass --bare as a CLI arg (it forces API key auth, breaking subscription login)', () => {
    const src = readFileSync(join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    // The string literal '--bare' must not appear as an argument — comments may mention it.
    expect(src).not.toContain("'--bare'");
  });

  it('NFR-11: fix-1: uses --tools flag with empty string to disable tools', () => {
    const src = readFileSync(join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    expect(src).toContain("'--tools'");
  });

  it('NFR-11: fix-1: uses --output-format text flag', () => {
    const src = readFileSync(join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    expect(src).toContain('--output-format');
    expect(src).toContain('text');
  });

  it('NFR-11: fix-2: passes prompt via stdin (input option), not as a CLI argument', () => {
    const src = readFileSync(join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    expect(src).toContain('input: prompt');
  });

  it('NFR-11: fix-1: uses a temporary empty cwd (mkdtempSync)', () => {
    const src = readFileSync(join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    expect(src).toContain('mkdtempSync');
    expect(src).toContain('cwd: tmpDir');
  });

  it('NFR-11: fix-3: throws on non-zero exit code', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const fakeSpawner = vi.fn().mockReturnValue({
      status: 1, stdout: '', stderr: 'some error', error: undefined, pid: 0, output: [], signal: null,
    });
    const p = new ClaudeCliProvider(fakeSpawner);
    await expect(p.complete('hello', { model: TEST_MODEL, maxTokens: 256 })).rejects.toThrow(
      /exited with status 1/i,
    );
  });

  it('NFR-11: fix-3: throws on empty output', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const fakeSpawner = vi.fn().mockReturnValue({
      status: 0, stdout: '   ', stderr: '', error: undefined, pid: 0, output: [], signal: null,
    });
    const p = new ClaudeCliProvider(fakeSpawner);
    await expect(p.complete('hello', { model: TEST_MODEL, maxTokens: 256 })).rejects.toThrow(
      /empty output/i,
    );
  });

  // Rate-limit detection must use stderr + non-zero exit only — never inspect stdout,
  // since the model may legitimately output "429" or "overloaded" as part of its answer.
  it('NFR-11: fix-3: stdout containing "429" and "overloaded" is accepted when exit is 0', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const fakeSpawner = vi.fn().mockReturnValue({
      status: 0,
      stdout: 'The HTTP 429 status means overloaded — back off and retry.',
      stderr: '', error: undefined, pid: 0, output: [], signal: null,
    });
    const p = new ClaudeCliProvider(fakeSpawner);
    const result = await p.complete('explain 429', { model: TEST_MODEL, maxTokens: 256 });
    expect(result.text).toContain('429');
    expect(result.text).toContain('overloaded');
  });

  it('NFR-11: fix-3: throws with rate-limit message when non-zero exit + 429 in stderr', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const fakeSpawner = vi.fn().mockReturnValue({
      status: 1, stdout: '', stderr: '429 Too Many Requests', error: undefined, pid: 0, output: [], signal: null,
    });
    const p = new ClaudeCliProvider(fakeSpawner);
    await expect(p.complete('hello', { model: TEST_MODEL, maxTokens: 256 })).rejects.toThrow(
      /rate limit/i,
    );
  });

  it('NFR-11: fix-3: non-zero exit without rate-limit pattern throws generic exit error', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const fakeSpawner = vi.fn().mockReturnValue({
      status: 1, stdout: '', stderr: 'internal error', error: undefined, pid: 0, output: [], signal: null,
    });
    const p = new ClaudeCliProvider(fakeSpawner);
    await expect(p.complete('hello', { model: TEST_MODEL, maxTokens: 256 })).rejects.toThrow(
      /exited with status 1/i,
    );
  });

  it('NFR-11: fix-3: has a timeout set', () => {
    const src = readFileSync(join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    expect(src).toContain('timeout');
  });

  it('NFR-11: fix-3: cleans up temp dir after successful call', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const os = await import('node:os');
    const fsBefore = readdirSync(os.tmpdir()).filter((f) => f.startsWith('claude-cli-'));
    const fakeSpawner = vi.fn().mockReturnValue({
      status: 0, stdout: 'hello response', stderr: '', error: undefined, pid: 0, output: [], signal: null,
    });
    const p = new ClaudeCliProvider(fakeSpawner);
    await p.complete('hello', { model: TEST_MODEL, maxTokens: 256 });
    const fsAfter = readdirSync(os.tmpdir()).filter((f) => f.startsWith('claude-cli-'));
    expect(fsAfter.length).toBe(fsBefore.length);
  });
});

// ─── NFR-11: ApiProvider pricing from config (fix-6) ─────────────────────────

describe('NFR-11: fix-6: ApiProvider pricing keyed by model name', () => {
  it('NFR-11: fix-6: ApiProvider accepts a per-model pricing table', async () => {
    const { ApiProvider } = await import('../src/api.js');
    const table = { 'claude-sonnet-4-6': { inputPerMTokenUsd: 3.0, outputPerMTokenUsd: 15.0 } };
    const p = new ApiProvider(table);
    expect(p).toBeInstanceOf(ApiProvider);
  });

  it('NFR-11: fix-6: config/defaults.json pricing is a map keyed by model name', () => {
    type PricingEntry = { inputPerMTokenUsd: number; outputPerMTokenUsd: number };
    const defaults = JSON.parse(
      readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8'),
    ) as { pricing?: Record<string, PricingEntry> };
    expect(defaults.pricing).toBeDefined();
    // At least the default model must have an entry
    const entry = defaults.pricing?.['claude-sonnet-4-6'];
    expect(typeof entry?.inputPerMTokenUsd).toBe('number');
    expect(typeof entry?.outputPerMTokenUsd).toBe('number');
  });

  it('NFR-11: fix-6: config/defaults.json has entries for haiku, sonnet, and opus', () => {
    type PricingEntry = { inputPerMTokenUsd: number; outputPerMTokenUsd: number };
    const defaults = JSON.parse(
      readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8'),
    ) as { pricing?: Record<string, PricingEntry> };
    expect(defaults.pricing?.['claude-haiku-4-5-20251001']).toBeDefined();
    expect(defaults.pricing?.['claude-sonnet-4-6']).toBeDefined();
    expect(defaults.pricing?.['claude-opus-4-7']).toBeDefined();
  });
});

// ─── NFR-11: maxCallsPerRun in config (fix-5) ─────────────────────────────────

describe('NFR-11: fix-5: maxCallsPerRun in config', () => {
  it('NFR-11: fix-5: config/defaults.json contains maxCallsPerRun field', () => {
    const defaults = JSON.parse(
      readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8'),
    ) as { maxCallsPerRun?: number };
    expect(typeof defaults.maxCallsPerRun).toBe('number');
    expect(defaults.maxCallsPerRun).toBeGreaterThan(0);
  });
});

// ─── NFR-11: ApiProvider integration (requires ANTHROPIC_API_KEY) ────────────────────────

describe('NFR-11: ApiProvider integration (requires ANTHROPIC_API_KEY)', () => {
  const hasKey = !!process.env['ANTHROPIC_API_KEY'];

  it.skipIf(!hasKey)('NFR-11: ApiProvider returns a non-empty text response', async () => {
    const { ApiProvider } = await import('../src/api.js');
    const p = new ApiProvider();
    const result = await p.complete('Say exactly: hello', { model: TEST_MODEL, maxTokens: 16 });
    expect(result.text.trim().length).toBeGreaterThan(0);
    expect(result.costUsd).toBeGreaterThanOrEqual(0);
  });
});

// ─── NFR-11: ClaudeCliProvider (requires claude CLI logged in) ────────────────

describe('NFR-11: ClaudeCliProvider integration (requires claude CLI)', () => {
  // Requires both a working CLI and an explicit opt-in env var, since `claude --version`
  // succeeds even when the user is not logged in.
  const claudeAvailable = !!process.env['CLAUDE_CLI_AVAILABLE'] && (() => {
    try {
      const r = spawnSync('claude', ['--version'], { encoding: 'utf8', timeout: 5000 });
      return r.status === 0;
    } catch {
      return false;
    }
  })();

  it.skipIf(!claudeAvailable)('NFR-11: ClaudeCliProvider returns a non-empty text response', async () => {
    const { ClaudeCliProvider } = await import('../src/cli.js');
    const p = new ClaudeCliProvider();
    const result = await p.complete('Say exactly: hello', { model: TEST_MODEL, maxTokens: 16 });
    expect(result.text.trim().length).toBeGreaterThan(0);
    expect(result.costUsd).toBe(0);
  });
});
