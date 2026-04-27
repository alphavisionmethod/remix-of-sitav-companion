// SITA OS — Concierge Proof page (Phase 7.4)
// Reads canonical concierge receipts from `ai_action_receipts` via
// `useConciergeProofTrail`. Demo mode falls back to a small bundled
// fixture so the surface stays alive in the showcase. The hard-coded
// fake records have been removed — every entry is now provenance-true.

import { useMemo, useState } from "react";
import { KPITile, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import {
  ConciergeReceiptViewer,
  ConciergePageWrapper,
  ConciergeEmptyState,
  type ReceiptRecord,
} from "@/modules/concierge/components/concierge";
import { Shield, CheckCircle, Clock, FileText, BadgeCheck } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useConciergeProofTrail } from "@/modules/concierge/hooks/use-concierge-proof-trail";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import type { ProofEntry } from "@/lib/trust";
import { formatDistanceToNow } from "date-fns";

// ── Demo fallback (only used when realityMode === "demo") ──
function generateDemoTrail(): ProofEntry[] {
  const now = Date.now();
  return [
    {
      id: "demo-1", timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
      action: "executed", actor: { type: "user", name: "You" },
      source: "concierge.errand.create", receipt_hash: "0x4a82c019",
      metadata: { summary: "Created errand: Pick up dry cleaning" },
    },
    {
      id: "demo-2", timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      action: "automated", actor: { type: "automation", name: "Concierge Automation" },
      source: "concierge.automation.activate", receipt_hash: "0x9f128bd2",
      metadata: { summary: "Activated automation: Weekly grocery refresh" },
    },
    {
      id: "demo-3", timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      action: "created", actor: { type: "user", name: "You" },
      source: "concierge.gift.create",
      metadata: { summary: "Tracked gift: Mom — birthday in 12 days" },
    },
  ];
}

function entryToReceiptRecord(e: ProofEntry): ReceiptRecord {
  const summary =
    (e.metadata?.summary as string | undefined) ??
    e.source.replace(/\./g, " · ");
  const verification: ReceiptRecord["verification"] =
    e.action === "failed" || e.action === "rejected"
      ? "unverified"
      : e.action === "executed" || e.action === "approved" || e.action === "verified"
      ? "verified"
      : "pending";
  const ts = formatDistanceToNow(new Date(e.timestamp), { addSuffix: true });
  return {
    id: e.id,
    action: summary,
    timestamp: ts,
    result: e.action,
    verification,
    details: e.receipt_hash ? `Receipt ${e.receipt_hash.slice(0, 10)}…` : undefined,
    who: e.actor.name,
    category: e.source.split(".").slice(0, 2).join("."),
  };
}

const ConciergeProof = () => {
  const [view, setView] = useState<"all" | "verified" | "pending">("all");
  const { isDemo } = useRealityModeSafe();

  const { data: realEntries, isLoading } = useConciergeProofTrail({ enabled: !isDemo });

  const entries: ProofEntry[] = useMemo(() => {
    if (isDemo) return generateDemoTrail();
    return realEntries ?? [];
  }, [isDemo, realEntries]);

  const verified = entries.filter(
    (e) => e.action === "executed" || e.action === "approved" || e.action === "verified",
  ).length;
  const pending = entries.filter(
    (e) => e.action === "created" || e.action === "updated" || e.action === "linked",
  ).length;
  const recent = entries.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 1000 * 60 * 60 * 24 * 7,
  ).length;

  const records: ReceiptRecord[] = useMemo(() => {
    const filtered =
      view === "verified"
        ? entries.filter(
            (e) => e.action === "executed" || e.action === "approved" || e.action === "verified",
          )
        : view === "pending"
        ? entries.filter(
            (e) => e.action === "created" || e.action === "updated" || e.action === "linked",
          )
        : entries;
    return filtered.map(entryToReceiptRecord);
  }, [entries, view]);

  if (!isDemo && isLoading) {
    return (
      <ConciergePageWrapper className="space-y-6">
        <PageTruthBanner />
        <ConciergeEmptyState
          domain="generic"
          title="Loading proof records…"
          description="Fetching the most recent verified concierge actions from your audit trail."
        />
      </ConciergePageWrapper>
    );
  }

  if (entries.length === 0) {
    return (
      <ConciergePageWrapper className="space-y-6">
        <PageTruthBanner />
        <ConciergeEmptyState
          domain="generic"
          title="No proof records yet"
          description="As you complete tasks and confirmations, verified records will appear here — giving you a clear audit trail of everything handled."
        />
      </ConciergePageWrapper>
    );
  }

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Records" value={String(entries.length)} icon={Shield} />
        <KPITile label="Verified" value={String(verified)} icon={CheckCircle} sub="Confirmed actions" />
        <KPITile label="Pending" value={String(pending)} icon={Clock} sub="Awaiting verification" />
        <KPITile label="This Week" value={String(recent)} icon={FileText} />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SitaTabs
          tabs={[
            { key: "all", label: "All Records" },
            { key: "verified", label: "Verified" },
            { key: "pending", label: "Pending" },
          ]}
          active={view}
          onChange={(k) => setView(k as typeof view)}
        />
        {!isDemo && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
            <BadgeCheck className="h-3 w-3" />
            Live receipts
          </span>
        )}
      </div>

      <ConciergeReceiptViewer records={records} />
    </ConciergePageWrapper>
  );
};

export default ConciergeProof;
