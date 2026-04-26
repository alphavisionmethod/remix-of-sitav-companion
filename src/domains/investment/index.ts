// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Barrel: src/domains/investment
//
// Trusted domain layer for the Investment Office. Owns:
//   • Domain types (instruments, portfolios, advisors, theses, …)
//   • Demo fixtures (gated behind isDemoMode at consumer layer)
//
// Pages, hooks, services and components MUST import from this
// barrel — NOT from `./types` or `./fixtures` directly.
//
// Domain depends on nothing — no UI, no Supabase, no engines.
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export * from "./fixtures";
