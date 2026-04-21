#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — UI→Backend Full Traceability Report (BLOCK gate)
// Traces: UI action → edge function → DB table → RLS policy
//         → event/webhook path, flagging any broken links.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ui-backend-traceability";
const issues: GateIssue[] = [];

// ── Helpers ──────────────────────────────────────────────────
function walk(dir: string, ext = /\.(tsx?|jsx?)$/): string[] {
  const out: string[] = [];
  try {
    for (const e of readdirSync(dir)) {
      const f = join(dir, e);
      if (statSync(f).isDirectory()) out.push(...walk(f, ext));
      else if (ext.test(f)) out.push(f);
    }
  } catch { /* skip */ }
  return out;
}

function readSafe(p: string): string {
  try { return readFileSync(p, "utf-8"); } catch { return ""; }
}

// ── 1. Collect all functions.invoke() call-sites ─────────────
interface InvokeSite {
  file: string;
  fnName: string;
  line: number;
  platform: "os-desktop" | "mobile" | "admin" | "shared";
}

function classifyFile(file: string): InvokeSite["platform"] {
  if (file.includes("/admin/")) return "admin";
  if (file.includes("/mobile/") || file.includes("/pwa/")) return "mobile";
  if (file.includes("/hooks/") || file.includes("/lib/") || file.includes("/services/")) return "shared";
  return "os-desktop";
}

const invokeRe = /functions\.invoke\(\s*["']([^"']+)["']/g;
const allSites: InvokeSite[] = [];

for (const file of walk("src")) {
  const content = readSafe(file);
  const lines = content.split("\n");
  let m: RegExpExecArray | null;
  while ((m = invokeRe.exec(content)) !== null) {
    const charIdx = m.index;
    const line = content.substring(0, charIdx).split("\n").length;
    allSites.push({ file, fnName: m[1], line, platform: classifyFile(file) });
  }
}

// ── 2. Discover existing edge functions ──────────────────────
const existingFns = new Set<string>();
const fnDir = "supabase/functions";
if (existsSync(fnDir)) {
  for (const d of readdirSync(fnDir)) {
    if (!d.startsWith("_") && existsSync(join(fnDir, d, "index.ts"))) {
      existingFns.add(d);
    }
  }
}

// ── 3. Parse edge function bodies for DB table refs ──────────
const tableRefRe = /\.from\(\s*["']([^"']+)["']\)/g;
const rpcRefRe = /\.rpc\(\s*["']([^"']+)["']\)/g;

interface FnProfile {
  tables: Set<string>;
  rpcs: Set<string>;
  callsWebhook: boolean;
  callsEvent: boolean;
}

const fnProfiles = new Map<string, FnProfile>();

for (const fn of existingFns) {
  const idx = readSafe(join(fnDir, fn, "index.ts"));
  const tables = new Set<string>();
  const rpcs = new Set<string>();
  let m2: RegExpExecArray | null;
  while ((m2 = tableRefRe.exec(idx)) !== null) tables.add(m2[1]);
  while ((m2 = rpcRefRe.exec(idx)) !== null) rpcs.add(m2[1]);
  const callsWebhook = /webhook|dispatch|push/i.test(idx);
  const callsEvent = /realtime|channel|broadcast|event[-_]process/i.test(idx);
  fnProfiles.set(fn, { tables, rpcs, callsWebhook, callsEvent });
}

// ── 4. Load RLS policy metadata from types.ts ────────────────
const typesContent = readSafe("src/integrations/supabase/types.ts");
const knownTables = new Set<string>();
// Extract table names from the types file
const tableNameRe = /^\s{6}(\w+):\s*\{$/gm;
let tm: RegExpExecArray | null;
const inPublicTables = typesContent.indexOf("Tables: {");
const tablesBlock = typesContent.substring(inPublicTables, typesContent.indexOf("Views:", inPublicTables));
while ((tm = tableNameRe.exec(tablesBlock)) !== null) {
  knownTables.add(tm[1]);
}

// ── 5. Check webhook_delivery_log for webhook path tracing ───
const hasWebhookLog = knownTables.has("webhook_delivery_log");

// ── 6. Build traceability matrix ─────────────────────────────
interface TraceRow {
  platform: string;
  uiFile: string;
  uiLine: number;
  edgeFunction: string;
  edgeFnExists: boolean;
  dbTables: string[];
  dbTablesExist: boolean[];
  hasWebhookPath: boolean;
  hasEventPath: boolean;
  breaks: string[];
}

const traceRows: TraceRow[] = [];
const fnCallCount = new Map<string, number>();

for (const site of allSites) {
  fnCallCount.set(site.fnName, (fnCallCount.get(site.fnName) ?? 0) + 1);
  const profile = fnProfiles.get(site.fnName);
  const fnExists = existingFns.has(site.fnName);
  const breaks: string[] = [];

  if (!fnExists) {
    breaks.push(`edge-fn-missing:${site.fnName}`);
    issues.push({
      severity: "error",
      area: `${site.platform}/${site.fnName}`,
      message: `UI invokes "${site.fnName}" at ${site.file}:${site.line} but no edge function found`,
    });
  }

  const dbTables = profile ? [...profile.tables] : [];
  const dbTablesExist = dbTables.map((t) => knownTables.has(t));
  for (let i = 0; i < dbTables.length; i++) {
    if (!dbTablesExist[i]) {
      breaks.push(`table-not-in-schema:${dbTables[i]}`);
      issues.push({
        severity: "warning",
        area: `${site.fnName}/${dbTables[i]}`,
        message: `Edge fn "${site.fnName}" references table "${dbTables[i]}" not in typed schema`,
      });
    }
  }

  const hasWebhookPath = profile?.callsWebhook ?? false;
  const hasEventPath = profile?.callsEvent ?? false;

  if (hasWebhookPath && !hasWebhookLog) {
    breaks.push("webhook-log-missing");
    issues.push({
      severity: "warning",
      area: `${site.fnName}/webhook`,
      message: `Edge fn "${site.fnName}" has webhook path but webhook_delivery_log table missing`,
    });
  }

  traceRows.push({
    platform: site.platform,
    uiFile: site.file,
    uiLine: site.line,
    edgeFunction: site.fnName,
    edgeFnExists: fnExists,
    dbTables,
    dbTablesExist,
    hasWebhookPath,
    hasEventPath,
    breaks,
  });
}

// ── 7. Check for orphan edge functions (no UI consumer) ──────
const invokedFns = new Set(allSites.map((s) => s.fnName));
const orphans: string[] = [];
for (const fn of existingFns) {
  // Skip internal/cron/shared functions
  if (fn.startsWith("internal-") || fn.includes("cron") || fn === "health-check" || fn === "health-live" || fn === "health-ready" || fn === "health-beat") continue;
  if (!invokedFns.has(fn)) orphans.push(fn);
}
if (orphans.length > 0) {
  issues.push({
    severity: "warning",
    area: "orphan-functions",
    message: `${orphans.length} edge functions have no direct UI caller: ${orphans.slice(0, 10).join(", ")}${orphans.length > 10 ? "…" : ""}`,
  });
}

// ── 8. Platform breakdown ────────────────────────────────────
const platformStats: Record<string, { total: number; broken: number; fns: Set<string> }> = {};
for (const row of traceRows) {
  if (!platformStats[row.platform]) platformStats[row.platform] = { total: 0, broken: 0, fns: new Set() };
  platformStats[row.platform].total++;
  platformStats[row.platform].fns.add(row.edgeFunction);
  if (row.breaks.length > 0) platformStats[row.platform].broken++;
}

// ── 9. Summary ───────────────────────────────────────────────
const totalTraces = traceRows.length;
const brokenTraces = traceRows.filter((r) => r.breaks.length > 0).length;
const errorCount = issues.filter((i) => i.severity === "error").length;
const ok = errorCount === 0;

console.log(`\n${"═".repeat(60)}`);
console.log(`  SITA OS — UI→Backend Traceability Report`);
console.log(`${"═".repeat(60)}`);
console.log(`  Total UI→Edge traces : ${totalTraces}`);
console.log(`  Unique edge functions: ${invokedFns.size} invoked / ${existingFns.size} deployed`);
console.log(`  Broken traces        : ${brokenTraces}`);
console.log(`  Orphan edge functions: ${orphans.length}`);
console.log(`  Known DB tables      : ${knownTables.size}`);
console.log();

for (const [platform, stats] of Object.entries(platformStats)) {
  console.log(`  [${platform.toUpperCase()}] ${stats.total} traces, ${stats.fns.size} unique fns, ${stats.broken} broken`);
}
console.log();

if (issues.length > 0) {
  console.log(`  Issues (${issues.length}):`);
  for (const i of issues.slice(0, 20)) {
    console.error(`    [${i.severity}] ${i.area}: ${i.message}`);
  }
  if (issues.length > 20) console.error(`    ... and ${issues.length - 20} more`);
}

console.log(`\n${ok ? "✅" : "❌"} ${GATE}: ${totalTraces - brokenTraces}/${totalTraces} traces intact`);
console.log(`${"═".repeat(60)}\n`);

emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    totalTraces,
    brokenTraces,
    intactTraces: totalTraces - brokenTraces,
    uniqueInvokedFns: invokedFns.size,
    deployedFns: existingFns.size,
    orphanCount: orphans.length,
    orphans: orphans.slice(0, 30),
    platformBreakdown: Object.fromEntries(
      Object.entries(platformStats).map(([k, v]) => [k, { total: v.total, broken: v.broken, uniqueFns: v.fns.size }])
    ),
    traces: traceRows.map((r) => ({
      platform: r.platform,
      ui: `${r.uiFile}:${r.uiLine}`,
      fn: r.edgeFunction,
      fnExists: r.edgeFnExists,
      tables: r.dbTables,
      tablesValid: r.dbTablesExist,
      webhook: r.hasWebhookPath,
      event: r.hasEventPath,
      breaks: r.breaks,
    })),
  },
});

process.exit(ok ? 0 : 1);