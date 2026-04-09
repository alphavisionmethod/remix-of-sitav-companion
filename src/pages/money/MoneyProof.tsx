import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState, ProofCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState, useMemo } from "react";
import { Shield, CheckCircle, Clock, FileText, DollarSign, Receipt, AlertTriangle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMoneyProofItems } from "@/hooks/use-domain-data";
import { formatDistanceToNow } from "date-fns";


interface MoneyProofRow {
  created_at?: string;
  details?: unknown;
  id?: string;
}

const categoryLabels: Record<string, string> = {
  bill: "Bill", subscription: "Subscription", reserve: "Reserve", transfer: "Transfer", invoice: "Invoice", approval: "Approval", money: "Money",
};

const MoneyProof = () => {
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: proofItems = [], isLoading } = useMoneyProofItems();

  const selected = proofItems.find((p: MoneyProofRow) => p.id === selectedId);

  const filtered = useMemo(() => {
    if (tab === "all") return proofItems;
    if (tab === "verified") return proofItems.filter((p: MoneyProofRow) => p.details?.verification === "verified");
    if (tab === "pending") return proofItems.filter((p: MoneyProofRow) => p.details?.verification === "pending" || p.details?.result === "pending");
    return proofItems;
  }, [tab, proofItems]);

  const verifiedCount = proofItems.filter((p: MoneyProofRow) => p.details?.verification === "verified").length;
  const pendingCount = proofItems.filter((p: MoneyProofRow) => p.details?.verification === "pending").length;
  const totalValue = proofItems.reduce((s: number, p: any) => s + (Number(p.details?.amount) || 0), 0);

  if (isLoading) return <SectionSkeleton cards={4} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Financial Proof & Receipts" subtitle="Every financial action leaves a verifiable trail" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Proof Items" value={String(proofItems.length)} icon={Shield} />
        <KPITile label="Verified" value={String(verifiedCount)} icon={CheckCircle} sub="Confirmed & auditable" />
        <KPITile label="Pending" value={String(pendingCount)} icon={Clock} sub="Awaiting confirmation" />
        <KPITile label="Total Value" value={`$${(totalValue / 1000).toFixed(1)}K`} icon={DollarSign} sub="Actions with amounts" />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Proof", count: proofItems.length },
          { key: "verified", label: "Verified", count: verifiedCount },
          { key: "pending", label: "Pending", count: pendingCount },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {filtered.length === 0 ? (
            <EmptyState icon={Shield} title="No proof items" description="Financial actions will generate proof records automatically" />
          ) : filtered.map((p: MoneyProofRow) => {
            const d = p.details || {};
            const isVerified = d.verification === "verified";
            const ts = p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : "";
            return (
              <SitaCard key={p.id} onClick={() => setSelectedId(p.id)} selected={selectedId === p.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`rounded-xl p-2 shrink-0 ${isVerified ? "bg-trust-verified/8" : "bg-state-queued/8"}`}>
                      {isVerified ? <CheckCircle className="h-4 w-4 text-trust-verified" /> : <Clock className="h-4 w-4 text-state-queued" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.description || p.action}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">{d.linkedItem || ""}</span>
                        <span className="rounded bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{categoryLabels[p.category] || p.category}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ts}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {d.amount && <p className="font-display text-sm font-bold text-foreground">${Number(d.amount).toLocaleString()}</p>}
                    <TrustBadge level={isVerified ? "verified" : "review"} label={d.verification || "pending"} size="sm" />
                  </div>
                </div>
              </SitaCard>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <SitaCardTitle>Proof Detail</SitaCardTitle>
                </div>
                <p className="text-sm font-medium text-foreground">{selected.details?.description || selected.action}</p>
                {selected.details?.amount && <p className="mt-1 font-display text-2xl font-bold gradient-sita-text">${Number(selected.details.amount).toLocaleString()}</p>}
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Linked Item</span><span className="text-foreground text-right text-xs max-w-[180px]">{selected.details?.linkedItem}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category</span><span className="text-foreground">{categoryLabels[selected.category] || selected.category}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Result</span><TrustBadge level={selected.details?.result === "success" ? "verified" : "review"} label={selected.details?.result || "pending"} size="sm" /></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verification</span><TrustBadge level={selected.details?.verification === "verified" ? "verified" : "review"} label={selected.details?.verification || "pending"} size="sm" /></div>
                </div>
              </SitaCard>

              <SitaCard hover={false}>
                <SitaCardTitle>Policy Snapshot</SitaCardTitle>
                <div className="mt-2 rounded-xl bg-secondary/30 p-3"><p className="text-sm text-foreground">{selected.details?.policy}</p></div>
              </SitaCard>

              {selected.details?.approvalRecord && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Approval Record</SitaCardTitle>
                  <div className="mt-2 rounded-xl bg-trust-verified/5 border border-trust-verified/10 p-3"><p className="text-sm text-foreground">{selected.details.approvalRecord}</p></div>
                </SitaCard>
              )}

              <SitaCard hover={false}>
                <SitaCardTitle>State After Action</SitaCardTitle>
                <div className="mt-2 rounded-xl bg-secondary/30 p-3"><p className="text-sm text-foreground">{selected.details?.stateAfter}</p></div>
              </SitaCard>

              {selected.details?.relatedDocs && selected.details.relatedDocs.length > 0 && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Related Documents</SitaCardTitle>
                  <div className="mt-2 space-y-1.5">
                    {selected.details.relatedDocs.map((doc: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{doc}</span>
                      </div>
                    ))}
                  </div>
                </SitaCard>
              )}
            </>
          ) : (
            <EmptyState icon={Shield} title="Select a proof item" description="Click on any proof record to see the full audit trail, policy snapshot, and verification details" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoneyProof;
