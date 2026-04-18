// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: No-Show Recovery Service
// ═══════════════════════════════════════════════════════════════

export interface NoShowEvent {
  id: string;
  type: "meeting" | "demo" | "onboarding-call" | "consultation";
  accountId: string;
  contactName: string;
  scheduledAt: string;
  valueCents: number;
}

export interface NoShowRecoveryAction {
  noShowId: string;
  action: "auto-reschedule" | "follow-up-email" | "call" | "escalate";
  scheduledFor: string;
  message: string;
}

export function detectNoShows(events: NoShowEvent[]): NoShowEvent[] {
  return events.filter(e => new Date(e.scheduledAt).getTime() < Date.now());
}

export function buildNoShowRecoveryActions(noShows: NoShowEvent[]): NoShowRecoveryAction[] {
  return noShows.map(ns => {
    const hoursSinceNoShow = (Date.now() - new Date(ns.scheduledAt).getTime()) / 3600000;
    let action: NoShowRecoveryAction["action"] = "follow-up-email";
    let message = `We missed you at the ${ns.type}. Would you like to reschedule?`;

    if (hoursSinceNoShow < 2) {
      action = "auto-reschedule";
      message = `Auto-rescheduling ${ns.type} for next available slot`;
    } else if (hoursSinceNoShow > 48) {
      action = "escalate";
      message = `No-show for ${ns.type} — escalating to account manager`;
    } else if (ns.valueCents > 500000) {
      action = "call";
      message = `High-value no-show — immediate callback recommended`;
    }

    return { noShowId: ns.id, action, scheduledFor: new Date(Date.now() + 3600000).toISOString(), message };
  });
}

export function computeNoShowRate(total: number, noShows: number): number {
  return total > 0 ? Math.round((noShows / total) * 100) : 0;
}

