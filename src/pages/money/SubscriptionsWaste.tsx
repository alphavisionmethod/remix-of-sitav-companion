import { HeroCard, SummaryCard, QueueCard, ActionCard, AdvisorCard } from "@/components/sita/cards";
import { FreshnessBadge, UrgencyBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SubscriptionTrendsChart, SubscriptionCategoryChart } from "@/components/sita/SitaCharts";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { ContextDrawer } from "@/components/sita/SitaComponents";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/useAction";
import { CreditCard, AlertTriangle, Plus, Trash2, Pencil, Pause, Play, XCircle, Eye, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { useQueryFreshness } from "@/hooks/use-query-freshness";




interface EnrichedSub { waste_flag: boolean; duplicate_of: string; usage_level: string; [key: string]: unknown; }
function enrichSub(s: Record<string, unknown>): EnrichedSub {
  return { ...s, waste_flag: typeof s.waste_flag === "boolean" ? s.waste_flag : (typeof s.usage_score === "number" && s.usage_score <= 20 && s.status === "active"), duplicate_of: typeof s.duplicate_of === "string" ? s.duplicate_of : "", usage_level: typeof s.usage_level === "string" ? s.usage_level : String(s.usage_score ?? "unknown") };
}

interface SubForm { service_name: string; amount: string; billing_cycle: string; category: string; renewal_date: string; usage_level: string; waste_flag: boolean; duplicate_of: string; notes: string; }
const emptyForm: SubForm = { service_name: "", amount: "", billing_cycle: "monthly", category: "", renewal_date: "", usage_level: "unknown", waste_flag: false, duplicate_of: "", notes: "" };

const SubscriptionsWaste = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SubForm>(emptyForm);

  const subsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => { const { data, error } = await fromTable("subscriptions").select("*").order("name", { ascending: true }); if (error) throw error; return data; },
  });
  const subscriptions = subsQuery.data ?? [];
  const isLoading = subsQuery.isLoading;
  const freshness = useQueryFreshness(subsQuery);

  const createMutation = useAction<SubForm>("finance", "subscription.create", { successMessage: "Subscription added", invalidateKeys: [["subscriptions"]], onSuccess: () => { setShowForm(false); setForm(emptyForm); } });
  const deleteMutation = useAction("finance", "subscription.delete", { successMessage: "Subscription deleted", invalidateKeys: [["subscriptions"]], onSuccess: () => { setSelectedId(null); } });
  const statusMutation = useAction("finance", "subscription.status", { successMessage: "Status updated", invalidateKeys: [["subscriptions"]] });

  const active = subscriptions.filter(s => s.status === "active");
  const totalMonthly = active.reduce((s, sub) => s + Number(sub.amount), 0);
  const wasteSubs = subscriptions.filter(s => enrichSub(s as Record<string, unknown>).waste_flag && s.status === "active");
  const wasteMonthly = wasteSubs.reduce((s, sub) => s + Number(sub.amount), 0);

  const filtered = tab === "all" ? subscriptions : tab === "waste" ? wasteSubs : tab === "paused" ? subscriptions.filter(s => s.status === "paused" || s.status === "cancelled") : subscriptions.filter(s => enrichSub(s as Record<string, unknown>).duplicate_of);
  const selected = subscriptions.find(s => s.id === selectedId);

  const annualized = (amount: number, cycle: string | null) => {
    const m = cycle === "weekly" ? 52 : cycle === "quarterly" ? 4 : cycle === "annually" ? 1 : 12;
    return amount * m;
  };

  const wasteQueueItems = wasteSubs.map(sub => ({
    id: sub.id,
    label: sub.name,
    meta: `$${Number(sub.amount).toFixed(0)}/mo`,
    urgency: "high" as const,
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner truthState="live" freshness={freshness.label} />
      <ConfirmationDialog state={confirmation} />

      <HeroCard
        title="Subscriptions & Waste"
        metric={`$${totalMonthly.toFixed(0)}/mo`}
        subtitle={`${active.length} active · $${wasteMonthly.toFixed(0)}/mo waste detected`}
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(165 50% 42%)"
        icon={<CreditCard className="h-5 w-5 text-[hsl(152_55%_58%)]" />}
      >
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(152_55%_48%/0.15)] hover:bg-[hsl(152_55%_48%/0.25)] text-[hsl(152_55%_58%)] text-[11px] font-medium transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Subscription
        </button>
      </HeroCard>

      <SummaryCard
        title="Subscription Health"
        kpis={[
          { label: "Active", value: String(active.length) },
          { label: "Monthly Total", value: `$${totalMonthly.toFixed(0)}` },
          { label: "Estimated Waste", value: `$${wasteMonthly.toFixed(0)}/mo`, trend: "down" },
          { label: "Flagged", value: String(wasteSubs.length) },
        ]}
        icon={<AlertTriangle className="h-4 w-4 text-[hsl(38_85%_58%)]" />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SubscriptionTrendsChart />
        <SubscriptionCategoryChart />
      </div>

      {wasteSubs.length > 0 && (
        <ActionCard
          title={`Save up to $${(wasteMonthly * 12).toFixed(0)}/year`}
          description={`${wasteSubs.length} subscriptions flagged as waste — review and cancel`}
          accentColor="hsl(38 85% 58%)"
          onApprove={() => setTab("waste")}
        />
      )}

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: subscriptions.length },
          { key: "waste", label: "Likely Waste", count: wasteSubs.length },
          { key: "paused", label: "Paused/Cancelled", count: subscriptions.filter(s => s.status === "paused" || s.status === "cancelled").length },
          { key: "duplicates", label: "Duplicates", count: subscriptions.filter(s => enrichSub(s as Record<string, unknown>).duplicate_of).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-[hsl(0_0%_100%/0.03)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
          <CreditCard className="h-6 w-6 text-[hsl(0_0%_40%)] mx-auto mb-2" />
          <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_70%)]")}>No subscriptions</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map(sub => (
              <div key={sub.id} onClick={() => setSelectedId(sub.id)} className="cursor-pointer">
                <ActionCard
                  title={sub.name}
                  description={`${sub.category || "Uncategorized"} · $${Number(sub.amount).toFixed(2)}/${sub.frequency === "annually" ? "yr" : "mo"}`}
                  accentColor={enrichSub(sub as Record<string, unknown>).waste_flag ? "hsl(0 70% 55%)" : "hsl(152 55% 48%)"}
                  badge={enrichSub(sub as Record<string, unknown>).waste_flag ? <UrgencyBadge urgency="critical" /> : undefined}
                />
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-3">
            {selected ? (
              <>
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_9%)] p-5">
                  <h4 className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)] mb-1")}>{selected.name}</h4>
                  <p className={cn(SITA_TYPE.metricEmphasis, "text-[hsl(0_0%_95%)]")}>${Number(selected.amount).toFixed(2)}/{selected.frequency === "annually" ? "yr" : "mo"}</p>
                  <p className={cn(SITA_TYPE.timelineMeta, "mt-1")}>${annualized(Number(selected.amount), selected.frequency).toFixed(0)}/year · {selected.category || "Uncategorized"}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selected.status === "active" && (
                    <button onClick={() => statusMutation.mutate({ id: selected.id, status: "cancelled" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(0_70%_55%/0.15)] px-3 py-2 text-xs font-medium text-[hsl(0_70%_60%)]"><XCircle className="h-3.5 w-3.5" /> Cancel</button>
                  )}
                  <button onClick={async () => { if (await confirm({ title: "Delete?", description: "Permanently remove this subscription.", variant: "destructive" })) deleteMutation.mutate({ id: selected.id }); }} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] px-3 py-2 text-xs text-[hsl(0_0%_50%)]"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
                <Eye className="h-6 w-6 text-[hsl(0_0%_40%)] mx-auto mb-2" />
                <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_70%)]")}>Select a subscription</p>
              </div>
            )}
            {wasteSubs.length > 0 && <QueueCard title="Waste Queue" items={wasteQueueItems} maxVisible={5} />}
          </div>
        </div>
      )}

      <AdvisorCard
        advisorName="Subscription Intelligence"
        domain="Finance"
        insight={`${wasteSubs.length} subscriptions flagged as waste. Cancel to save $${(wasteMonthly * 12).toFixed(0)}/year.`}
        confidence={85}
        accentColor="hsl(152 55% 48%)"
      />
    </motion.div>
  );
};

export default SubscriptionsWaste;
