// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Callback Queue Service
// ═══════════════════════════════════════════════════════════════

import type { Lead } from "@/domains/business";

export interface CallbackEntry {
  id: string;
  leadId: string;
  leadName: string;
  priority: "urgent" | "high" | "normal" | "low";
  reason: string;
  scheduledFor: string;
  estimatedDurationMin: number;
  assignedTo: string;
  status: "pending" | "completed" | "skipped" | "rescheduled";
}

export function buildCallbackQueue(leads: Lead[]): CallbackEntry[] {
  return leads
    .filter(l => l.status === "qualified" || l.status === "nurturing")
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((lead, i) => ({
      id: `cb-${lead.id}`,
      leadId: lead.id,
      leadName: lead.name,
      priority: lead.score > 80 ? "urgent" : lead.score > 60 ? "high" : lead.score > 40 ? "normal" : "low",
      reason: lead.score > 80 ? "Hot lead — high engagement" : "Scheduled follow-up",
      scheduledFor: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      estimatedDurationMin: 15,
      assignedTo: "unassigned",
      status: "pending" as const,
    }));
}

export function prioritizeCallbacks(entries: CallbackEntry[]): CallbackEntry[] {
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  return entries.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

