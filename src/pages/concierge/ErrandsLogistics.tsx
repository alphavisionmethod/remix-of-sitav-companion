import { ConciergePageWrapper } from "@/components/concierge";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { ConciergeAdvisorInsightCard } from "@/components/concierge";
import { ErrandBundleCard, LogisticsTimelineCard } from "@/components/concierge";
import type { ErrandBundle, TimelineStop } from "@/components/concierge";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Zap, ShoppingCart, Car, CheckCircle, Sparkles, Route, Package } from "lucide-react";

/* ── Demo Data ── */
const BUNDLES: ErrandBundle[] = [
  {
    id: "b1", label: "Downtown Loop", area: "Downtown", totalMinutes: 55,
    errands: [
      { id: "e1", title: "Pick up dry cleaning", location: "Main St Cleaners", estimatedMinutes: 10, priority: "medium", combinable: true },
      { id: "e2", title: "Drop off package at UPS", location: "UPS Store — 4th Ave", estimatedMinutes: 10, priority: "high" },
      { id: "e3", title: "Return library books", location: "Central Library", estimatedMinutes: 15, priority: "low", combinable: true },
      { id: "e4", title: "Pick up birthday cake order", location: "Sweet Treats Bakery", estimatedMinutes: 20, priority: "high" },
    ],
  },
  {
    id: "b2", label: "Suburban Run", area: "West Side", totalMinutes: 40,
    errands: [
      { id: "e5", title: "Grocery run — weekly staples", location: "Trader Joe's", estimatedMinutes: 25, priority: "medium" },
      { id: "e6", title: "Pet food restock", location: "PetSmart", estimatedMinutes: 15, priority: "medium", combinable: true },
    ],
  },
  {
    id: "b3", label: "Quick Wins", area: "Home / Online", totalMinutes: 20,
    errands: [
      { id: "e7", title: "Schedule dentist appointment", priority: "high", estimatedMinutes: 5 },
      { id: "e8", title: "Renew parking permit online", priority: "medium", estimatedMinutes: 10 },
      { id: "e9", title: "Order replacement air filters", priority: "low", estimatedMinutes: 5, combinable: true },
    ],
  },
];

const TIMELINE: TimelineStop[] = [
  { id: "t1", time: "9:00 AM", title: "Drop off package at UPS", location: "4th Ave", status: "done" },
  { id: "t2", time: "9:20 AM", title: "Pick up dry cleaning", location: "Main St", status: "done" },
  { id: "t3", time: "9:45 AM", title: "Return library books", location: "Central Library", status: "current" },
  { id: "t4", time: "10:15 AM", title: "Pick up birthday cake", location: "Sweet Treats", status: "upcoming" },
  { id: "t5", time: "11:00 AM", title: "Grocery run", location: "Trader Joe's", status: "upcoming" },
  { id: "t6", time: "11:30 AM", title: "Pet food restock", location: "PetSmart", status: "upcoming" },
];

const ALL_ERRANDS = BUNDLES.flatMap((b) => b.errands);

type ErrandsView = "bundles" | "timeline" | "quick-wins" | "all";

const ErrandsLogistics = () => {
  const [view, setView] = useState<ErrandsView>("bundles");

  const totalErrands = ALL_ERRANDS.length;
  const highPriority = ALL_ERRANDS.filter((e) => e.priority === "high").length;
  const combinable = ALL_ERRANDS.filter((e) => e.combinable).length;
  const totalMinutes = BUNDLES.reduce((s, b) => s + b.totalMinutes, 0);

  return (
    <ConciergePageWrapper className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Errands & Logistics" subtitle="Intelligent sequencing — batch, combine, and reduce friction" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Open Errands" value={String(totalErrands)} icon={Package} />
        <KPITile label="High Priority" value={String(highPriority)} icon={Zap} sub="Handle first" />
        <KPITile label="Combinable" value={String(combinable)} icon={Route} sub="Save time" />
        <KPITile label="Est. Time" value={`${totalMinutes}m`} icon={Clock} sub="Across all bundles" />
      </div>

      <SitaTabs
        tabs={[
          { key: "bundles", label: "Route Bundles" },
          { key: "timeline", label: "Day Timeline" },
          { key: "quick-wins", label: "Quick Wins" },
          { key: "all", label: "All Errands" },
        ]}
        active={view}
        onChange={(k) => setView(k as ErrandsView)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "bundles" && BUNDLES.map((b) => <ErrandBundleCard key={b.id} bundle={b} />)}

          {view === "timeline" && <LogisticsTimelineCard stops={TIMELINE} label="Today's Route" />}

          {view === "quick-wins" && (
            <div className="space-y-3">
              <SitaSectionHeader title="Quick Wins" subtitle="Handle from home or online — low effort, high value" />
              {BUNDLES.find((b) => b.label === "Quick Wins")?.errands.map((e) => (
                <SitaCard key={e.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${e.priority === "high" ? "bg-destructive" : e.priority === "medium" ? "bg-amber-500" : "bg-chart-2"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{e.title}</p>
                      {e.estimatedMinutes && <p className="text-xs text-muted-foreground">~{e.estimatedMinutes} minutes</p>}
                    </div>
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Do Now</button>
                  </div>
                </SitaCard>
              ))}
            </div>
          )}

          {view === "all" && (
            <div className="space-y-2">
              <SitaSectionHeader title="All Errands" subtitle={`${totalErrands} items across ${BUNDLES.length} bundles`} />
              {ALL_ERRANDS.map((e) => (
                <SitaCard key={e.id} className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${e.priority === "high" ? "bg-destructive" : e.priority === "medium" ? "bg-amber-500" : "bg-chart-2"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.location || "Home / Online"}{e.estimatedMinutes ? ` · ~${e.estimatedMinutes}m` : ""}</p>
                    </div>
                    {e.combinable && <span className="text-[9px] bg-accent/10 text-accent rounded-full px-1.5 py-0.5">combinable</span>}
                  </div>
                </SitaCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Route Suggestion */}
          <GlassCard glow="accent" intensity="subtle" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold text-foreground">Route Suggestion</p>
            </div>
            <p className="text-xs text-foreground mb-2">Combine the Downtown Loop and Suburban Run into a single 1h 35m outing. Saves ~20 min of travel overlap.</p>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Accept Route</button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors">Modify</button>
            </div>
          </GlassCard>

          {/* Combinable Items */}
          <SitaCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <SitaCardTitle>Can Be Combined</SitaCardTitle>
            </div>
            <div className="space-y-1.5">
              {ALL_ERRANDS.filter((e) => e.combinable).map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-chart-2" />
                  <span className="text-foreground">{e.title}</span>
                </div>
              ))}
            </div>
          </SitaCard>

          {/* Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Logistics Advisor",
            message: "The UPS drop-off and dry cleaning pickup are 2 blocks apart — handle together first. Birthday cake pickup has a narrow window (before noon). Grocery run can shift to tomorrow if today feels heavy.",
            linkedItems: ["Downtown Loop", "Cake pickup", "Grocery flexibility"],
            confidence: "high",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default ErrandsLogistics;
