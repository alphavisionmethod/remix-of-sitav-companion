// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Session Trace
// In-memory session model for tracking support interactions.
// ═══════════════════════════════════════════════════════════════

import type {
  SupportSession,
  SupportSessionAction,
  SupportSessionStatus,
} from "./support-bundle-contract";

let sessionCounter = 0;

function generateSessionId(): string {
  sessionCounter += 1;
  return `SS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${sessionCounter}`;
}

export class SupportSessionTracer {
  private session: SupportSession;

  constructor(actorId: string, issueRef?: string) {
    this.session = {
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString(),
      status: "open",
      actorIds: [actorId],
      issueRef: issueRef ?? null,
      generatedBundleIds: [],
      actions: [],
      escalationIds: [],
      runbooksConsulted: [],
      killSwitchesSuggested: [],
      closedAt: null,
    };
  }

  get sessionId(): string { return this.session.sessionId; }

  recordAction(actorId: string, action: string, details?: string): this {
    this.session = {
      ...this.session,
      actions: [
        ...this.session.actions,
        { timestamp: new Date().toISOString(), action, actorId, details: details ?? null },
      ],
      actorIds: [...new Set([...this.session.actorIds, actorId])],
    };
    return this;
  }

  recordBundle(bundleId: string): this {
    this.session = {
      ...this.session,
      generatedBundleIds: [...this.session.generatedBundleIds, bundleId],
    };
    return this;
  }

  recordEscalation(escalationId: string): this {
    this.session = {
      ...this.session,
      escalationIds: [...this.session.escalationIds, escalationId],
      status: "escalated",
    };
    return this;
  }

  consultRunbook(runbookId: string): this {
    this.session = {
      ...this.session,
      runbooksConsulted: [...new Set([...this.session.runbooksConsulted, runbookId])],
    };
    return this;
  }

  suggestKillSwitch(switchId: string): this {
    this.session = {
      ...this.session,
      killSwitchesSuggested: [...new Set([...this.session.killSwitchesSuggested, switchId])],
    };
    return this;
  }

  resolve(): this {
    this.session = { ...this.session, status: "resolved" };
    return this;
  }

  close(): SupportSession {
    this.session = {
      ...this.session,
      status: this.session.status === "open" ? "closed" : this.session.status,
      closedAt: new Date().toISOString(),
    };
    return this.session;
  }

  snapshot(): SupportSession {
    return { ...this.session };
  }
}

export function startSupportSession(actorId: string, issueRef?: string): SupportSessionTracer {
  return new SupportSessionTracer(actorId, issueRef);
}