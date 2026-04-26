// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Barrel: src/domains/business
//
// This is the trusted domain layer for Business OS. It owns
// shared business types, status enums, and contracts consumed
// by engines (src/domains/engines/), services
// (src/lib/services/business-os/), and the Business UI
// (src/modules/business/). It MUST NOT import from any of those
// layers — domain depends on nothing.
//
// Import conventions:
//   import type { LeadScoreResult } from "@/domains/business";
//   import { ALL_ARCHETYPES }       from "@/domains/business";
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export * from "./contracts";
