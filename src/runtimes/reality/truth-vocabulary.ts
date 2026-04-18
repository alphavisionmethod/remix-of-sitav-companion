// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Truth Vocabulary
// Canonical four-state model shared across all truth systems.
// All operator surfaces MUST use these definitions.
// ═══════════════════════════════════════════════════════════════

export const REALITY_STATES = ["presentational", "simulated", "persisted", "proven"] as const;
export type RealityState = typeof REALITY_STATES[number];

export const REALITY_STATE_CONFIG: Record<RealityState, {
  label: string;
  description: string;
  shortDescription: string;
  colorClass: string;
  bgClass: string;
  iconName: "Eye" | "Cpu" | "Shield" | "CheckCircle2";
  truthClaim: string;
  launchEligible: boolean;
}> = {
  presentational: {
    label: "Presentational",
    description: "UI shell — no backing logic or data truth. Static layout only.",
    shortDescription: "UI shell only",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
    iconName: "Eye",
    truthClaim: "Not functional — display only",
    launchEligible: false,
  },
  simulated: {
    label: "Simulated",
    description: "Mock/demo/in-memory logic. State dies on refresh. No real backend.",
    shortDescription: "Mock-backed, no durability",
    colorClass: "text-yellow-400",
    bgClass: "bg-yellow-500/20",
    iconName: "Cpu",
    truthClaim: "Functional appearance only — not production-real",
    launchEligible: false,
  },
  persisted: {
    label: "Persisted",
    description: "Real backend + storage. State survives refresh. Durable data source.",
    shortDescription: "Real backend, durable",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/20",
    iconName: "Shield",
    truthClaim: "Real substrate exists — not yet fully verified",
    launchEligible: false,
  },
  proven: {
    label: "Proven",
    description: "Persisted + verified + contract-aligned + launch-honest. Full runtime truth.",
    shortDescription: "Verified, launch-ready",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/20",
    iconName: "CheckCircle2",
    truthClaim: "Fully working and launch-honest",
    launchEligible: true,
  },
};

// ── Progression Model ──

export const PROGRESSION_PATHS: Array<{
  from: RealityState;
  to: RealityState;
  requirements: string[];
}> = [
  {
    from: "presentational",
    to: "simulated",
    requirements: ["component_renders", "shell_exists", "data_source_real"],
  },
  {
    from: "simulated",
    to: "persisted",
    requirements: ["db_persistence", "mock_imports_none", "real_mutation_path"],
  },
  {
    from: "persisted",
    to: "proven",
    requirements: ["contract_exists", "runtime_evidence", "interaction_verified", "e2e_coverage", "launch_ready"],
  },
];

// ── Priority Model ──

export const PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;
export type PriorityLevel = typeof PRIORITY_LEVELS[number];

export const PRIORITY_CONFIG: Record<PriorityLevel, {
  label: string;
  description: string;
  colorClass: string;
}> = {
  critical: { label: "P0 — Launch Blocker", description: "Severe truth mismatch, blocks launch", colorClass: "text-destructive" },
  high: { label: "P1 — Core Integrity", description: "Core product integrity blocker", colorClass: "text-orange-400" },
  medium: { label: "P2 — Important", description: "Important but nonblocking", colorClass: "text-yellow-400" },
  low: { label: "P3 — Internal", description: "Low-risk or internal-only simulation", colorClass: "text-muted-foreground" },
};

// ── Launch Honesty ──

export function computeClaimSeverity(provenPct: number): "safe" | "caution" | "danger" {
  if (provenPct >= 80) return "safe";
  if (provenPct >= 50) return "caution";
  return "danger";
}

export const CLAIM_SEVERITY_CONFIG = {
  safe: { label: "Safe to claim", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/20" },
  caution: { label: "Claim with caveats", colorClass: "text-yellow-400", bgClass: "bg-yellow-500/20" },
  danger: { label: "Do not claim production-ready", colorClass: "text-destructive", bgClass: "bg-destructive/20" },
};

// ── Contract Status ──

export const CONTRACT_STATUSES = ["none", "partial", "aligned", "verified"] as const;
export type ContractStatus = typeof CONTRACT_STATUSES[number];

export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, {
  label: string;
  colorClass: string;
}> = {
  none: { label: "No Contract", colorClass: "text-destructive" },
  partial: { label: "Partial", colorClass: "text-yellow-400" },
  aligned: { label: "Aligned", colorClass: "text-blue-400" },
  verified: { label: "Verified", colorClass: "text-emerald-400" },
};

// ── Migration Status ──

export const MIGRATION_STATUSES = ["identified", "planned", "in_progress", "blocked", "completed", "validated"] as const;
export type MigrationStatus = typeof MIGRATION_STATUSES[number];

export const MIGRATION_STATUS_CONFIG: Record<MigrationStatus, {
  label: string;
  colorClass: string;
  bgClass: string;
}> = {
  identified: { label: "Identified", colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  planned: { label: "Planned", colorClass: "text-blue-400", bgClass: "bg-blue-500/20" },
  in_progress: { label: "In Progress", colorClass: "text-yellow-400", bgClass: "bg-yellow-500/20" },
  blocked: { label: "Blocked", colorClass: "text-destructive", bgClass: "bg-destructive/20" },
  completed: { label: "Completed", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/20" },
  validated: { label: "Validated", colorClass: "text-emerald-300", bgClass: "bg-emerald-600/20" },
};

// ── Vocabulary Mapping (normalizes legacy terms) ──
// Maps old truth vocabulary to the canonical four-state model

export function normalizeToRealityState(legacyTerm: string): RealityState {
  const t = legacyTerm.toLowerCase().trim();
  if (["shell", "static", "presentational", "ui-only", "layout"].includes(t)) return "presentational";
  if (["mock", "demo", "simulated", "fake", "stub", "in-memory", "hardcoded"].includes(t)) return "simulated";
  if (["persisted", "stored", "durable", "real", "backed", "db-backed"].includes(t)) return "persisted";
  if (["proven", "verified", "launch-ready", "production", "validated"].includes(t)) return "proven";
  return "presentational";
}
