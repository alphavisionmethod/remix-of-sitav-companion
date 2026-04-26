// ═══════════════════════════════════════════════════════════════
// Business OS — Per-Page State-Grammar Audit
// Stricter than the project-wide src/__tests__/pages/page-state-grammar
// heuristic: every Business OS page that touches a data hook MUST
// surface an explicit empty/loading/error grammar marker.
//
// Allow-list: a small set of static-content pages that legitimately
// have no data hooks (e.g. router shells) is permitted to opt out.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const BUSINESS_PAGES_DIR = "src/modules/business/pages";

// Heuristic data-hook markers.
const DATA_HOOKS = [
  "useQuery",
  "useMutation",
  "useCRMContacts",
  "useCRMOpportunities",
  "useCRMCompanies",
  "useCustomers",
  "useScheduledAppointments",
  "useAutopilotConfig",
  "useCollectionsAccounts",
  "usePageData",
  "supabase.from",
  "supabase.rpc",
];

// Honest empty/loading/error grammar markers.
const STATE_PATTERNS = [
  "isLoading", "isPending", "isFetching", "isError", "isEmpty", "isReady",
  "Skeleton", "PageSkeleton", "SectionSkeleton", "KPISkeleton",
  "EmptyState", "EmptyStateCard", "PremiumEmptyState",
  "Loader", "animate-pulse",
  "state === \"loading\"", "state === \"error\"", "state === \"empty\"",
  "Couldn't load", "unavailable", "Sign in", "requires sign-in",
];

// Pages legitimately exempt — these are dispatcher/shell pages without
// their own data layer, OR pages whose state honesty is provided by
// composed children (and is verified by the child's own page test).
const EXEMPT_PAGES = new Set<string>([
  "BusinessCenter.tsx",
  "BusinessOverview.tsx",
  "BusinessSettingsPage.tsx",
  "BusinessBoardroom.tsx",
  "BusinessDocuments.tsx",
  "BusinessOperations.tsx",
  "RecoveredValuePage.tsx",
  "RevenueOpsHome.tsx",
]);

// Known pages that currently fail strict state-grammar honesty.
// These are tracked for incremental remediation — Phase 3 ratchets the
// baseline so it can only shrink, never grow. Each remediation removes
// one entry; this list MUST NOT be added to.
const STATE_GRAMMAR_DEBT = new Set<string>([
  "CRMHealth.tsx",
  "CRMHome.tsx",
  "CRMSegments.tsx",
  "CommunicationsCenter.tsx",
  "StrategicAccountRoom.tsx",
]);

function getPageFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    if (entry.name.endsWith(".tsx")) out.push(path.join(dir, entry.name));
  }
  return out;
}

describe("Business OS — Per-Page State Grammar", () => {
  const pages = getPageFiles(BUSINESS_PAGES_DIR);

  it("audited at least 30 business pages", () => {
    expect(pages.length).toBeGreaterThanOrEqual(30);
  });

  it("every data-hook-using page surfaces an honest state grammar marker", () => {
    const violations: string[] = [];
    for (const p of pages) {
      const base = path.basename(p);
      if (EXEMPT_PAGES.has(base)) continue;
      const code = fs.readFileSync(p, "utf8");
      const usesData = DATA_HOOKS.some((h) => code.includes(h));
      if (!usesData) continue;
      const hasGrammar = STATE_PATTERNS.some((s) => code.includes(s));
      if (!hasGrammar) violations.push(base);
    }
    // Anything in violations that is NOT in the tracked debt set is a
    // *new* regression and must fail the build.
    const newRegressions = violations.filter((v) => !STATE_GRAMMAR_DEBT.has(v));
    if (newRegressions.length > 0) {
      throw new Error(
        `New Business OS state-grammar regressions (page uses data hooks but renders no honest loading/error/empty UI):\n  - ` +
          newRegressions.join("\n  - ") +
          `\n\nFix the page OR (only with reviewer sign-off) add it to STATE_GRAMMAR_DEBT.`,
      );
    }
    // The debt set MUST NOT grow stale either: any debt entry that has
    // since been remediated (no longer a violation) should be removed.
    const staleDebt = [...STATE_GRAMMAR_DEBT].filter((d) => !violations.includes(d));
    if (staleDebt.length > 0) {
      throw new Error(
        `STATE_GRAMMAR_DEBT contains entries that are no longer violations — remove them:\n  - ` +
          staleDebt.join("\n  - "),
      );
    }
    expect(newRegressions).toEqual([]);
  });
});