import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { ProofCard } from "@/platform/sita/components/sita/cards";
import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { useState, useMemo } from "react";
import { Shield, CheckCircle, Clock, FileText, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useMoneyProofItems } from "@/hooks/use-domain-data";
import { formatDistanceToNow } from "date-fns";

const categoryLabels: Record<string, string> = {
  bill: "Bill", subscription: "Subscription", reserve: "Reserve", transfer: "Transfer", invoice: "Invoice", approval: "Approval", money: "Money",
};

const MoneyProof = () => {
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: proofItems = [], isLoading } = useMoneyProofItems();

  const selected = proofItems.find((p: Record<string, any>) => p.id === selectedId);

  const filtered = useMemo(() => {
    if (tab === "all") return proofItems;
    if (tab === "verified") return proofItems.filter((p: Record<string, any>) => p.details?.verification === "verified");
    if (tab === "pending") return proofItems.filter((p: Record<string, any>) => p.details?.verification === "pending" || p.details?.result === "pending");
    return proofItems;
  }, [tab, proofItems]);

  const verifiedCount = proofItems.filter((p: Record<string, any>) => p.details?.verification === "verified").length;
  const pendingCount = proofItems.filter((p: Record<string, any>) => p.details?.verification === "pending").length;
  const totalValue = proofItems.reduce((s: number, p: Record<string, any>) => s + (Number(p.details?.amount) || 0), 0);

  if (isLoading) return <SectionSkeleton cards={4} columns={1} />;

  const listPanel = (
    <div className="p-3 space-y-3">
      <SitaTabs
        tabs={[
          { key: "all", label: "All Proof", count: proofItems.length },
          { key: "verified", label: "Verified", count: verifiedCount },
          { key: "pending", label: "Pending", count: pendingCount },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState icon={Shield} title="No proof items" description="Financial actions will generate proof records automatically" />
        ) : filtered.map((p: Record<string, any>) => {
          const d = p.details || {};
          const isVerified = d.verification === "verified";
          const ts = p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : "";
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`micro-hover-lift w-full text-left rounded-xl border p-3 transition-all ${selectedId === p.id ? "border-[hsl(265_55%_58%/0.4)] bg-[hsl(0_0%_12%)]" : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className={`rounded-lg p-1.5 shrink-0 mt-0.5 ${isVerified ? "bg-[hsl(152_55%_48%/0.12)]" : "bg-[hsl(38_85%_58%/0.12)]"}`}>
                    {isVerified ? <CheckCircle className="h-3.5 w-3.5 text-[hsl(152_55%_48%)]" /> : <Clock className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />}
                  </div>
                  <div className="min-w-0">
                    <p className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_85%)] truncate"}>{d.description || p.action}</p>
                    <p className={SITA_TYPE.timelineMeta}>{categoryLabels[p.category] || p.category} · {ts}</p>
                  </div>
                </div>
                {d.amount && <p className="text-sm font-semibold text-[hsl(0_0%_85%)] shrink-0">${Number(d.amount).toLocaleString()}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const detailPanel = selected ? (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-[hsl(265_55%_58%)]" />
        <h3 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_90%)]"}>Proof Detail</h3>
      </div>
      <p className="text-sm font-medium text-[hsl(0_0%_85%)]">{selected.details?.description || selected.action}</p>
      {selected.details?.amount && <p className="text-2xl font-bold text-[hsl(265_55%_58%)]">${Number(selected.details.amount).toLocaleString()}</p>}

      <ProofCard
        title="Verification Chain"
        status={selected.details?.verification === "verified" ? "verified" : "pending"}
        chain={[
          { label: "Action executed", timestamp: selected.created_at },
          { label: selected.details?.policy || "Policy applied" },
          { label: `Result: ${selected.details?.result || "pending"}` },
          ...(selected.details?.approvalRecord ? [{ label: selected.details.approvalRecord }] : []),
        ]}
      />

      {selected.details?.stateAfter && (
        <div className="rounded-xl bg-[hsl(0_0%_100%/0.04)] p-3">
          <h4 className={SITA_TYPE.microLabel + " text-[hsl(0_0%_50%)] mb-1"}>STATE AFTER ACTION</h4>
          <p className="text-sm text-[hsl(0_0%_70%)]">{selected.details.stateAfter}</p>
        </div>
      )}

      {selected.details?.relatedDocs && selected.details.relatedDocs.length > 0 && (
        <div>
          <h4 className={SITA_TYPE.microLabel + " text-[hsl(0_0%_50%)] mb-2"}>RELATED DOCUMENTS</h4>
          <div className="space-y-1.5">
            {selected.details.relatedDocs.map((doc: string, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5">
                <FileText className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
                <span className="text-xs text-[hsl(0_0%_85%)]">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <Shield className="h-8 w-8 text-[hsl(0_0%_30%)] mx-auto mb-3" />
        <p className="text-sm text-[hsl(0_0%_50%)]">Select a proof item to see the full audit trail</p>
      </div>
    </div>
  );

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <div className="px-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Proof Items" value={String(proofItems.length)} icon={Shield} />
        <KPITile label="Verified" value={String(verifiedCount)} icon={CheckCircle} sub="Confirmed & auditable" />
        <KPITile label="Pending" value={String(pendingCount)} icon={Clock} sub="Awaiting confirmation" />
        <KPITile label="Total Value" value={`$${(totalValue / 1000).toFixed(1)}K`} icon={DollarSign} sub="Actions with amounts" />
      </div>

      <SplitWorkspace
        list={listPanel}
        detail={detailPanel}
        hasSelection={!!selected}
        defaultSplit={42}
        className="h-[600px]"
      />
    </motion.div>
  );
};

export default MoneyProof;
