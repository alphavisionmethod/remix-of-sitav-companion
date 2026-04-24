#!/usr/bin/env node
/**
 * Sequential Vitest Runner
 * --------------------------------------------------------------
 * Runs each Vitest spec file one-by-one in its own child process,
 * streaming live progress and writing a JSON + Markdown report.
 *
 * Usage:
 *   node scripts/test-sequential.mjs [options]
 *
 * Options:
 *   --filter <substr>     Restrict spec set (substring match on path)
 *   --bail                Stop on first failure
 *   --retry <n>           Retry a failing file up to n times (default: 0)
 *   --timeout <ms>        Per-file kill timeout (default: 180000)
 *   --shard <i/N>         Split workload across runs (1-indexed)
 *   --since <ref>         Only specs touched since git ref
 *   --list                Print discovered specs and exit
 *   --allow-failures      Always exit 0
 *   --quiet               Suppress per-file stdout streaming
 *   --help                Show this help
 *
 * Why: vitest run with high concurrency can stall on memory or worker
 * timeouts during full audits. This runner trades speed for determinism
 * so the audit always completes and produces an artifact.
 */
import { spawn, execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

process.env.TZ ||= "UTC";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "coverage");
const REPORT_JSON = path.join(REPORT_DIR, "sequential-report.json");
const REPORT_MD = path.join(REPORT_DIR, "sequential-report.md");

// --- arg parsing ---------------------------------------------------------
const args = process.argv.slice(2);
const flags = {
  filter: null,
  bail: false,
  retry: 0,
  timeout: 180_000,
  shard: null, // { index, total }
  since: null,
  list: false,
  allowFailures: false,
  quiet: false,
};

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  switch (a) {
    case "--help":
    case "-h":
      printHelp();
      process.exit(0);
    case "--filter":
      flags.filter = args[++i];
      break;
    case "--bail":
      flags.bail = true;
      break;
    case "--retry":
      flags.retry = Math.max(0, parseInt(args[++i], 10) || 0);
      break;
    case "--timeout":
      flags.timeout = Math.max(1000, parseInt(args[++i], 10) || 180_000);
      break;
    case "--shard": {
      const raw = args[++i] || "";
      const m = raw.match(/^(\d+)\/(\d+)$/);
      if (!m) {
        console.error(`Invalid --shard value: ${raw} (expected i/N)`);
        process.exit(2);
      }
      flags.shard = { index: parseInt(m[1], 10), total: parseInt(m[2], 10) };
      if (flags.shard.index < 1 || flags.shard.index > flags.shard.total) {
        console.error(`Invalid --shard range: ${raw}`);
        process.exit(2);
      }
      break;
    }
    case "--since":
      flags.since = args[++i];
      break;
    case "--list":
      flags.list = true;
      break;
    case "--allow-failures":
      flags.allowFailures = true;
      break;
    case "--quiet":
      flags.quiet = true;
      break;
    default:
      console.error(`Unknown option: ${a}`);
      printHelp();
      process.exit(2);
  }
}

function printHelp() {
  console.log(
    `Sequential Vitest Runner\n\n` +
      `Usage: node scripts/test-sequential.mjs [options]\n\n` +
      `  --filter <substr>     Restrict spec set (substring match)\n` +
      `  --bail                Stop on first failure\n` +
      `  --retry <n>           Retry failing files (default 0)\n` +
      `  --timeout <ms>        Per-file kill timeout (default 180000)\n` +
      `  --shard <i/N>         Run shard i of N (1-indexed)\n` +
      `  --since <ref>         Only specs changed since git ref\n` +
      `  --list                Print discovered specs and exit\n` +
      `  --allow-failures      Always exit 0\n` +
      `  --quiet               Do not stream child stdout\n`,
  );
}

// --- discovery -----------------------------------------------------------
const SPEC_RE = /\.(test|spec)\.(ts|tsx)$/;
const ROOT_DIRS = ["src", "tests", "scripts"];
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "coverage",
  "build",
  ".next",
  ".turbo",
  "generated",
]);

async function walk(dir, out) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, out);
    } else if (e.isFile() && SPEC_RE.test(e.name)) {
      out.push(path.relative(ROOT, full));
    }
  }
}

async function discoverSpecs() {
  const out = [];
  for (const d of ROOT_DIRS) {
    await walk(path.join(ROOT, d), out);
  }
  return out.sort();
}

function applySince(specs, ref) {
  try {
    const changed = execSync(`git diff --name-only ${ref}...HEAD`, {
      encoding: "utf8",
    })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const set = new Set(changed);
    // Spec is included if itself changed, OR any sibling source under same
    // top-level directory changed (advisory heuristic).
    return specs.filter((s) => set.has(s) || changed.some((c) => sharesDir(s, c)));
  } catch (err) {
    console.warn(`[since] git diff failed (${err.message}); ignoring --since`);
    return specs;
  }
}

function sharesDir(a, b) {
  const da = path.dirname(a);
  const db = path.dirname(b);
  return da === db || da.startsWith(db + path.sep) || db.startsWith(da + path.sep);
}

function applyShard(specs, shard) {
  if (!shard) return specs;
  return specs.filter((_, i) => i % shard.total === shard.index - 1);
}

function applyFilter(specs, filter) {
  if (!filter) return specs;
  return specs.filter((s) => s.includes(filter));
}

// --- execution -----------------------------------------------------------
function fmtMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
  const m = Math.floor(ms / 60_000);
  const s = ((ms % 60_000) / 1000).toFixed(1);
  return `${m}m${s}s`;
}

function streamChild(child, prefix) {
  const onLine = (chunk) => {
    const text = chunk.toString();
    if (flags.quiet) return;
    for (const line of text.split(/\r?\n/)) {
      if (line.length === 0) continue;
      process.stdout.write(`${prefix} ${line}\n`);
    }
  };
  child.stdout.on("data", onLine);
  child.stderr.on("data", onLine);
}

function runVitestFile(file, prefix, timeoutMs) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(
      "npx",
      ["vitest", "run", file, "--reporter=default", "--no-coverage"],
      {
        cwd: ROOT,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    streamChild(child, prefix);

    let killed = false;
    const killer = setTimeout(() => {
      killed = true;
      try {
        child.kill("SIGTERM");
      } catch {}
      setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {}
      }, 5000);
    }, timeoutMs);

    child.on("close", (code, signal) => {
      clearTimeout(killer);
      const durationMs = Date.now() - started;
      const status = killed
        ? "timeout"
        : code === 0
          ? "pass"
          : "fail";
      resolve({
        file,
        status,
        exitCode: code,
        signal: signal || null,
        durationMs,
      });
    });

    child.on("error", (err) => {
      clearTimeout(killer);
      resolve({
        file,
        status: "fail",
        exitCode: -1,
        signal: null,
        durationMs: Date.now() - started,
        error: err.message,
      });
    });
  });
}

async function writeReport(results, meta) {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const report = { meta, results };
  await fs.writeFile(REPORT_JSON, JSON.stringify(report, null, 2));

  const passed = results.filter((r) => r.status === "pass");
  const failed = results.filter((r) => r.status === "fail");
  const timedOut = results.filter((r) => r.status === "timeout");
  const slow = [...results]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 10);

  const lines = [
    `# Sequential Test Report`,
    ``,
    `- **Started:** ${meta.startedAt}`,
    `- **Finished:** ${meta.finishedAt}`,
    `- **Total duration:** ${fmtMs(meta.totalMs)}`,
    `- **Specs:** ${results.length}  ✅ ${passed.length}  ❌ ${failed.length}  ⏱ ${timedOut.length}`,
    meta.shard ? `- **Shard:** ${meta.shard.index}/${meta.shard.total}` : ``,
    ``,
    `## Slowest 10`,
    ``,
    `| File | Duration | Status |`,
    `| --- | --- | --- |`,
    ...slow.map((r) => `| \`${r.file}\` | ${fmtMs(r.durationMs)} | ${r.status} |`),
  ];

  if (failed.length || timedOut.length) {
    lines.push(``, `## Failures`, ``, `| File | Status | Exit | Attempts |`, `| --- | --- | --- | --- |`);
    for (const r of [...failed, ...timedOut]) {
      lines.push(`| \`${r.file}\` | ${r.status} | ${r.exitCode} | ${r.attempts || 1} |`);
    }
  }

  await fs.writeFile(REPORT_MD, lines.filter(Boolean).join("\n") + "\n");
}

// --- main ----------------------------------------------------------------
(async () => {
  let specs = await discoverSpecs();
  if (flags.since) specs = applySince(specs, flags.since);
  specs = applyFilter(specs, flags.filter);
  specs = applyShard(specs, flags.shard);

  if (flags.list) {
    for (const s of specs) console.log(s);
    console.log(`\n${specs.length} spec(s) discovered.`);
    process.exit(0);
  }

  if (specs.length === 0) {
    console.log("No specs matched.");
    await writeReport([], {
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      totalMs: 0,
      shard: flags.shard,
      flags,
    });
    process.exit(0);
  }

  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  console.log(
    `▶ Running ${specs.length} spec(s) sequentially` +
      (flags.shard ? ` (shard ${flags.shard.index}/${flags.shard.total})` : "") +
      `\n`,
  );

  const results = [];
  for (let i = 0; i < specs.length; i++) {
    const file = specs[i];
    const prefix = `[${i + 1}/${specs.length} ${path.basename(file)}]`;
    let attempt = 0;
    let res;
    do {
      attempt += 1;
      const tag = attempt === 1 ? prefix : `${prefix} retry#${attempt - 1}`;
      console.log(`\n${tag} ▶ ${file}`);
      res = await runVitestFile(file, tag, flags.timeout);
      res.attempts = attempt;
      const icon = res.status === "pass" ? "✅" : res.status === "timeout" ? "⏱" : "❌";
      console.log(`${tag} ${icon} ${res.status} in ${fmtMs(res.durationMs)} (exit ${res.exitCode})`);
    } while (res.status !== "pass" && attempt <= flags.retry);

    results.push(res);

    if (res.status !== "pass" && flags.bail) {
      console.log(`\n⛔ --bail set; stopping after first failure.`);
      break;
    }
  }

  const finishedAt = new Date().toISOString();
  const totalMs = Date.now() - startedMs;
  await writeReport(results, {
    startedAt,
    finishedAt,
    totalMs,
    shard: flags.shard,
    flags: { ...flags, filter: flags.filter, since: flags.since },
  });

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.length - passed;

  console.log(
    `\n──────────────────────────────────────────────────────────\n` +
      `Total: ${results.length}   ✅ ${passed}   ❌ ${failed}   ⏱ ${fmtMs(totalMs)}\n` +
      `Report: ${path.relative(ROOT, REPORT_JSON)}\n` +
      `        ${path.relative(ROOT, REPORT_MD)}\n`,
  );

  if (failed > 0 && !flags.allowFailures) process.exit(1);
  process.exit(0);
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});