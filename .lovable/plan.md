

# Sequential Vitest Runner — One-by-One with Streaming Progress

Add a deterministic, file-by-file test runner that avoids worker timeouts and streams live progress, so the full audit always completes.

## What you'll get

- A new script `scripts/test-sequential.mjs` that:
  - Discovers every Vitest spec under `src/**/*.{test,spec}.{ts,tsx}`, `tests/**/...`, and `scripts/**/...` (matching `vitest.config.ts`).
  - Runs each file in its own `vitest run <file>` child process, sequentially.
  - Streams stdout/stderr live (prefixed with `[i/N file]`) and prints a per-file PASS/FAIL line with elapsed ms.
  - Persists a JSON report to `coverage/sequential-report.json` and an `.md` summary to `coverage/sequential-report.md`.
  - Supports flags:
    - `--filter <glob>` — restrict spec set
    - `--bail` — stop on first failure (default: continue)
    - `--retry <n>` — retry a failing file up to n times (default: 0)
    - `--timeout <ms>` — per-file kill timeout (default: 180000)
    - `--shard <i/N>` — split workload across machines/runs
    - `--since <ref>` — only specs touched since git ref (advisory)
    - `--list` — print discovered specs and exit
  - Writes a final summary: total, passed, failed, skipped, slowest 10, total duration. Exits non-zero on any failure unless `--allow-failures`.

- Two npm scripts in `package.json`:
  - `"test:seq": "node scripts/test-sequential.mjs"`
  - `"test:seq:bail": "node scripts/test-sequential.mjs --bail"`

- Optional CI workflow `.github/workflows/test-sequential.yml` (manual `workflow_dispatch`) that runs `npm run test:seq -- --shard ${{ matrix.shard }}/4` across a 4-way matrix and uploads `coverage/sequential-report.*` as artifacts.

- Memory note `mem://architecture/sequential-test-runner.md` describing when to use it (full audits, flake hunts, CI shards) vs default `vitest run` (fast local).

## How it works (technical)

- Discovery: use `fast-glob` (already transitively present via Vite) or fall back to a small recursive `fs.readdir` walker — no new dependency.
- Execution: `child_process.spawn("npx", ["vitest", "run", file, "--reporter=default", "--no-coverage"], { stdio: "pipe" })`. Inherit env. Pipe lines through a prefixer.
- Coverage: by default disabled per-file (faster, no merge complexity). `--coverage` flag re-enables and merges via `c8` if requested (out of scope for v1; documented).
- Timeouts: `setTimeout` → `child.kill("SIGTERM")` then `SIGKILL` after 5s grace.
- Reporting: collect `{ file, status, durationMs, attempts, exitCode }` per spec; write report files atomically.
- Determinism: `process.env.TZ ||= "UTC"`; sorted spec order; single concurrency.

## Files to add / edit

**New**
- `scripts/test-sequential.mjs`
- `.github/workflows/test-sequential.yml`
- `mem/architecture/sequential-test-runner.md`

**Edited**
- `package.json` — add `test:seq` and `test:seq:bail` scripts
- `mem/index.md` — add Sequential Test Runner entry under Memories

## Out of scope
- Merged coverage across shards (documented follow-up).
- Replacing the default `vitest run` in `scripts/pre-deploy.sh` (kept fast). The sequential runner is opt-in for full audits and flake investigations.

