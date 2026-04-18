// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Requirement Map
// For every action class, declares which proofs MUST be emitted.
// Companion: src/lib/platform/proof/proof-registry.ts
// ═══════════════════════════════════════════════════════════════

export type ActionClass =
  | "auth.signin"
  | "auth.signout"
  | "auth.elevate"
  | "files.upload"
  | "files.delete"
  | "files.bulk-delete"
  | "finance.transfer"
  | "finance.recategorize"
  | "comms.send-email"
  | "comms.send-sms"
  | "advisor.recommendation"
  | "advisor.execute"
  | "approval.approve"
  | "approval.reject"
  | "admin.kill-switch"
  | "admin.config-change"
  | "owner.transfer-control"
  | "ai.inference"
  | "connector.exchange-token"
  | "shell.zone-transition";

export interface ProofRequirement {
  readonly actionClass: ActionClass;
  readonly mustEmit: readonly string[];        // proofIds that MUST be produced
  readonly mayEmit: readonly string[];         // proofIds that MAY be produced
  readonly chainTo: string | null;             // proofId of parent in lineage (or null)
  readonly minimumProofs: number;              // hard minimum count
  readonly approvalRequired: boolean;
  readonly emitsNegativeOnRefusal: boolean;
}

export const PROOF_REQUIREMENT_MAP: readonly ProofRequirement[] = [
  { actionClass: "auth.signin",           mustEmit: ["audit-event"],                                        mayEmit: ["device-attestation"], chainTo: null,                  minimumProofs: 1, approvalRequired: false, emitsNegativeOnRefusal: true  },
  { actionClass: "auth.signout",          mustEmit: ["audit-event"],                                        mayEmit: [],                     chainTo: null,                  minimumProofs: 1, approvalRequired: false, emitsNegativeOnRefusal: false },
  { actionClass: "auth.elevate",          mustEmit: ["audit-event", "consent-record"],                      mayEmit: ["device-attestation"], chainTo: null,                  minimumProofs: 2, approvalRequired: false, emitsNegativeOnRefusal: true  },

  { actionClass: "files.upload",          mustEmit: ["execution-event"],                                    mayEmit: ["audit-event"],        chainTo: null,                  minimumProofs: 1, approvalRequired: false, emitsNegativeOnRefusal: true  },
  { actionClass: "files.delete",          mustEmit: ["execution-event", "audit-event"],                     mayEmit: ["reversal-receipt"],   chainTo: null,                  minimumProofs: 2, approvalRequired: false, emitsNegativeOnRefusal: true  },
  { actionClass: "files.bulk-delete",     mustEmit: ["approval-decision", "execution-event", "audit-event"], mayEmit: ["reversal-receipt"],  chainTo: "approval-decision",   minimumProofs: 3, approvalRequired: true,  emitsNegativeOnRefusal: true  },

  { actionClass: "finance.transfer",      mustEmit: ["approval-decision", "execution-event", "audit-event"], mayEmit: ["outcome-verification"], chainTo: "approval-decision", minimumProofs: 3, approvalRequired: true,  emitsNegativeOnRefusal: true  },
  { actionClass: "finance.recategorize",  mustEmit: ["execution-event", "audit-event"],                     mayEmit: ["reversal-receipt"],   chainTo: null,                  minimumProofs: 2, approvalRequired: false, emitsNegativeOnRefusal: true  },

  { actionClass: "comms.send-email",      mustEmit: ["execution-event", "audit-event"],                     mayEmit: ["consent-record"],     chainTo: null,                  minimumProofs: 2, approvalRequired: false, emitsNegativeOnRefusal: true  },
  { actionClass: "comms.send-sms",        mustEmit: ["execution-event", "audit-event", "consent-record"],   mayEmit: [],                     chainTo: null,                  minimumProofs: 3, approvalRequired: false, emitsNegativeOnRefusal: true  },

  { actionClass: "advisor.recommendation", mustEmit: ["flagship-loop-step", "ai-inference-receipt"],        mayEmit: [],                     chainTo: null,                  minimumProofs: 2, approvalRequired: false, emitsNegativeOnRefusal: false },
  { actionClass: "advisor.execute",       mustEmit: ["execution-binding", "execution-event", "outcome-verification"], mayEmit: ["audit-event"], chainTo: "approval-decision", minimumProofs: 3, approvalRequired: true,  emitsNegativeOnRefusal: true  },

  { actionClass: "approval.approve",      mustEmit: ["approval-decision", "audit-event", "flagship-loop-step"], mayEmit: ["execution-binding"], chainTo: null,             minimumProofs: 3, approvalRequired: false, emitsNegativeOnRefusal: false },
  { actionClass: "approval.reject",       mustEmit: ["approval-decision", "audit-event", "flagship-loop-step"], mayEmit: ["negative-receipt"],  chainTo: null,             minimumProofs: 3, approvalRequired: false, emitsNegativeOnRefusal: false },

  { actionClass: "admin.kill-switch",     mustEmit: ["audit-event", "consent-record"],                      mayEmit: ["execution-event"],    chainTo: null,                  minimumProofs: 2, approvalRequired: true,  emitsNegativeOnRefusal: true  },
  { actionClass: "admin.config-change",   mustEmit: ["audit-event"],                                        mayEmit: ["reversal-receipt"],   chainTo: null,                  minimumProofs: 1, approvalRequired: false, emitsNegativeOnRefusal: true  },

  { actionClass: "owner.transfer-control", mustEmit: ["approval-decision", "audit-event", "consent-record", "device-attestation"], mayEmit: [], chainTo: null,              minimumProofs: 4, approvalRequired: true,  emitsNegativeOnRefusal: true  },

  { actionClass: "ai.inference",          mustEmit: ["ai-inference-receipt"],                               mayEmit: [],                     chainTo: null,                  minimumProofs: 1, approvalRequired: false, emitsNegativeOnRefusal: true  },
  { actionClass: "connector.exchange-token", mustEmit: ["audit-event", "device-attestation"],               mayEmit: [],                     chainTo: null,                  minimumProofs: 2, approvalRequired: false, emitsNegativeOnRefusal: true  },
  { actionClass: "shell.zone-transition", mustEmit: ["audit-event"],                                        mayEmit: [],                     chainTo: null,                  minimumProofs: 1, approvalRequired: false, emitsNegativeOnRefusal: true  },
] as const;

export function getProofRequirement(actionClass: ActionClass): ProofRequirement | undefined {
  return PROOF_REQUIREMENT_MAP.find((e) => e.actionClass === actionClass);
}

export function actionsRequiringApproval(): readonly ActionClass[] {
  return PROOF_REQUIREMENT_MAP.filter((r) => r.approvalRequired).map((r) => r.actionClass);
}
