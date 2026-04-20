/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 6 BLOCK Gate: RAW IMG Artifact Presence
//
// Physically verifies the cloud-init flashable raw IMG was produced.
// Mode logic mirrors check-iso-artifact-presence.ts (ci|dev).
//
// Output: generated/raw-img-artifact-presence-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Issue { severity: "error" | "warning"; area: string; message: string; }

const MODE = (process.env.SITA_RELEASE_MODE === "ci" ? "ci" : "dev") as "ci" | "dev";
const OUT_DIR = process.env.SITA_OUT_DIR || "out";

const issues: Issue[] = [];
const found: { img: string[]; sha256: string[]; manifest: string[] } = {
  img: [], sha256: [], manifest: [],
};

if (existsSync(OUT_DIR)) {
  for (const f of readdirSync(OUT_DIR)) {
    if (/^sita-os-.*-amd64\.img$/.test(f)) found.img.push(f);
    else if (/^sita-os-.*-amd64\.img\.sha256$/.test(f)) found.sha256.push(f);
    else if (/^sita-os-.*-amd64\.img\.manifest\.json$/.test(f)) found.manifest.push(f);
  }
}

if (MODE === "ci") {
  if (found.img.length === 0) {
    issues.push({ severity: "error", area: "img", message: `No raw IMG found in ${OUT_DIR}/ (expected sita-os-<version>-amd64.img)` });
  }
  if (found.sha256.length === 0) {
    issues.push({ severity: "error", area: "img", message: `No IMG checksum found (expected *.img.sha256)` });
  }
  // Manifest is recommended but not strictly required for raw IMG
  if (found.manifest.length === 0) {
    issues.push({ severity: "warning", area: "img", message: `No IMG manifest found (expected *.img.manifest.json) — recommended for cloud-import provenance` });
  }
  for (const img of found.img) {
    if (!found.sha256.includes(`${img}.sha256`)) {
      issues.push({ severity: "error", area: "img", message: `IMG ${img} has no matching .sha256` });
    }
    try {
      const s = statSync(join(OUT_DIR, img));
      if (s.size < 100 * 1024 * 1024) {
        issues.push({ severity: "error", area: "img", message: `IMG ${img} is suspiciously small (${s.size} bytes); expected ≥ 100 MiB` });
      }
    } catch { /* unreachable */ }
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/raw-img-artifact-presence-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "raw-img-artifact-presence",
  phase: "wave-6-iso-ova-raw-production",
  mode: MODE,
  outDir: OUT_DIR,
  found,
  errorCount,
  warningCount,
  ok,
  issues,
}, null, 2));

console.log(`RAW IMG artifact presence (mode=${MODE}): ${ok ? `✅ OK (img=${found.img.length}, sha256=${found.sha256.length}, manifest=${found.manifest.length})` : `❌ ${errorCount} errors`}`);
if (!ok) {
  for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
