# @agenticds/provider

Model provider abstraction used by the Composer and Builder agents. Supports three backends selected at runtime via config or environment variable.

## Selecting a provider

Set `MODEL_PROVIDER` in the environment, or set `provider` in `config/defaults.json`:

| Value | Description |
|-------|-------------|
| `fake` | (default) Reads pre-recorded fixture files from `evals/fixtures/provider/`. No network, no API key. Used in tests and CI. |
| `claude-cli` | Runs `claude -p` non-interactively using your logged-in Claude subscription. No API key needed. |
| `api` | Calls the Anthropic API directly via `@anthropic-ai/sdk`. Requires `ANTHROPIC_API_KEY`. |

A transparent response cache is enabled by default (`cache.enabled: true` in `config/defaults.json`). Cached responses are stored under `runs/.provider-cache/` and return `costUsd: 0`.

## Running one real brief with the CLI provider

Prerequisites: Claude CLI installed and logged in (`claude --version` returns 0).

```sh
MODEL_PROVIDER=claude-cli npx tsx agents/orchestrator/index.ts \
  --taskId task-001 \
  --brief "A screen with a primary submit button"
```

The run log is written to `runs/`. Subsequent runs with the same prompt are served from cache.

## Recording fixtures for fake mode

Fixtures are JSON files at `evals/fixtures/provider/<hash>.json` where the hash is `sha256("<model>|<maxTokens>|<prompt>")`.

To record a new fixture from a live provider:

1. Run with `MODEL_PROVIDER=api` (or `MODEL_PROVIDER=claude-cli`) once to get a real response.
2. Copy the response into a fixture file. The file name is printed in any `FakeProvider` error — look for `"no fixture for hash <hash>"`.

```jsonc
// evals/fixtures/provider/<hash>.json
{ "text": "...", "costUsd": 0.0012 }
```

3. Set `MODEL_PROVIDER=fake` (or omit it) to replay from the fixture in future runs.

## Pricing configuration

API pricing lives in `config/defaults.json`:

```jsonc
{
  "pricing": {
    "inputPerMTokenUsd": 3.0,
    "outputPerMTokenUsd": 15.0
  }
}
```

Update these values when Anthropic changes pricing — no code changes required.

## maxCallsPerRun

The `maxCallsPerRun` config field limits the total number of agent calls per orchestrator run. This guards the `claude-cli` provider, where `costUsd` is always 0 and the cost cap never fires.

```jsonc
{ "maxCallsPerRun": 10 }
```
