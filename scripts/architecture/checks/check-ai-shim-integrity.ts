// ============================================================================
// BLOCK Gate #28 — AI Shim Integrity
// ----------------------------------------------------------------------------
// Asserts every *.ts file under the 4 legacy AI clusters is a thin DEPRECATED
// SHIM re-exporting from the canonical @/lib/ai-platform/* home. Prevents a
// future agent from re-introducing logic into the legacy folders, which would
// physically resurrect the naming-overlap problem MISSING_AUDIT.md §3 row 1
// and §4 rows 5–8 marked RESOLVED.
//
// A valid shim:
//   - contains the marker string "DEPRECATED SHIM"
//   - contains exactly one `export * from "@/lib/ai-platform/...";` line
//   - is ≤ 12 lines of code (drift detector)
//
// BLOCK tier. Emits generated/ai-shim-integrity-report.json.
// ============================================================================
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const LEGACY_CLUSTERS = [
  "src/lib/ai",
  "src/lib/ai-engineering",
  "src/lib/ai-gateway",
  "src/lib/sovereign-ai-gateway",
];

const SHIM_MARKER = "DEPRECATED SHIM";
const CANONICAL_PREFIX = '"@/lib/ai-platform/';
const MAX_SHIM_LINES = 12;
const EXPORT_RE = /export\s+\*\s+from\s+"@\/lib\/ai-platform\/[^"]+";/;

interface FileResult {
  file: string;
  ok: boolean;
  reasons: string[];
  lineCount: number;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const issues: GateIssue[] = [];
const perFile: FileResult[] = [];

for (const cluster of LEGACY_CLUSTERS) {
  if (!existsSync(cluster)) {
    issues.push({
      severity: "error",
      area: cluster,
      message: `Legacy AI cluster ${cluster} is missing on disk. If it was removed intentionally, also remove it from LEGACY_CLUSTERS in this gate.`,
    });
    continue;
  }
  const files = walk(cluster);
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    const lines = body.split("\n");
    const reasons: string[] = [];
    if (!body.includes(SHIM_MARKER)) {
      reasons.push(`missing "${SHIM_MARKER}" marker`);
    }
    const exportMatches = lines.filter(l => /export\s+\*\s+from\s+"/.test(l));
    if (exportMatches.length === 0) {
      reasons.push(`no \`export * from\` re-export found`);
    } else {
      const nonCanonical = exportMatches.filter(l => !l.includes(CANONICAL_PREFIX));
      if (nonCanonical.length > 0) {
        reasons.push(
          `re-export points outside @/lib/ai-platform/: ${nonCanonical.map(s => s.trim()).join(" | ")}`,
        );
      }
      const validCanonical = exportMatches.some(l => EXPORT_RE.test(l));
      if (!validCanonical) {
        reasons.push(`no canonical \`export * from "@/lib/ai-platform/..."\` line matched the required pattern`);
      }
    }
    if (lines.length > MAX_SHIM_LINES) {
      reasons.push(`shim is ${lines.length} lines (max ${MAX_SHIM_LINES}) — drift suspected`);
    }
    const ok = reasons.length === 0;
    perFile.push({ file, ok, reasons, lineCount: lines.length });
    if (!ok) {
      issues.push({
        severity: "error",
        area: file,
        message: `${file}: ${reasons.join("; ")}`,
      });
    }
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const okFiles = perFile.filter(f => f.ok).length;
const failFiles = perFile.filter(f => !f.ok).length;

emitGateReport({
  gate: "ai-shim-integrity",
  ok,
  issues,
  extra: {
    legacyClusters: LEGACY_CLUSTERS,
    canonicalHome: "src/lib/ai-platform",
    totalFiles: perFile.length,
    okFiles,
    failFiles,
    maxShimLines: MAX_SHIM_LINES,
    perFile,
  },
});

console.log(
  `ai-shim-integrity: ${ok ? "OK" : "FAIL"} (${okFiles}/${perFile.length} shims valid, ${failFiles} failing)`,
);
if (!ok) {
  for (const i of issues) console.log(`  [${i.severity}] ${i.area}: ${i.message}`);
}
process.exit(ok ? 0 : 1);
