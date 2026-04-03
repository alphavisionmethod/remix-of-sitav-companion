import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ReserveProgressChart, ReserveOverTimeChart } from "@/components/sita/SitaCharts";
import { PiggyBank, Target, Shield, TrendingUp, Plus, Sparkles, Loader2 } from "lucide-react";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/integrations/supabase/db";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { toast } from "sonner";

const mockReserves = [
  { id: "1", name: "Emergency Fund", current_amount: 12000, target_amount: 15000, category: "emergency", contribution_amount: 500, notes: "Safety net", auto_contribute: true, priority: 1 },
  { id: "2", name: "Tax Reserve", current_amount: 8400, target_amount: 12000, category: "sinking", contribution_amount: 1200, notes: "Q2 estimated", auto_contribute: true, priority: 2 },
  { id: "3", name: "Equipment Fund", current_amount: 2800, target_amount: 5000, category: "sinking", contribution_amount: 400, notes: "Business capex", auto_contribute: false, priority: 3 },
  { id: "4", name: "Vacation Fund", current_amount: 1600, target_amount: 4000, category: "goal", contribution_amount: 300, notes: "Summer trip", auto_contribute: true, priority: 4 },
  { id: "5", name: "Kids Education", current_amount: 6200, target_amount: 25000, category: "goal", contribution_amount: 500, notes: "529 supplement", auto_contribute: true, priority: 5 },
];

const ReservesSavings = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const queryClient = useQueryClient();

  const { data: reserves = [], isLoading } = useQuery({
    queryKey: ["reserves", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockReserves;
      if (!user) return [];
      const { data, error } = await (db as any)
        .from("reserves")
        .select("*")
        .order("priority", { ascending: true });
      if (error) { console.error("[reserves]", error); return mockReserves; }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 10000,
  });

  const totalCurrent = reserves.reduce((s: number, r: any) => s + (r.current_amount || 0), 0);
  const totalTarget = reserves.reduce((s: number, r: any) => s + (r.target_amount || 0), 0);
  const overallHealth = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const monthlyTotal = reserves.reduce((s: number, r: any) => s + (r.contribution_amount || 0), 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader title="Reserves & Savings" subtitle="Build stability, track goals, and maintain financial resilience" actions={<SitaButton variant="primary"><Plus className="h-4 w-4" /> New Goal</SitaButton>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Reserved" value={`$${(totalCurrent / 1000).toFixed(1)}K`} icon={PiggyBank} sub={`of $${(totalTarget / 1000).toFixed(0)}K target`} className="gradient-sita-subtle" />
        <KPITile label="Overall Health" value={`${overallHealth}%`} trend="up" icon={Shield} sub="On track" />
        <KPITile label="Monthly Contributions" value={`$${monthlyTotal.toLocaleString()}`} icon={TrendingUp} />
        <KPITile label="Active Goals" value={reserves.length} icon={Target} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReserveProgressChart />
        <ReserveOverTimeChart />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : reserves.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No reserves yet" description="Create your first savings goal to start building financial resilience." />
      ) : (
        <div className="space-y-4">
          {reserves.map((r: any) => {
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

                  <div className="shrink-0">
                    <TrustBadge level={pct >= 80 ? "verified" : pct >= 50 ? "review" : "degraded"} label={pct >= 80 ? "Healthy" : pct >= 50 ? "Building" : "Behind"} size="sm" />
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
        demoRecommendation={`Emergency fund at ${reserves[0] ? Math.round(((reserves[0] as any).current_amount / (reserves[0] as any).target_amount) * 100) : 0}% — increase monthly contribution by $200 to hit target 3 months sooner. Tax reserve is on track for Q2 estimated payment.`}
        demoReasoning="Based on reserve health analysis, contribution rates, target timelines, and upcoming obligations."
      />
    </motion.div>
  );
};

export default ReservesSavings;
