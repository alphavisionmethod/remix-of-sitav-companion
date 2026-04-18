// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Domain Types
// Single import point for domain types. Source of truth lives in
// mock-data/ files but pages import from here (type-only).
// ═══════════════════════════════════════════════════════════════

export type { CollectionsAccount } from "@/lib/mock-data/collections";
export type { OwnerApprovalItem, OwnerPricingItem } from "@/lib/mock-data/owner";
export type { MockDoc, MockSheet, MockDeck, MockSlide } from "@/lib/mock-data/workspace";
export type { CallingContact, CallingCallLog, CallingCallScript } from "@/lib/mock-data/revenue-calling";
