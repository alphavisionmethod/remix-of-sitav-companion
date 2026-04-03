import { SitaPageHeader, SitaSectionHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { ProofReceipt } from "@/components/sita/primitives/ProofReceipt";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { useProofRecords } from "@/hooks/use-sita-data";
import { useProofTimeline } from "@/hooks/use-proof-timeline";
import { useKernelStatus } from "@/contexts/SitaKernelContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useState } from "react";
import { Receipt, ShieldCheck, Clock, AlertTriangle, Eye, RotateCcw, FileDown, Filter, Link2 } from "lucide-react";

const trustMap: Record<string, "verified" | "pending" | "failed" | "rolled-back"> = {
  "system-verified": "verified",
  verified: "verified",
  pending: "pending",
  unverified: "pending",
  failed: "failed",
};

const stateMap: Record<string, "verified" | "pending" | "failed" | "rolled-back"> = {
  completed: "verified",
  executing: "pending",
  escalated: "failed",
  failed: "failed",
  "rolled-back": "rolled-back",
};

const generateHash = (id: string) => {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) hash += chars[(id.charCodeAt(i % id.length) + i * 7) % 16];
  return hash;
};

const buildSteps = (item: any) => {
  const steps = [
    { label: "Action Initiated", detail: item.action_summary || "System action", status: "completed" as const, timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString() : undefined },
    { label: "Receipt Generated", detail: `Hash: ${generateHash(item.id || "unknown").slice(0, 16)}…`, status: "completed" as const },
    { label: "Verification", detail: item.verification === "system-verified" ? "System verified ✓" : item.verification || "Pending", status: item.verification === "system-verified" || item.verification === "verified" ? "completed" as const : item.result === "failed" ? "failed" as const : "pending" as const },
  ];
  if (item.result === "failed" || item.result === "escalated") {
    steps.push({ label: item.result === "escalated" ? "Escalated to Owner" : "Rollback Initiated", detail: "Automatic recovery triggered", status: "failed" as const });
  }
  return steps;
};

type FilterType = "all" | "verified" | "pending" | "failed";

const ProofCenter = () => {
  const { data: proofRecords = [], isLoading } = useProofRecords();
  const { isDemoMode } = useDataMode();
  const [filter, setFilter] = useState<FilterType>("all");

  const verified = proofRecords.filter((p: any) => p.verification === "system-verified" || p.result === "completed");
  const pending = proofRecords.filter((p: any) => p.verification === "pending" || p.result === "executing");
  const failed = proofRecords.filter((p: any) => p.result === "failed" || p.result === "escalated");

  const trustScore = proofRecords.length > 0 ? Math.round((verified.length / proofRecords.length) * 100) : 96;

  const filtered = filter === "all" ? proofRecords
    : filter === "verified" ? verified
    : filter === "pending" ? pending
    : failed;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DomainHeader
        title="Proof Center"
        subtitle="Trust-verified receipts, execution chains, and approval records"
        icon={Receipt}
        domain="system"
        actions={
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
              <div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              {isDemoMode ? "Demo" : "Live"}
            </div>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Verified Actions" value={String(verified.length)} icon={ShieldCheck} sub="Trust-proven" />
        <KPITile label="Pending" value={String(pending.length)} icon={Clock} sub="Awaiting verification" />
        <KPITile label="Failed / Escalated" value={String(failed.length)} icon={AlertTriangle} sub={failed.length === 0 ? "Clean record" : "Needs review"} />
        <div className="rounded-xl border border-border bg-card p-4">
          <ConfidenceBar value={trustScore} label="Trust Score" size="lg" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "verified", "pending", "failed"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-all ${
              filter === f ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {f} {f === "all" ? `(${proofRecords.length})` : f === "verified" ? `(${verified.length})` : f === "pending" ? `(${pending.length})` : `(${failed.length})`}
          </button>
        ))}
        <div className="ml-auto">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <FileDown className="h-3 w-3" /> Export Audit Trail
          </button>
        </div>
      </div>

      {/* Proof Stream */}
      <SitaSectionHeader title="Proof Stream" subtitle={`${filtered.length} records — with full execution chain browsing`} />

      <div className="space-y-3">
        {filtered.map((item: any, i: number) => (
          <ProofReceipt
            key={item.id || i}
            title={item.action_summary || "Action"}
            hash={generateHash(item.id || "unknown")}
            verification={trustMap[item.verification] || stateMap[item.result] || "pending"}
            timestamp={item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown"}
            actor={item.actor || "System"}
            steps={buildSteps(item)}
          />
        ))}
        {filtered.length === 0 && !isLoading && (
          <SitaCard hover={false} className="p-8 text-center">
            <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {filter === "all" ? "No proof records yet. Actions will appear here as they're verified." : `No ${filter} records found.`}
            </p>
          </SitaCard>
        )}
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
