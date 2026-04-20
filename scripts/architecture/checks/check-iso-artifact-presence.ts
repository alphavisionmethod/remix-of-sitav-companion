/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 6 BLOCK Gate: ISO Artifact Presence
//
// Physically verifies that the ISO build actually produced its
// release artifacts on disk (not just that the build scripts exist).
//
// Modes (selected by SITA_RELEASE_MODE env var):
//   • ci   → out/sita-os-*.iso + .sha256 + .manifest.json MUST exist
//   • dev  → artifacts may be absent; gate reports OK with mode=dev
//
// CI sets SITA_RELEASE_MODE=ci after the ISO build step. Local dev
// runs default to "dev" so unrelated work isn't blocked.
//
// Output: generated/iso-artifact-presence-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Issue { severity: "error" | "warning"; area: string; message: string; }

const MODE = (process.env.SITA_RELEASE_MODE === "ci" ? "ci" : "dev") as "ci" | "dev";
const OUT_DIR = process.env.SITA_OUT_DIR || "out";

const issues: Issue[] = [];
const found: { iso: string[]; sha256: string[]; manifest: string[] } = {
  iso: [], sha256: [], manifest: [],
};

if (existsSync(OUT_DIR)) {
  for (const f of readdirSync(OUT_DIR)) {
    if (/^sita-os-.*-amd64\.iso$/.test(f)) found.iso.push(f);
    else if (/^sita-os-.*-amd64\.iso\.sha256$/.test(f)) found.sha256.push(f);
    else if (/^sita-os-.*-amd64\.iso\.manifest\.json$/.test(f)) found.manifest.push(f);
  }
}

if (MODE === "ci") {
  if (found.iso.length === 0) {
    issues.push({ severity: "error", area: "iso", message: `No ISO found in ${OUT_DIR}/ (expected sita-os-<version>-amd64.iso)` });
  }
  if (found.sha256.length === 0) {
    issues.push({ severity: "error", area: "iso", message: `No ISO checksum found (expected *.iso.sha256)` });
  }
  if (found.manifest.length === 0) {
    issues.push({ severity: "error", area: "iso", message: `No ISO build manifest found (expected *.iso.manifest.json)` });
  }
  // Each ISO must have a matching .sha256 and .manifest.json
  for (const iso of found.iso) {
    if (!found.sha256.includes(`${iso}.sha256`)) {
      issues.push({ severity: "error", area: "iso", message: `ISO ${iso} has no matching .sha256` });
    }
    if (!found.manifest.includes(`${iso}.manifest.json`)) {
      issues.push({ severity: "error", area: "iso", message: `ISO ${iso} has no matching .manifest.json` });
    }
    // Sanity check: ISO must be > 100 MiB (a real Ubuntu-derived ISO)
    try {
      const s = statSync(join(OUT_DIR, iso));
      if (s.size < 100 * 1024 * 1024) {
        issues.push({ severity: "error", area: "iso", message: `ISO ${iso} is suspiciously small (${s.size} bytes); expected ≥ 100 MiB` });
      }
    } catch { /* unreachable */ }
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/iso-artifact-presence-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "iso-artifact-presence",
  phase: "wave-6-iso-ova-raw-production",
  mode: MODE,
  outDir: OUT_DIR,
  found,
  errorCount,
  warningCount,
  ok,
  issues,
}, null, 2));

console.log(`ISO artifact presence (mode=${MODE}): ${ok ? `✅ OK (iso=${found.iso.length}, sha256=${found.sha256.length}, manifest=${found.manifest.length})` : `❌ ${errorCount} errors`}`);
if (!ok) {
  for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
