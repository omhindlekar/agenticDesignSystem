import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
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
      expect((err as Error).message).toMatch(/abc1b3ece8a2391/);
    }
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
});

// ─── NFR-11: ApiProvider (requires ANTHROPIC_API_KEY) ────────────────────────

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
  const claudeAvailable = (() => {
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
