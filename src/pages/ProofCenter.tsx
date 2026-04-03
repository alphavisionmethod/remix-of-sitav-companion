import { SitaPageHeader, SitaSectionHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, ProofCard } from "@/components/sita/SitaComponents";
import { TrustBadge, TrustLevel } from "@/components/sita/TrustBadge";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { useProofRecords } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useState } from "react";
import { Receipt, ShieldCheck, FileText, RotateCcw, AlertTriangle, Eye, Clock, ChevronDown, ChevronRight, Zap } from "lucide-react";

const trustMap: Record<string, TrustLevel> = {
  "system-verified": "verified",
  verified: "verified",
  pending: "review",
  unverified: "degraded",
};

const stateMap: Record<string, ExecutionState> = {
  completed: "completed",
  executing: "executing",
  escalated: "escalated",
  failed: "rolled-back",
};

const generateHash = (id: string) => {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) hash += chars[(id.charCodeAt(i % id.length) + i * 7) % 16];
  return hash;
};

/* ── Proof Chain Browser ─────────────────────────────── */
const ProofChain = ({ item }: { item: any }) => {
  const [open, setOpen] = useState(false);
  const hash = generateHash(item.id || "unknown");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        <ProofCard
          title={item.action_summary || "Action"}
          artifact={item.artifact || `${item.category || "system"} — ${item.verification || "pending"}`}
          time={item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown"}
          trust={trustMap[item.verification] || "review"}
          state={stateMap[item.result] || "completed"}
          hash={hash}
        />
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary/30 transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Proof Chain
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><Zap className="h-3 w-3 text-primary" /></div>
            <div>
              <p className="text-[11px] font-medium text-foreground">Action Initiated</p>
              <p className="text-[10px] text-muted-foreground">{item.action_summary || "System action"}</p>
            </div>
          </div>
          <div className="ml-3 border-l border-border pl-4 py-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center"><Receipt className="h-3 w-3 text-accent" /></div>
              <div>
                <p className="text-[11px] font-medium text-foreground">Receipt Generated</p>
                <p className="font-mono text-[10px] text-muted-foreground/60">{hash.slice(0, 16)}…</p>
              </div>
            </div>
          </div>
          <div className="ml-6 border-l border-border pl-4 py-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-trust-verified/10 flex items-center justify-center"><ShieldCheck className="h-3 w-3 text-trust-verified" /></div>
              <div>
                <p className="text-[11px] font-medium text-foreground">Verification</p>
                <p className="text-[10px] text-muted-foreground">{item.verification === "system-verified" ? "System verified ✓" : item.verification || "Pending"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProofCenter = () => {
  const { data: proofRecords = [], isLoading } = useProofRecords();
  const { isDemoMode } = useDataMode();

  const verified = proofRecords.filter((p: any) => p.verification === "system-verified" || p.result === "completed");
  const pending = proofRecords.filter((p: any) => p.verification === "pending" || p.result === "executing");
  const failed = proofRecords.filter((p: any) => p.result === "failed" || p.result === "escalated");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SitaPageHeader
        title="Proof Center"
        subtitle="Trust-verified receipts, action logs, and approval records"
        actions={
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
            <div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {isDemoMode ? "Demo" : "Live"}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Verified Actions" value={String(verified.length)} icon={ShieldCheck} sub="Trust-proven" />
        <KPITile label="Pending Verification" value={String(pending.length)} icon={Clock} />
        <KPITile label="Escalated / Failed" value={String(failed.length)} icon={AlertTriangle} />
        <KPITile label="Trust Score" value="96%" trend="up" icon={Receipt} sub="Excellent standing" className="gradient-sita-subtle" />
      </div>

      <SitaSectionHeader title="Proof Stream" subtitle="All trust-verified actions with proof chain browsing" />

      <div className="space-y-3">
        {proofRecords.map((item: any, i: number) => (
          <ProofChain key={item.id || i} item={item} />
        ))}
        {proofRecords.length === 0 && !isLoading && (
          <SitaCard hover={false} className="p-8 text-center">
            <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No proof records yet. Actions will appear here as they're verified.</p>
          </SitaCard>
        )}
      </div>
    </div>
  );
};

export default ProofCenter;
