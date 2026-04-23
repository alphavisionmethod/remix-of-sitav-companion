// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge skill pack (Phase E)
// ═══════════════════════════════════════════════════════════════

import type { SitaSkillDef } from "../skill-registry";

export const CONCIERGE_SKILLS: SitaSkillDef[] = [
  {
    id: "concierge.reservation.book",
    domain: "concierge",
    capabilityId: "reservation.book",
    label: "Book reservation",
    description: "Reserve dining / venue / lifestyle slot via concierge connector.",
    risk: "medium",
    reversible: true,
    requiresApproval: false,
    paramHints: { venue: "string", partySize: "number", whenAt: "iso-date" },
  },
  {
    id: "concierge.reservation.reschedule",
    domain: "concierge",
    capabilityId: "reservation.reschedule",
    label: "Reschedule reservation",
    description: "Move a reservation to a new time.",
    risk: "low",
    reversible: true,
    requiresApproval: false,
    paramHints: { reservationId: "uuid", newWhenAt: "iso-date" },
  },
  {
    id: "concierge.reservation.cancel",
    domain: "concierge",
    capabilityId: "reservation.cancel",
    label: "Cancel reservation",
    description: "Cancel an existing reservation — may incur fees.",
    risk: "medium",
    reversible: false,
    requiresApproval: true,
    paramHints: { reservationId: "uuid" },
  },
  {
    id: "concierge.reminder.create",
    domain: "concierge",
    capabilityId: "reminder.create",
    label: "Create reminder",
    description: "Add a personal reminder.",
    risk: "low",
    reversible: true,
    requiresApproval: false,
    paramHints: { text: "string", remindAt: "iso-date" },
  },
  {
    id: "concierge.travel.request",
    domain: "concierge",
    capabilityId: "travel.request",
    label: "Request travel",
    description: "Open a travel request (flight/car/hotel) for owner review.",
    risk: "high",
    reversible: true,
    requiresApproval: true,
    paramHints: { kind: "flight|hotel|car", details: "object" },
  },
  {
    id: "concierge.lifestyle.task",
    domain: "concierge",
    capabilityId: "lifestyle.task",
    label: "Lifestyle task",
    description: "Generic lifestyle errand (gift, courier, household).",
    risk: "low",
    reversible: true,
    requiresApproval: false,
    paramHints: { description: "string" },
  },
];