import { HeroCard, SummaryCard, StatusCard, AdvisorCard } from "@/components/sita/cards";
import { TrustBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ReserveProgressChart, ReserveOverTimeChart } from "@/components/sita/SitaCharts";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { PiggyBank, Target, Shield, TrendingUp, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useReservesSavings } from "@/hooks/use-domain-data";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { useQueryFreshness } from "@/hooks/use-query-freshness";
import { useDataMode } from "@/contexts/DataModeContext";



const ReservesSavings = () => {
  const { isDemo: isDemoMode } = useAuth();
  const { isDemoMode } = useDataMode();
  const { data: reservesData = [] } = useReservesSavings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();

  const reservesQuery = useQuery({
    queryKey: ["reserves", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return reservesData;
      if (!user) return [];
      const { data, error } = await db.from("reserves").select("*").order("priority", { ascending: true });
      if (error) { console.error("[reserves]", error); return reservesData; }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 10000,
  });
  const reserves = reservesQuery.data ?? [];
  const isLoading = reservesQuery.isLoading;
  const freshness = useQueryFreshness(reservesQuery);

  const createReserve = useAction("finance", "reserve.create", { successMessage: "Reserve goal created", invalidateKeys: [["reserves"], ["reserves-savings"]] });
  const deleteReserve = useAction("finance", "reserve.delete", { successMessage: "Reserve goal deleted", invalidateKeys: [["reserves"], ["reserves-savings"]] });

  const totalCurrent = reserves.reduce((s: number, r: Record<string, any>) => s + (r.current_amount || 0), 0);
  const totalTarget = reserves.reduce((s: number, r: Record<string, any>) => s + (r.target_amount || 0), 0);
  const overallHealth = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const monthlyTotal = reserves.reduce((s: number, r: Record<string, any>) => s + (r.contribution_amount || 0), 0);

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} freshness={freshness.label} />
      <ConfirmationDialog state={confirmation} />

      <HeroCard
        title="Reserves & Savings"
        metric={`$${(totalCurrent / 1000).toFixed(1)}K reserved`}
        subtitle={`of $${(totalTarget / 1000).toFixed(0)}K target · ${overallHealth}% health`}
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(165 50% 42%)"
        icon={<PiggyBank className="h-5 w-5 text-[hsl(152_55%_58%)]" />}
      >
        <button onClick={() => createReserve.mutate({ name: "New Goal", target_amount: 5000, category: "goal", contribution_amount: 200 })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(152_55%_48%/0.15)] hover:bg-[hsl(152_55%_48%/0.25)] text-[hsl(152_55%_58%)] text-[11px] font-medium transition-colors">
          <Plus className="h-3.5 w-3.5" /> New Goal
        </button>
      </HeroCard>

      <SummaryCard
        title="Reserve Health"
        kpis={[
          { label: "Total Reserved", value: `$${(totalCurrent / 1000).toFixed(1)}K`, trend: "up" },
          { label: "Overall Health", value: `${overallHealth}%` },
          { label: "Monthly Contributions", value: `$${monthlyTotal.toLocaleString()}` },
          { label: "Active Goals", value: String(reserves.length) },
        ]}
        icon={<Shield className="h-4 w-4 text-[hsl(152_55%_48%)]" />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ReserveProgressChart />
        <ReserveOverTimeChart />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-[hsl(0_0%_100%/0.03)] animate-pulse" />)}</div>
      ) : reserves.length === 0 ? (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
          <PiggyBank className="h-8 w-8 text-[hsl(0_0%_40%)] mx-auto mb-2" />
          <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_70%)]")}>No reserves yet</p>
          <p className={cn(SITA_TYPE.timelineMeta)}>Create your first savings goal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reserves.map((r: Record<string, any>) => {
            const pct = r.target_amount > 0 ? Math.round((r.current_amount / r.target_amount) * 100) : 0;
            return (
              <StatusCard
                key={r.id}
                label={r.name}
                status={pct >= 80 ? "healthy" : pct >= 50 ? "degraded" : "down"}
                confidence={pct}
                lastChecked={`$${(r.current_amount || 0).toLocaleString()} / $${(r.target_amount || 0).toLocaleString()}`}
                icon={<Target className="h-4 w-4" />}
              />
            );
          })}
        </div>
      )}

      <AdvisorCard
        advisorName="Reserve Intelligence"
        domain="Finance"
        insight={`Reserve health at ${overallHealth}%. ${reserves.length} active goals with $${monthlyTotal.toLocaleString()}/mo in contributions.`}
        confidence={overallHealth >= 80 ? 90 : 72}
        accentColor="hsl(152 55% 48%)"
      />
    </motion.div>
  );
};

export default ReservesSavings;
