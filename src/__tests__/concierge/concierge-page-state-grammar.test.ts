// ═══════════════════════════════════════════════════════════════
// Concierge — Per-Page State-Grammar Audit
// Mirror of src/__tests__/business-os/pages/business-page-state-grammar.test.ts
// for the Concierge module. Every concierge page that touches a
// data hook MUST surface an explicit empty/loading/error grammar
// marker, OR be on the static-shell allow-list.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { CONCIERGE_TRUTH_MANIFEST } from "@/modules/concierge/PRODUCTION_TRUTH_MANIFEST";

const CONCIERGE_PAGES_DIR = "src/modules/concierge/pages";

const DATA_HOOKS = [
  "useQuery",
  "useMutation",
  "useHouseholds",
  "useHouseholdMembers",
  "useHouseholdTasks",
  "useFamilyEvents",
  "useErrands",
  "useGroceryLists",
  "useCalendarData",
  "useServiceProvidersList",
  "useCompanion",
  "supabase.from",
  "supabase.rpc",
];

const STATE_PATTERNS = [
  "isLoading", "isPending", "isFetching", "isError", "isEmpty", "isReady",
  "Skeleton", "PageSkeleton", "SectionSkeleton", "KPISkeleton",
  "EmptyState", "EmptyStateCard", "PremiumEmptyState", "ConciergeEmptyState",
  "Loader", "animate-pulse",
  'state === "loading"', 'state === "error"', 'state === "empty"',
  "Couldn't load", "unavailable", "Sign in", "requires sign-in",
  "truthState=\"partial\"", "truthState=\"degraded\"", "truthState=\"connecting\"",
];

// Container/shell/router pages whose data honesty is delegated to
// composed children, plus pages still tracked as honest-degraded
// debt via the truth manifest (banner already declares partial).
const EXEMPT_PAGES = new Set<string>([
  "ConciergeCenter.tsx",
  "ConciergeOverview.tsx",
  "ConciergeSettings.tsx",
  "ConciergeBoardroom.tsx",
  "ConciergeFiles.tsx",
  "ConciergeProof.tsx",
  "ConciergeWorkflows.tsx",
  "MonthGridCalendar.tsx",
  // Phase 3 IA cleanup — these are 1-line re-exports of their canonical
  // implementations; the empty-state grammar lives in the canonical file
  // (LifeAdminCenter.tsx / HouseholdCommandCenter.tsx) which the test
  // already audits.
  "LifeAdminWorkspace.tsx",
  "HouseholdWorkspace.tsx",
  "index.ts",
]);

function listPages(): string[] {
  return fs.readdirSync(CONCIERGE_PAGES_DIR).filter((f) => f.endsWith(".tsx"));
}

function readPage(file: string): string {
  return fs.readFileSync(path.join(CONCIERGE_PAGES_DIR, file), "utf8");
}

describe("Concierge — page state-grammar audit", () => {
  const pages = listPages();

  it("every page is classified in CONCIERGE_TRUTH_MANIFEST", () => {
    const manifest = new Set(CONCIERGE_TRUTH_MANIFEST.map((e) => e.page));
    const missing = pages
      .map((f) => f.replace(/\.tsx$/, ""))
      .filter((p) => !manifest.has(p));
    expect(missing, `Pages missing from CONCIERGE_TRUTH_MANIFEST: ${missing.join(", ")}`).toEqual([]);
  });

  it("data-hook pages render explicit state grammar", () => {
    const offenders: string[] = [];
    for (const file of pages) {
      if (EXEMPT_PAGES.has(file)) continue;
      const src = readPage(file);
      const usesHook = DATA_HOOKS.some((h) => src.includes(h));
      if (!usesHook) continue;
      const hasGrammar = STATE_PATTERNS.some((p) => src.includes(p));
      if (!hasGrammar) offenders.push(file);
    }
    expect(offenders, `Pages missing state grammar: ${offenders.join(", ")}`).toEqual([]);
  });

  it("degraded pages render an honest empty/setup surface", () => {
    const degraded = CONCIERGE_TRUTH_MANIFEST.filter((e) => e.state === "degraded");
    const offenders: string[] = [];
    for (const entry of degraded) {
      const file = `${entry.page}.tsx`;
      const full = path.join(CONCIERGE_PAGES_DIR, file);
      if (!fs.existsSync(full)) continue;
      const src = fs.readFileSync(full, "utf8");
      const hasEmpty =
        /EmptyStateCard|PremiumEmptyState|ConciergeEmptyState|<EmptyState\b/.test(src) ||
        /PageTruthBanner[^>]*truthState=["'](?:partial|degraded|connecting)["']/.test(src) ||
        /setup-required|setupRequired|connect-an-integration/i.test(src);
      if (!hasEmpty) offenders.push(file);
    }
    expect(offenders, `Degraded pages missing empty-state grammar: ${offenders.join(", ")}`).toEqual([]);
  });
});
