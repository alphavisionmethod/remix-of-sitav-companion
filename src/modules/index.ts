// ════════════════════════════════════════════════════════════
// SITA OS — 4-Module Pillar Registry
// Single source of truth for module identity. Used by:
//   - App launcher (priority ordering)
//   - Top-level navigation
//   - Architecture validator
// ════════════════════════════════════════════════════════════

import { BUSINESS_PILLAR } from "./business";
import { CONCIERGE_PILLAR } from "./concierge";
import { FINANCE_PILLAR } from "./finance";
import { HEALTH_PILLAR } from "./health";
import { TRUST_LAYER } from "./_trust";
import { SHARED_LAYER } from "./_shared";

export const PILLARS = [
  BUSINESS_PILLAR,
  CONCIERGE_PILLAR,
  FINANCE_PILLAR,
  HEALTH_PILLAR,
] as const;

export const PLATFORM_LAYERS = [TRUST_LAYER, SHARED_LAYER] as const;

export type PillarId = (typeof PILLARS)[number]["id"];
export type PlatformLayerId = (typeof PLATFORM_LAYERS)[number]["id"];

export {
  BUSINESS_PILLAR,
  CONCIERGE_PILLAR,
  FINANCE_PILLAR,
  HEALTH_PILLAR,
  TRUST_LAYER,
  SHARED_LAYER,
};