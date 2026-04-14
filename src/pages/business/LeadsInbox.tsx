import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SitaButton } from "@/components/sita/SitaCard";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";

import { LeadInboxHeader } from "@/components/business/lead-inbox/LeadInboxHeader";
import { LeadInboxOverviewCards } from "@/components/business/lead-inbox/LeadInboxOverviewCards";
import { LeadTriageQueue } from "@/components/business/lead-inbox/LeadTriageQueue";
import { LeadDetailPanel } from "@/components/business/lead-inbox/LeadDetailPanel";
import { LeadBulkTriageBar } from "@/components/business/lead-inbox/LeadBulkTriageBar";
import { LeadDuplicateDrawer } from "@/components/business/lead-inbox/LeadDuplicateDrawer";
import { useLeadInbox, type InboxFilter } from "@/components/business/lead-inbox/useLeadInbox";
import { getInboxStats } from "@/components/business/lead-inbox/mock-inbox-data";

import { Search, Plus, Plug, ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

const FILTER_TABS: { key: InboxFilter; label: string }[] = [
  { key: "all", label: "All Pending" },
  { key: "new", label: "New" },
  { key: "urgent", label: "Urgent" },
  { key: "high-quality", label: "High Quality" },
  { key: "missing-info", label: "Missing Info" },
  { key: "duplicates", label: "Duplicates" },
  { key: "exceptional", label: "★ Exceptional" },
  { key: "snoozed", label: "Snoozed" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

const LeadsInbox = () => {
  const { navigateTo } = useBusinessNavigation();
  const { primaryMode } = useBusinessProfile();
  const [showOverview, setShowOverview] = useState(true);
  const [duplicateDrawerItem, setDuplicateDrawerItem] = useState<string | null>(null);

  const {
    items, filtered, selected, selectedId,
    filter, setFilter, search, setSearch,
    setSelectedId, checkedIds, toggleCheck, clearChecked,
    triageAction, bulkAction, isLoading, isDemo,
  } = useLeadInbox();

  const stats = getInboxStats(items);

  const tabsWithCounts = FILTER_TABS.map(t => {
    let count = 0;
    switch (t.key) {
      case "all": count = items.filter(i => i.triage_status !== "accepted" && i.triage_status !== "rejected").length; break;
      case "new": count = stats.newCount; break;
      case "urgent": count = stats.urgent; break;
      case "high-quality": count = stats.highQuality; break;
      case "missing-info": count = stats.incomplete; break;
      case "duplicates": count = stats.duplicates; break;
      case "exceptional": count = stats.exceptional; break;
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
        <KPISkeleton count={6} />
        <SectionSkeleton cards={4} columns={1} />
      </motion.div>
    );
  }

  // Contextual summary
  const summaryParts: string[] = [];
  if (stats.newCount > 0) summaryParts.push(`${stats.newCount} new arrival${stats.newCount > 1 ? "s" : ""} need triage`);
  if (stats.urgent > 0) summaryParts.push(`${stats.urgent} urgent`);
  if (stats.highQuality > 0) summaryParts.push(`${stats.highQuality} high-quality`);
  if (stats.duplicates > 0) summaryParts.push(`${stats.duplicates} possible duplicate${stats.duplicates > 1 ? "s" : ""}`);
  if (stats.exceptional > 0) summaryParts.push(`${stats.exceptional} exceptional`);
  const summary = summaryParts.length > 0
    ? summaryParts.join(", ") + "."
    : "All caught up — no pending items.";

  const duplicateItem = duplicateDrawerItem ? items.find(i => i.id === duplicateDrawerItem) : null;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <SitaButton variant="ghost" size="sm" onClick={() => setShowOverview(v => !v)}>
            {showOverview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <LayoutGrid className="h-3.5 w-3.5" />
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
      <LeadInboxHeader items={items} />

      {/* Overview Cards */}
      <AnimatePresence>
        {showOverview && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <LeadInboxOverviewCards items={items} />
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Main content: queue + detail */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Triage Queue */}
        <div className="lg:col-span-3 space-y-2">
          <LeadTriageQueue
            items={filtered}
            allItems={items}
            filter={filter}
            selectedId={selectedId}
            checkedIds={checkedIds}
            onSelect={setSelectedId}
            onCheck={toggleCheck}
            onAccept={id => triageAction(id, "accept")}
            onRoute={(id, dest) => triageAction(id, "route", dest)}
            onReject={id => triageAction(id, "reject")}
            onSnooze={id => triageAction(id, "snooze")}
            onFlag={id => triageAction(id, "route", "boardroom")}
            onAddLead={() => navigateTo("contacts")}
            onImport={() => navigateTo("integrations")}
            newCount={stats.newCount}
          />
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <LeadDetailPanel
              item={selected}
              onClose={() => setSelectedId(null)}
              onAccept={(id) => triageAction(id, "accept")}
              onRoute={(id, dest) => triageAction(id, "route", dest)}
              onReject={(id) => triageAction(id, "reject")}
              onOpenDuplicate={(id) => setDuplicateDrawerItem(id)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border/30 bg-card/30"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary/20" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Select a lead to review</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Click any card to open the triage workspace with full details and actions</p>
            </motion.div>
          )}
        </div>
      </div>

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

      {/* Advisor Strip */}
      <ModuleAdvisorInsight
        advisorName={primaryMode === "service" ? "Intake Advisor" : primaryMode === "ecommerce" ? "Growth Advisor" : "Pipeline Advisor"}
        domain="business"
        insight={
          stats.exceptional > 0
            ? `${stats.exceptional} exceptional lead${stats.exceptional > 1 ? "s" : ""} detected — route to Boardroom for strategic review. ${stats.urgent} items need urgent triage.`
            : stats.urgent > 0
              ? `${stats.urgent} urgent lead${stats.urgent > 1 ? "s" : ""} waiting — prioritize high-quality arrivals first. Source quality is ${stats.highQuality > stats.incomplete ? "strong" : "mixed"} today.`
              : "Inbox is healthy. Continue processing new arrivals for optimal response times."
        }
        confidence={stats.exceptional > 0 ? 95 : stats.urgent > 0 ? 82 : 70}
      />
    </motion.div>
  );
};

export default LeadsInbox;
