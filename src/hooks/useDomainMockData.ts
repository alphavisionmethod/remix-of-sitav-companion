// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Mock Data Hooks (Contract Masking Layer)
// One hook per domain, wrapping mock imports behind a stable API.
// When live data is ready, swap internals — zero page changes.
// ═══════════════════════════════════════════════════════════════

// ── Re-export types that pages import as type-only ──
export type { CollectionsAccount } from "@/lib/mock-data/collections";
export type { OwnerApprovalItem, OwnerPricingItem } from "@/lib/mock-data/owner";
export type { MockDoc, MockSheet, MockDeck, MockSlide } from "@/lib/mock-data/workspace";
export type { CallingContact, CallingCallLog, CallingCallScript } from "@/lib/mock-data/revenue-calling";

// ── Named re-exports for module-scope usage ──
export { MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES, MOCK_LEAKAGE_INPUT } from "@/lib/mock-data/revenue-autopilot";
export { generateCalendarDemoEvents } from "@/lib/mock-data/calendar";
export { MOCK_CAPITAL_BUCKETS, MOCK_POSITIONS, MOCK_THESES } from "@/lib/mock-data/investment";
export { buildMockSimResult } from "@/lib/mock-data";
export {
  MOCK_CONTACTS, MOCK_CALL_LOGS, MOCK_CALL_SCRIPTS,
} from "@/lib/mock-data/revenue-calling";
