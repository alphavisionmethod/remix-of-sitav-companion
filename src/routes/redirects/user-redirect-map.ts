// ═══════════════════════════════════════════════════════════════
// SITA OS — User Domain Redirect Map (Phase 2)
//
// Hand-curated. User-domain pages are mostly single-shell composites
// (BusinessCenter, MoneyCenter, ConciergeCenter), so there are very
// few duplicate URLs to redirect. This map covers the legacy plural
// /investments/* paths and a handful of pre-shell URLs.
// ═══════════════════════════════════════════════════════════════

export interface UserRedirect {
  from: string;
  to: string;
  reason: "legacy-path" | "domain-rename" | "shell-consolidation";
}

export const USER_REDIRECTS: UserRedirect[] = [
  // Investment Office: legacy plural prefix.
  { from: "/investments", to: "/investment", reason: "domain-rename" },
  { from: "/investments/boardroom", to: "/investment/boardroom", reason: "domain-rename" },
  { from: "/investments/markets", to: "/investment/markets", reason: "domain-rename" },
  { from: "/investments/portfolio", to: "/investment/portfolio", reason: "domain-rename" },
  { from: "/investments/strategy", to: "/investment/strategy", reason: "domain-rename" },
  { from: "/investments/execute", to: "/investment/execute", reason: "domain-rename" },
  { from: "/investments/research", to: "/investment/research", reason: "domain-rename" },
  { from: "/investments/risk", to: "/investment/risk", reason: "domain-rename" },
  { from: "/investments/family-office", to: "/investment/family-office", reason: "domain-rename" },

  // Boardroom: legacy single-segment.
  { from: "/board", to: "/boardroom", reason: "legacy-path" },

  // Files: legacy plural.
  { from: "/file", to: "/files", reason: "legacy-path" },

  // Money: legacy /finance prefix.
  { from: "/finance", to: "/money", reason: "domain-rename" },
  { from: "/finance/overview", to: "/money/overview", reason: "domain-rename" },
  { from: "/finance/bills", to: "/money/bills", reason: "domain-rename" },
];

export type { UserRedirect as UserRedirectEntry };
