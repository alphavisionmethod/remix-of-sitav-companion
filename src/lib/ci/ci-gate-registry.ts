// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Gate Registry (Phase 8 Umbrella)
// Master registry of every architectural CI gate, grouped by phase.
// ═══════════════════════════════════════════════════════════════

import type { CIGateEntry } from "./ci-gate-types";

export const CI_GATE_REGISTRY: readonly CIGateEntry[] = [
  // ── Phase 1 ── Bounded Context
  {
    id: "bounded-context-coverage",
    phase: "phase-1-bounded-context",
    title: "Bounded context coverage",
    script: "scripts/architecture/checks/check-bounded-context-coverage.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Every BoundedContextEntry sourceOfTruth/edgeFunctions/tables must resolve.",
    producesArtifact: "generated/bounded-context-manifest.json",
  },

  // ── Phase 2 ── Runtime Tier
  {
    id: "runtime-foundations",
    phase: "phase-2-runtime-tier",
    title: "Runtime foundations",
    script: "scripts/architecture/checks/check-runtime-foundations.ts",
    owner: "runtime-team",
    severity: "blocker",
    description: "Tier model, surfaces, capability matrix internally consistent.",
  },
  {
    id: "surface-ownership",
    phase: "phase-2-runtime-tier",
    title: "Surface ownership",
    script: "scripts/architecture/checks/check-surface-ownership.ts",
    owner: "runtime-team",
    severity: "blocker",
    description: "Every canonical surface owned by a team & contract.",
  },

  // ── Phase 3 ── Permissions / Identity
  {
    id: "policy-coverage",
    phase: "phase-3-permissions",
    title: "Policy coverage",
    script: "scripts/architecture/checks/check-policy-coverage.ts",
    owner: "identity-team",
    severity: "blocker",
    description: "Sensitive routes & actions wrapped in granular permission gates.",
  },
  {
    id: "policy-mapping",
    phase: "phase-3-permissions",
    title: "Policy → permission mapping",
    script: "scripts/architecture/checks/check-policy-mapping.ts",
    owner: "identity-team",
    severity: "blocker",
    description: "Permission identifiers map to admin_role_permissions rows.",
  },

  // ── Phase 4 ── Kill Switches
  {
    id: "kill-switch-coverage",
    phase: "phase-4-kill-switches",
    title: "Kill-switch coverage",
    script: "scripts/architecture/checks/check-kill-switch-coverage.ts",
    owner: "control-plane-team",
    severity: "blocker",
    description: "Every kill switch has enforcement points and runbook coverage.",
  },

  // ── Phase 5 ── Runbooks
  {
    id: "runbook-coverage",
    phase: "phase-5-runbooks",
    title: "Runbook coverage",
    script: "scripts/architecture/checks/check-runbook-coverage.ts",
    owner: "support-team",
    severity: "blocker",
    description: "Every kill switch / outage scenario has a referenced runbook.",
  },

  // ── Phase 6 ── Golden Paths
  {
    id: "golden-path-coverage",
    phase: "phase-6-golden-paths",
    title: "Golden path coverage",
    script: "scripts/architecture/checks/check-golden-path-coverage.ts",
    owner: "operations-team",
    severity: "blocker",
    description: "Every critical journey has a golden-path entry & primary context.",
  },

  // ── Phase 7 ── Meta-Architecture
  {
    id: "registry-integrity",
    phase: "phase-7-meta-arch",
    title: "Meta-arch registry integrity",
    script: "scripts/architecture/checks/check-registry-integrity.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Cross-references between contexts/switches/runbooks/paths resolve.",
  },

  // ── Phase 8 ── CI Umbrella
  {
    id: "ci-umbrella-integrity",
    phase: "phase-8-ci-umbrella",
    title: "CI umbrella integrity",
    script: "scripts/architecture/checks/check-ci-umbrella-integrity.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Every registered CI gate has a real script on disk.",
    producesArtifact: "generated/ci-umbrella-manifest.json",
  },

  // ── Phase 9 ── Reality + Deployability
  {
    id: "feature-reality-coverage",
    phase: "phase-9-reality-deployability",
    title: "Feature reality coverage",
    script: "scripts/architecture/checks/check-feature-reality-coverage.ts",
    owner: "reality-team",
    severity: "blocker",
    description: "Every feature in the registry classifies all 7 surfaces honestly.",
    producesArtifact: "generated/feature-reality-report.json",
  },
  {
    id: "context-membership",
    phase: "phase-9-reality-deployability",
    title: "Context membership (no orphans)",
    script: "scripts/architecture/checks/check-context-membership.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Every route, service, edge function, table is owned by exactly one context.",
    producesArtifact: "generated/context-membership-manifest.json",
  },
  {
    id: "page-state-coverage",
    phase: "phase-9-reality-deployability",
    title: "Page state coverage",
    script: "scripts/architecture/checks/check-page-state-coverage.ts",
    owner: "reality-team",
    severity: "blocker",
    description: "Registered pages declare the required loading/empty/error/degraded states for their class.",
  },
  {
    id: "cta-wiring",
    phase: "phase-9-reality-deployability",
    title: "CTA wiring",
    script: "scripts/architecture/checks/check-cta-wiring.ts",
    owner: "reality-team",
    severity: "warning",
    description: "Scans for placeholder onClicks, hrefs, TODOs in critical pages.",
  },
  {
    id: "mock-leak",
    phase: "phase-9-reality-deployability",
    title: "Mock-provider leak",
    script: "scripts/architecture/checks/check-mock-leak.ts",
    owner: "reality-team",
    severity: "blocker",
    description: "No production route imports demo/mock providers.",
  },
  {
    id: "deployability-coverage",
    phase: "phase-9-reality-deployability",
    title: "Deployability coverage",
    script: "scripts/architecture/checks/check-deployability-coverage.ts",
    owner: "release-team",
    severity: "blocker",
    description: "Every claimed surface has build/sign/distribute/update/recover evidence.",
    producesArtifact: "generated/deployability-report.json",
  },

  // ── Phase 10 ── Completeness (registry ↔ disk truth)
  {
    id: "edge-function-membership-completeness",
    phase: "phase-10-completeness",
    title: "Edge function membership completeness",
    script: "scripts/architecture/checks/check-edge-function-membership-completeness.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Every supabase/functions/<name>/ on disk is claimed by exactly one bounded context.",
    producesArtifact: "generated/edge-function-membership-report.json",
  },
  {
    id: "table-membership-completeness",
    phase: "phase-10-completeness",
    title: "Table membership completeness",
    script: "scripts/architecture/checks/check-table-membership-completeness.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Every public-schema table is claimed by exactly one bounded context.",
    producesArtifact: "generated/table-membership-report.json",
  },
  {
    id: "page-registry-completeness",
    phase: "phase-10-completeness",
    title: "Page registry completeness",
    script: "scripts/architecture/checks/check-page-registry-completeness.ts",
    owner: "reality-team",
    severity: "blocker",
    description: "Every critical page on disk is registered in page-state-registry.",
    producesArtifact: "generated/page-registry-completeness-report.json",
  },
  {
    id: "route-registry-completeness",
    phase: "phase-10-completeness",
    title: "Route registry completeness",
    script: "scripts/architecture/checks/check-route-registry-completeness.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description: "Every <Route path=> declared in src/routes/** is owned by a bounded context.",
    producesArtifact: "generated/route-registry-completeness-report.json",
  },

  // ── Phase 12 ── Mobile Deployability (iOS + Android Store Readiness)
  {
    id: "mobile-store-readiness",
    phase: "phase-12-mobile-deployability",
    title: "Mobile store readiness (iOS + Android)",
    script: "scripts/architecture/checks/check-mobile-store-readiness.ts",
    owner: "release-team",
    severity: "blocker",
    description: "iOS App Store + Google Play Store 36-item checklist: zero missing, partial items must have remediation.",
    producesArtifact: "generated/mobile-store-readiness-report.json",
  },
  {
    id: "mobile-min-os-floor",
    phase: "phase-12-mobile-deployability",
    title: "Mobile minimum OS floor",
    script: "scripts/architecture/checks/check-mobile-store-readiness.ts",
    owner: "release-team",
    severity: "blocker",
    description: "iOS ≥ 16.0 and Android API ≥ 26 enforced via min-os-version-contract.",
  },
  {
    id: "mobile-build-pipeline",
    phase: "phase-12-mobile-deployability",
    title: "Mobile build pipeline (Capacitor + IPA + AAB)",
    script: "scripts/architecture/checks/check-mobile-build-pipeline.ts",
    owner: "release-team",
    severity: "blocker",
    description: "Capacitor deps installed, capacitor.config.ts parses, exportOptions.plist exists, build scripts present.",
    producesArtifact: "generated/mobile-build-pipeline-report.json",
  },

  // ── Phase 13 ── Web Deployability (Production SPA Readiness)
  {
    id: "web-deployability",
    phase: "phase-13-web-deployability",
    title: "Web deployability (13-item production SPA checklist)",
    script: "scripts/architecture/checks/check-web-deployability.ts",
    owner: "release-team",
    severity: "blocker",
    description: "13-item Web Deployability Checklist: zero missing, partials must have remediation, SW iframe-guarded, CSP aligned, push icons resolved.",
    producesArtifact: "generated/web-deployability-report.json",
  },

  // ── Phase 14 ── Desktop Host / Electron Deployability
  {
    id: "desktop-deployability",
    phase: "phase-14-desktop-deployability",
    title: "Desktop deployability (11-item Electron host checklist)",
    script: "scripts/architecture/checks/check-desktop-deployability.ts",
    owner: "release-team",
    severity: "blocker",
    description: "11-item Desktop Host / Electron Checklist: sandbox enforced, preload bridge matches contract (22 methods), forge signing config present, fallbacks declared for every desktop-exclusive feature.",
    producesArtifact: "generated/desktop-deployability-report.json",
  },

  // ── Phase 15 ── VMware / ISO / Appliance Deployability
  {
    id: "appliance-deployability",
    phase: "phase-15-appliance-deployability",
    title: "Appliance deployability (12-item VMware / ISO / appliance checklist)",
    script: "scripts/architecture/checks/check-appliance-deployability.ts",
    owner: "release-team",
    severity: "blocker",
    description: "12-item VMware / ISO / Appliance Checklist: ISO+OVA build pipelines real & executable, systemd units present, autoinstall configs valid, runtime-capability-matrix declares appliance column, no roadmap capability is overclaimed as native, startup-order + recovery actions wired.",
    producesArtifact: "generated/appliance-deployability-report.json",
  },

  // ── Phase 16 ── Backend / API Deployability
  {
    id: "backend-api-deployability",
    phase: "phase-16-backend-api-deployability",
    title: "Backend / API deployability (15-item Backend / API Reality Checklist)",
    script: "scripts/architecture/checks/check-backend-api-deployability.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description:
      "15-item Backend / API Reality Checklist: registry/membership ok, governance not RED, no active ambiguous endpoints, every active fn has auth/contract/owner, every high side-effect fn has strict rate-limit + required audit-log, every P0 frontend action has a real backend target.",
    producesArtifact: "generated/backend-api-deployability-report.json",
  },

  // ── Phase 17 ── Edge Function Health & Replay
  {
    id: "edge-function-health-replay",
    phase: "phase-17-edge-function-health-replay",
    title: "Edge function health & replay (10-item Edge Function Checklist)",
    script: "scripts/architecture/checks/check-edge-function-health-replay.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description:
      "Every ORCHESTRATION_FUNCTION + CONNECTOR_WEBHOOK_FUNCTION declares a real, code-backed failure/replay path. Health adapter + admin dashboard wired and observable.",
    producesArtifact: "generated/edge-function-health-replay-report.json",
  },

  // ── Phase 18 ── Database / Migration Reality
  {
    id: "db-reality",
    phase: "phase-18-db-reality",
    title: "Database / migration reality (17-item DB Reality Checklist)",
    script: "scripts/architecture/checks/check-db-reality.ts",
    owner: "platform-architecture",
    severity: "blocker",
    description:
      "Every table has owner/writers/readers/tenancy/sensitivity. Every active edge function declares table I/O. Cross-domain writers blocked. Backup manifest fresh and restore drill green.",
    producesArtifact: "generated/db-reality-report.json",
  },
];

export function listGatesByPhase(phase: CIGateEntry["phase"]): readonly CIGateEntry[] {
  return CI_GATE_REGISTRY.filter((g) => g.phase === phase);
}

export function findGate(id: string): CIGateEntry | undefined {
  return CI_GATE_REGISTRY.find((g) => g.id === id);
}

export function gatesByOwner(): Record<string, readonly CIGateEntry[]> {
  const out: Record<string, CIGateEntry[]> = {};
  for (const g of CI_GATE_REGISTRY) {
    (out[g.owner] ??= []).push(g);
  }
  return out;
}

export function blockerCount(): number {
  return CI_GATE_REGISTRY.filter((g) => g.severity === "blocker").length;
}
