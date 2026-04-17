#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Workflow Map Check (Gate 36 — Phase 25)
//
// Validates that every OwnerWorkflow.entry and every step.route
// resolves to a route that is mounted in src/routes/AdminRoutes.tsx
// or has a registry entry whose `replacedBy` resolves to a mounted
// path. Fails loudly when the workflow map drifts from reality.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, writeJsonOutput } from "../lib/utils";

const vc = new ViolationCollector();

const ROUTES_PATH = "src/routes/AdminRoutes.tsx";
const WORKFLOW_PATH = "src/lib/architecture/owner-workflow-map.ts";
const REGISTRY_PATH = "src/lib/architecture/admin-route-registry.ts";
const REPORT_PATH = "generated/owner-workflow-reality-report.json";

if (!fs.existsSync(ROUTES_PATH) || !fs.existsSync(WORKFLOW_PATH) || !fs.existsSync(REGISTRY_PATH)) {
  vc.add("phase-25", "missing-input", "AdminRoutes / owner-workflow-map / route-registry not found");
  vc.report("check-owner-workflow-map");
  vc.exitIfErrors();
  process.exit(0);
}

// ── Parse mounted routes ────────────────────────────────────────
const routesSrc = fs.readFileSync(ROUTES_PATH, "utf-8");
const mounted = new Set<string>();
const pathRe = /path="(\/admin[^"]*)"/g;
let m: RegExpExecArray | null;
while ((m = pathRe.exec(routesSrc)) !== null) mounted.add(m[1]);

// ── Parse registry entries (path → replacedBy) ─────────────────
const registrySrc = fs.readFileSync(REGISTRY_PATH, "utf-8");
const replacedBy = new Map<string, string>();
const entryRe = /\{\s*path:\s*"(\/admin[^"]+)"[^}]*?replacedBy:\s*"(\/admin[^"]+)"/g;
while ((m = entryRe.exec(registrySrc)) !== null) replacedBy.set(m[1], m[2]);

function resolves(path: string): boolean {
  if (mounted.has(path)) return true;
  const target = replacedBy.get(path);
  if (target && mounted.has(target)) return true;
  return false;
}

// ── Parse workflow map ─────────────────────────────────────────
const wfSrc = fs.readFileSync(WORKFLOW_PATH, "utf-8");
type WorkflowKey = string;
interface ParsedWorkflow {
  key: WorkflowKey;
  entry: string;
  steps: string[];
  domains: string[];
}

const workflows: ParsedWorkflow[] = [];
const blockRe = /(daily|weekly|support|release|"trust-safety"):\s*\{([\s\S]*?)\n\s{2}\},/g;
while ((m = blockRe.exec(wfSrc)) !== null) {
  const key = m[1].replace(/"/g, "");
  const body = m[2];
  const entryMatch = body.match(/entry:\s*"([^"]+)"/);
  const domainMatch = body.match(/domains:\s*\[([^\]]+)\]/);
  const stepRoutes: string[] = [];
  const stepRe = /route:\s*"([^"]+)"/g;
  let sm: RegExpExecArray | null;
  while ((sm = stepRe.exec(body)) !== null) stepRoutes.push(sm[1]);
  workflows.push({
    key,
    entry: entryMatch?.[1] ?? "",
    steps: stepRoutes,
    domains: (domainMatch?.[1] ?? "").split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean),
  });
}

const ADMIN_DOMAINS = [
  "overview", "alerts", "approvals", "environments", "ai-runtime", "integrations",
  "trust-security", "health", "releases", "verification", "config", "support",
];
const REQUIRED_KEYS = ["daily", "weekly", "support", "release", "trust-safety"];

const reportPerWorkflow: Record<string, { mounted: number; total: number; entryOk: boolean; missingSteps: string[] }> = {};

for (const key of REQUIRED_KEYS) {
  const w = workflows.find((x) => x.key === key);
  if (!w) {
    vc.add(WORKFLOW_PATH, "missing-workflow", `Required workflow "${key}" missing`);
    continue;
  }
  if (w.steps.length < 4) {
    vc.add(WORKFLOW_PATH, "too-few-steps", `Workflow "${key}" has ${w.steps.length} steps (need ≥4)`);
  }
  for (const d of w.domains) {
    if (!ADMIN_DOMAINS.includes(d)) {
      vc.add(WORKFLOW_PATH, "unknown-domain", `Workflow "${key}" references unknown domain "${d}"`);
    }
  }
  const entryOk = resolves(w.entry);
  if (!entryOk) {
    vc.add(WORKFLOW_PATH, "entry-unmounted", `Workflow "${key}" entry not mounted: ${w.entry}`);
  }
  const missing: string[] = [];
  for (const r of w.steps) {
    if (!resolves(r)) {
      missing.push(r);
      vc.add(WORKFLOW_PATH, "step-unmounted", `Workflow "${key}" step not mounted: ${r}`);
    }
  }
  reportPerWorkflow[key] = {
    mounted: w.steps.length - missing.length,
    total: w.steps.length,
    entryOk,
    missingSteps: missing,
  };
}

const ok = vc.errors.length === 0;
writeJsonOutput(REPORT_PATH, {
  generatedAt: new Date().toISOString(),
  ok,
  workflows: reportPerWorkflow,
  totals: {
    mountedRoutes: mounted.size,
    registryRedirects: replacedBy.size,
    workflowKeys: workflows.length,
  },
});

console.log(`  🔁 ${workflows.length} workflows, ${mounted.size} mounted routes, ${replacedBy.size} redirects`);
for (const [k, r] of Object.entries(reportPerWorkflow)) {
  console.log(`    ${k}: ${r.mounted}/${r.total} steps mounted${r.entryOk ? "" : " (entry MISSING)"}`);
}

vc.report("check-owner-workflow-map");
vc.exitIfErrors();
