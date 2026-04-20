#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// BLOCK Gate — Public Artifact Mirror Drift Detector
// Asserts public/generated/artifacts/ is in sync with the mirror
// policy and that the artifact-index.json is well-formed. This
// gate is gate #22 in the master release-readiness aggregator.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  resolveMirrorMatches,
  PUBLIC_MIRROR_ROOT,
  PUBLIC_INDEX_PATH,
  MIRROR_MIN_THRESHOLD,
} from "../lib/public-mirror-policy";
import { emitGateReport, GateIssue } from "../../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

function sha256File(p: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const matches = resolveMirrorMatches();
const expectedRelPaths = new Set(matches.map((m) => m.mirroredRelPath));

// 1) Every policy-matched artifact exists in the mirror with matching hash
for (const m of matches) {
  const destAbs = path.join(PUBLIC_MIRROR_ROOT, m.mirroredRelPath);
  if (!fs.existsSync(destAbs)) {
    issues.push({
      severity: "error",
      area: "mirror-missing",
      message: `Policy-matched artifact missing in public mirror: ${m.mirroredRelPath} (source: ${m.sourcePath}). Run: npx tsx scripts/manifests/generate/generate-public-artifact-mirror.ts`,
    });
    continue;
  }
  if (sha256File(destAbs) !== sha256File(m.sourcePath)) {
    issues.push({
      severity: "error",
      area: "mirror-stale",
      message: `Mirror content drifted from source: ${m.mirroredRelPath}. Run: npx tsx scripts/manifests/generate/generate-public-artifact-mirror.ts`,
    });
  }
}

// 2) No orphan files in the mirror root that aren't in the policy
const onDisk = walk(PUBLIC_MIRROR_ROOT)
  .map((p) => path.relative(PUBLIC_MIRROR_ROOT, p).split(path.sep).join("/"));
for (const rel of onDisk) {
  if (!expectedRelPaths.has(rel)) {
    issues.push({
      severity: "error",
      area: "mirror-orphan",
      message: `Orphan file in public mirror not matched by policy: ${rel}. Run the generator to prune.`,
    });
  }
}

// 3) artifact-index.json exists, parses, and aligns with mirror contents
let indexedCount = 0;
if (!fs.existsSync(PUBLIC_INDEX_PATH)) {
  issues.push({
    severity: "error",
    area: "index-missing",
    message: `${PUBLIC_INDEX_PATH} not found. Run the generator.`,
  });
} else {
  try {
    const idx = JSON.parse(fs.readFileSync(PUBLIC_INDEX_PATH, "utf-8"));
    if (typeof idx?.totalArtifacts !== "number" || !Array.isArray(idx?.categories)) {
      issues.push({
        severity: "error",
        area: "index-malformed",
        message: `${PUBLIC_INDEX_PATH} is missing required fields (totalArtifacts, categories[]).`,
      });
    } else {
      indexedCount = idx.totalArtifacts;
      if (indexedCount !== matches.length) {
        issues.push({
          severity: "error",
          area: "index-drift",
          message: `Index totalArtifacts=${indexedCount} but policy resolves ${matches.length} matches. Regenerate.`,
        });
      }
      for (const cat of idx.categories) {
        for (const f of cat.files ?? []) {
          if (!expectedRelPaths.has(f.path)) {
            issues.push({
              severity: "error",
              area: "index-stale-entry",
              message: `Index references file no longer in policy: ${f.path}`,
            });
          }
        }
      }
    }
  } catch (err) {
    issues.push({
      severity: "error",
      area: "index-parse-error",
      message: `Failed to parse ${PUBLIC_INDEX_PATH}: ${(err as Error).message}`,
    });
  }
}

// 4) Minimum threshold (must surface materially more than the historical ~10)
if (matches.length < MIRROR_MIN_THRESHOLD) {
  issues.push({
    severity: "error",
    area: "mirror-coverage-too-low",
    message: `Mirror exposes only ${matches.length} artifacts; minimum threshold is ${MIRROR_MIN_THRESHOLD}. Broaden the policy in scripts/architecture/lib/public-mirror-policy.ts.`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const reportPath = emitGateReport({
  gate: "public-artifact-mirror",
  ok,
  issues,
  extra: {
    policyMatches: matches.length,
    indexedCount,
    mirrorRoot: PUBLIC_MIRROR_ROOT,
    indexPath: PUBLIC_INDEX_PATH,
    minThreshold: MIRROR_MIN_THRESHOLD,
  },
});

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
console.log(
  `${ok ? "✅" : "❌"} public-artifact-mirror: ${matches.length} mirrored, ${errorCount} error(s), ${warningCount} warning(s) → ${reportPath}`,
);

if (!ok) process.exit(1);
