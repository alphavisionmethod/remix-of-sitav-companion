// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Check Registry
// Canonical, machine-usable map of every verification check in the
// repository. Each entry declares: id, command, subsystem, scope,
// criticality, dependencies. This is the EYES of the self-healer.
// ═══════════════════════════════════════════════════════════════

/**
 * Subsystem taxonomy — must align with platform-planes memory.
 * frontend | backend | edge | db | auth | ai | manifests | contracts |
 * release | security | runtime | tests | governance
 */

/**
 * Scope taxonomy — what blast radius a check can attribute failure to.
 * file | package | subsystem | repo
 */

/**
 * Criticality taxonomy — informs blast-radius scoring + escalation.
 * trivial | normal | high | release-blocker
 */

export const CHECK_REGISTRY = [
  // ── TYPE & LINT (repo-wide gates) ──────────────────────────
  {
    id: "typecheck",
    command: "npx tsc --noEmit",
    subsystem: "frontend",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 600_000,
  },
  {
    id: "lint",
    command: "npx eslint . --max-warnings=0",
    subsystem: "frontend",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 300_000,
  },

  // ── TESTS ──────────────────────────────────────────────────
  {
    id: "vitest:unit",
    command: "npx vitest run --reporter=json --outputFile=coverage/vitest-result.json",
    subsystem: "tests",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 1_200_000,
  },
  {
    id: "vitest:integration",
    command: "npx vitest run src/test/integration/ --reporter=json",
    subsystem: "tests",
    scope: "subsystem",
    criticality: "high",
    dependencies: ["vitest:unit"],
    timeoutMs: 600_000,
  },
  {
    id: "test:deployment-readiness",
    command: "npm run test:deployment-readiness",
    subsystem: "release",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: ["vitest:unit"],
    timeoutMs: 600_000,
  },
  {
    id: "test:imports",
    command: "npm run test:imports",
    subsystem: "contracts",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 120_000,
  },
  {
    id: "test:classifier",
    command: "node scripts/lib/failure-classifier.test.mjs",
    subsystem: "governance",
    scope: "repo",
    criticality: "normal",
    dependencies: [],
    timeoutMs: 60_000,
  },

  // ── VALIDATE-ALL DOMAINS (245+ validators bundled) ─────────
  {
    id: "validate:architecture",
    command: "npm run validate:architecture",
    subsystem: "governance",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 600_000,
  },
  {
    id: "validate:contracts",
    command: "npm run validate:contracts",
    subsystem: "contracts",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 600_000,
  },
  {
    id: "validate:runtime",
    command: "npm run validate:runtime",
    subsystem: "runtime",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 600_000,
  },
  {
    id: "validate:db",
    command: "npm run validate:db",
    subsystem: "db",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 300_000,
  },
  {
    id: "validate:deployment",
    command: "npm run validate:deployment",
    subsystem: "release",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 600_000,
  },
  {
    id: "validate:manifests",
    command: "npm run validate:manifests",
    subsystem: "manifests",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 300_000,
  },
  {
    id: "validate:support",
    command: "npm run validate:support",
    subsystem: "governance",
    scope: "repo",
    criticality: "normal",
    dependencies: [],
    timeoutMs: 300_000,
  },
  {
    id: "validate:release",
    command: "npm run validate:release",
    subsystem: "release",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 600_000,
  },
  {
    id: "validate:security",
    command: "npm run validate:security",
    subsystem: "security",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 600_000,
  },

  // ── IMPORT INTEGRITY ───────────────────────────────────────
  {
    id: "check:imports",
    command: "npm run check:imports",
    subsystem: "contracts",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 120_000,
  },

  // ── GOVERNANCE / GENERATED ARTIFACT FRESHNESS ──────────────
  {
    id: "validate:governance",
    command: "npm run validate:governance",
    subsystem: "governance",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 180_000,
  },
  {
    id: "check:ai-domains",
    command: "npm run check:ai-domains",
    subsystem: "ai",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 120_000,
  },
  {
    id: "check:routes-inventory",
    command: "npm run check:routes-inventory-completeness",
    subsystem: "frontend",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 120_000,
  },
  {
    id: "check:edge-function-ownership",
    command: "npm run check:edge-function-ownership-completeness",
    subsystem: "edge",
    scope: "repo",
    criticality: "high",
    dependencies: [],
    timeoutMs: 120_000,
  },
  {
    id: "check:artifact-ownership-graph",
    command: "npm run check:artifact-ownership-graph",
    subsystem: "manifests",
    scope: "repo",
    criticality: "normal",
    dependencies: [],
    timeoutMs: 180_000,
  },
  {
    id: "check:runbook-coverage",
    command: "npm run check:runbook-coverage",
    subsystem: "governance",
    scope: "repo",
    criticality: "normal",
    dependencies: [],
    timeoutMs: 60_000,
  },
  {
    id: "check:self-healer-safe-catalogue",
    command: "npx tsx scripts/validation/check-self-healer-safe-catalogue.ts",
    subsystem: "security",
    scope: "repo",
    criticality: "release-blocker",
    dependencies: [],
    timeoutMs: 60_000,
  },
];

export const SUBSYSTEMS = [
  "frontend", "backend", "edge", "db", "auth", "ai",
  "manifests", "contracts", "release", "security",
  "runtime", "tests", "governance",
];

export const CRITICALITY_LEVELS = ["trivial", "normal", "high", "release-blocker"];
export const SCOPES = ["file", "package", "subsystem", "repo"];

export function getCheckById(id) {
  return CHECK_REGISTRY.find(c => c.id === id);
}

export function getChecksBySubsystem(subsystem) {
  return CHECK_REGISTRY.filter(c => c.subsystem === subsystem);
}

export function getReleaseBlockers() {
  return CHECK_REGISTRY.filter(c => c.criticality === "release-blocker");
}

export function getCheckCount() {
  return CHECK_REGISTRY.length;
}