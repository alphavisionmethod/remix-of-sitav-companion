#!/usr/bin/env tsx
/**
 * Wave D §D.3 — Reverse-Dependency Retirement Policy Manifest
 *
 * Emits the canonical map of frozen subtrees → required evidence kinds.
 * Read by the completeness validator to know what to check.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "generated", "manifests", "reverse-dependency-retirement-policy.json");

const policy = {
  generatedAt: new Date().toISOString(),
  schemaVersion: 1,
  rule: "Constitution Rule 47 (Wave D §D.3 — Reverse-Dependency Retirement Law)",
  evidenceKinds: ["grepProof", "manifestProof", "routeProof", "testProof", "docsProof"],
  mergeAdditional: ["duplicateReconciliation"],
  scopes: {
    grepProof: ["src"],
    manifestProof: ["generated/manifests"],
    routeProof: ["src/routes", "src/App.tsx"],
    testProof: ["tests", "src/__tests__"],
    docsProof: ["docs", "generated/audits"],
  },
  frozenSubtrees: [
    {
      pattern: "src/components/**",
      requiredEvidence: ["grepProof", "manifestProof", "routeProof", "testProof", "docsProof"],
      governingRule: "Wave C §C.1 — UI Ownership Law",
    },
    {
      pattern: "src/pages/**",
      requiredEvidence: ["grepProof", "manifestProof", "routeProof", "testProof", "docsProof"],
      governingRule: "Wave 0.7 — Semantic Route-Adapter Contract",
    },
    {
      pattern: "src/admin/**",
      requiredEvidence: ["grepProof", "manifestProof", "routeProof", "testProof", "docsProof"],
      governingRule: "Wave 0.6 — Admin Plane Law",
    },
    {
      pattern: "src/platform/**",
      requiredEvidence: ["grepProof", "manifestProof", "routeProof", "testProof", "docsProof"],
      governingRule: "Wave 0.5 — Platform Subclassification",
    },
    {
      pattern: "src/modules/**",
      requiredEvidence: ["grepProof", "manifestProof", "routeProof", "testProof", "docsProof"],
      governingRule: "Constitution Rule 1–4 — Pillar Boundaries",
    },
    {
      pattern: "src/contracts/**",
      requiredEvidence: ["grepProof", "manifestProof", "testProof", "docsProof"],
      governingRule: "Wave 1.2 — Contract Layer Ownership",
    },
    {
      pattern: "src/domains/**",
      requiredEvidence: ["grepProof", "manifestProof", "testProof", "docsProof"],
      governingRule: "Constitution Rule 6 / 41 — Domain Purity",
    },
    {
      pattern: "src/lib/services/**",
      requiredEvidence: ["grepProof", "manifestProof", "testProof", "docsProof"],
      governingRule: "Service Layer Constitution",
    },
    {
      pattern: "supabase/functions/**",
      requiredEvidence: ["grepProof", "manifestProof", "testProof", "docsProof"],
      governingRule: "Wave B §B.2 — Frontend/Backend Boundary",
    },
  ],
  archiveExceptions: [
    "archive/**",
    "generated/historical/**",
    "generated/audits/**",
    "generated/manifests/safe-change-evidence-ledger.json",
  ],
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(policy, null, 2) + "\n", "utf8");
console.log(`✅ ${OUT} (${policy.frozenSubtrees.length} frozen subtrees)`);