// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Gift Reminders Service
// Domain types imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { GiftReminder } from "@/domains/concierge";

export type { GiftReminder };

export function getUpcomingGiftReminders(): GiftReminder[] {
  return [
    { id: "g-1", recipientName: "Mom", occasion: "Birthday", date: new Date(Date.now() + 21 * 86400000).toISOString(), daysUntil: 21, budgetCents: 15000, ideas: ["Spa gift card", "Book collection", "Garden tools"], purchased: false },
    { id: "g-2", recipientName: "Partner", occasion: "Anniversary", date: new Date(Date.now() + 45 * 86400000).toISOString(), daysUntil: 45, budgetCents: 25000, ideas: ["Weekend trip", "Jewelry", "Experience gift"], purchased: false },
  ];
}

export function filterUrgent(reminders: GiftReminder[], daysThreshold: number = 14): GiftReminder[] {
  return reminders.filter(r => r.daysUntil <= daysThreshold && !r.purchased);
}

