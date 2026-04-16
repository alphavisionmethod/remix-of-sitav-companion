#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Manifest vs Imports Linkage Check
// Diffs generated/service-manifest.json against actual import graph
// ═══════════════════════════════════════════════════════════════
//
// Source of truth: src/lib/services/* + src/lib/core-services/* on disk
// Failure: manifest claims services that don't exist OR services exist
// on disk but aren't tracked in the manifest.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const MANIFEST_PATH = "generated/service-manifest.json";

const manifest = readJsonSafe<any>(MANIFEST_PATH);
if (!manifest) {
  vc.add(MANIFEST_PATH, "missing", "Service manifest does not exist", "error");
  vc.report("check-service-manifest-vs-imports");
  vc.exitIfErrors();
  process.exit(0);
}

const manifestServices: Array<{ name: string; path?: string }> =
  manifest.services || manifest.entries || [];

const manifestPaths = new Set(
  manifestServices.map((s) => s.path).filter(Boolean) as string[]
);

// ── Filesystem inventory ───────────────────────────────────────
const serviceDirs = ["src/lib/services", "src/lib/core-services"];
const fsServices = new Set<string>();

for (const dir of serviceDirs) {
  const files = scanDir(dir, [".ts", ".tsx"]).filter(
    (f) =>
      !f.includes("__tests__") &&
      !f.endsWith(".test.ts") &&
      !f.endsWith(".test.tsx") &&
      !f.endsWith(".d.ts") &&
      path.basename(f) !== "index.ts"
  );
  for (const f of files) fsServices.add(f);
}

// ── Diff ───────────────────────────────────────────────────────
let manifestOnly = 0;
let fsOnly = 0;
const manifestOnlySamples: string[] = [];
const fsOnlySamples: string[] = [];

for (const p of manifestPaths) {
  if (!fs.existsSync(p)) {
    manifestOnly++;
    manifestOnlySamples.push(p);
  }
}
for (const p of fsServices) {
  if (!manifestPaths.has(p)) {
    fsOnly++;
    fsOnlySamples.push(p);
  }
}

const SAMPLE_LIMIT = 6;
if (manifestOnly > 0) {
  vc.add(
    MANIFEST_PATH,
    "manifest-claims-missing-service",
    `${manifestOnly} service(s) in manifest reference files not on disk. Sample: ${manifestOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    "error"
  );
}
if (fsOnly > 0) {
  vc.add(
    MANIFEST_PATH,
    "service-on-disk-not-in-manifest",
    `${fsOnly} service file(s) on disk not in manifest (regenerate service-manifest). Sample: ${fsOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    "warning"
  );
}

console.log(
  `  ⚙️  Services — manifest: ${manifestPaths.size}, filesystem: ${fsServices.size}`
);
console.log(
  `  📊 Drift — manifest→missing-fs: ${manifestOnly}, fs→missing-manifest: ${fsOnly}`
);

vc.report("check-service-manifest-vs-imports");
vc.exitIfErrors();
