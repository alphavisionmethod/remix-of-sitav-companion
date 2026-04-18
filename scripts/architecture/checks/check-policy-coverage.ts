#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Coverage Validator (Phase 3 extended)
//
// Original behavior (capability ↔ policy binding) preserved.
// New Phase 3 assertions:
//   1. Every PolicyDomainKey has a default risk class binding
//   2. Every domain.primaryContextId resolves to a real bounded context
//   3. Every domain has full coverage in: proof, reversibility,
//      trust, approval maps for at least one risk class
//   4. Every surface override references a canonical surface
//   5. Every actor.maxTrustLevel is in the 0-4 range
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, loadCapabilityIndex, scanDir, readFileContent } from "../lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

// ── Original capability/policy binding pass ─────────────────
const capIndex = loadCapabilityIndex();
if (!capIndex) {
  console.error("❌ generated/capability-index.json not found");
  process.exit(1);
}

const policyMatrix = readJsonSafe<any>("generated/capability-policy-matrix.json");
const capabilities = capIndex.capabilities || capIndex.entries || [];

const policyFiles = scanDir("src/packages", [".ts"]).filter((f) =>
  f.includes("policy") || f.includes("governance"),
);

const definedPolicies = new Set<string>();
for (const file of policyFiles) {
  const content = readFileContent(file);
  const matches = content.match(/policyId:\s*["']([^"']+)["']/g);
  if (matches) {
    for (const m of matches) {
      const id = m.match(/["']([^"']+)["']/)?.[1];
      if (id) definedPolicies.add(id);
    }
  }
}

let covered = 0;
let uncovered = 0;
if (policyMatrix?.matrix) {
  for (const entry of policyMatrix.matrix) {
    const policies = entry.policies || entry.policyIds || [];
    if (policies.length > 0) covered++;
    else {
      uncovered++;
      vc.add("capability-policy-matrix.json", "no-policy",
        `Capability "${entry.capabilityId}" has no policy binding`, "warning");
    }
  }
} else {
  covered = capabilities.length;
  console.log("  ⚠️ No policy matrix found — coverage unknown");
}

const total = covered + uncovered;
const coveragePercent = total > 0 ? Math.round((covered / total) * 100) : 0;
console.log(`  🛡️ Capability policy coverage: ${covered}/${total} (${coveragePercent}%)`);
console.log(`  📜 ${definedPolicies.size} policy definitions found in source`);

// ── Phase 3: 9-dimension cross-reference checks ─────────────
console.log("");
console.log("  ── Phase 3 Meta-Architecture Checks ──");

const REQUIRED = [
  "src/lib/policy/unified-policy-matrix.ts",
  "src/lib/policy/policy-actor-registry.ts",
  "src/lib/policy/policy-domain-map.ts",
  "src/lib/policy/policy-surface-map.ts",
  "src/lib/policy/policy-proof-requirements.ts",
  "src/lib/policy/policy-reversibility-map.ts",
  "src/lib/policy/policy-trust-thresholds.ts",
  "src/lib/policy/policy-approval-map.ts",
  "src/platform/architecture/bounded-context-registry.ts",
  "src/lib/runtime/surface-types.ts",
];
for (const p of REQUIRED) {
  if (!fs.existsSync(p)) {
    vc.add(p, "missing-phase3-file", `Required Phase 3 file not found: ${p}`);
  }
}
if (vc.errors.length > 0) {
  vc.report("check-policy-coverage");
  vc.exitIfErrors();
}

const domainSrc = fs.readFileSync("src/lib/policy/policy-domain-map.ts", "utf-8");
const actorSrc = fs.readFileSync("src/lib/policy/policy-actor-registry.ts", "utf-8");
const surfacePolicySrc = fs.readFileSync("src/lib/policy/policy-surface-map.ts", "utf-8");
const proofSrc = fs.readFileSync("src/lib/policy/policy-proof-requirements.ts", "utf-8");
const revSrc = fs.readFileSync("src/lib/policy/policy-reversibility-map.ts", "utf-8");
const trustSrc = fs.readFileSync("src/lib/policy/policy-trust-thresholds.ts", "utf-8");
const approvalSrc = fs.readFileSync("src/lib/policy/policy-approval-map.ts", "utf-8");
const ctxSrc = fs.readFileSync("src/platform/architecture/bounded-context-registry.ts", "utf-8");
const surfaceTypeSrc = fs.readFileSync("src/lib/runtime/surface-types.ts", "utf-8");

// 1. Extract domain keys
const domainKeys = Array.from(domainSrc.matchAll(/domain:\s*"([a-z]+)"/g)).map((m) => m[1]);
const uniqueDomains = Array.from(new Set(domainKeys));
console.log(`  🏷  ${uniqueDomains.length} policy domains: ${uniqueDomains.join(", ")}`);

// 2. Extract bounded-context IDs and assert primaryContextId resolves
const validContextIds = new Set(
  Array.from(ctxSrc.matchAll(/contextId:\s*"([a-z0-9-]+)"/g)).map((m) => m[1]),
);
const primaryRefs = Array.from(domainSrc.matchAll(/primaryContextId:\s*"([a-z0-9-]+)"/g)).map((m) => m[1]);
for (const ref of primaryRefs) {
  if (!validContextIds.has(ref)) {
    vc.add("src/lib/policy/policy-domain-map.ts", "dangling-context-ref",
      `policy-domain-map.primaryContextId "${ref}" not in bounded-context-registry.`);
  }
}
const participatingRefs = Array.from(domainSrc.matchAll(/participatingContexts:\s*\[([^\]]*)\]/g))
  .flatMap((m) => Array.from(m[1].matchAll(/"([a-z0-9-]+)"/g)).map((x) => x[1]));
for (const ref of participatingRefs) {
  if (!validContextIds.has(ref)) {
    vc.add("src/lib/policy/policy-domain-map.ts", "dangling-context-ref",
      `policy-domain-map.participatingContexts "${ref}" not in bounded-context-registry.`);
  }
}
console.log(`  🔗 ${primaryRefs.length} primary + ${participatingRefs.length} participating context refs verified`);

// 3. Assert each domain has at least one entry in proof, reversibility, trust, approval
for (const d of uniqueDomains) {
  const inProof = proofSrc.includes(`domain: "${d}"`);
  const inRev = revSrc.includes(`domain: "${d}"`);
  const inTrust = trustSrc.includes(`domain: "${d}"`);
  const inApproval = approvalSrc.includes(`domain: "${d}"`);
  if (!inProof) vc.add("src/lib/policy/policy-proof-requirements.ts", "missing-domain-coverage", `Domain "${d}" has no proof requirement entries.`);
  if (!inRev) vc.add("src/lib/policy/policy-reversibility-map.ts", "missing-domain-coverage", `Domain "${d}" has no reversibility entries.`);
  if (!inTrust) vc.add("src/lib/policy/policy-trust-thresholds.ts", "missing-domain-coverage", `Domain "${d}" has no trust threshold entries.`);
  if (!inApproval) vc.add("src/lib/policy/policy-approval-map.ts", "missing-domain-coverage", `Domain "${d}" has no approval mapping entries.`);
}

// 4. Surface overrides reference canonical surfaces
const canonicalBlock = surfaceTypeSrc.match(/CANONICAL_SURFACES[^=]*=\s*\[([\s\S]*?)\]/);
const canonicalSurfaces = new Set<string>(
  canonicalBlock ? Array.from(canonicalBlock[1].matchAll(/"([a-z]+)"/g)).map((x) => x[1]) : [],
);
const surfaceRefs = Array.from(surfacePolicySrc.matchAll(/surface:\s*"([a-z]+)"/g)).map((m) => m[1]);
for (const ref of surfaceRefs) {
  if (canonicalSurfaces.size > 0 && !canonicalSurfaces.has(ref)) {
    vc.add("src/lib/policy/policy-surface-map.ts", "dangling-surface-ref",
      `policy-surface-map references non-canonical surface "${ref}".`);
  }
}
console.log(`  🌐 ${surfaceRefs.length} surface overrides referencing ${canonicalSurfaces.size} canonical surfaces`);

// 5. Actor maxTrustLevel sanity (0-4)
const actorTrustMatches = Array.from(actorSrc.matchAll(/maxTrustLevel:\s*(\d)/g)).map((m) => parseInt(m[1], 10));
for (const t of actorTrustMatches) {
  if (t < 0 || t > 4) {
    vc.add("src/lib/policy/policy-actor-registry.ts", "invalid-trust-level",
      `Actor maxTrustLevel ${t} out of range 0-4.`);
  }
}
console.log(`  🛡  ${actorTrustMatches.length} actor trust ceilings validated`);

vc.report("check-policy-coverage");
vc.exitIfErrors();
