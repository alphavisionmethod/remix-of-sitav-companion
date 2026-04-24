---
name: Sequential Test Runner
description: One-by-one Vitest runner used for full audits, flake hunts, and CI shards
type: feature
---
# Sequential Test Runner

- **Script:** `scripts/test-sequential.mjs`
- **Scripts:** `npm run test:seq`, `npm run test:seq:bail`
- **CI:** `.github/workflows/test-sequential.yml` (manual `workflow_dispatch`, 4-way shard matrix)
- **Reports:** `coverage/sequential-report.json` and `coverage/sequential-report.md`

## When to use

- Full audits where the default `vitest run` stalls on memory or worker timeouts.
- Flake investigations — combine `--retry <n>` with `--filter <substr>`.
- CI sharding via `--shard i/N` to split the workload across machines.
- `--since <ref>` for change-scoped runs (advisory heuristic).

## Rules

- Discovery mirrors `vitest.config.ts` includes: `src/**/*.{test,spec}.{ts,tsx}`,
  `tests/**/...`, `scripts/**/...` (sorted, deterministic).
- Each spec runs in its own `npx vitest run <file> --no-coverage` child process.
- Per-file kill timeout: `--timeout` (default 180000ms), SIGTERM then SIGKILL after 5s.
- Coverage is intentionally disabled per-file; merging across shards is a follow-up.
- Default `vitest run` (and `scripts/pre-deploy.sh`) remain unchanged — sequential
  runner is opt-in.