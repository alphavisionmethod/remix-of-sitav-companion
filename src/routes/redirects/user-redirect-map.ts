// ═══════════════════════════════════════════════════════════════
// SITA OS — User Domain Redirect Map (Phase 2 + Phase 5 expansion)
//
// Hand-curated. User-domain pages are mostly single-shell composites
// (BusinessCenter, MoneyCenter, ConciergeCenter), so there are very
// few duplicate URLs to redirect. This map covers the legacy plural
// /investments/* paths and a handful of pre-shell URLs.
//
// Phase 5 (Investment Routing Consolidation):
//   /investment (singular) is the single canonical Investment Office
//   namespace. Every /investments/* path now redirects to its singular
//   equivalent. Generated from the merged route inventory of:
//     - src/routes/families/investment-routes.tsx        (canonical)
//     - src/routes/families/investment-office-routes.tsx (extended pages)
//     - src/routes/families/experimental-routes.tsx      (former duplicate; removed in Phase 5)
// ═══════════════════════════════════════════════════════════════

export interface UserRedirect {
  from: string;
  to: string;
  reason: "legacy-path" | "domain-rename" | "shell-consolidation";
}

export const USER_REDIRECTS: UserRedirect[] = [
  // ── Investment Office: legacy plural prefix → canonical singular ─
  { from: "/investments", to: "/investment", reason: "domain-rename" },
  { from: "/investments/boardroom", to: "/investment/boardroom", reason: "domain-rename" },
  { from: "/investments/markets", to: "/investment/markets", reason: "domain-rename" },
  { from: "/investments/instrument/:instrumentId", to: "/investment/instrument/:instrumentId", reason: "domain-rename" },
  { from: "/investments/portfolio", to: "/investment/portfolio", reason: "domain-rename" },
  { from: "/investments/strategy", to: "/investment/strategy", reason: "domain-rename" },
  { from: "/investments/execute", to: "/investment/execute", reason: "domain-rename" },
  { from: "/investments/research", to: "/investment/research", reason: "domain-rename" },
  { from: "/investments/journal", to: "/investment/journal", reason: "domain-rename" },
  { from: "/investments/risk", to: "/investment/risk", reason: "domain-rename" },
  { from: "/investments/advisors", to: "/investment/advisors", reason: "domain-rename" },
  { from: "/investments/platforms", to: "/investment/platforms", reason: "domain-rename" },
  { from: "/investments/events", to: "/investment/events", reason: "domain-rename" },
  { from: "/investments/watchlists", to: "/investment/watchlists", reason: "domain-rename" },
  { from: "/investments/receipts", to: "/investment/receipts", reason: "domain-rename" },
  { from: "/investments/beginner", to: "/investment/beginner", reason: "domain-rename" },
  { from: "/investments/advanced", to: "/investment/advanced", reason: "domain-rename" },
  { from: "/investments/capital-twin", to: "/investment/capital-twin", reason: "domain-rename" },
  { from: "/investments/decision-theater", to: "/investment/decision-theater", reason: "domain-rename" },
  { from: "/investments/trading-floor", to: "/investment/trading-floor", reason: "domain-rename" },
  { from: "/investments/war-room", to: "/investment/war-room", reason: "domain-rename" },
  { from: "/investments/time-machine", to: "/investment/time-machine", reason: "domain-rename" },
  { from: "/investments/catalysts", to: "/investment/catalysts", reason: "domain-rename" },
  { from: "/investments/opportunity-map", to: "/investment/opportunity-map", reason: "domain-rename" },
  { from: "/investments/constitution", to: "/investment/constitution", reason: "domain-rename" },
  { from: "/investments/behavioral", to: "/investment/behavioral", reason: "domain-rename" },
  { from: "/investments/memory", to: "/investment/memory", reason: "domain-rename" },
  { from: "/investments/dossier", to: "/investment/dossier", reason: "domain-rename" },
  { from: "/investments/probability-lab", to: "/investment/probability-lab", reason: "domain-rename" },
  { from: "/investments/strategy-dna", to: "/investment/strategy-dna", reason: "domain-rename" },
  { from: "/investments/post-trade", to: "/investment/post-trade", reason: "domain-rename" },
  { from: "/investments/cross-asset", to: "/investment/cross-asset", reason: "domain-rename" },
  { from: "/investments/conviction", to: "/investment/conviction", reason: "domain-rename" },
  { from: "/investments/sizing", to: "/investment/sizing", reason: "domain-rename" },
  { from: "/investments/modes", to: "/investment/modes", reason: "domain-rename" },
  { from: "/investments/readiness", to: "/investment/readiness", reason: "domain-rename" },
  { from: "/investments/capital-purpose", to: "/investment/capital-purpose", reason: "domain-rename" },
  { from: "/investments/what-would-break", to: "/investment/what-would-break", reason: "domain-rename" },
  { from: "/investments/disagreements", to: "/investment/disagreements", reason: "domain-rename" },
  { from: "/investments/family-office", to: "/investment/family-office", reason: "domain-rename" },
  { from: "/investments/knowledge-graph", to: "/investment/knowledge-graph", reason: "domain-rename" },
  // /money/investments was a Finance-shell deep-link to the Investment gate.
  { from: "/money/investments", to: "/investment", reason: "shell-consolidation" },

  // ── Boardroom: legacy single-segment ────────────────────────────
  { from: "/board", to: "/boardroom", reason: "legacy-path" },

  // ── Files: legacy plural ────────────────────────────────────────
  { from: "/file", to: "/files", reason: "legacy-path" },

  // ── Money: legacy /finance prefix ───────────────────────────────
  { from: "/finance", to: "/money", reason: "domain-rename" },
  { from: "/finance/overview", to: "/money/overview", reason: "domain-rename" },
  { from: "/finance/bills", to: "/money/bills", reason: "domain-rename" },

  // ── Business IA Phase 2 cleanup ─────────────────────────────────
  // AutopilotHub → RevenueAutopilotConsole rename. Old slug remains
  // mounted in the shell page map for in-app deep-links, but external
  // bookmarks/URLs are promoted to the canonical control-plane URL.
  { from: "/business/autopilot-hub", to: "/business/revenue-autopilot-console", reason: "domain-rename" },
  // RevenueImpactDashboard demoted to an internal sub-tab of Revenue Home.
  { from: "/business/revenue-impact", to: "/business/revenue", reason: "shell-consolidation" },
];

export type { UserRedirect as UserRedirectEntry };
