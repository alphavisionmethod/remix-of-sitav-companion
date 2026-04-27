// ═══════════════════════════════════════════════════════════════
// Adaptive Contact Layout
// Reorders contact detail sections based on business archetype
// ═══════════════════════════════════════════════════════════════

import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

export interface ContactSection {
  id: string;
  label: string;
  priority: number; // lower = higher priority
}

const SECTION_PRIORITIES: Record<string, Record<string, number>> = {
  ecommerce: {
    "order-history": 1, "lifetime-value": 2, "cart-status": 3, "campaign-source": 4,
    "support-history": 5, "contact-info": 6, "communication": 7, "tasks": 8,
    "notes": 9, "deals": 10, "finance": 11, "files": 12,
  },
  service: {
    "communication": 1, "deals": 2, "tasks": 3, "contact-info": 4,
    "finance": 5, "notes": 6, "files": 7, "support-history": 8,
    "order-history": 12, "cart-status": 12, "lifetime-value": 9,
  },
  "brick-and-mortar": {
    "contact-info": 1, "communication": 2, "tasks": 3, "notes": 4,
    "deals": 5, "finance": 6, "files": 7, "support-history": 8,
  },
  "employee-based": {
    "tasks": 1, "communication": 2, "deals": 3, "contact-info": 4,
    "notes": 5, "finance": 6, "support-history": 7, "files": 8,
  },
  agency: {
    "deals": 1, "communication": 2, "tasks": 3, "finance": 4,
    "contact-info": 5, "notes": 6, "files": 7, "support-history": 8,
  },
};

const DEFAULT_SECTIONS: ContactSection[] = [
  { id: "contact-info", label: "Contact Information", priority: 1 },
  { id: "communication", label: "Communication History", priority: 2 },
  { id: "deals", label: "Deals & Opportunities", priority: 3 },
  { id: "tasks", label: "Tasks & Follow-ups", priority: 4 },
  { id: "notes", label: "Notes", priority: 5 },
  { id: "finance", label: "Financial Summary", priority: 6 },
  { id: "files", label: "Files & Documents", priority: 7 },
  { id: "support-history", label: "Support History", priority: 8 },
];

export function useAdaptiveContactSections(): ContactSection[] {
  const { primaryMode } = useBusinessProfile();
  const priorities = SECTION_PRIORITIES[primaryMode] || SECTION_PRIORITIES.service;

  return [...DEFAULT_SECTIONS]
    .map(section => ({
      ...section,
      priority: priorities[section.id] ?? section.priority,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export function getContactDetailTabs(primaryMode: ProfileArchetype): string[] {
  const tabOrder: Record<string, string[]> = {
    ecommerce: ["overview", "timeline", "deals", "tasks", "notes", "finance", "files", "prep", "concierge", "proof"],
    service: ["overview", "timeline", "deals", "tasks", "finance", "notes", "prep", "files", "concierge", "proof"],
    "brick-and-mortar": ["overview", "timeline", "tasks", "notes", "deals", "finance", "prep", "files", "concierge", "proof"],
    "employee-based": ["overview", "tasks", "timeline", "deals", "notes", "finance", "prep", "files", "concierge", "proof"],
    agency: ["overview", "deals", "timeline", "tasks", "finance", "notes", "prep", "files", "concierge", "proof"],
  };
  return tabOrder[primaryMode] || tabOrder.service;
}
