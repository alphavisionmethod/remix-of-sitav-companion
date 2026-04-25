#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Build-Spec Completeness Gate (BLOCK)
//
// Verifies that every Business System advisor declared in the
// registry has a fully-authored, non-stub 23-section build spec
// registered in src/lib/ai-platform/specs/index.ts.
//
// During phased rollout, advisors that have not yet had their
// spec authored are reported as PENDING (warning) — but once a
// spec exists, it MUST pass strict validation (error if not).
//
// Run: npx tsx scripts/advisors/check-advisor-spec-completeness.ts
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";
import { BUSINESS_ADVISORS, type BusinessAdvisorId } from "../../src/lib/ai-platform/runtime/business-advisor-registry";
import { getAdvisorSpec, validateAdvisorSpec } from "../../src/lib/ai-platform/specs";

const vc = new ViolationCollector();
const REGISTRY_FILE = "src/lib/ai-platform/runtime/business-advisor-registry.ts";
const SPECS_FILE = "src/lib/ai-platform/specs/index.ts";

const advisorIds = Object.keys(BUSINESS_ADVISORS) as BusinessAdvisorId[];

const summary: Array<{
  id: BusinessAdvisorId;
  status: "complete" | "incomplete" | "pending";
  issueCount: number;
  issues: { field: string; reason: string }[];
}> = [];

for (const id of advisorIds) {
  const spec = getAdvisorSpec(id);
  if (!spec) {
    // Pending = registered advisor without an authored spec yet.
    // Non-blocking during phased rollout, but visible in the report.
    vc.add(SPECS_FILE, "advisor-spec-pending", `No spec authored yet for ${id}`, "warning");
    summary.push({ id, status: "pending", issueCount: 0, issues: [] });
    continue;
  }

  const issues = validateAdvisorSpec(spec);
  if (issues.length > 0) {
    for (const issue of issues) {
      vc.add(`spec/${id}.spec.ts`, "spec-incomplete", `${issue.field}: ${issue.reason}`);
    }
    summary.push({ id, status: "incomplete", issueCount: issues.length, issues });
  } else {
    summary.push({ id, status: "complete", issueCount: 0, issues: [] });
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-spec-completeness.json", {
  generatedAt: new Date().toISOString(),
  gate: "advisor-spec-completeness",
  ok: vc.errors.length === 0,
  totalAdvisors: advisorIds.length,
  complete: summary.filter((s) => s.status === "complete").length,
  incomplete: summary.filter((s) => s.status === "incomplete").length,
  pending: summary.filter((s) => s.status === "pending").length,
  registryFile: REGISTRY_FILE,
  specsFile: SPECS_FILE,
  details: summary,
});

vc.report("check-advisor-spec-completeness");
vc.exitIfErrors();