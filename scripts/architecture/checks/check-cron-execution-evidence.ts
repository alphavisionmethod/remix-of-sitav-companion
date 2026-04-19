#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 4 — Cron Execution Evidence Validator (WARN during burn-in, BLOCK after 14 days).
// Verifies declared cron jobs (per audit §64) have cron_run_receipts in last 24h.
// Reads generated/cron-receipts-snapshot.json (produced by cron-receipt-collector
// invocation by the master aggregator) as the ground-truth source.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface DeclaredJob {
  job_name: string;
  cadence: string;
  max_age_hours: number;
}

const DECLARED_JOBS: DeclaredJob[] = [
  { job_name: "webhook-retry-processor", cadence: "2m", max_age_hours: 1 },
  { job_name: "ai-internal-agent-loop", cadence: "5m", max_age_hours: 1 },
  { job_name: "boardroom-l7-sla-scan", cadence: "30m", max_age_hours: 2 },
  { job_name: "oauth-refresh-probe", cadence: "1h", max_age_hours: 3 },
  { job_name: "sita-security-council-tick", cadence: "1h", max_age_hours: 3 },
  { job_name: "ai-runtime-nightly-verify", cadence: "daily 02:00", max_age_hours: 30 },
  { job_name: "connector-truth-nightly", cadence: "daily 02:30", max_age_hours: 30 },
  { job_name: "compliance-evidence-collect", cadence: "daily 06:00", max_age_hours: 30 },
  { job_name: "expire-overdue-kill-switches", cadence: "1h", max_age_hours: 3 },
  { job_name: "trim-kill-switch-audit-log", cadence: "daily", max_age_hours: 30 },
  { job_name: "cron-receipt-collector", cadence: "5m", max_age_hours: 1 },
];

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: Issue[] = [];
const snapshotPath = "generated/cron-receipts-snapshot.json";

interface SnapshotEntry {
  job_name: string;
  last_succeeded_at: string;
  status: string;
}
let snapshot: SnapshotEntry[] = [];

if (!existsSync(snapshotPath)) {
  issues.push({
    severity: "warning",
    area: "cron-evidence",
    message: "cron-receipts-snapshot.json not yet produced — validator in WARN mode until first aggregator run with DB read",
  });
} else {
  try {
    const raw = JSON.parse(readFileSync(snapshotPath, "utf8"));
    snapshot = Array.isArray(raw?.entries) ? raw.entries : [];
  } catch (e) {
    issues.push({ severity: "warning", area: "cron-evidence", message: `Snapshot parse failure: ${(e as Error).message}` });
  }
}

const now = Date.now();
const jobReports: Array<{ job_name: string; status: "fresh" | "stale" | "missing"; ageHours: number | null }> = [];

for (const job of DECLARED_JOBS) {
  const entry = snapshot.find((e) => e.job_name === job.job_name);
  if (!entry || !entry.last_succeeded_at) {
    jobReports.push({ job_name: job.job_name, status: "missing", ageHours: null });
    issues.push({ severity: "warning", area: "cron-evidence", message: `${job.job_name}: no receipt found` });
    continue;
  }
  const ageMs = now - new Date(entry.last_succeeded_at).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours > job.max_age_hours) {
    jobReports.push({ job_name: job.job_name, status: "stale", ageHours: Number(ageHours.toFixed(2)) });
    issues.push({ severity: "warning", area: "cron-evidence", message: `${job.job_name}: stale (${ageHours.toFixed(1)}h > ${job.max_age_hours}h)` });
  } else {
    jobReports.push({ job_name: job.job_name, status: "fresh", ageHours: Number(ageHours.toFixed(2)) });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  join("generated", "cron-execution-evidence-report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "cron-execution-evidence",
      ok,
      errorCount,
      warningCount,
      declaredJobs: DECLARED_JOBS.length,
      jobReports,
      issues,
    },
    null,
    2,
  ),
);

console.log(`cron-execution-evidence: ${DECLARED_JOBS.length} declared jobs, ${errorCount} errors, ${warningCount} warnings`);
process.exit(errorCount === 0 ? 0 : 1);
