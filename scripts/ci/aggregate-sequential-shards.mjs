#!/usr/bin/env node
/**
 * Aggregate per-shard sequential-report.json files into a single
 * canonical inventory for G6 (full vitest sharded inventory).
 *
 * Usage:
 *   node scripts/ci/aggregate-sequential-shards.mjs <inputDir> <outputDir>
 *
 * Inputs:  one subdirectory per shard, each containing sequential-report.json
 * Outputs: <outputDir>/sequential-inventory.json
 *          <outputDir>/sequential-inventory.md
 *          process exit 0 always (artifact is the deliverable)
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const [, , inputDirArg, outputDirArg] = process.argv;
if (!inputDirArg || !outputDirArg) {
  console.error("usage: aggregate-sequential-shards.mjs <inputDir> <outputDir>");
  process.exit(2);
}

const inputDir = path.resolve(inputDirArg);
const outputDir = path.resolve(outputDirArg);
await fs.mkdir(outputDir, { recursive: true });

function fmtMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m${s}s`;
}

async function findReports(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await findReports(full)));
    } else if (entry.isFile() && entry.name === "sequential-report.json") {
      out.push(full);
    }
  }
  return out;
}

const reportPaths = await findReports(inputDir);
if (reportPaths.length === 0) {
  console.error(`No sequential-report.json files found under ${inputDir}`);
  // Still emit empty artifacts so downstream tooling has a stable contract.
}

const allResults = [];
const shards = [];
let totalMs = 0;
let earliest = null;
let latest = null;

for (const p of reportPaths) {
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(p, "utf8"));
  } catch (err) {
    console.error(`skip malformed report ${p}: ${err.message}`);
    continue;
  }
  const meta = raw.meta || {};
  const results = Array.isArray(raw.results) ? raw.results : [];
  shards.push({
    path: path.relative(inputDir, p),
    shard: meta.shard || null,
    specs: results.length,
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    timedOut: results.filter((r) => r.status === "timeout").length,
    durationMs: meta.totalMs ?? 0,
    startedAt: meta.startedAt ?? null,
    finishedAt: meta.finishedAt ?? null,
  });
  totalMs += meta.totalMs ?? 0;
  if (meta.startedAt && (!earliest || meta.startedAt < earliest)) earliest = meta.startedAt;
  if (meta.finishedAt && (!latest || meta.finishedAt > latest)) latest = meta.finishedAt;
  for (const r of results) allResults.push({ ...r, shard: meta.shard?.index ?? null });
}

// Deduplicate by file path — when a spec appears in multiple shards (shouldn't,
// but defensive), keep the worst status (timeout > fail > pass).
const STATUS_RANK = { pass: 0, fail: 1, timeout: 2 };
const byFile = new Map();
for (const r of allResults) {
  const prev = byFile.get(r.file);
  if (!prev || (STATUS_RANK[r.status] ?? 0) > (STATUS_RANK[prev.status] ?? 0)) {
    byFile.set(r.file, r);
  }
}
const uniqueResults = [...byFile.values()];

const passed = uniqueResults.filter((r) => r.status === "pass");
const failed = uniqueResults.filter((r) => r.status === "fail");
const timedOut = uniqueResults.filter((r) => r.status === "timeout");
const slowest = [...uniqueResults]
  .sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0))
  .slice(0, 20);

const inventory = {
  meta: {
    aggregatedAt: new Date().toISOString(),
    shardReportsFound: reportPaths.length,
    earliestShardStart: earliest,
    latestShardFinish: latest,
    cumulativeShardDurationMs: totalMs,
  },
  shards,
  summary: {
    specsTotal: uniqueResults.length,
    passed: passed.length,
    failed: failed.length,
    timedOut: timedOut.length,
    passRate:
      uniqueResults.length === 0
        ? null
        : Number(((passed.length / uniqueResults.length) * 100).toFixed(2)),
  },
  failures: [...failed, ...timedOut].map((r) => ({
    file: r.file,
    status: r.status,
    exitCode: r.exitCode ?? null,
    durationMs: r.durationMs ?? 0,
    attempts: r.attempts ?? 1,
    shard: r.shard ?? null,
  })),
  slowest: slowest.map((r) => ({
    file: r.file,
    durationMs: r.durationMs ?? 0,
    status: r.status,
    shard: r.shard ?? null,
  })),
};

await fs.writeFile(
  path.join(outputDir, "sequential-inventory.json"),
  JSON.stringify(inventory, null, 2)
);

const lines = [
  `# Sequential Vitest Inventory (G6)`,
  ``,
  `- **Aggregated at:** ${inventory.meta.aggregatedAt}`,
  `- **Shards aggregated:** ${shards.length}`,
  `- **Specs total (unique):** ${inventory.summary.specsTotal}`,
  `- **Passed:** ${inventory.summary.passed}`,
  `- **Failed:** ${inventory.summary.failed}`,
  `- **Timed out:** ${inventory.summary.timedOut}`,
  `- **Pass rate:** ${inventory.summary.passRate ?? "n/a"}%`,
  `- **Cumulative shard wall time:** ${fmtMs(inventory.meta.cumulativeShardDurationMs)}`,
  ``,
  `## Per-shard summary`,
  ``,
  `| Shard | Specs | ✅ | ❌ | ⏱ | Duration |`,
  `| --- | --- | --- | --- | --- | --- |`,
  ...shards.map((s) => {
    const label = s.shard ? `${s.shard.index}/${s.shard.total}` : "—";
    return `| ${label} | ${s.specs} | ${s.passed} | ${s.failed} | ${s.timedOut} | ${fmtMs(s.durationMs)} |`;
  }),
];

if (inventory.failures.length > 0) {
  lines.push(
    ``,
    `## Failures (${inventory.failures.length})`,
    ``,
    `| File | Status | Shard | Exit | Attempts | Duration |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...inventory.failures.map(
      (f) =>
        `| \`${f.file}\` | ${f.status} | ${f.shard ?? "—"} | ${f.exitCode ?? "—"} | ${f.attempts} | ${fmtMs(f.durationMs)} |`
    )
  );
} else {
  lines.push(``, `## Failures`, ``, `_No failing specs._`);
}

lines.push(
  ``,
  `## Slowest 20`,
  ``,
  `| File | Duration | Status | Shard |`,
  `| --- | --- | --- | --- |`,
  ...inventory.slowest.map(
    (r) => `| \`${r.file}\` | ${fmtMs(r.durationMs)} | ${r.status} | ${r.shard ?? "—"} |`
  )
);

await fs.writeFile(
  path.join(outputDir, "sequential-inventory.md"),
  lines.join("\n") + "\n"
);

console.log(
  `Aggregated ${reportPaths.length} shard report(s) → ${path.relative(process.cwd(), outputDir)}/sequential-inventory.{json,md}`
);
console.log(
  `Specs: ${inventory.summary.specsTotal}  ✅ ${inventory.summary.passed}  ❌ ${inventory.summary.failed}  ⏱ ${inventory.summary.timedOut}`
);
process.exit(0);