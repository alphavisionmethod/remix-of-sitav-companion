#!/usr/bin/env node
// SITA OS — Advisor Tool Permission Validator (BLOCK)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/ai-platform/runtime/advisor-permission-matrix.ts";
const REQUIRED_ROLES = ["business", "finance", "concierge", "security", "operations", "investment"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-permission-matrix.ts not found");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing: string[] = [];
  for (const role of REQUIRED_ROLES) {
    if (!content.includes(`"${role}"`)) missing.push(role);
  }
  if (missing.length > 0) {
    vc.add(SRC, "missing-roles", `Permission matrix missing roles: ${missing.join(", ")}`);
  }
  if (!content.includes("blocked")) {
    vc.add(SRC, "no-blocked-actions", "Permission matrix has no blocked field");
  }
  writeJsonOutput("generated/advisor-boardroom-proof/advisor-tool-permission-check.json", {
    generatedAt: new Date().toISOString(), gate: "advisor-tool-permissions", ok: vc.errors.length === 0,
    requiredRoles: REQUIRED_ROLES, missingRoles: missing,
  });
  writeJsonOutput("generated/advisor-tool-permissions-report.json", {
    generatedAt: new Date().toISOString(), gate: "advisor-tool-permissions", ok: vc.errors.length === 0,
    errorCount: vc.errors.length, warningCount: 0,
    requiredRoles: REQUIRED_ROLES, missingRoles: missing,
  });
}

vc.report("check-advisor-tool-permissions");
vc.exitIfErrors();