#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Per-UI-Action Backend Coverage Report
//
// Scans UI source files for backend calls (supabase.functions.invoke,
// supabase.from().insert/update/delete, supabase.rpc) and builds a
// coverage matrix showing which backend endpoints and DB tables each
// UI action exercises. Cross-references with CI trace JSON output
// to report invocation counts.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDir, readJsonSafe } from "../lib/utils";

const vc = new ViolationCollector();
const OUT_PATH = "generated/ui-action-coverage-report.json";
const TRACE_DIR = "generated/trace-output";
const UI_DIRS = ["src/pages", "src/components", "src/domains"];

// ── Pattern extraction ─────────────────────────────────────────

interface UiBackendCall {
  file: string;
  line: number;
  callType: "function-invoke" | "db-read" | "db-write" | "rpc";
  target: string; // function name or table name
  operation?: string; // insert/update/delete/select
}

interface CiTraceEntry {
  functionName?: string;
  table?: string;
  operation?: string;
  count: number;
}

const CALL_PATTERNS: Array<{
  regex: RegExp;
  extract: (match: RegExpExecArray, line: number) => UiBackendCall | null;
}> = [
  {
    regex: /functions\.invoke\s*\(\s*["'`]([^"'`]+)["'`]/g,
    extract: (m, line) => ({
      file: "", line, callType: "function-invoke",
      target: m[1], operation: "invoke",
    }),
  },
  {
    regex: /\.from\s*\(\s*["'`]([^"'`]+)["'`]\s*\)\s*\.\s*(select|insert|update|delete|upsert)/g,
    extract: (m, line) => ({
      file: "", line,
      callType: m[2] === "select" ? "db-read" : "db-write",
      target: m[1], operation: m[2],
    }),
  },
  {
    regex: /\.rpc\s*\(\s*["'`]([^"'`]+)["'`]/g,
    extract: (m, line) => ({
      file: "", line, callType: "rpc",
      target: m[1], operation: "rpc",
    }),
  },
];

// ── Scan UI files ──────────────────────────────────────────────

const allCalls: UiBackendCall[] = [];

for (const dir of UI_DIRS) {
  if (!existsSync(dir)) continue;
  const files = scanDir(dir, [".ts", ".tsx"]);

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    for (const pat of CALL_PATTERNS) {
      pat.regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pat.regex.exec(content)) !== null) {
        const charIndex = match.index;
        const lineNum = content.substring(0, charIndex).split("\n").length;
        const call = pat.extract(match, lineNum);
        if (call) {
          call.file = relative(process.cwd(), filePath);
          allCalls.push(call);
        }
      }
    }
  }
}

// ── Load CI trace data ────────────────────────────────────────

const ciTraces: CiTraceEntry[] = [];
if (existsSync(TRACE_DIR)) {
  const traceFiles = readdirSync(TRACE_DIR).filter(f => f.endsWith(".json"));
  for (const tf of traceFiles) {
    const data = readJsonSafe<any>(join(TRACE_DIR, tf));
    if (data?.traces) {
      for (const t of data.traces) {
        ciTraces.push({
          functionName: t.functionName ?? t.edgeFunction,
          table: t.table ?? t.tableName,
          operation: t.operation,
          count: t.count ?? t.invocationCount ?? 1,
        });
      }
    }
  }
}

// ── Build coverage matrix ──────────────────────────────────────

interface CoverageEntry {
  target: string;
  callType: string;
  uiSources: Array<{ file: string; line: number; operation?: string }>;
  ciInvocationCount: number;
  covered: boolean;
}

const targetMap = new Map<string, CoverageEntry>();

for (const call of allCalls) {
  const key = `${call.callType}:${call.target}`;
  if (!targetMap.has(key)) {
    const ciMatch = ciTraces.find(t =>
      (call.callType === "function-invoke" && t.functionName === call.target) ||
      (call.callType !== "function-invoke" && t.table === call.target && t.operation === call.operation)
    );
    targetMap.set(key, {
      target: call.target,
      callType: call.callType,
      uiSources: [],
      ciInvocationCount: ciMatch?.count ?? 0,
      covered: (ciMatch?.count ?? 0) > 0,
    });
  }
  const entry = targetMap.get(key)!;
  entry.uiSources.push({ file: call.file, line: call.line, operation: call.operation });
}

const coverageEntries = [...targetMap.values()].sort((a, b) => a.target.localeCompare(b.target));
const coveredCount = coverageEntries.filter(e => e.covered).length;
const uncoveredCount = coverageEntries.filter(e => !e.covered).length;
const totalTargets = coverageEntries.length;

// ── By-type summary ────────────────────────────────────────────

const byType: Record<string, { total: number; covered: number; uncovered: number }> = {};
for (const e of coverageEntries) {
  if (!byType[e.callType]) byType[e.callType] = { total: 0, covered: 0, uncovered: 0 };
  byType[e.callType].total++;
  if (e.covered) byType[e.callType].covered++;
  else byType[e.callType].uncovered++;
}

// ── Flag zero-coverage items as warnings ───────────────────────

for (const e of coverageEntries) {
  if (!e.covered) {
    vc.add(
      e.uiSources[0]?.file ?? "unknown",
      "uncovered-backend-call",
      `${e.callType} → ${e.target} has 0 CI invocations`,
      "warning"
    );
  }
}

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "ui-action-coverage",
  ok: true, // advisory gate
  totalUiBackendCalls: allCalls.length,
  uniqueTargets: totalTargets,
  coveredInCI: coveredCount,
  uncoveredInCI: uncoveredCount,
  coveragePct: totalTargets > 0 ? Math.round((coveredCount / totalTargets) * 100) : 100,
  byType,
  entries: coverageEntries,
});

console.log(`📊 UI-Action Coverage: ${totalTargets} targets, ${coveredCount} covered, ${uncoveredCount} uncovered`);
if (uncoveredCount > 0) {
  console.log(`⚠ ${uncoveredCount} backend calls have 0 CI invocations`);
}
vc.report("check-ui-action-coverage");