#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script Runtime Consequence Map
// Defines what breaks if each script category is absent or broken
// ═══════════════════════════════════════════════════════════════

export interface RuntimeConsequence {
  scriptCategory: string;
  ifAbsent: string;
  ifBroken: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedSystems: string[];
}

export const RUNTIME_CONSEQUENCES: RuntimeConsequence[] = [
  {
    scriptCategory: "generate-service-manifest",
    ifAbsent: "Service discovery fails — runtime cannot resolve service topology",
    ifBroken: "Stale service manifest causes routing errors and ownership confusion",
    severity: "critical",
    affectedSystems: ["runtime", "admin-dashboard", "deployment"],
  },
  {
    scriptCategory: "generate-route-manifest",
    ifAbsent: "Route registry empty — navigation and admin IA break",
    ifBroken: "Route drift undetected — phantom routes or missing pages",
    severity: "critical",
    affectedSystems: ["runtime", "admin-dashboard", "ci"],
  },
  {
    scriptCategory: "generate-capability-index",
    ifAbsent: "Capability matrix empty — feature governance unenforceable",
    ifBroken: "Capabilities registered incorrectly — false launch readiness",
    severity: "high",
    affectedSystems: ["runtime", "launch-honesty", "admin-dashboard"],
  },
  {
    scriptCategory: "architecture-assertions",
    ifAbsent: "Architecture invariants not enforced — sprawl and boundary violations accumulate",
    ifBroken: "False positives block merges; false negatives allow violations",
    severity: "critical",
    affectedSystems: ["ci", "architecture"],
  },
  {
    scriptCategory: "contract-checks",
    ifAbsent: "Contract integrity not verified — type drift and import violations undetected",
    ifBroken: "Incorrect boundary enforcement breaks valid code",
    severity: "high",
    affectedSystems: ["ci", "contracts", "build"],
  },
  {
    scriptCategory: "runtime-conformance",
    ifAbsent: "Runtime truth not validated — deployed code may not match declared capabilities",
    ifBroken: "False runtime conformance allows broken deployments",
    severity: "critical",
    affectedSystems: ["runtime", "deployment", "launch-honesty"],
  },
  {
    scriptCategory: "db-checks",
    ifAbsent: "Schema ownership and RLS coverage not validated — security and tenancy gaps",
    ifBroken: "False DB compliance allows data leakage or broken migrations",
    severity: "critical",
    affectedSystems: ["db", "security", "tenancy"],
  },
  {
    scriptCategory: "deployment-checks",
    ifAbsent: "Deployment readiness not verified — broken releases possible",
    ifBroken: "False deploy readiness causes production incidents",
    severity: "critical",
    affectedSystems: ["deployment", "release", "production"],
  },
  {
    scriptCategory: "release-checks",
    ifAbsent: "Release gates not enforced — incomplete packages shipped",
    ifBroken: "Release gate bypass allows broken desktop/appliance releases",
    severity: "high",
    affectedSystems: ["release", "desktop", "appliance", "vmware"],
  },
  {
    scriptCategory: "security-checks",
    ifAbsent: "Security posture unvalidated — tenant isolation and role leakage undetected",
    ifBroken: "False security compliance masks real vulnerabilities",
    severity: "critical",
    affectedSystems: ["security", "tenancy", "compliance"],
  },
  {
    scriptCategory: "support-drills",
    ifAbsent: "Recovery paths untested — incident response time unknown",
    ifBroken: "False drill results create false confidence in recovery capability",
    severity: "medium",
    affectedSystems: ["supportability", "incident-response"],
  },
  {
    scriptCategory: "support-coverage",
    ifAbsent: "Runbook and kill-switch coverage unknown — operational blind spots",
    ifBroken: "Coverage gaps hidden — incidents expose missing runbooks",
    severity: "medium",
    affectedSystems: ["supportability", "operations"],
  },
];

console.log(`✅ script-runtime-consequence-map: ${RUNTIME_CONSEQUENCES.length} consequence categories defined`);
