/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 6 BLOCK Gate: OVA Artifact Presence
//
// Physically verifies the VMware OVA appliance was produced.
// Mode logic mirrors check-iso-artifact-presence.ts (ci|dev).
//
// Output: generated/ova-artifact-presence-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Issue { severity: "error" | "warning"; area: string; message: string; }

const MODE = (process.env.SITA_RELEASE_MODE === "ci" ? "ci" : "dev") as "ci" | "dev";
const OUT_DIR = process.env.SITA_OUT_DIR || "out";

const issues: Issue[] = [];
const found: { ova: string[]; sha256: string[]; manifest: string[] } = {
  ova: [], sha256: [], manifest: [],
};

if (existsSync(OUT_DIR)) {
  for (const f of readdirSync(OUT_DIR)) {
    if (/^sita-os-.*-amd64\.ova$/.test(f)) found.ova.push(f);
    else if (/^sita-os-.*-amd64\.ova\.sha256$/.test(f)) found.sha256.push(f);
    else if (/^sita-os-.*-amd64\.ova\.manifest\.json$/.test(f)) found.manifest.push(f);
  }
}

if (MODE === "ci") {
  if (found.ova.length === 0) {
    issues.push({ severity: "error", area: "ova", message: `No OVA found in ${OUT_DIR}/ (expected sita-os-<version>-amd64.ova)` });
  }
  if (found.sha256.length === 0) {
    issues.push({ severity: "error", area: "ova", message: `No OVA checksum found (expected *.ova.sha256)` });
  }
  if (found.manifest.length === 0) {
    issues.push({ severity: "error", area: "ova", message: `No OVA manifest found (expected *.ova.manifest.json)` });
  }
  for (const ova of found.ova) {
    if (!found.sha256.includes(`${ova}.sha256`)) {
      issues.push({ severity: "error", area: "ova", message: `OVA ${ova} has no matching .sha256` });
    }
    if (!found.manifest.includes(`${ova}.manifest.json`)) {
      issues.push({ severity: "error", area: "ova", message: `OVA ${ova} has no matching .manifest.json` });
    }
    try {
      const s = statSync(join(OUT_DIR, ova));
      if (s.size < 100 * 1024 * 1024) {
        issues.push({ severity: "error", area: "ova", message: `OVA ${ova} is suspiciously small (${s.size} bytes); expected ≥ 100 MiB` });
      }
    } catch { /* unreachable */ }
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/ova-artifact-presence-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "ova-artifact-presence",
  phase: "wave-6-iso-ova-raw-production",
  mode: MODE,
  outDir: OUT_DIR,
  found,
  errorCount,
  warningCount,
  ok,
  issues,
}, null, 2));

console.log(`OVA artifact presence (mode=${MODE}): ${ok ? `✅ OK (ova=${found.ova.length}, sha256=${found.sha256.length}, manifest=${found.manifest.length})` : `❌ ${errorCount} errors`}`);
if (!ok) {
  for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
