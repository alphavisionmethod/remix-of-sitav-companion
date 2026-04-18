// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Domain Manifest (Phase 24.D)
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "../domain-manifest";

export const boardroomManifest: DomainManifest = {
  id: "boardroom",
  name: "Boardroom",
  description: "Strategic decision chamber: sessions, items, evidence, recommendations, decisions, and replay",
  owner: "boardroom-service",
  version: "1.0.0",

  entities: [
    { id: "session", name: "Boardroom Session", description: "Convened strategic decision session", dbTable: "boardroom_sessions", statusStates: ["assembling", "in-session", "deliberating", "deciding", "adjourned"], permissions: { create: "boardroom.session.create", read: "boardroom.session.read", update: "boardroom.session.update", delete: "boardroom.session.delete" }, searchable: true, fileAttachable: true },
    { id: "item", name: "Boardroom Item", description: "Issue placed before the boardroom", dbTable: "boardroom_items", statusStates: ["queued", "framing", "discussing", "decided", "deferred"], permissions: { create: "boardroom.item.create", read: "boardroom.item.read", update: "boardroom.item.update", delete: "boardroom.item.delete" }, searchable: true, fileAttachable: true },
    { id: "evidence", name: "Boardroom Evidence", description: "Evidence presented for an item", dbTable: "boardroom_evidence", statusStates: ["proposed", "verified", "disputed", "stale"], permissions: { create: "boardroom.evidence.create", read: "boardroom.evidence.read", update: "boardroom.evidence.update", delete: "boardroom.evidence.delete" }, searchable: true, fileAttachable: true },
    { id: "recommendation", name: "Boardroom Recommendation", description: "Recommendation generated for the boardroom", dbTable: "boardroom_recommendations", statusStates: ["proposed", "endorsed", "rejected", "withdrawn"], permissions: { create: "boardroom.recommendation.create", read: "boardroom.recommendation.read", update: "boardroom.recommendation.update", delete: "boardroom.recommendation.delete", approve: "boardroom.recommendation.approve" }, searchable: true, fileAttachable: false },
    { id: "decision-receipt", name: "Decision Receipt", description: "Final decision artifact with proof trail", dbTable: "boardroom_decision_receipts", statusStates: ["recorded", "executing", "completed", "reversed"], permissions: { create: "boardroom.receipt.create", read: "boardroom.receipt.read", update: "boardroom.receipt.update", delete: "boardroom.receipt.delete" }, searchable: true, fileAttachable: true },
  ],

  workflows: [
    {
      id: "boardroom-session", name: "Boardroom Session", description: "Assemble → discuss → recommend → vote → decide → adjourn",
      trigger: "boardroom.session.requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["boardroom.session.opened", "boardroom.decision.recorded", "boardroom.session.adjourned"],
      steps: [
        { id: "assemble", name: "Assemble", type: "automated", description: "Open session, attach advisors, gather context", canFail: false, rollbackCapable: true },
        { id: "frame", name: "Frame Items", type: "human", description: "Add items + framing", canFail: false, rollbackCapable: true },
        { id: "evidence", name: "Attach Evidence", type: "ai-assisted", description: "Attach lineage-tracked evidence", canFail: true, rollbackCapable: true },
        { id: "recommend", name: "Generate Recommendations", type: "ai-assisted", description: "Advisors propose recommendations", canFail: true, rollbackCapable: true },
        { id: "vote", name: "Vote", type: "approval", description: "Owner votes on recommendation", canFail: false, rollbackCapable: true },
        { id: "decide", name: "Record Decision", type: "automated", description: "Write decision receipt", canFail: false, rollbackCapable: true },
        { id: "adjourn", name: "Adjourn", type: "automated", description: "Close session, emit summary", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "boardroom-replay", name: "Boardroom Replay", description: "Admin replay of a past session for audit/investigation",
      trigger: "boardroom.replay.requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["boardroom.replay.completed"],
      steps: [
        { id: "load", name: "Load Session", type: "automated", description: "Load session + all evidence/recs/receipts", canFail: true, rollbackCapable: false },
        { id: "verify", name: "Verify Integrity", type: "verification", description: "Verify proof trail integrity", canFail: true, rollbackCapable: false },
        { id: "render", name: "Render Replay", type: "automated", description: "Render reconstructed session", canFail: true, rollbackCapable: false },
      ],
    },
  ],

  shellIntegration: {
    launcher: {
      appId: "boardroom", displayName: "Boardroom", icon: "Crown", category: "Decisions",
      description: "Convene strategic sessions, review evidence, and decide",
      keywords: ["board", "boardroom", "decide", "session", "decision"],
    },
    commandPalette: [
      { id: "br-open", label: "Open Boardroom", keywords: ["board", "open"], action: "/boardroom", icon: "Crown" },
      { id: "br-weekly", label: "Weekly Boardroom", keywords: ["weekly", "review"], action: "/boardroom/weekly", icon: "Calendar" },
      { id: "br-history", label: "Boardroom History", keywords: ["history", "past"], action: "/boardroom/history", icon: "History" },
      { id: "br-replay", label: "Boardroom Replay", keywords: ["replay", "audit"], action: "/boardroom/replay", icon: "PlayCircle" },
    ],
    searchProviders: [
      { id: "search-sessions", name: "Sessions", entityType: "boardroom_session", searchFields: ["session_type", "scope"], resultRoute: "/boardroom/history?session=:id", icon: "Crown" },
      { id: "search-decisions", name: "Decisions", entityType: "boardroom_decision_receipt", searchFields: ["approved_motion", "rationale_summary"], resultRoute: "/boardroom/history?receipt=:id", icon: "Stamp" },
    ],
    notificationTriggers: [
      { eventSubject: "boardroom.session.opened", title: "Boardroom in session", priority: "high", actionRoute: "/boardroom", groupKey: "boardroom-session" },
      { eventSubject: "boardroom.decision.recorded", title: "Decision recorded", priority: "high", actionRoute: "/boardroom/history", groupKey: "boardroom-decision" },
    ],
  },

  crossDomainEvents: [
    { id: "br-bus-decision", sourceEvent: "boardroom.decision.recorded", sourceDomain: "boardroom", targetDomain: "business", targetAction: "execution.dispatch", description: "Dispatch business execution items from a decision", direction: "emit" },
    { id: "br-fin-decision", sourceEvent: "boardroom.decision.recorded", sourceDomain: "boardroom", targetDomain: "finance", targetAction: "execution.dispatch", description: "Dispatch finance execution items from a decision", direction: "emit" },
    { id: "br-inv-escalation", sourceEvent: "risk.flag-raised", sourceDomain: "investment", targetDomain: "boardroom", targetAction: "session.escalate", description: "Receive risk escalations from Investment Office", direction: "consume" },
  ],

  truthModel: {
    freshnessThresholds: { session: 60, item: 60, evidence: 300, recommendation: 60, "decision-receipt": 0 },
    simulatedSurfaces: [],
    dataSourceClassification: { session: "live", item: "live", evidence: "live", recommendation: "live", "decision-receipt": "live" },
    deterministic: ["decision-receipt.approved_motion", "decision-receipt.proof_trail"],
  },

  aiIntegration: {
    advisorIds: ["chief-advisor", "risk-advisor", "finance-advisor", "business-advisor"],
    capabilityKeys: ["boardroom.recommendation", "boardroom.evidence-grading", "boardroom.replay-summary"],
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    budgetClass: "premium",
  },

  fileIntegration: {
    acceptedTypes: ["application/pdf", "image/*", "text/*"],
    storageBucket: "boardroom-files",
    maxFileSizeMB: 100,
    autoClassify: true,
  },

  boardroomEscalation: {
    manualEscalationEnabled: true,
    autoEscalateRules: [],
  },
};
