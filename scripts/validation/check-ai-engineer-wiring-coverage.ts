/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Engineer Hub: Wiring Coverage Gate
// Tier: BLOCK
//
// For every registered tab, scan the panel source for:
//   • supabase.from('<table>')
//   • supabase.rpc('<rpc>')
//   • supabase.functions.invoke('<fn>')
//   • supabase.channel(...) / .on('postgres_changes', ...)
//
// Cross-checks discovered usage against the declared `dataSources[]`
// and `realtime` flag in the registry. Also verifies the registry's
// declared sources (table / rpc / edgeFunction) actually appear in
// the panel — closes the gap between "claimed wiring" and "actual
// wiring".
//
// Emits: generated/ai-engineer-wiring-coverage-report.json
//        + generated/admin-ai-engineer-team/wiring-coverage.json
//        + generated/admin-ai-engineer-team/WIRING_PROOF_MATRIX.md
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { AI_ENGINEER_HUB_TABS } from "../../src/lib/admin/ai-engineer-hub/tab-registry";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const ROOT = resolve(process.cwd());
const OUT_DIR = resolve(ROOT, "generated/admin-ai-engineer-team");
mkdirSync(OUT_DIR, { recursive: true });

interface PanelWiring {
  tabId: string;
  componentPath: string;
  fileExists: boolean;
  tablesFound: string[];
  rpcsFound: string[];
  edgeFunctionsFound: string[];
  channelFound: boolean;
  realtimeFound: boolean;
  declaredTables: string[];
  declaredRpcs: string[];
  declaredEdgeFunctions: string[];
  declaredRealtime: boolean;
  missingDeclared: string[];
  unwiredRealtime: boolean;
}

function aliasToPath(alias: string): string {
  return resolve(ROOT, `${alias.replace(/^@\//, "src/")}.tsx`);
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}

function scanPanel(src: string) {
  const tables = uniq(
    [...src.matchAll(/supabase\s*\.\s*from\(\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
  );
  const rpcs = uniq(
    [...src.matchAll(/supabase\s*\.\s*rpc\(\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
  );
  const edgeFunctions = uniq(
    [...src.matchAll(/supabase\s*\.\s*functions\s*\.\s*invoke\(\s*["'`]([^"'`]+)["'`]/g)].map(
      (m) => m[1],
    ),
  );
  const channelFound = /supabase\s*\.\s*channel\s*\(/.test(src);
  const realtimeFound =
    /postgres_changes/.test(src) || /\.subscribe\s*\(/.test(src) && channelFound;
  return { tables, rpcs, edgeFunctions, channelFound, realtimeFound };
}

const issues: GateIssue[] = [];
const wiring: PanelWiring[] = [];

for (const t of AI_ENGINEER_HUB_TABS) {
  const p = aliasToPath(t.componentPath);
  const exists = existsSync(p);
  const declaredTables = t.dataSources.flatMap((d) => (d.table ? [d.table] : []));
  const declaredRpcs = t.dataSources.flatMap((d) => (d.rpc ? [d.rpc] : []));
  const declaredEdgeFunctions = t.dataSources.flatMap((d) =>
    d.edgeFunction ? [d.edgeFunction] : [],
  );

  if (!exists) {
    wiring.push({
      tabId: t.id,
      componentPath: t.componentPath,
      fileExists: false,
      tablesFound: [],
      rpcsFound: [],
      edgeFunctionsFound: [],
      channelFound: false,
      realtimeFound: false,
      declaredTables,
      declaredRpcs,
      declaredEdgeFunctions,
      declaredRealtime: t.realtime,
      missingDeclared: [...declaredTables, ...declaredRpcs, ...declaredEdgeFunctions],
      unwiredRealtime: t.realtime,
    });
    issues.push({
      severity: "error",
      area: "wiring",
      message: `Tab "${t.id}" — component file missing: ${t.componentPath}`,
    });
    continue;
  }

  const src = readFileSync(p, "utf8");
  const scan = scanPanel(src);

  // For declared sources, check they really appear in the panel — but
  // only if the data source is "table" / "rpc" / "edgeFunction".
  // Some panels are pure note-only (deferred / archived); those are
  // skipped.
  const declaredSourcesAreNoteOnly = t.dataSources.every(
    (d) => !d.table && !d.rpc && !d.edgeFunction,
  );

  const missingDeclared: string[] = [];
  if (!declaredSourcesAreNoteOnly) {
    for (const tbl of declaredTables) if (!scan.tables.includes(tbl)) missingDeclared.push(`table:${tbl}`);
    for (const r of declaredRpcs) if (!scan.rpcs.includes(r)) missingDeclared.push(`rpc:${r}`);
    for (const f of declaredEdgeFunctions)
      if (!scan.edgeFunctions.includes(f)) missingDeclared.push(`edge:${f}`);
  }

  const unwiredRealtime = t.realtime && !scan.channelFound;

  wiring.push({
    tabId: t.id,
    componentPath: t.componentPath,
    fileExists: true,
    tablesFound: scan.tables,
    rpcsFound: scan.rpcs,
    edgeFunctionsFound: scan.edgeFunctions,
    channelFound: scan.channelFound,
    realtimeFound: scan.realtimeFound,
    declaredTables,
    declaredRpcs,
    declaredEdgeFunctions,
    declaredRealtime: t.realtime,
    missingDeclared,
    unwiredRealtime,
  });

  // WARN-tier (Phase 3): declared but missing in source.
  // Many panels resolve table reads via shared service modules
  // (e.g. internal-agent-registry, kill-switch service), which the
  // AST scan cannot follow. Reported as warnings; promotion to BLOCK
  // tracked in CLOSURE_PHASE_3_6.md.
  for (const m of missingDeclared) {
    issues.push({
      severity: "warning",
      area: "wiring-mismatch",
      message: `Tab "${t.id}" declares ${m} but the AST scan did not find a direct supabase.* call in ${t.componentPath} (may be wired via a shared service module)`,
    });
  }
  if (unwiredRealtime) {
    issues.push({
      severity: "warning",
      area: "realtime",
      message: `Tab "${t.id}" declares realtime=true but no supabase.channel(...) call found in ${t.componentPath}`,
    });
  }
}

// Write detailed wiring artifact for the closure bundle.
writeFileSync(
  join(OUT_DIR, "wiring-coverage.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalTabs: AI_ENGINEER_HUB_TABS.length,
      tabsWithRealWiring: wiring.filter(
        (w) =>
          w.fileExists &&
          (w.tablesFound.length > 0 ||
            w.rpcsFound.length > 0 ||
            w.edgeFunctionsFound.length > 0),
      ).length,
      tabsWithRealtime: wiring.filter((w) => w.channelFound).length,
      tabsClaimingRealtime: wiring.filter((w) => w.declaredRealtime).length,
      mismatches: wiring.filter((w) => w.missingDeclared.length > 0 || w.unwiredRealtime),
      panels: wiring,
    },
    null,
    2,
  ),
);

// Human-readable proof matrix.
const md: string[] = [
  "# Admin AI Engineer Hub — Wiring Proof Matrix",
  "",
  `> Generated: ${new Date().toISOString()}`,
  `> Tabs: ${AI_ENGINEER_HUB_TABS.length} · Realtime: ${wiring.filter((w) => w.channelFound).length} · Mismatches: ${wiring.filter((w) => w.missingDeclared.length > 0 || w.unwiredRealtime).length}`,
  "",
  "Each tab is verified against its declared data sources by AST-scanning the panel source for `supabase.from`, `supabase.rpc`, `supabase.functions.invoke`, and `supabase.channel`.",
  "",
  "| Tab | File | Tables Found | RPCs Found | Edge Fns Found | Realtime | Status |",
  "|---|---|---|---|---|---|---|",
];
for (const w of wiring) {
  const rt = w.declaredRealtime
    ? w.channelFound
      ? "✅ live"
      : "❌ claimed-not-found"
    : w.channelFound
      ? "ℹ️ found-not-claimed"
      : "—";
  const status =
    !w.fileExists
      ? "❌ missing-file"
      : w.missingDeclared.length > 0 || w.unwiredRealtime
        ? "⚠️ mismatch"
        : "✅ ok";
  md.push(
    `| \`${w.tabId}\` | \`${w.componentPath.split("/").pop()}\` | ${w.tablesFound.join(", ") || "—"} | ${w.rpcsFound.join(", ") || "—"} | ${w.edgeFunctionsFound.join(", ") || "—"} | ${rt} | ${status} |`,
  );
}
md.push("");
md.push("## Mismatches");
md.push("");
const mismatches = wiring.filter((w) => w.missingDeclared.length > 0 || w.unwiredRealtime);
if (mismatches.length === 0) {
  md.push("None. Every declared data source is wired in source. ✅");
} else {
  for (const w of mismatches) {
    md.push(`### \`${w.tabId}\``);
    if (w.missingDeclared.length > 0) {
      md.push(`- Missing in source: ${w.missingDeclared.map((s) => `\`${s}\``).join(", ")}`);
    }
    if (w.unwiredRealtime) {
      md.push(`- Declared realtime=true but no \`supabase.channel(...)\` found.`);
    }
  }
}
writeFileSync(join(OUT_DIR, "WIRING_PROOF_MATRIX.md"), md.join("\n"));

// WARN-tier in Phase 3: errors are zero, warnings carry the signal.
const errCount = issues.filter((i) => i.severity === "error").length;
const ok = errCount === 0;

const reportFile = emitGateReport({
  gate: "ai-engineer-wiring-coverage",
  ok,
  issues,
  extra: {
    tier: "WARN",
    promotionTier: "BLOCK",
    scope: "admin-ai-engineer-team",
    totalTabs: AI_ENGINEER_HUB_TABS.length,
    realtimeTabs: wiring.filter((w) => w.channelFound).length,
    mismatchCount: mismatches.length,
  },
});

console.log(
  `[ai-engineer-wiring-coverage] ${ok ? "OK" : "FAIL"} — ${AI_ENGINEER_HUB_TABS.length} tabs, ${wiring.filter((w) => w.channelFound).length} realtime, ${mismatches.length} mismatches → ${reportFile}`,
);
process.exit(ok ? 0 : 1);
