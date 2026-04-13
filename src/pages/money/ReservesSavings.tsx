import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ReserveProgressChart, ReserveOverTimeChart } from "@/components/sita/SitaCharts";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { SurfaceTrustStrip } from "@/components/sita/SurfaceTrustStrip";
import { PiggyBank, Target, Shield, TrendingUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAction } from "@/lib/hooks/useAction";
import { toast } from "sonner";
import { useReservesSavings } from "@/hooks/use-domain-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { DataFreshnessBadge } from "@/components/sita/DataFreshnessBadge";
import { useQueryFreshness } from "@/hooks/use-query-freshness";
import { ContextualEmptyState } from "@/components/sita/ContextualEmptyState";
import { getContextualEmptyState } from "@/lib/ux-trust/contextual-empty-states";



const ReservesSavings = () => {
  const { data: reservesData = [] } = useReservesSavings();
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();

  const reservesQuery = useQuery({
    queryKey: ["reserves", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return reservesData;
      if (!user) return [];
      const { data, error } = await db.from("reserves")
        .select("*")
        .order("priority", { ascending: true });
      if (error) { console.error("[reserves]", error); return reservesData; }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 10000,
  });
  const reserves = reservesQuery.data ?? [];
  const isLoading = reservesQuery.isLoading;
  const freshness = useQueryFreshness(reservesQuery);

  // Create reserve mutation
  const createReserve = useAction("finance", "reserve.create", {
    successMessage: "Reserve goal created",
    invalidateKeys: [["reserves"], ["reserves-savings"]],
  });

  // Delete reserve mutation
  const deleteReserve = useAction("finance", "reserve.delete", {
    successMessage: "Reserve goal deleted",
    invalidateKeys: [["reserves"], ["reserves-savings"]],
  });

  const totalCurrent = reserves.reduce((s: number,  r: Record<string, any>) => s + (r.current_amount || 0), 0);
  const totalTarget = reserves.reduce((s: number,  r: Record<string, any>) => s + (r.target_amount || 0), 0);
  const overallHealth = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const monthlyTotal = reserves.reduce((s: number,  r: Record<string, any>) => s + (r.contribution_amount || 0), 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <ConfirmationDialog state={confirmation} />
      <SitaPageHeader title="Reserves & Savings" subtitle="Build stability, track goals, and maintain financial resilience"
        actions={<div className="flex items-center gap-3"><DataFreshnessBadge {...freshness} /><SitaButton variant="primary" onClick={() => createReserve.mutate({ name: "New Goal", target_amount: 5000, category: "goal", contribution_amount: 200 })}><Plus className="h-4 w-4" /> New Goal</SitaButton></div>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Reserved" value={`$${(totalCurrent / 1000).toFixed(1)}K`} icon={PiggyBank} sub={`of $${(totalTarget / 1000).toFixed(0)}K target`} className="gradient-sita-subtle" />
        <KPITile label="Overall Health" value={`${overallHealth}%`} trend="up" icon={Shield} sub="On track" />
        <KPITile label="Monthly Contributions" value={`$${monthlyTotal.toLocaleString()}`} icon={TrendingUp} />
        <KPITile label="Active Goals" value={reserves.length} icon={Target} />
      </div>

      {/* Trust metadata */}
      <SurfaceTrustStrip config={{
        evidenceGrade: isDemoMode ? "C" : reserves.length > 0 ? "A" : "D",
        gradeLabel: isDemoMode ? "Simulated data" : reserves.length > 0 ? "Live data" : undefined,
        dataSources: [
          "Reserve goals database",
          "Contribution tracking",
          ...(isDemoMode ? ["Demo seed data"] : []),
        ],
        lastRefreshed: freshness.lastFetchedAt,
        assumptions: [
          { statement: "Overall health is weighted average across all reserve goals", impact: "high" },
          { statement: "Monthly contribution assumes consistent auto-contribute schedule", impact: "medium" },
        ],
        caveats: isDemoMode
          ? ["Demo mode — amounts are illustrative, not connected to real accounts"]
          : undefined,
      }} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReserveProgressChart />
        <ReserveOverTimeChart />
      </div>

      {isLoading ? (
        <SectionSkeleton cards={4} columns={1} />
      ) : reserves.length === 0 && !isDemoMode ? (
        <ContextualEmptyState config={getContextualEmptyState("money")} />
      ) : reserves.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No reserves yet" description="Create your first savings goal to start building financial resilience." />
      ) : (
        <div className="space-y-4">
          {reserves.map((r: Record<string, any>) => {
            const pct = r.target_amount > 0 ? Math.round((r.current_amount / r.target_amount) * 100) : 0;
            const healthColor = pct >= 80 ? "bg-trust-verified" : pct >= 50 ? "bg-trust-review" : "bg-urgency-high";
            const healthText = pct >= 80 ? "text-trust-verified" : pct >= 50 ? "text-trust-review" : "text-urgency-high";
            return (
              <SitaCard key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <span className="text-[10px] bg-secondary rounded px-1.5 py-px text-muted-foreground capitalize">{r.category}</span>
                      {r.auto_contribute && <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-px">Auto</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{r.notes || ""}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${healthColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                      <span className={`font-display text-sm font-bold ${healthText}`}>{pct}%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-6 text-xs text-muted-foreground">
                      <span>Current: <span className="font-semibold text-foreground">${(r.current_amount || 0).toLocaleString()}</span></span>
                      <span>Target: <span className="font-semibold text-foreground">${(r.target_amount || 0).toLocaleString()}</span></span>
                      {r.contribution_amount > 0 && <span>Monthly: <span className="font-semibold text-foreground">${r.contribution_amount}</span></span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <TrustBadge level={pct >= 80 ? "verified" : pct >= 50 ? "review" : "degraded"} label={pct >= 80 ? "Healthy" : pct >= 50 ? "Building" : "Behind"} size="sm" />
                    {!isDemoMode && (
                      <button onClick={async () => { if (await confirm({ title: "Delete this reserve goal?", description: "This savings goal will be permanently removed.", variant: "destructive" })) deleteReserve.mutate(r.id); }} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </SitaCard>
            );
          })}
        </div>
      )}

      <LiveAdvisorCard
        advisor="money"
        intent="reserve_strategy"
        demoName="Reserve Intelligence"
        demoRole="Savings Advisor"
        demoConfidence="High"
        demoRecommendation={`Reserve health at ${overallHealth}%. ${reserves.length} active goals with $${monthlyTotal.toLocaleString()}/mo in contributions.`}
        demoReasoning="Based on reserve health analysis, contribution rates, target timelines, and upcoming obligations."
      />
    </motion.div>
  );
};

export default ReservesSavings;
