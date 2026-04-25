// ═══════════════════════════════════════════════════════════════
// SITA OS — Primary Concept Registry (Wave D §D.2)
//
// Single source of truth for cross-cutting **primary product / platform
// concepts**. Each concept has exactly one canonical owner, one canonical
// route family, and one canonical page family. Aliases are compatibility
// devices only.
//
// This registry is consumed by:
//   - scripts/architecture/generate/generate-primary-concept-ownership-map.ts
//   - scripts/architecture/checks/check-primary-concept-uniqueness.ts
//
// Constitution Rule 46 (Wave D §D.2 — Concept Uniqueness Law) — BLOCKING.
// ═══════════════════════════════════════════════════════════════

export type ConceptOwnerType = "module" | "platform" | "admin";

export type ConceptStatus = "canonical" | "alias" | "transitional" | "duplicate-risk";

export interface PrimaryConcept {
  /** Stable canonical concept id, kebab-case. */
  concept: string;
  /** Human-readable display name. */
  displayName: string;
  /** Owner type: module pillar, platform system, or admin plane. */
  ownerType: ConceptOwnerType;
  /** Canonical owner directory (e.g., "src/modules/business" or "src/platform/trust"). */
  ownerPath: string;
  /** Canonical route family prefix (e.g., "/business", "/boardroom"). */
  canonicalRouteFamily: string;
  /** Canonical page family directory (e.g., "src/modules/business/pages"). */
  canonicalPageFamily: string;
  /** Compatibility-only aliases (route prefixes or page paths). MUST NOT host new logic. */
  aliases: string[];
  /** Optional notes about transitional state. */
  notes?: string;
}

export const PRIMARY_CONCEPTS: PrimaryConcept[] = [
  // ─── Module pillars ──────────────────────────────────────────────
  {
    concept: "business-front-door",
    displayName: "Business OS",
    ownerType: "module",
    ownerPath: "src/modules/business",
    canonicalRouteFamily: "/business",
    canonicalPageFamily: "src/modules/business/pages",
    aliases: ["/crm"],
    notes: "Business CRM is a sub-surface of Business OS, not a second front door.",
  },
  {
    concept: "concierge-front-door",
    displayName: "Concierge",
    ownerType: "module",
    ownerPath: "src/modules/concierge",
    canonicalRouteFamily: "/concierge",
    canonicalPageFamily: "src/modules/concierge/pages",
    aliases: [],
  },
  {
    concept: "finance-front-door",
    displayName: "Money / Finance OS",
    ownerType: "module",
    ownerPath: "src/modules/finance",
    canonicalRouteFamily: "/money",
    canonicalPageFamily: "src/modules/finance/pages",
    aliases: ["/finance"],
    notes: "Finance pillar canonicalizes its public route family as /money.",
  },
  {
    concept: "health-front-door",
    displayName: "Health OS",
    ownerType: "module",
    ownerPath: "src/modules/health",
    canonicalRouteFamily: "/health",
    canonicalPageFamily: "src/modules/health/pages",
    aliases: [],
  },

  // ─── Platform systems ────────────────────────────────────────────
  {
    concept: "boardroom",
    displayName: "Boardroom",
    ownerType: "platform",
    ownerPath: "src/platform/boardroom",
    canonicalRouteFamily: "/boardroom",
    canonicalPageFamily: "src/platform/boardroom/pages",
    aliases: [],
  },
  {
    concept: "trust",
    displayName: "Trust Center",
    ownerType: "platform",
    ownerPath: "src/platform/trust",
    canonicalRouteFamily: "/trust",
    canonicalPageFamily: "src/platform/trust/pages",
    aliases: [],
  },
  {
    concept: "personal-brain",
    displayName: "Personal Brain",
    ownerType: "platform",
    ownerPath: "src/platform/personal-brain",
    canonicalRouteFamily: "/personal-brain",
    canonicalPageFamily: "src/platform/personal-brain/pages",
    aliases: [],
  },
  {
    concept: "mission-control",
    displayName: "Mission Control",
    ownerType: "platform",
    ownerPath: "src/platform/mission-control",
    canonicalRouteFamily: "/mission",
    canonicalPageFamily: "src/platform/mission-control/mission-pages",
    aliases: ["/mission-control"],
  },
  {
    concept: "files",
    displayName: "Files",
    ownerType: "platform",
    ownerPath: "src/platform/files",
    canonicalRouteFamily: "/files",
    canonicalPageFamily: "src/platform/files/pages",
    aliases: [],
  },
  {
    concept: "atlas",
    displayName: "Atlas",
    ownerType: "platform",
    ownerPath: "src/platform/atlas",
    canonicalRouteFamily: "/atlas",
    canonicalPageFamily: "src/platform/atlas/pages",
    aliases: [],
  },
  {
    concept: "owner",
    displayName: "Owner Mode",
    ownerType: "platform",
    ownerPath: "src/platform/owner",
    canonicalRouteFamily: "/owner",
    canonicalPageFamily: "src/platform/owner/pages",
    aliases: [],
  },

  // ─── Admin plane (already governed by check-no-duplicate-primary-concept) ──
  {
    concept: "admin-plane",
    displayName: "Admin Control Plane",
    ownerType: "admin",
    ownerPath: "src/admin",
    canonicalRouteFamily: "/admin",
    canonicalPageFamily: "src/admin/modules",
    aliases: ["/operator", "/control"],
    notes: "Per-domain uniqueness is enforced by check-no-duplicate-primary-concept.ts (admin-route-registry).",
  },
];

export const PRIMARY_CONCEPT_INDEX: Map<string, PrimaryConcept> = new Map(
  PRIMARY_CONCEPTS.map((c) => [c.concept, c]),
);