#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Behavioral Equivalence Proof Generator
// For each consolidation pair, generates a proof bundle containing:
//   1. API Surface Diff (exported symbols, function signatures)
//   2. Side-Effect Analysis (mutations, storage, fetch, timers)
//   3. Receipt/Logging Deltas (console, telemetry, receipt emissions)
// Persists per-pair bundles as JSON + a summary manifest.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import * as path from "node:path";

// ── Types ──────────────────────────────────────────────────────

interface ExportedSymbol {
  name: string;
  kind: "function" | "class" | "const" | "type" | "interface" | "enum" | "re-export" | "unknown";
  isDefault: boolean;
  line: number;
}

interface SideEffectSignal {
  category: "storage" | "fetch" | "timer" | "dom" | "console" | "event" | "mutation" | "supabase";
  pattern: string;
  line: number;
  snippet: string;
}

interface ReceiptSignal {
  category: "console-log" | "console-warn" | "console-error" | "receipt-emit" | "audit-log" | "telemetry" | "toast";
  pattern: string;
  line: number;
  snippet: string;
}

interface FileAnalysis {
  filePath: string;
  exists: boolean;
  sha256: string;
  lineCount: number;
  byteSize: number;
  exports: ExportedSymbol[];
  sideEffects: SideEffectSignal[];
  receipts: ReceiptSignal[];
}

interface EquivalenceDiff {
  exportsAdded: string[];
  exportsRemoved: string[];
  exportsCommon: string[];
  apiSurfaceMatch: boolean;
  sideEffectDelta: { onlyInCanonical: SideEffectSignal[]; onlyInRetired: SideEffectSignal[] };
  receiptDelta: { onlyInCanonical: ReceiptSignal[]; onlyInRetired: ReceiptSignal[] };
  sideEffectsEquivalent: boolean;
  receiptsEquivalent: boolean;
}

interface ProofBundle {
  pairId: string;
  generatedAt: string;
  fingerprint: string;
  canonical: FileAnalysis;
  retired: FileAnalysis;
  diff: EquivalenceDiff;
  verdict: "equivalent" | "api-drift" | "side-effect-drift" | "receipt-drift" | "divergent";
  verdictReason: string;
  proofHash: string;
}

interface ProofManifest {
  generatedAt: string;
  totalPairs: number;
  equivalent: number;
  drifted: number;
  skipped: number;
  bundles: Array<{
    pairId: string;
    canonical: string;
    retired: string;
    verdict: string;
    bundlePath: string;
  }>;
}

// ── Analysis Helpers ───────────────────────────────────────────

const EXPORT_PATTERNS: Array<{ re: RegExp; kind: ExportedSymbol["kind"] }> = [
  { re: /^export\s+(?:async\s+)?function\s+(\w+)/gm, kind: "function" },
  { re: /^export\s+class\s+(\w+)/gm, kind: "class" },
  { re: /^export\s+const\s+(\w+)/gm, kind: "const" },
  { re: /^export\s+let\s+(\w+)/gm, kind: "const" },
  { re: /^export\s+type\s+(\w+)/gm, kind: "type" },
  { re: /^export\s+interface\s+(\w+)/gm, kind: "interface" },
  { re: /^export\s+enum\s+(\w+)/gm, kind: "enum" },
  { re: /^export\s+default\s+(?:function|class)\s*(\w*)/gm, kind: "function" },
];

const RE_EXPORT_RE = /^export\s+\{([^}]+)\}\s+from/gm;
const EXPORT_STAR_RE = /^export\s+\*\s+from\s+["']([^"']+)["']/gm;

function extractExports(src: string): ExportedSymbol[] {
  const results: ExportedSymbol[] = [];
  const lines = src.split("\n");

  for (const { re, kind } of EXPORT_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const line = src.substring(0, m.index).split("\n").length;
      const name = m[1] || "(default)";
      results.push({ name, kind, isDefault: m[0].includes("default"), line });
    }
  }

  RE_EXPORT_RE.lastIndex = 0;
  let rm: RegExpExecArray | null;
  while ((rm = RE_EXPORT_RE.exec(src)) !== null) {
    const names = rm[1].split(",").map(n => n.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean);
    const line = src.substring(0, rm.index).split("\n").length;
    for (const name of names) {
      results.push({ name, kind: "re-export", isDefault: false, line });
    }
  }

  EXPORT_STAR_RE.lastIndex = 0;
  let sm: RegExpExecArray | null;
  while ((sm = EXPORT_STAR_RE.exec(src)) !== null) {
    const line = src.substring(0, sm.index).split("\n").length;
    results.push({ name: `* from ${sm[1]}`, kind: "re-export", isDefault: false, line });
  }

  return results;
}

const SIDE_EFFECT_PATTERNS: Array<{ re: RegExp; category: SideEffectSignal["category"] }> = [
  { re: /localStorage\.\w+|sessionStorage\.\w+/g, category: "storage" },
  { re: /\bfetch\s*\(|\baxios\b|\bsupabase\.\w+\.\w+/g, category: "fetch" },
  { re: /\bsetTimeout\b|\bsetInterval\b|\brequestAnimationFrame\b/g, category: "timer" },
  { re: /document\.\w+|window\.\w+(?!\.location)/g, category: "dom" },
  { re: /\.dispatchEvent\b|\.emit\b|\.publish\b|EventBus\b/g, category: "event" },
  { re: /supabase\.\w+\.(insert|update|upsert|delete|rpc)\b/g, category: "supabase" },
];

function extractSideEffects(src: string): SideEffectSignal[] {
  const results: SideEffectSignal[] = [];
  const lines = src.split("\n");

  for (const { re, category } of SIDE_EFFECT_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const lineNum = src.substring(0, m.index).split("\n").length;
      const snippet = lines[lineNum - 1]?.trim().substring(0, 120) ?? "";
      results.push({ category, pattern: m[0], line: lineNum, snippet });
    }
  }

  return results;
}

const RECEIPT_PATTERNS: Array<{ re: RegExp; category: ReceiptSignal["category"] }> = [
  { re: /console\.log\b/g, category: "console-log" },
  { re: /console\.warn\b/g, category: "console-warn" },
  { re: /console\.error\b/g, category: "console-error" },
  { re: /emitReceipt\b|createReceipt\b|receipt\.emit\b|\.receipt\b/g, category: "receipt-emit" },
  { re: /auditLog\b|audit\.log\b|logAudit\b/g, category: "audit-log" },
  { re: /telemetry\.\w+|trackEvent\b|analytics\.\w+/g, category: "telemetry" },
  { re: /toast\.\w+|sonner|addToast\b/g, category: "toast" },
];

function extractReceipts(src: string): ReceiptSignal[] {
  const results: ReceiptSignal[] = [];
  const lines = src.split("\n");

  for (const { re, category } of RECEIPT_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const lineNum = src.substring(0, m.index).split("\n").length;
      const snippet = lines[lineNum - 1]?.trim().substring(0, 120) ?? "";
      results.push({ category, pattern: m[0], line: lineNum, snippet });
    }
  }

  return results;
}

function analyzeFile(filePath: string): FileAnalysis {
  if (!existsSync(filePath)) {
    return { filePath, exists: false, sha256: "", lineCount: 0, byteSize: 0, exports: [], sideEffects: [], receipts: [] };
  }
  const buf = readFileSync(filePath);
  const src = buf.toString("utf8");
  const sha256 = createHash("sha256").update(buf).digest("hex");

  return {
    filePath,
    exists: true,
    sha256,
    lineCount: src.split("\n").length,
    byteSize: buf.length,
    exports: extractExports(src),
    sideEffects: extractSideEffects(src),
    receipts: extractReceipts(src),
  };
}

// ── Diff Logic ─────────────────────────────────────────────────

function computeDiff(canonical: FileAnalysis, retired: FileAnalysis): EquivalenceDiff {
  const cNames = new Set(canonical.exports.map(e => e.name));
  const rNames = new Set(retired.exports.map(e => e.name));

  const exportsCommon = [...cNames].filter(n => rNames.has(n));
  const exportsAdded = [...cNames].filter(n => !rNames.has(n));
  const exportsRemoved = [...rNames].filter(n => !cNames.has(n));

  const cSideKeys = new Set(canonical.sideEffects.map(s => `${s.category}:${s.pattern}`));
  const rSideKeys = new Set(retired.sideEffects.map(s => `${s.category}:${s.pattern}`));
  const sideOnlyCanonical = canonical.sideEffects.filter(s => !rSideKeys.has(`${s.category}:${s.pattern}`));
  const sideOnlyRetired = retired.sideEffects.filter(s => !cSideKeys.has(`${s.category}:${s.pattern}`));

  const cRecKeys = new Set(canonical.receipts.map(r => `${r.category}:${r.pattern}`));
  const rRecKeys = new Set(retired.receipts.map(r => `${r.category}:${r.pattern}`));
  const recOnlyCanonical = canonical.receipts.filter(r => !rRecKeys.has(`${r.category}:${r.pattern}`));
  const recOnlyRetired = retired.receipts.filter(r => !cRecKeys.has(`${r.category}:${r.pattern}`));

  return {
    exportsAdded,
    exportsRemoved,
    exportsCommon,
    apiSurfaceMatch: exportsAdded.length === 0 && exportsRemoved.length === 0,
    sideEffectDelta: { onlyInCanonical: sideOnlyCanonical, onlyInRetired: sideOnlyRetired },
    receiptDelta: { onlyInCanonical: recOnlyCanonical, onlyInRetired: recOnlyRetired },
    sideEffectsEquivalent: sideOnlyCanonical.length === 0 && sideOnlyRetired.length === 0,
    receiptsEquivalent: recOnlyCanonical.length === 0 && recOnlyRetired.length === 0,
  };
}

function determineVerdict(diff: EquivalenceDiff, byteIdentical: boolean): { verdict: ProofBundle["verdict"]; reason: string } {
  if (byteIdentical) return { verdict: "equivalent", reason: "Byte-identical files" };
  if (!diff.apiSurfaceMatch) return { verdict: "api-drift", reason: `API surface differs: +${diff.exportsAdded.length} -${diff.exportsRemoved.length}` };
  if (!diff.sideEffectsEquivalent) return { verdict: "side-effect-drift", reason: `Side-effect delta: ${diff.sideEffectDelta.onlyInCanonical.length + diff.sideEffectDelta.onlyInRetired.length} differences` };
  if (!diff.receiptsEquivalent) return { verdict: "receipt-drift", reason: `Receipt/logging delta: ${diff.receiptDelta.onlyInCanonical.length + diff.receiptDelta.onlyInRetired.length} differences` };
  return { verdict: "equivalent", reason: "API, side-effects, and receipts all match" };
}

// ── Main ───────────────────────────────────────────────────────

const OUTPUT_DIR = "generated/behavioral-equivalence-proofs";
const BUNDLES_DIR = path.join(OUTPUT_DIR, "bundles");
mkdirSync(BUNDLES_DIR, { recursive: true });

// Load consolidation records
const RESOLUTION_PATH = "generated/lib-remediation/duplicate-resolution.json";
if (!existsSync(RESOLUTION_PATH)) {
  console.error("❌ No duplicate-resolution.json found. Run consolidate-duplicate-services first.");
  process.exit(1);
}

const resolution = JSON.parse(readFileSync(RESOLUTION_PATH, "utf8"));
const pairs: Array<{ fingerprint: string; canonical: string; retired: string; byteIdentical: boolean; action: string }> = resolution.records ?? [];

console.log(`\n🔍 Generating behavioral equivalence proofs for ${pairs.length} consolidation pairs...\n`);

const manifestEntries: ProofManifest["bundles"] = [];
let equivalent = 0, drifted = 0, skipped = 0;

for (const pair of pairs) {
  if (pair.action === "skipped-divergent") {
    skipped++;
    continue;
  }

  const pairId = createHash("md5")
    .update(`${pair.canonical}|${pair.retired}`)
    .digest("hex")
    .substring(0, 12);

  const canonical = analyzeFile(pair.canonical);
  const retired = analyzeFile(pair.retired);
  const diff = computeDiff(canonical, retired);
  const { verdict, reason } = determineVerdict(diff, pair.byteIdentical);

  const bundle: ProofBundle = {
    pairId,
    generatedAt: new Date().toISOString(),
    fingerprint: pair.fingerprint,
    canonical,
    retired,
    diff,
    verdict,
    verdictReason: reason,
    proofHash: "",
  };

  // Self-seal: hash the bundle content for tamper detection
  bundle.proofHash = createHash("sha256")
    .update(JSON.stringify({ ...bundle, proofHash: "" }))
    .digest("hex");

  const bundlePath = path.join(BUNDLES_DIR, `${pairId}-proof.json`);
  writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));

  if (verdict === "equivalent") equivalent++;
  else drifted++;

  const icon = verdict === "equivalent" ? "✅" : "⚠️";
  console.log(`  ${icon} ${pairId} ${verdict} — ${pair.retired}`);

  manifestEntries.push({
    pairId,
    canonical: pair.canonical,
    retired: pair.retired,
    verdict,
    bundlePath,
  });
}

// Write manifest
const manifest: ProofManifest = {
  generatedAt: new Date().toISOString(),
  totalPairs: pairs.length,
  equivalent,
  drifted,
  skipped,
  bundles: manifestEntries,
};

writeFileSync(
  path.join(OUTPUT_DIR, "equivalence-manifest.json"),
  JSON.stringify(manifest, null, 2),
);

// Write human-readable summary
const summaryLines = [
  "# Behavioral Equivalence Proof Summary",
  "",
  `Generated: ${manifest.generatedAt}`,
  `Total pairs: ${manifest.totalPairs}`,
  `Equivalent: ${equivalent} | Drifted: ${drifted} | Skipped: ${skipped}`,
  "",
  "## Per-Pair Results",
  "",
  "| Pair ID | Verdict | Canonical | Retired |",
  "|---------|---------|-----------|---------|",
  ...manifestEntries.map(e =>
    `| ${e.pairId} | ${e.verdict} | \`${e.canonical}\` | \`${e.retired}\` |`
  ),
  "",
  "## Drift Details",
  "",
];

for (const e of manifestEntries.filter(e => e.verdict !== "equivalent")) {
  const b: ProofBundle = JSON.parse(readFileSync(e.bundlePath, "utf8"));
  summaryLines.push(`### ${e.pairId} — ${b.verdict}`);
  summaryLines.push(`**Reason:** ${b.verdictReason}`);
  if (b.diff.exportsAdded.length) summaryLines.push(`- Exports added in canonical: ${b.diff.exportsAdded.join(", ")}`);
  if (b.diff.exportsRemoved.length) summaryLines.push(`- Exports removed from retired: ${b.diff.exportsRemoved.join(", ")}`);
  if (b.diff.sideEffectDelta.onlyInCanonical.length)
    summaryLines.push(`- Side-effects only in canonical: ${b.diff.sideEffectDelta.onlyInCanonical.map(s => s.pattern).join(", ")}`);
  if (b.diff.sideEffectDelta.onlyInRetired.length)
    summaryLines.push(`- Side-effects only in retired: ${b.diff.sideEffectDelta.onlyInRetired.map(s => s.pattern).join(", ")}`);
  summaryLines.push("");
}

writeFileSync(path.join(OUTPUT_DIR, "EQUIVALENCE_PROOF_SUMMARY.md"), summaryLines.join("\n"));

console.log(`\n✅ Proof generation complete`);
console.log(`   ${equivalent} equivalent | ${drifted} drifted | ${skipped} skipped`);
console.log(`   Bundles: ${BUNDLES_DIR}/`);
console.log(`   Manifest: ${OUTPUT_DIR}/equivalence-manifest.json`);