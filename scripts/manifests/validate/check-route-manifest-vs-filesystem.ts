#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Manifest vs Filesystem Linkage Check
// Diffs generated/route-manifest.json against actual src/pages/**
// ═══════════════════════════════════════════════════════════════
//
// Source of truth: filesystem (src/pages/**/*.tsx + router config)
// Failure: drift between manifest and real route inventory
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const MANIFEST_PATH = "generated/route-manifest.json";

// ── Read the manifest ───────────────────────────────────────────
const manifest = readJsonSafe<any>(MANIFEST_PATH);
if (!manifest) {
  vc.add(MANIFEST_PATH, "missing", "Route manifest does not exist", "error");
  vc.report("check-route-manifest-vs-filesystem");
  vc.exitIfErrors();
  process.exit(0);
}

const manifestRoutes: Array<{ path: string; component?: string }> =
  manifest.routes || manifest.entries || [];

const manifestComponents = new Set(
  manifestRoutes.map((r) => r.component).filter(Boolean) as string[]
);

// ── Scan filesystem for page components ─────────────────────────
const pageFiles = scanDir("src/pages", [".tsx"]).filter(
  (f) => !f.includes("__tests__") && !f.endsWith(".test.tsx") && !f.endsWith(".stories.tsx")
);

const fsComponents = new Set<string>();
for (const file of pageFiles) {
  const base = path.basename(file, ".tsx");
  // Skip index files and barrel exports
  if (base === "index") {
    // For index.tsx, use the parent directory name
    const parent = path.basename(path.dirname(file));
    fsComponents.add(parent);
  } else {
    fsComponents.add(base);
  }
}

// Also scan src/routes/ for any inline route components
const routeFiles = scanDir("src/routes", [".tsx", ".ts"]);
for (const file of routeFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const componentRefs = content.match(/(?:component:|element=\{<)\s*<?(\w+)/g) || [];
  for (const ref of componentRefs) {
    const name = ref.replace(/.*[<\s]/, "").replace(/\W.*/, "");
    if (name && /^[A-Z]/.test(name)) fsComponents.add(name);
  }
}

// ── Diff ────────────────────────────────────────────────────────
let inManifestOnly = 0;
let onFsOnly = 0;
const inManifestNotFs: string[] = [];
const onFsNotManifest: string[] = [];

for (const comp of manifestComponents) {
  if (!fsComponents.has(comp)) {
    inManifestNotFs.push(comp);
    inManifestOnly++;
  }
}
for (const comp of fsComponents) {
  if (!manifestComponents.has(comp)) {
    onFsNotManifest.push(comp);
    onFsOnly++;
  }
}

// Manifest-only is the dangerous direction (claims routes that don't exist)
const SAMPLE_LIMIT = 8;
if (inManifestOnly > 0) {
  // Heuristic: some "missing components" are lazy-loaded via dynamic
  // imports we don't statically resolve. Error only when drift exceeds
  // 10% of the manifest.
  const ratio = inManifestOnly / Math.max(manifestComponents.size, 1);
  const severity = ratio > 0.1 ? "error" : "warning";
  vc.add(
    MANIFEST_PATH,
    "manifest-claims-missing-component",
    `${inManifestOnly} route(s) in manifest reference components not found on disk. Sample: ${inManifestNotFs.slice(0, SAMPLE_LIMIT).join(", ")}`,
    severity
  );
}

// FS-only is informational drift (real pages not yet in manifest)
if (onFsOnly > 0) {
  vc.add(
    MANIFEST_PATH,
    "filesystem-component-not-in-manifest",
    `${onFsOnly} page component(s) on disk are not listed in the manifest (regenerate route-manifest). Sample: ${onFsNotManifest.slice(0, SAMPLE_LIMIT).join(", ")}`,
    "warning"
  );
}

console.log(
  `  🛤️  Routes — manifest: ${manifestComponents.size}, filesystem: ${fsComponents.size}`
);
console.log(
  `  📊 Drift — manifest→missing-fs: ${inManifestOnly}, fs→missing-manifest: ${onFsOnly}`
);

vc.report("check-route-manifest-vs-filesystem");
vc.exitIfErrors();
