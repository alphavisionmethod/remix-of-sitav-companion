// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Gate Types (Phase 8 Umbrella)
// Unified typing for the cross-phase CI validation registry.
// ═══════════════════════════════════════════════════════════════

export type CIGatePhase =
  | "phase-1-bounded-context"
  | "phase-2-runtime-tier"
  | "phase-3-permissions"
  | "phase-4-kill-switches"
  | "phase-5-runbooks"
  | "phase-6-golden-paths"
  | "phase-7-meta-arch"
  | "phase-8-ci-umbrella"
  | "phase-9-reality-deployability"
  | "phase-10-completeness"
  | "phase-12-mobile-deployability"
  | "phase-13-web-deployability"
  | "phase-14-desktop-deployability"
  | "phase-15-appliance-deployability"
  | "phase-16-backend-api-deployability"
  | "phase-17-edge-function-health-replay"
  | "phase-18-db-reality"
  | "phase-19-auth-policy-trust-reality"
  | "phase-20-production-operations"
  | "phase-21-ai-advisor-reality"
  | "phase-22-connector-reality"
  | "phase-23-workflow-reality"
  | "phase-24-domain-reality"
  | "phase-25-owner-workflow-reality";

export type CIGateSeverity = "blocker" | "warning" | "info";

export type CIGateOwner =
  | "platform-architecture"
  | "runtime-team"
  | "identity-team"
  | "control-plane-team"
  | "support-team"
  | "operations-team"
  | "release-team"
  | "reality-team"
  | "ai-platform-team";

export interface CIGateEntry {
  readonly id: string;
  readonly phase: CIGatePhase;
  readonly title: string;
  readonly script: string;
  readonly owner: CIGateOwner;
  readonly severity: CIGateSeverity;
  readonly description: string;
  readonly producesArtifact?: string;
}

export interface CIGateEvaluation {
  readonly gateId: string;
  readonly status: "pass" | "fail" | "skip" | "unknown";
  readonly errorCount: number;
  readonly warningCount: number;
  readonly evaluatedAt: string;
}

export interface CIUmbrellaIntegrityIssue {
  readonly severity: "error" | "warning";
  readonly gateId: string;
  readonly message: string;
}

export interface CIUmbrellaIntegrityReport {
  readonly checkedAt: string;
  readonly gateCount: number;
  readonly issues: readonly CIUmbrellaIntegrityIssue[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly ok: boolean;
}
