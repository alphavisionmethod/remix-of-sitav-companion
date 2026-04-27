import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalSearch } from "@/platform/search";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { SectionSkeleton, KPISkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";

import { LeadInboxHeader } from "@/modules/business/components/business/lead-inbox/LeadInboxHeader";
import { LeadScoringDashboard } from "@/modules/business/components/business/lead-inbox/LeadScoringDashboard";
import { LeadPriorityStack } from "@/modules/business/components/business/lead-inbox/LeadPriorityStack";
import { LeadTriageQueue } from "@/modules/business/components/business/lead-inbox/LeadTriageQueue";
import { LeadDetailPanel } from "@/modules/business/components/business/lead-inbox/LeadDetailPanel";
import { LeadBulkTriageBar } from "@/modules/business/components/business/lead-inbox/LeadBulkTriageBar";
import { LeadDuplicateDrawer } from "@/modules/business/components/business/lead-inbox/LeadDuplicateDrawer";
import { ScoreExplainabilityDrawer } from "@/modules/business/components/business/lead-inbox/ScoreExplainabilityDrawer";
import { LeadScoreComparison } from "@/modules/business/components/business/lead-inbox/LeadScoreComparison";
import { useLeadInbox, type InboxFilter } from "@/modules/business/components/business/lead-inbox/useLeadInbox";
import { getInboxStats } from "@/modules/business/components/business/lead-inbox/mock-inbox-data";
import { LEADS_INBOX_FILTER_TABS as FILTER_TABS } from "./_config/LeadsInbox.config";

import { Search, Plus, Plug, ChevronDown, ChevronUp, LayoutGrid, BarChart3, List, ArrowLeftRight, LogIn, Inbox } from "lucide-react";
import { toast } from "sonner";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type ViewMode = "queue" | "priority-stack" | "dashboard";

const LeadsInbox = () => {
  const { navigateTo } = useBusinessNavigation();
  const navigate = useNavigate();
  const { primaryMode } = useBusinessProfile();
  const [showOverview, setShowOverview] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("queue");
  const [duplicateDrawerItem, setDuplicateDrawerItem] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const {
    items, filtered, selected, selectedId, selectedScore,
    filter, setFilter, search, setSearch,
    setSelectedId, checkedIds, toggleCheck, clearChecked,
    triageAction, bulkAction, isLoading, isDemo,
    isUnauthenticated, isError, error, refetch,
    scoreMap, scoreResults,
    explainId, setExplainId, explainScore,
  } = useLeadInbox();

  const stats = getInboxStats(items);

  // Compare mode: when exactly 2 items are checked
  const compareLeads = useMemo(() => {
    if (checkedIds.size !== 2) return null;
    const ids = Array.from(checkedIds);
    const a = items.find(i => i.id === ids[0]);
    const b = items.find(i => i.id === ids[1]);
    const sa = scoreMap.get(ids[0]);
    const sb = scoreMap.get(ids[1]);
    if (a && b && sa && sb) return { a, b, sa, sb };
    return null;
  }, [checkedIds, items, scoreMap]);

  const tabsWithCounts = FILTER_TABS.map(t => {
    let count = 0;
    switch (t.key) {
      case "all": count = items.filter(i => i.triage_status !== "accepted" && i.triage_status !== "rejected").length; break;
      case "new": count = stats.newCount; break;
      case "urgent": count = scoreResults.filter(s => s.urgencyBand === "heating-up" || s.urgencyBand === "needs-response-today").length; break;
      case "high-quality": count = scoreResults.filter(s => s.priorityScore >= 70).length; break;
      case "at-risk": count = scoreResults.filter(s => s.staleRisk > 50).length; break;
      case "recovery": count = scoreResults.filter(s => s.recoveryPotential > 50).length; break;
      case "missing-info": count = stats.incomplete; break;
      case "duplicates": count = stats.duplicates; break;
      case "exceptional": count = scoreResults.filter(s => s.boardroomWorthy).length; break;
      case "snoozed": count = items.filter(i => i.triage_status === "snoozed").length; break;
      case "accepted": count = items.filter(i => i.triage_status === "accepted").length; break;
      case "rejected": count = items.filter(i => i.triage_status === "rejected").length; break;
    }
    return { ...t, count };
  });

  if (isLoading) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner />
        <KPISkeleton count={8} />
        <SectionSkeleton cards={4} columns={1} />
      </motion.div>
    );
  }

  // Unauthenticated → honest sign-in CTA (live mode only).
  if (isUnauthenticated && !isDemo) {
    return (
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner />
        <EmptyStateCard
          icon={LogIn}
          title="Sign in to view your lead inbox"
          description="Inbound leads, scoring, and triage are scoped to your account. Switch to Demo mode to explore the surface with sample data."
          ctaLabel="Open sign-in"
          ctaPath="/auth"
        />
      </motion.div>
    );
  }

  // Live-mode error.
  if (isError) {
    return (
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner />
        <EmptyStateCard
          icon={Inbox}
          title="Couldn't load your inbox"
          description={error?.message ?? "Something went wrong while reading inbound leads."}
          ctaLabel="Retry"
          onAction={() => refetch()}
        />
      </motion.div>
    );
  }

  // Live-mode empty (authenticated, no demo, no rows) → honest empty state.
  // The previous behaviour silently fell back to FALLBACK_INBOX_ITEMS — that
  // was a fake-live leak. We now surface the truth and offer setup actions.
  if (!isDemo && items.length === 0) {
    return (
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner />
        <EmptyStateCard
          icon={Inbox}
          title="No inbound leads yet"
          description="When new leads arrive from your website, integrations, or manual entry, they'll appear here for triage and scoring."
          ctaLabel="Connect a lead source"
          ctaPath="/business/integrations"
        />
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/business/crm-contacts")}>
            Or add a lead manually
          </Button>
        </div>
      </motion.div>
    );
  }

  const criticalCount = scoreResults.filter(s => s.priorityTier === "critical-now").length;
  const summaryParts: string[] = [];
  if (criticalCount > 0) summaryParts.push(`${criticalCount} critical lead${criticalCount > 1 ? "s" : ""} need immediate action`);
  if (stats.newCount > 0) summaryParts.push(`${stats.newCount} new arrival${stats.newCount > 1 ? "s" : ""}`);
  if (stats.urgent > 0) summaryParts.push(`${stats.urgent} urgent`);
  const atRiskCount = scoreResults.filter(s => s.staleRisk > 50).length;
  if (atRiskCount > 0) summaryParts.push(`${atRiskCount} at risk`);
  const summary = summaryParts.length > 0
    ? summaryParts.join(", ") + "."
    : "All caught up — no pending items.";

  const duplicateItem = duplicateDrawerItem ? items.find(i => i.id === duplicateDrawerItem) : null;

  // Detail panel or compare panel
  const renderSidePanel = () => {
    if (compareMode && compareLeads) {
      return (
        <LeadScoreComparison
          leadA={compareLeads.a}
          leadB={compareLeads.b}
          scoreA={compareLeads.sa}
          scoreB={compareLeads.sb}
          onClose={() => { setCompareMode(false); clearChecked(); }}
          onAccept={(id) => { triageAction(id, "accept"); setCompareMode(false); clearChecked(); }}
        />
      );
    }

    if (selected) {
      return (
        <LeadDetailPanel
          item={selected}
          score={selectedScore}
          onClose={() => setSelectedId(null)}
          onAccept={(id) => triageAction(id, "accept")}
          onRoute={(id, dest) => triageAction(id, "route", dest)}
          onReject={(id) => triageAction(id, "reject")}
          onOpenDuplicate={(id) => setDuplicateDrawerItem(id)}
          onExplain={(id) => setExplainId(id)}
        />
      );
    }

    return (
      <div className="hidden lg:block">
        <EmptyState
          variant="card"
          icon={Search}
          title="Select a lead to review"
          description="Click any card to see full details and scoring breakdown."
        />
      </div>
    );
  };

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      {/* Top bar */}
      <FederatedLeadsHints query={search} />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {/* Compare button */}
          {checkedIds.size === 2 && (
            <SitaButton variant="accent" size="sm" onClick={() => setCompareMode(true)}>
              <ArrowLeftRight className="h-3.5 w-3.5" /> Compare
            </SitaButton>
          )}
          {/* View mode toggles */}
          <div className="flex rounded-lg border border-border/40 overflow-hidden">
            <button
              onClick={() => setViewMode("queue")}
              className={`p-2 text-xs ${viewMode === "queue" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              title="Queue View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("priority-stack")}
              className={`p-2 text-xs ${viewMode === "priority-stack" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              title="Priority Stack"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("dashboard")}
              className={`p-2 text-xs ${viewMode === "dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              title="Scoring Dashboard"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
          <SitaButton variant="ghost" size="sm" onClick={() => setShowOverview(v => !v)}>
            {showOverview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </SitaButton>
          <SitaButton variant="secondary" size="sm" onClick={() => navigateTo("integrations")}>
            <Plug className="h-3.5 w-3.5" /> Sources
          </SitaButton>
          <SitaButton variant="primary" size="sm" onClick={() => navigateTo("contacts")}>
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </SitaButton>
        </div>
      </div>

      {/* KPI Header */}
      <AnimatePresence>
        {showOverview && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <LeadInboxHeader items={items} scores={scoreResults} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LeadScoringDashboard
            scores={scoreResults}
            items={items}
            scoreMap={scoreMap}
            onSelectLead={setSelectedId}
            selectedId={selectedId}
          />
        </motion.div>
      )}

      {/* Tabs */}
      <div className="overflow-x-auto pb-1">
        <SitaTabs
          tabs={tabsWithCounts.filter(t => t.count > 0 || ["all", "new", "accepted"].includes(t.key))}
          active={filter}
          onChange={k => setFilter(k as InboxFilter)}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Search by name, company, email, or inquiry..."
        />
      </div>

      {/* Main content */}
      {viewMode === "priority-stack" ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <LeadPriorityStack
              items={items}
              scores={scoreMap}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onExplain={setExplainId}
            />
          </div>
          <div className="lg:col-span-2">
            {renderSidePanel()}
          </div>
        </div>
      ) : viewMode === "queue" ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            <LeadTriageQueue
              items={filtered}
              allItems={items}
              filter={filter}
              selectedId={selectedId}
              checkedIds={checkedIds}
              scoreMap={scoreMap}
              onSelect={setSelectedId}
              onCheck={toggleCheck}
              onAccept={id => triageAction(id, "accept")}
              onRoute={(id, dest) => triageAction(id, "route", dest)}
              onReject={id => triageAction(id, "reject")}
              onSnooze={id => triageAction(id, "snooze")}
              onFlag={id => triageAction(id, "route", "boardroom")}
              onExplain={setExplainId}
              onAddLead={() => navigateTo("contacts")}
              onImport={() => navigateTo("integrations")}
              newCount={stats.newCount}
            />
          </div>
          <div className="lg:col-span-2">
            {renderSidePanel()}
          </div>
        </div>
      ) : null}

      {/* Bulk Triage Bar */}
      <LeadBulkTriageBar
        count={checkedIds.size}
        onAcceptAll={() => bulkAction("accept")}
        onRejectAll={() => bulkAction("reject")}
        onRouteAll={(dest) => bulkAction("route", dest)}
        onClear={clearChecked}
      />

      {/* Duplicate Drawer */}
      {duplicateItem && (
        <LeadDuplicateDrawer
          item={duplicateItem}
          open={!!duplicateDrawerItem}
          onClose={() => setDuplicateDrawerItem(null)}
          onMerge={() => {
            toast.success("Records merged successfully");
            setDuplicateDrawerItem(null);
          }}
          onKeepBoth={() => {
            toast.success("Both records kept — duplicate flag cleared");
            setDuplicateDrawerItem(null);
          }}
        />
      )}

      {/* Score Explainability Drawer */}
      <ScoreExplainabilityDrawer
        score={explainScore}
        open={!!explainId}
        onClose={() => setExplainId(null)}
      />

      {/* Advisor Strip */}
      <ModuleAdvisorInsight
        advisorName={primaryMode === "service" ? "Intake Advisor" : primaryMode === "ecommerce" ? "Growth Advisor" : "Pipeline Advisor"}
        domain="business"
        insight={
          scoreResults.some(s => s.priorityTier === "critical-now")
            ? `${scoreResults.filter(s => s.priorityTier === "critical-now").length} critical lead${scoreResults.filter(s => s.priorityTier === "critical-now").length > 1 ? "s" : ""} need immediate action. Scoring engine identifies ${scoreResults.filter(s => s.staleRisk > 50).length} at-risk leads slipping.`
            : scoreResults.some(s => s.boardroomWorthy)
              ? `${scoreResults.filter(s => s.boardroomWorthy).length} lead${scoreResults.filter(s => s.boardroomWorthy).length > 1 ? "s" : ""} flagged for Boardroom review. Priority distribution looks ${scoreResults.filter(s => s.priorityScore >= 60).length > 3 ? "strong" : "mixed"}.`
              : "Scoring engine active. Lead pool health is stable — continue triaging for optimal conversion."
        }
        confidence={scoreResults.some(s => s.priorityTier === "critical-now") ? 95 : scoreResults.some(s => s.boardroomWorthy) ? 88 : 72}
      />
    </motion.div>
  );
};

// Federated cross-domain hints (Phase S/T) — surfaces non-lead matches inline.
function FederatedLeadsHints({ query }: { query: string }) {
  const { results, search, clearResults } = useGlobalSearch();
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) search(query);
      else clearResults();
    }, 250);
    return () => clearTimeout(t);
  }, [query, search, clearResults]);
  const cross = results.filter((r) => r.type !== "lead").slice(0, 4);
  if (!query.trim() || cross.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/40 bg-secondary/30 p-2.5 text-[11px]">
      <span className="text-muted-foreground mr-2">Also matches in other apps:</span>
      {cross.map((r) => (
        <span key={`${r.type}:${r.id}`} className="mr-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
          {r.domain}/{r.type}: {r.title.slice(0, 32)}
        </span>
      ))}
    </div>
  );
}

export default LeadsInbox;
