// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Registry
// 15 canonical Golden Paths. Every entry is cross-linked to:
//   • Bounded contexts (Phase 1)
//   • Surfaces (Phase 2)
//   • Policy decisions (Phase 3 — via expectedMutations)
//   • Kill switches (Phase 4)
//   • Runbooks (Phase 5)
// ═══════════════════════════════════════════════════════════════

import type {
  GoldenPathEntry,
  GoldenPathId,
  GoldenPathOwnership,
  GoldenPathStepBinding,
} from "./golden-path-types";

export type {
  GoldenPathEntry,
  GoldenPathId,
  GoldenPathStep,
  GoldenPathVerification,
  GoldenPathOwnership,
  GoldenPathStepBinding,
  GoldenPathPersona,
  GoldenPathCriticality,
  GoldenPathSurface,
  GoldenPathVerificationKind,
} from "./golden-path-types";

export const GOLDEN_PATH_REGISTRY: readonly GoldenPathEntry[] = [
  // ─────────────────────────────────────────────────────────────
  // GP-FIRST-BOOT — first-launch experience
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-FIRST-BOOT",
    title: "First Boot — New Owner Provisioning",
    summary: "From cold start to authenticated owner with personalized shell.",
    persona: "new-user",
    criticality: "P0",
    primaryContextId: "setup-identity",
    contextIds: ["setup-identity", "runtime-kernel"],
    ownerTeam: "identity-team",
    surfaces: ["web", "desktop"],
    steps: [
      {
        stepId: "boot-shell-render",
        order: 1,
        title: "Render boot shell",
        description: "Boot shell renders with progress and runtime tier banner.",
        surface: "web",
        routePattern: "/boot",
        contextId: "runtime-kernel",
        expectedMutations: [],
        expectedReceipts: ["receipt-boot-render"],
        verifications: ["playwright-e2e", "runtime-probe"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-009"],
      },
      {
        stepId: "personalize-profile",
        order: 2,
        title: "Personalize profile",
        description: "Owner enters identity preferences and trust posture.",
        surface: "web",
        routePattern: "/onboarding/personalize",
        contextId: "setup-identity",
        expectedMutations: ["profile.create", "preferences.save"],
        expectedReceipts: ["receipt-profile-created"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-016"],
      },
      {
        stepId: "trust-calibrate",
        order: 3,
        title: "Calibrate trust",
        description: "Trust calibration produces an initial autonomy ceiling.",
        surface: "web",
        routePattern: "/onboarding/trust",
        contextId: "setup-identity",
        expectedMutations: ["trust.calibrate"],
        expectedReceipts: ["receipt-trust-calibrated"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-016"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/auth/first-boot.spec.ts",
        owner: "identity-team",
        lastGreenAt: null,
      },
      {
        kind: "runtime-probe",
        artifactRef: "src/lib/runtime/probes/first-boot-probe.ts",
        owner: "kernel-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-001", "RB-009", "RB-016"],
    completionReceipts: ["receipt-onboarding-complete"],
    slaLatencyMsP95: 4500,
    requiredCoveragePct: 95,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-SIGN-IN — returning user authentication
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-SIGN-IN",
    title: "Sign In — Returning Owner",
    summary: "Email/password (or biometric) sign-in into the desktop shell.",
    persona: "owner",
    criticality: "P0",
    primaryContextId: "setup-identity",
    contextIds: ["setup-identity"],
    ownerTeam: "identity-team",
    surfaces: ["web", "desktop", "mobile-pwa"],
    steps: [
      {
        stepId: "render-login",
        order: 1,
        title: "Render login surface",
        description: "Login surface renders with calm copy and biometric option.",
        surface: "web",
        routePattern: "/login",
        contextId: "setup-identity",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-001"],
      },
      {
        stepId: "submit-credentials",
        order: 2,
        title: "Submit credentials",
        description: "Auth provider validates credentials and issues session.",
        surface: "web",
        routePattern: "/login",
        contextId: "setup-identity",
        expectedMutations: ["auth.session.create"],
        expectedReceipts: ["receipt-session-created"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-001"],
      },
      {
        stepId: "land-dashboard",
        order: 3,
        title: "Land on dashboard",
        description: "Owner lands on home with personalized rail and pulse.",
        surface: "web",
        routePattern: "/",
        contextId: "setup-identity",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e", "runtime-probe"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: [],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/auth/sign-in.spec.ts",
        owner: "identity-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-001"],
    completionReceipts: ["receipt-session-created"],
    slaLatencyMsP95: 1800,
    requiredCoveragePct: 99,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-RESTORE — full account/state restoration
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-RESTORE",
    title: "Restore Account State",
    summary: "Restore an owner's full state from cloud backup into a new device.",
    persona: "owner",
    criticality: "P0",
    primaryContextId: "cloud-control-plane",
    contextIds: ["cloud-control-plane", "setup-identity"],
    ownerTeam: "cloud-team",
    surfaces: ["web", "desktop"],
    steps: [
      {
        stepId: "restore-init",
        order: 1,
        title: "Initiate restore",
        description: "Owner authenticates and selects a backup snapshot.",
        surface: "web",
        routePattern: "/settings/restore",
        contextId: "cloud-control-plane",
        expectedMutations: ["restore.initiate"],
        expectedReceipts: ["receipt-restore-initiated"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: ["KS-RELEASE-ROLLOUT"],
        recoveryRunbookRefs: ["RB-014"],
      },
      {
        stepId: "restore-apply",
        order: 2,
        title: "Apply backup",
        description: "Cloud backbone replays state into local store.",
        surface: "web",
        routePattern: "/settings/restore",
        contextId: "cloud-control-plane",
        expectedMutations: ["restore.apply"],
        expectedReceipts: ["receipt-restore-applied"],
        verifications: ["receipt-emitted", "runtime-probe"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-014"],
      },
      {
        stepId: "restore-verify",
        order: 3,
        title: "Verify integrity",
        description: "Integrity validator runs and posts a proof receipt.",
        surface: "web",
        routePattern: "/settings/restore",
        contextId: "proof-trust",
        expectedMutations: ["restore.verify"],
        expectedReceipts: ["receipt-restore-verified"],
        verifications: ["receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-014", "RB-015"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/settings/restore.spec.ts",
        owner: "cloud-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-RELEASE-ROLLOUT"],
    recoveryRunbookRefs: ["RB-014", "RB-015"],
    completionReceipts: ["receipt-restore-verified"],
    slaLatencyMsP95: 60_000,
    requiredCoveragePct: 90,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-SETUP-CONTINUATION — resume an interrupted setup
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-SETUP-CONTINUATION",
    title: "Resume Interrupted Setup",
    summary: "Owner returns mid-setup and continues from the last checkpoint.",
    persona: "new-user",
    criticality: "P1",
    primaryContextId: "setup-identity",
    contextIds: ["setup-identity"],
    ownerTeam: "identity-team",
    surfaces: ["web", "desktop"],
    steps: [
      {
        stepId: "load-checkpoint",
        order: 1,
        title: "Load setup checkpoint",
        description: "Setup checkpoint loads and routes to last-completed step.",
        surface: "web",
        routePattern: "/onboarding",
        contextId: "setup-identity",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e", "runtime-probe"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-016"],
      },
      {
        stepId: "complete-remaining",
        order: 2,
        title: "Complete remaining steps",
        description: "Owner finishes the remaining personalization and trust steps.",
        surface: "web",
        routePattern: "/onboarding/*",
        contextId: "setup-identity",
        expectedMutations: ["setup.checkpoint.advance"],
        expectedReceipts: ["receipt-onboarding-complete"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-016"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/auth/setup-continuation.spec.ts",
        owner: "identity-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-016"],
    completionReceipts: ["receipt-onboarding-complete"],
    slaLatencyMsP95: 5000,
    requiredCoveragePct: 85,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-CONNECT-CRM — connect a CRM provider
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-CONNECT-CRM",
    title: "Connect CRM Provider",
    summary: "Connect Salesforce/HubSpot/Pipedrive and complete first lead sync.",
    persona: "owner",
    criticality: "P0",
    primaryContextId: "integrations",
    contextIds: ["integrations", "business-os"],
    ownerTeam: "integration-team",
    surfaces: ["web", "desktop"],
    steps: [
      {
        stepId: "open-connect",
        order: 1,
        title: "Open connector picker",
        description: "Owner opens the connector catalog and picks a provider.",
        surface: "web",
        routePattern: "/business/connect",
        contextId: "integrations",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e"],
        blockingKillSwitches: ["KS-CONNECTORS"],
        recoveryRunbookRefs: ["RB-004"],
      },
      {
        stepId: "oauth-handshake",
        order: 2,
        title: "Complete OAuth handshake",
        description: "Provider OAuth completes and tokens are stored encrypted.",
        surface: "web",
        routePattern: "/business/connect/oauth",
        contextId: "integrations",
        expectedMutations: ["connector.oauth.complete"],
        expectedReceipts: ["receipt-connector-connected"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: ["KS-CONNECTORS", "KS-OUTBOUND"],
        recoveryRunbookRefs: ["RB-004"],
      },
      {
        stepId: "first-sync",
        order: 3,
        title: "Run first sync",
        description: "First lead sync completes and persists rows in business OS.",
        surface: "web",
        routePattern: "/business",
        contextId: "business-os",
        expectedMutations: ["crm.sync.run"],
        expectedReceipts: ["receipt-crm-sync"],
        verifications: ["receipt-emitted", "runtime-probe"],
        blockingKillSwitches: ["KS-SYNC"],
        recoveryRunbookRefs: ["RB-006"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/connectors/connect-crm.spec.ts",
        owner: "integration-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-CONNECTORS", "KS-OUTBOUND", "KS-SYNC"],
    recoveryRunbookRefs: ["RB-004", "RB-006"],
    completionReceipts: ["receipt-crm-sync"],
    slaLatencyMsP95: 30_000,
    requiredCoveragePct: 90,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-OAUTH-AND-SYNC — full OAuth + scheduled sync loop
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-OAUTH-AND-SYNC",
    title: "OAuth Token Refresh and Scheduled Sync",
    summary: "Refresh expiring tokens and run a scheduled connector sync.",
    persona: "operator",
    criticality: "P1",
    primaryContextId: "integrations",
    contextIds: ["integrations"],
    ownerTeam: "integration-team",
    surfaces: ["web", "admin-console"],
    steps: [
      {
        stepId: "token-refresh",
        order: 1,
        title: "Refresh OAuth token",
        description: "Token refresh edge function rotates near-expiry tokens.",
        surface: "admin-console",
        routePattern: "/admin/integrations/tokens",
        contextId: "integrations",
        expectedMutations: ["connector.token.refresh"],
        expectedReceipts: ["receipt-token-refreshed"],
        verifications: ["receipt-emitted", "runtime-probe"],
        blockingKillSwitches: ["KS-CONNECTORS"],
        recoveryRunbookRefs: ["RB-004"],
      },
      {
        stepId: "scheduled-sync",
        order: 2,
        title: "Run scheduled sync",
        description: "Scheduler triggers periodic sync and records lag metric.",
        surface: "admin-console",
        routePattern: "/admin/integrations/sync",
        contextId: "integrations",
        expectedMutations: ["connector.sync.run"],
        expectedReceipts: ["receipt-sync-completed"],
        verifications: ["receipt-emitted", "runtime-probe"],
        blockingKillSwitches: ["KS-SYNC"],
        recoveryRunbookRefs: ["RB-006"],
      },
    ],
    verifications: [
      {
        kind: "runtime-probe",
        artifactRef: "src/lib/runtime/probes/oauth-sync-probe.ts",
        owner: "integration-team",
        lastGreenAt: null,
      },
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/connectors/oauth-and-sync.spec.ts",
        owner: "integration-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-CONNECTORS", "KS-SYNC"],
    recoveryRunbookRefs: ["RB-004", "RB-006"],
    completionReceipts: ["receipt-sync-completed"],
    slaLatencyMsP95: 45_000,
    requiredCoveragePct: 85,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-RECOVER-STALE-LEADS — stale lead detection + recovery
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-RECOVER-STALE-LEADS",
    title: "Recover Stale Leads",
    summary: "Detect stale leads and ship a recovery action with proof.",
    persona: "advisor",
    criticality: "P1",
    primaryContextId: "business-os",
    contextIds: ["business-os", "boardroom"],
    ownerTeam: "business-team",
    surfaces: ["web"],
    steps: [
      {
        stepId: "detect-stale",
        order: 1,
        title: "Detect stale leads",
        description: "Detector flags leads with no activity past freshness window.",
        surface: "web",
        routePattern: "/business/leads",
        contextId: "business-os",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["runtime-probe"],
        blockingKillSwitches: ["KS-ADVISORS"],
        recoveryRunbookRefs: [],
      },
      {
        stepId: "advisor-recommend",
        order: 2,
        title: "Generate recovery recommendation",
        description: "Business advisor produces a recommended next action.",
        surface: "web",
        routePattern: "/business/leads/:id",
        contextId: "boardroom",
        expectedMutations: ["recommendation.create"],
        expectedReceipts: ["receipt-recommendation-created"],
        verifications: ["receipt-emitted"],
        blockingKillSwitches: ["KS-ADVISORS"],
        recoveryRunbookRefs: [],
      },
      {
        stepId: "approve-and-ship",
        order: 3,
        title: "Approve and ship",
        description: "Owner approves and the action is executed with proof.",
        surface: "web",
        routePattern: "/business/leads/:id",
        contextId: "business-os",
        expectedMutations: ["lead.action.execute"],
        expectedReceipts: ["receipt-action-executed"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: ["KS-OUTBOUND"],
        recoveryRunbookRefs: ["RB-003"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/dashboard/stale-leads.spec.ts",
        owner: "business-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-ADVISORS", "KS-OUTBOUND"],
    recoveryRunbookRefs: ["RB-003"],
    completionReceipts: ["receipt-action-executed"],
    slaLatencyMsP95: 120_000,
    requiredCoveragePct: 80,
    runtimeProbeRequired: false,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-APPROVE-OUTBOUND-FOLLOWUP — approve outbound action
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-APPROVE-OUTBOUND-FOLLOWUP",
    title: "Approve Outbound Follow-Up",
    summary: "Owner reviews, approves, and ships an outbound message with proof.",
    persona: "owner",
    criticality: "P0",
    primaryContextId: "boardroom",
    contextIds: ["boardroom", "finance-os"],
    ownerTeam: "boardroom-team",
    surfaces: ["web", "desktop", "mobile-pwa"],
    steps: [
      {
        stepId: "open-approval",
        order: 1,
        title: "Open approval queue",
        description: "Approval queue renders pending items with full evidence.",
        surface: "web",
        routePattern: "/boardroom/approvals",
        contextId: "boardroom",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-007"],
      },
      {
        stepId: "approve-item",
        order: 2,
        title: "Approve item",
        description: "Approval persists and triggers downstream execution.",
        surface: "web",
        routePattern: "/boardroom/approvals",
        contextId: "boardroom",
        expectedMutations: ["approval.decide"],
        expectedReceipts: ["receipt-approval-decided"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-007"],
      },
      {
        stepId: "ship-outbound",
        order: 3,
        title: "Ship outbound action",
        description: "Outbound executor delivers the action and emits proof.",
        surface: "web",
        routePattern: "/boardroom/approvals",
        contextId: "boardroom",
        expectedMutations: ["outbound.execute"],
        expectedReceipts: ["receipt-outbound-shipped"],
        verifications: ["receipt-emitted", "runtime-probe"],
        blockingKillSwitches: ["KS-OUTBOUND"],
        recoveryRunbookRefs: ["RB-003", "RB-007"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/boardroom/approve-outbound.spec.ts",
        owner: "boardroom-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-OUTBOUND"],
    recoveryRunbookRefs: ["RB-003", "RB-007"],
    completionReceipts: ["receipt-outbound-shipped"],
    slaLatencyMsP95: 8000,
    requiredCoveragePct: 95,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-REVIEW-PROOF — proof review and audit
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-REVIEW-PROOF",
    title: "Review Proof Receipt",
    summary: "Owner opens a receipt, inspects the proof chain, and exports it.",
    persona: "owner",
    criticality: "P0",
    primaryContextId: "proof-trust",
    contextIds: ["proof-trust", "boardroom"],
    ownerTeam: "trust-team",
    surfaces: ["web", "desktop"],
    steps: [
      {
        stepId: "open-receipt",
        order: 1,
        title: "Open receipt",
        description: "Receipt renders with full evidence, lineage, and signatures.",
        surface: "web",
        routePattern: "/proof/receipts/:id",
        contextId: "proof-trust",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e", "manifest-evidence"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-013"],
      },
      {
        stepId: "verify-chain",
        order: 2,
        title: "Verify proof chain",
        description: "Verifier validates hash chain and detects any drift.",
        surface: "web",
        routePattern: "/proof/receipts/:id",
        contextId: "proof-trust",
        expectedMutations: ["proof.verify"],
        expectedReceipts: ["receipt-proof-verified"],
        verifications: ["receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-013"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/boardroom/review-proof.spec.ts",
        owner: "trust-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-013"],
    completionReceipts: ["receipt-proof-verified"],
    slaLatencyMsP95: 3000,
    requiredCoveragePct: 95,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-WORKFLOW-REPLAY — re-run a stuck workflow
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-WORKFLOW-REPLAY",
    title: "Workflow Replay",
    summary: "Operator replays a stuck workflow from the last good state.",
    persona: "operator",
    criticality: "P1",
    primaryContextId: "runtime-kernel",
    contextIds: ["runtime-kernel", "boardroom"],
    ownerTeam: "kernel-team",
    surfaces: ["admin-console"],
    steps: [
      {
        stepId: "select-workflow",
        order: 1,
        title: "Select stuck workflow",
        description: "Operator selects a workflow flagged stuck by the monitor.",
        surface: "admin-console",
        routePattern: "/admin/workflows",
        contextId: "runtime-kernel",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-008"],
      },
      {
        stepId: "replay-from-checkpoint",
        order: 2,
        title: "Replay from checkpoint",
        description: "Workflow replays from last good checkpoint and emits receipt.",
        surface: "admin-console",
        routePattern: "/admin/workflows/:id/replay",
        contextId: "runtime-kernel",
        expectedMutations: ["workflow.replay"],
        expectedReceipts: ["receipt-workflow-replayed"],
        verifications: ["receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-008"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/admin/workflow-replay.spec.ts",
        owner: "kernel-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-008"],
    completionReceipts: ["receipt-workflow-replayed"],
    slaLatencyMsP95: 15_000,
    requiredCoveragePct: 80,
    runtimeProbeRequired: false,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-MOBILE-APPROVAL — approve from mobile
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-MOBILE-APPROVAL",
    title: "Mobile Approval",
    summary: "Owner approves a pending item from the mobile PWA via push.",
    persona: "owner",
    criticality: "P0",
    primaryContextId: "mobile",
    contextIds: ["mobile", "boardroom"],
    ownerTeam: "mobile-team",
    surfaces: ["mobile-pwa", "ios", "android"],
    steps: [
      {
        stepId: "open-from-push",
        order: 1,
        title: "Open from push",
        description: "Push notification opens the approval surface with deep link.",
        surface: "mobile-pwa",
        routePattern: "/m/approvals/:id",
        contextId: "mobile",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e"],
        blockingKillSwitches: ["KS-MOBILE-PUSH"],
        recoveryRunbookRefs: ["RB-011"],
      },
      {
        stepId: "approve-mobile",
        order: 2,
        title: "Approve item",
        description: "Approval persists and is replicated to the boardroom.",
        surface: "mobile-pwa",
        routePattern: "/m/approvals/:id",
        contextId: "boardroom",
        expectedMutations: ["approval.decide"],
        expectedReceipts: ["receipt-approval-decided"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-007"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/boardroom/mobile-approval.spec.ts",
        owner: "mobile-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-MOBILE-PUSH"],
    recoveryRunbookRefs: ["RB-007", "RB-011"],
    completionReceipts: ["receipt-approval-decided"],
    slaLatencyMsP95: 6000,
    requiredCoveragePct: 90,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-PUSH-TO-APPROVAL — push pipeline → approval surface
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-PUSH-TO-APPROVAL",
    title: "Push To Approval",
    summary: "Server-emitted push lands on owner's device and opens approval.",
    persona: "owner",
    criticality: "P1",
    primaryContextId: "mobile",
    contextIds: ["mobile"],
    ownerTeam: "mobile-team",
    surfaces: ["mobile-pwa", "android", "ios"],
    steps: [
      {
        stepId: "emit-push",
        order: 1,
        title: "Emit push",
        description: "Push pipeline emits a notification to the owner's device.",
        surface: "mobile-pwa",
        routePattern: "/system/push",
        contextId: "mobile",
        expectedMutations: ["push.emit"],
        expectedReceipts: ["receipt-push-emitted"],
        verifications: ["receipt-emitted", "runtime-probe"],
        blockingKillSwitches: ["KS-MOBILE-PUSH"],
        recoveryRunbookRefs: ["RB-011"],
      },
      {
        stepId: "open-deep-link",
        order: 2,
        title: "Open deep link",
        description: "Owner taps push and lands on the approval surface.",
        surface: "mobile-pwa",
        routePattern: "/m/approvals/:id",
        contextId: "mobile",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["playwright-e2e"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-011"],
      },
    ],
    verifications: [
      {
        kind: "runtime-probe",
        artifactRef: "src/lib/runtime/probes/push-pipeline-probe.ts",
        owner: "mobile-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-MOBILE-PUSH"],
    recoveryRunbookRefs: ["RB-011"],
    completionReceipts: ["receipt-push-emitted"],
    slaLatencyMsP95: 5000,
    requiredCoveragePct: 80,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-OWNER-INTERVENTION — admin pauses/resumes platform activity
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-OWNER-INTERVENTION",
    title: "Owner Intervention (Pause/Resume)",
    summary: "Admin arms a kill switch, verifies impact, then disarms it.",
    persona: "admin",
    criticality: "P0",
    primaryContextId: "admin",
    contextIds: ["admin", "runtime-kernel"],
    ownerTeam: "admin-team",
    surfaces: ["admin-console"],
    steps: [
      {
        stepId: "arm-switch",
        order: 1,
        title: "Arm kill switch",
        description: "Admin arms a kill switch with justification and dual approval if required.",
        surface: "admin-console",
        routePattern: "/admin/kill-switches",
        contextId: "admin",
        expectedMutations: ["killswitch.arm"],
        expectedReceipts: ["receipt-killswitch-armed"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-012"],
      },
      {
        stepId: "verify-impact",
        order: 2,
        title: "Verify impact",
        description: "Admin verifies dependent surfaces enter degraded mode.",
        surface: "admin-console",
        routePattern: "/admin/kill-switches",
        contextId: "admin",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["runtime-probe"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: [],
      },
      {
        stepId: "disarm-switch",
        order: 3,
        title: "Disarm switch",
        description: "Admin disarms the switch and the platform returns to normal.",
        surface: "admin-console",
        routePattern: "/admin/kill-switches",
        contextId: "admin",
        expectedMutations: ["killswitch.disarm"],
        expectedReceipts: ["receipt-killswitch-disarmed"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-012"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/admin/owner-intervention.spec.ts",
        owner: "admin-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-012"],
    completionReceipts: ["receipt-killswitch-disarmed"],
    slaLatencyMsP95: 10_000,
    requiredCoveragePct: 95,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-LAUNCH-READINESS — admin runs launch readiness gate
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-LAUNCH-READINESS",
    title: "Launch Readiness Gate",
    summary: "Admin runs the readiness gate and exports a launch-honest report.",
    persona: "admin",
    criticality: "P0",
    primaryContextId: "admin",
    contextIds: ["admin", "proof-trust"],
    ownerTeam: "admin-team",
    surfaces: ["admin-console"],
    steps: [
      {
        stepId: "run-gate",
        order: 1,
        title: "Run readiness gate",
        description: "Gate runs all checks and surfaces blockers.",
        surface: "admin-console",
        routePattern: "/admin/launch-readiness",
        contextId: "admin",
        expectedMutations: ["readiness.gate.run"],
        expectedReceipts: ["receipt-readiness-evaluated"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-017"],
      },
      {
        stepId: "export-report",
        order: 2,
        title: "Export launch report",
        description: "Admin exports the launch-honest report bundle.",
        surface: "admin-console",
        routePattern: "/admin/launch-readiness",
        contextId: "proof-trust",
        expectedMutations: ["readiness.export"],
        expectedReceipts: ["receipt-readiness-exported"],
        verifications: ["receipt-emitted", "manifest-evidence"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: [],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/admin/launch-readiness.spec.ts",
        owner: "admin-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: [],
    recoveryRunbookRefs: ["RB-017"],
    completionReceipts: ["receipt-readiness-exported"],
    slaLatencyMsP95: 30_000,
    requiredCoveragePct: 90,
    runtimeProbeRequired: false,
    lastCertifiedAt: null,
  },

  // ─────────────────────────────────────────────────────────────
  // GP-ENV-RECOVERY — environment recovery
  // ─────────────────────────────────────────────────────────────
  {
    pathId: "GP-ENV-RECOVERY",
    title: "Environment Recovery",
    summary: "Admin recovers an environment from a failed deployment.",
    persona: "admin",
    criticality: "P0",
    primaryContextId: "cloud-control-plane",
    contextIds: ["cloud-control-plane", "admin"],
    ownerTeam: "cloud-team",
    surfaces: ["admin-console"],
    steps: [
      {
        stepId: "detect-failure",
        order: 1,
        title: "Detect failed deployment",
        description: "Health check fails post-deploy and recovery flow opens.",
        surface: "admin-console",
        routePattern: "/admin/environments",
        contextId: "cloud-control-plane",
        expectedMutations: [],
        expectedReceipts: [],
        verifications: ["runtime-probe"],
        blockingKillSwitches: [],
        recoveryRunbookRefs: ["RB-009"],
      },
      {
        stepId: "rollback",
        order: 2,
        title: "Roll back release",
        description: "Admin triggers rollback and verifies health.",
        surface: "admin-console",
        routePattern: "/admin/environments",
        contextId: "cloud-control-plane",
        expectedMutations: ["release.rollback"],
        expectedReceipts: ["receipt-release-rolled-back"],
        verifications: ["playwright-e2e", "receipt-emitted"],
        blockingKillSwitches: ["KS-RELEASE-ROLLOUT"],
        recoveryRunbookRefs: ["RB-009"],
      },
    ],
    verifications: [
      {
        kind: "playwright-e2e",
        artifactRef: "tests/e2e/customer-journey/admin/env-recovery.spec.ts",
        owner: "cloud-team",
        lastGreenAt: null,
      },
    ],
    blockingKillSwitches: ["KS-RELEASE-ROLLOUT"],
    recoveryRunbookRefs: ["RB-009", "RB-014"],
    completionReceipts: ["receipt-release-rolled-back"],
    slaLatencyMsP95: 20_000,
    requiredCoveragePct: 95,
    runtimeProbeRequired: true,
    lastCertifiedAt: null,
  },
] as const;

// ── Lookups ──────────────────────────────────────────────────────

const REGISTRY_BY_ID: ReadonlyMap<GoldenPathId, GoldenPathEntry> = new Map(
  GOLDEN_PATH_REGISTRY.map((entry) => [entry.pathId, entry])
);

export function getGoldenPath(pathId: GoldenPathId): GoldenPathEntry | undefined {
  return REGISTRY_BY_ID.get(pathId);
}

export function getGoldenPathsByContext(contextId: string): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter((p) => p.contextIds.includes(contextId as any));
}

export function getGoldenPathsByCriticality(
  criticality: "P0" | "P1" | "P2"
): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter((p) => p.criticality === criticality);
}

export function getGoldenPathsForKillSwitch(switchId: string): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter(
    (p) =>
      p.blockingKillSwitches.includes(switchId) ||
      p.steps.some((s) => s.blockingKillSwitches.includes(switchId))
  );
}

export function getGoldenPathsForRunbook(runbookId: string): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter(
    (p) =>
      p.recoveryRunbookRefs.includes(runbookId) ||
      p.steps.some((s) => s.recoveryRunbookRefs.includes(runbookId))
  );
}

export function getOwnerships(): readonly GoldenPathOwnership[] {
  return GOLDEN_PATH_REGISTRY.map((p) => ({
    pathId: p.pathId,
    primaryContextId: p.primaryContextId,
    ownerTeam: p.ownerTeam,
    escalationTarget: "admin",
    slo: {
      p95LatencyMs: p.slaLatencyMsP95,
      successRatePct: p.requiredCoveragePct,
      weeklyExecutions: p.criticality === "P0" ? 1000 : p.criticality === "P1" ? 200 : 50,
    },
  }));
}

export function getStepBindings(): readonly GoldenPathStepBinding[] {
  return GOLDEN_PATH_REGISTRY.flatMap((p) =>
    p.steps.map((s) => ({
      pathId: p.pathId,
      stepId: s.stepId,
      contextId: s.contextId,
    }))
  );
}
