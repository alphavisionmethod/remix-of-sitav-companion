#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Authority Completeness Check
// Fails CI if any authoritative manifest is missing required metadata
// ═══════════════════════════════════════════════════════════════
//
// Required metadata for every authoritative entry:
//   - validator (path to generator/validator script)
//   - ciGate (CI workflow name)
//   - sourceInputs (at least 1 real authoritative input, not another manifest)
//   - runtimeConsequence (non-empty)
//   - releaseConsequence (non-empty)
//   - owner (declared)
//
// Honest classification rule (Phase 1):
//   No manifest may claim authority="authoritative" without all of the above.
//   Otherwise it must be demoted to "derived" or "informational".
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import { MANIFEST_REGISTRY } from "../../../src/lib/truth-manifests/manifest-registry";

const vc = new ViolationCollector();

let authoritativeCount = 0;
let derivedCount = 0;
let informationalCount = 0;
let completeAuthoritative = 0;

for (const entry of MANIFEST_REGISTRY) {
  if (entry.authority === "authoritative") authoritativeCount++;
  else if (entry.authority === "derived") derivedCount++;
  else informationalCount++;

  if (entry.authority !== "authoritative") continue;

  const issues: string[] = [];

  if (!entry.validator) issues.push("missing validator script");
  if (!entry.ciGate) issues.push("missing CI gate");
  if (!entry.sourceInputs || entry.sourceInputs.length === 0) {
    issues.push("missing sourceInputs");
  } else {
    // sourceInputs must not be exclusively other generated manifests
    const allDerived = entry.sourceInputs.every((s) => s.startsWith("generated/"));
    if (allDerived) {
      issues.push("sourceInputs are all generated/* — must include real authoritative source");
    }
  }
  if (!entry.runtimeConsequence || entry.runtimeConsequence.trim().length === 0) {
    issues.push("missing runtimeConsequence");
  }
  if (!entry.releaseConsequence || entry.releaseConsequence.trim().length === 0) {
    issues.push("missing releaseConsequence");
  }
  if (!entry.owner) issues.push("missing owner");

  if (issues.length > 0) {
    vc.add(
      entry.path,
      "incomplete-authority",
      `Authoritative manifest "${entry.id}" is incomplete: ${issues.join("; ")}. Either complete the metadata or demote authority to "derived" / "informational".`,
      "error"
    );
  } else {
    completeAuthoritative++;
  }
}

console.log(
  `  📊 Registry: ${MANIFEST_REGISTRY.length} entries — ${authoritativeCount} authoritative, ${derivedCount} derived, ${informationalCount} informational`
);
console.log(`  ✅ ${completeAuthoritative}/${authoritativeCount} authoritative entries complete`);

vc.report("check-manifest-authority-completeness");
vc.exitIfErrors();
