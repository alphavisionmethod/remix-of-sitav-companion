#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Conformance Generator (Phase 3)
//
// Reads the live runtime evidence bundle (captured at boot and
// persisted to `generated/runtime-evidence-bundle.json` by the
// e2e harness) and emits a runtime-backed conformance manifest.
//
// This generator REPLACES the older static-source variant: the
// resulting `generated/runtime-conformance-manifest.json` is now
// derived from real runtime probes, not from filesystem scans.
//
// If no bundle is present, the generator emits an explicitly
// degraded manifest with `evidenceState: "missing"` so downstream
// validators can detect drift.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface RecordShape {
  collectorId: string;
  manifestId: string;
  capturedAt: string;
  runtimeTier: string;
  ok: boolean;
  itemCount: number;
  payload: Record<string, unknown>;
  warnings: string[];
  errors: string[];
}

interface BundleShape {
  bundleVersion: 1;
  generatedAt: string;
  runtimeTier: string;
  records: RecordShape[];
  coverage: Record<string, number>;
}

const cwd = process.cwd();
const bundlePath = path.join(cwd, "generated", "runtime-evidence-bundle.json");
const outPath = path.join(cwd, "generated", "runtime-conformance-manifest.json");

function readBundle(): BundleShape | null {
  if (!fs.existsSync(bundlePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(bundlePath, "utf-8")) as BundleShape;
  } catch (e) {
    console.error(`  ❌ Failed to parse runtime evidence bundle: ${(e as Error).message}`);
    return null;
  }
}

const bundle = readBundle();

let manifest: Record<string, unknown>;

if (!bundle) {
  manifest = {
    schemaVersion: 2,
    evidenceState: "missing",
    generatedAt: new Date().toISOString(),
    note: "No runtime evidence bundle present. Run `npm run runtime:capture-evidence` after booting the app to populate generated/runtime-evidence-bundle.json.",
    records: [],
    summary: { totalRecords: 0, ok: 0, withWarnings: 0, withErrors: 0 },
  };
  console.log("  ⚠️  No runtime evidence bundle — emitting degraded manifest");
} else {
  const ok = bundle.records.filter((r) => r.ok).length;
  const withWarnings = bundle.records.filter((r) => r.warnings.length > 0).length;
  const withErrors = bundle.records.filter((r) => r.errors.length > 0).length;
  manifest = {
    schemaVersion: 2,
    evidenceState: "live",
    generatedAt: new Date().toISOString(),
    capturedAt: bundle.generatedAt,
    runtimeTier: bundle.runtimeTier,
    coverage: bundle.coverage,
    records: bundle.records.map((r) => ({
      collectorId: r.collectorId,
      manifestId: r.manifestId,
      capturedAt: r.capturedAt,
      ok: r.ok,
      itemCount: r.itemCount,
      warningCount: r.warnings.length,
      errorCount: r.errors.length,
      summary: r.payload,
    })),
    summary: { totalRecords: bundle.records.length, ok, withWarnings, withErrors },
  };
  console.log(`  ✅ Runtime conformance manifest derived from ${bundle.records.length} live records`);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
console.log(`  📝 Wrote ${path.relative(cwd, outPath)}`);
