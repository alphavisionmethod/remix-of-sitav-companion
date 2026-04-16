#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Manifest vs Registrations Linkage Check
// Diffs generated/capability-index.json against actual capability
// declaration sites in source code
// ═══════════════════════════════════════════════════════════════
//
// Source of truth: capability declarations in src/packages/*-contracts/
// + registerCapability(...) call sites + CapabilityClass enums
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, scanDir, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const MANIFEST_PATH = "generated/capability-index.json";

const manifest = readJsonSafe<any>(MANIFEST_PATH);
if (!manifest) {
  vc.add(MANIFEST_PATH, "missing", "Capability index does not exist", "error");
  vc.report("check-capability-manifest-vs-registrations");
  vc.exitIfErrors();
  process.exit(0);
}

const manifestCaps: Array<{ name: string; source?: string }> =
  manifest.capabilities || manifest.entries || [];
const manifestNames = new Set(manifestCaps.map((c) => c.name).filter(Boolean));
const manifestSources = new Set(
  manifestCaps.map((c) => c.source).filter(Boolean) as string[]
);

// ── Scan source for capability declarations ────────────────────
//   patterns:
//     registerCapability(...)
//     CapabilityClass.X
//     export const X: CapabilityId = "..."
//     export type/const ending in CapabilityId / CapabilityKey
const sourceFiles = scanDir("src", [".ts", ".tsx"]).filter(
  (f) =>
    !f.includes("__tests__") &&
    !f.endsWith(".test.ts") &&
    !f.endsWith(".test.tsx") &&
    !f.endsWith(".d.ts")
);

const fsCapabilityNames = new Set<string>();
const fsCapabilitySources = new Set<string>();

const declRx =
  /export\s+(?:const|type|interface)\s+(\w*(?:Capability(?:Id|Key|Class)?|DomainId)\w*)/g;
const registerRx = /registerCapability\s*\(\s*["'`]([\w\-.]+)["'`]/g;

for (const file of sourceFiles) {
  let content: string;
  try {
    content = fs.readFileSync(file, "utf-8");
  } catch {
    continue;
  }

  let touched = false;
  let m: RegExpExecArray | null;
  while ((m = declRx.exec(content)) !== null) {
    fsCapabilityNames.add(m[1]);
    touched = true;
  }
  while ((m = registerRx.exec(content)) !== null) {
    fsCapabilityNames.add(m[1]);
    touched = true;
  }
  if (touched) fsCapabilitySources.add(file);

  // Reset lastIndex (regex with /g shares state across iterations of for-loop)
  declRx.lastIndex = 0;
  registerRx.lastIndex = 0;
}

// ── Diff ───────────────────────────────────────────────────────
let manifestOnly = 0;
let fsOnly = 0;
const manifestOnlySamples: string[] = [];
const fsOnlySamples: string[] = [];

for (const name of manifestNames) {
  if (!fsCapabilityNames.has(name as string)) {
    manifestOnly++;
    manifestOnlySamples.push(name as string);
  }
}
for (const name of fsCapabilityNames) {
  if (!manifestNames.has(name)) {
    fsOnly++;
    fsOnlySamples.push(name);
  }
}

// Also verify every manifest source path exists
let missingSources = 0;
const missingSourceSamples: string[] = [];
for (const src of manifestSources) {
  if (!fs.existsSync(src)) {
    missingSources++;
    missingSourceSamples.push(src);
  }
}

const SAMPLE_LIMIT = 8;
if (manifestOnly > 0) {
  // Capabilities scanner is heuristic — keep as warning unless drift is huge
  const severity = manifestOnly > manifestNames.size * 0.5 ? "error" : "warning";
  vc.add(
    MANIFEST_PATH,
    "manifest-capability-not-found-in-source",
    `${manifestOnly} capability name(s) in manifest not detected in source declarations. Sample: ${manifestOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    severity
  );
}
if (missingSources > 0) {
  vc.add(
    MANIFEST_PATH,
    "manifest-source-path-missing",
    `${missingSources} capability source path(s) reference files not on disk. Sample: ${missingSourceSamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    "error"
  );
}
if (fsOnly > 0) {
  vc.add(
    MANIFEST_PATH,
    "source-capability-not-in-manifest",
    `${fsOnly} capability declaration(s) in source not in manifest (regenerate). Sample: ${fsOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    "warning"
  );
}

console.log(
  `  🎯 Capabilities — manifest: ${manifestNames.size}, source declarations: ${fsCapabilityNames.size}, missing source files: ${missingSources}`
);
console.log(
  `  📊 Drift — manifest→missing-src: ${manifestOnly}, src→missing-manifest: ${fsOnly}`
);

vc.report("check-capability-manifest-vs-registrations");
vc.exitIfErrors();
