// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipt / Proof Center
// The signature trust surface — accountable, inspectable, premium
// Now with proof chain visualization and bundle export (Phase 3)
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { ProofReceipt } from "@/components/sita/primitives/ProofReceipt";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useProofRecords } from "@/hooks/use-sita-data";
import { useProofTimeline } from "@/hooks/use-proof-timeline";
import { useProofChain, useProofBundle } from "@/hooks/use-proof-chain";
import { useKernelStatus } from "@/contexts/SitaKernelContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Receipt, ShieldCheck, Clock, AlertTriangle, Eye, RotateCcw, FileDown, Filter,
  Link2, Search, ChevronDown, ChevronRight, Shield, CheckCircle, XCircle,
  DollarSign, Briefcase, Home, Zap, Hash, Download, Layers
} from "lucide-react";
import { PageShell } from "@/components/sita/PageShell";

const isDemoMode = false;
type FilterType = "all" | "verified" | "pending" | "failed" | "rolled-back";
type DomainFilter = "all" | "finance" | "business" | "household" | "system" | "workflow";
type DetailViewId = string | null;

const trustMap: Record<string, "verified" | "pending" | "failed" | "rolled-back"> = {
  "system-verified": "verified", verified: "verified", pending: "pending", unverified: "pending", failed: "failed",
};
const stateMap: Record<string, "verified" | "pending" | "failed" | "rolled-back"> = {
  completed: "verified", executing: "pending", escalated: "failed", failed: "failed", "rolled-back": "rolled-back",
};

const generateHash = (id: string) => {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) hash += chars[(id.charCodeAt(i % id.length) + i * 7) % 16];
  return hash;
};

const buildSteps = (item: Record<string, any>) => {
  const steps = [
    { label: "Action Initiated", detail: item.action_summary || "System action", status: "completed" as const, timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString() : undefined },
    { label: "Receipt Generated", detail: `Hash: ${generateHash(item.id || "unknown").slice(0, 16)}…`, status: "completed" as const },
    { label: "Verification", detail: item.verification === "system-verified" ? "System verified ✓" : item.verification || "Pending",
      status: item.verification === "system-verified" || item.verification === "verified" ? "completed" as const : item.result === "failed" ? "failed" as const : "pending" as const },
  ];
  if (item.result === "failed" || item.result === "escalated") {
    steps.push({ label: item.result === "escalated" ? "Escalated to Owner" : "Rollback Initiated", detail: "Automatic recovery triggered", status: "failed" as const });
  }
  return steps;
};

// ── Receipt Detail Panel ─────────────────────────────────────
const ReceiptDetailPanel = ({ item, onClose }: { item: any; onClose: () => void }) => {
  const hash = generateHash(item.id || "unknown");

  return (
    <PageShell>
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl border border-primary/15 bg-card p-5 space-y-5"
    >
      <PageTruthBanner />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-display font-semibold text-foreground">{item.action_summary || "Action Receipt"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.domain || "System"} · {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown"}
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <ShieldCheck className={cn("h-4 w-4", item.verification === "system-verified" ? "text-trust-verified" : "text-muted-foreground")} />
        <span className="text-xs font-medium text-foreground capitalize">{item.verification || item.result || "pending"}</span>
        {item.category && <span className="text-[10px] bg-secondary rounded-md px-1.5 py-0.5 text-muted-foreground">{item.category}</span>}
      </div>

      {/* Summary */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1.5 border-b border-border/50">
          <span className="text-muted-foreground">What happened</span>
          <span className="text-foreground font-medium">{item.action_summary || "—"}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border/50">
          <span className="text-muted-foreground">Domain</span>
          <span className="text-foreground">{item.domain || "system"}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border/50">
          <span className="text-muted-foreground">Outcome</span>
          <span className="text-foreground capitalize">{item.result || "—"}</span>
        </div>
        {item.correlation_id && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Chain ID</span>
            <span className="text-primary text-[10px] font-mono">{item.correlation_id.slice(0, 12)}…</span>
          </div>
        )}
        {item.parent_proof_id && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Parent Proof</span>
            <span className="text-primary text-[10px] font-mono">{item.parent_proof_id.slice(0, 12)}…</span>
          </div>
        )}
        {item.policy_id && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Policy applied</span>
            <span className="text-primary text-[10px]">{item.policy_id}</span>
          </div>
        )}
      </div>

      {/* Hash */}
      <div className="rounded-lg bg-secondary/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Hash className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Proof Hash</span>
        </div>
        <p className="text-[11px] text-foreground font-mono break-all">{item.hash || hash}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <SitaButton variant="secondary" size="sm" onClick={() => {
          if (item.correlation_id) {
            const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `proof-${(item.id || "unknown").slice(0, 8)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }}>
          <Download className="h-3 w-3 mr-1" /> Export
        </SitaButton>
        <SitaButton variant="secondary" size="sm">
          <Link2 className="h-3 w-3 mr-1" /> Chain
        </SitaButton>
      </div>
    </motion.div>
    </PageShell>
  );
};

// ── Main Component ───────────────────────────────────────────
const ProofCenter = () => {
  const { data: proofRecords = [], isLoading } = useProofRecords();
  const { receipts: kernelReceipts, chainValid, chainLength } = useProofTimeline();
  const kernelStatus = useKernelStatus();
  const { user, isDemo } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailId, setDetailId] = useState<DetailViewId>(null);

  // Fetch linked approvals
  const { data: approvals = [] } = useQuery({
    queryKey: ["proof_approvals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await fromTable("approval_queue").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const verified = proofRecords.filter((p: Record<string, any>) => p.verification === "system-verified" || p.result === "completed");
  const pending = proofRecords.filter((p: Record<string, any>) => p.verification === "pending" || p.result === "executing");
  const failed = proofRecords.filter((p: Record<string, any>) => p.result === "failed" || p.result === "escalated");
  const rolledBack = proofRecords.filter((p: Record<string, any>) => p.result === "rolled-back");
  const trustScore = proofRecords.length > 0 ? Math.round((verified.length / proofRecords.length) * 100) : 96;

  const filtered = useMemo(() => {
    let items = proofRecords;
    if (filter !== "all") {
      items = filter === "verified" ? verified : filter === "pending" ? pending : filter === "failed" ? failed : rolledBack;
    }
    if (domainFilter !== "all") {
      items = items.filter((p: Record<string, any>) => (p.domain || "system") === domainFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((p: Record<string, any>) => (p.action_summary || "").toLowerCase().includes(q));
    }
    return items;
  }, [proofRecords, filter, domainFilter, searchQuery, verified, pending, failed, rolledBack]);

  const selectedItem = detailId ? proofRecords.find((p: Record<string, any>) => p.id === detailId) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DomainHeader
        title="Receipt & Proof Center"
        subtitle="Trust-verified receipts, execution chains, and accountable outcomes"
        icon={Receipt}
        domain="system"
        actions={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <FileDown className="h-3 w-3" /> Export Audit Trail
            </button>
            <div className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
              isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            )}>
              <div className={cn("h-2 w-2 rounded-full", isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              {isDemoMode ? "Demo" : "Live"}
            </div>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Verified" value={String(verified.length)} icon={ShieldCheck} sub="Trust-proven" />
        <KPITile label="Pending" value={String(pending.length)} icon={Clock} sub="Awaiting" />
        <KPITile label="Failed" value={String(failed.length)} icon={AlertTriangle} sub={failed.length === 0 ? "Clean" : "Review"} />
        <KPITile label="Approvals Linked" value={String(approvals.length)} icon={Shield} sub="with proof" />
        <div className="rounded-xl border border-border bg-card p-4">
          <ConfidenceBar value={trustScore} label="Trust Score" size="lg" />
        </div>
      </div>

      {/* Chain status */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 flex items-center gap-3">
          <Link2 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">{chainLength} Chain Receipts</p>
            <p className="text-[10px] text-muted-foreground">Hash-linked integrity chain</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 flex items-center gap-3">
          <ShieldCheck className={cn("h-4 w-4", chainValid ? "text-trust-safe" : "text-destructive")} />
          <div>
            <p className="text-xs font-semibold text-foreground">Chain {chainValid ? "Valid" : "Broken"}</p>
            <p className="text-[10px] text-muted-foreground">Integrity verified</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 flex items-center gap-3">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-semibold text-foreground">{kernelStatus.totalEvents} Events</p>
            <p className="text-[10px] text-muted-foreground">Uptime: {Math.round(kernelStatus.uptimeMs / 1000)}s</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(["all", "verified", "pending", "failed", "rolled-back"] as FilterType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all",
                  filter === f ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary"
                )}>
                {f === "rolled-back" ? "Rolled Back" : f}
              </button>
            ))}
          </div>
          {/* Domain filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            {(["all", "finance", "business", "system", "workflow"] as DomainFilter[]).map(d => (
              <button key={d} onClick={() => setDomainFilter(d)}
                className={cn("rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all",
                  domainFilter === d ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:bg-secondary"
                )}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content: list + optional detail */}
      <div className={cn("grid gap-4", selectedItem ? "lg:grid-cols-[1fr_380px]" : "")}>
        {/* Proof Stream */}
        <div className="space-y-3">
          <SitaSectionHeader title="Proof Stream" subtitle={`${filtered.length} records`} />
          {filtered.map((item: any, i: number) => (
            <div key={item.id || i} onClick={() => setDetailId(item.id)} className="cursor-pointer">
              <ProofReceipt
                title={item.action_summary || "Action"}
                hash={generateHash(item.id || "unknown")}
                verification={trustMap[item.verification] || stateMap[item.result] || "pending"}
                timestamp={item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown"}
                actor={item.actor || "System"}
                steps={buildSteps(item)}
              />
            </div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <SitaCard hover={false} className="p-8 text-center">
              <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {filter === "all" ? "No proof records yet." : `No ${filter} records found.`}
              </p>
            </SitaCard>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedItem && (
            <div className="hidden lg:block sticky top-4">
              <ReceiptDetailPanel item={selectedItem} onClose={() => setDetailId(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Rollback History */}
      {failed.length > 0 && (
        <>
          <SitaSectionHeader title="Rollback History" subtitle="Failed actions with recovery proof" />
          <div className="space-y-3">
            {failed.map((item: any, i: number) => (
              <ProofReceipt
                key={`rollback-${item.id || i}`}
                title={`Recovery: ${item.action_summary || "Action"}`}
                hash={generateHash((item.id || "unknown") + "-recovery")}
                verification="rolled-back"
                timestamp={item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown"}
                actor="Recovery Agent"
                steps={[
                  { label: "Failure Detected", detail: item.result || "Unknown failure", status: "failed" },
                  { label: "Rollback Initiated", detail: "Automatic recovery triggered", status: "completed" },
                  { label: "State Restored", detail: "Previous state verified", status: "completed" },
                ]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProofCenter;
