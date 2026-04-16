#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script Taxonomy
// Canonical classification of all script types in the system
// ═══════════════════════════════════════════════════════════════

export const SCRIPT_CLASSES = [
  "assert",
  "check",
  "validate",
  "generate",
  "bootstrap",
  "migrate",
  "emit",
  "codemod",
  "drill",
  "restore",
  "rotate",
] as const;

export type ScriptClass = (typeof SCRIPT_CLASSES)[number];

export const SCRIPT_CLASS_DEFINITIONS: Record<ScriptClass, { description: string; ciDefault: string; permanence: "permanent" | "migration" | "ops" }> = {
  assert: {
    description: "Architecture invariant assertions — must pass or block merge/release",
    ciDefault: "pr",
    permanence: "permanent",
  },
  check: {
    description: "Structural checks — validate repo shape, ownership, boundaries, coverage",
    ciDefault: "pr",
    permanence: "permanent",
  },
  validate: {
    description: "Truth validation — confirm generated artifacts match source truth",
    ciDefault: "pr",
    permanence: "permanent",
  },
  generate: {
    description: "Artifact generation — produce JSON manifests, registries, reports from source",
    ciDefault: "pr",
    permanence: "permanent",
  },
  bootstrap: {
    description: "Scaffold creation — generate new features, services, packages from templates",
    ciDefault: "local-only",
    permanence: "permanent",
  },
  migrate: {
    description: "Migration tooling — transform imports, data, or structure during refactors",
    ciDefault: "manual",
    permanence: "migration",
  },
  emit: {
    description: "Artifact emission — produce deployment/release artifacts (OVA, ISO, bundles)",
    ciDefault: "release-gate",
    permanence: "permanent",
  },
  codemod: {
    description: "Automated code transformations — bulk import rewrites, API migrations",
    ciDefault: "manual",
    permanence: "migration",
  },
  drill: {
    description: "Operational drills — disaster recovery, backup verification, incident simulation",
    ciDefault: "support-drill",
    permanence: "ops",
  },
  restore: {
    description: "Recovery operations — backup restoration, state recovery",
    ciDefault: "support-drill",
    permanence: "ops",
  },
  rotate: {
    description: "Secret/credential rotation — key rotation, certificate renewal",
    ciDefault: "manual",
    permanence: "ops",
  },
};

export const OWNERSHIP_DOMAINS = [
  "architecture",
  "platform-runtime",
  "contracts",
  "deployment-release",
  "db",
  "security",
  "supportability",
  "admin-control-plane",
  "migration-refactor",
] as const;

export type OwnershipDomain = (typeof OWNERSHIP_DOMAINS)[number];

export const OWNERSHIP_DOMAIN_DESCRIPTIONS: Record<OwnershipDomain, string> = {
  architecture: "Structural invariants, layer boundaries, module governance",
  "platform-runtime": "Runtime truth, capability matrices, service lifecycle, edge functions",
  contracts: "Contract integrity, import boundaries, type surface governance",
  "deployment-release": "Build, deploy, release, packaging, ingress, VMware, ISO, Electron",
  db: "Schema, RLS, migrations, tenancy, backup/restore",
  security: "Secret rotation, tenant isolation, role leakage, attestations",
  supportability: "Diagnostics, runbooks, drills, recovery, kill-switches, golden paths",
  "admin-control-plane": "Admin IA, shell consistency, domain routing, control plane governance",
  "migration-refactor": "Codemods, import rewrites, service consolidation, one-off transforms",
};

export const CI_PHASES = [
  "pr",
  "nightly",
  "manual",
  "release-gate",
  "deploy-gate",
  "support-drill",
  "local-only",
] as const;

export type CIPhase = (typeof CI_PHASES)[number];

export const SCRIPT_LANGUAGES = ["typescript", "shell", "powershell", "javascript"] as const;
export type ScriptLanguage = (typeof SCRIPT_LANGUAGES)[number];

export function classifyLanguage(filePath: string): ScriptLanguage {
  if (filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".sh")) return "shell";
  if (filePath.endsWith(".ps1")) return "powershell";
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "javascript";
  return "typescript";
}

export function classifyScriptClass(fileName: string): ScriptClass {
  const base = fileName.replace(/\.(ts|js|mjs|sh|ps1)$/, "");
  if (base.startsWith("assert-")) return "assert";
  if (base.startsWith("check-")) return "check";
  if (base.startsWith("validate-")) return "validate";
  if (base.startsWith("generate-")) return "generate";
  if (base.startsWith("bootstrap-")) return "bootstrap";
  if (base.startsWith("migrate-") || base.startsWith("rewrite-")) return "migrate";
  if (base.startsWith("emit-")) return "emit";
  if (base.startsWith("consolidate-") || base.startsWith("normalize-")) return "codemod";
  if (base.includes("drill") || base.includes("disaster-recovery")) return "drill";
  if (base.startsWith("restore-") || base.includes("recovery")) return "restore";
  if (base.startsWith("rotate-")) return "rotate";
  if (base.startsWith("build-") || base.startsWith("deploy-")) return "emit";
  if (base.startsWith("render-") || base.startsWith("verify-")) return "check";
  return "check";
}

console.log("✅ script-taxonomy: 11 script classes, 9 ownership domains, 7 CI phases defined");
