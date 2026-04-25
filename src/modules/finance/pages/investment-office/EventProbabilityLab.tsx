import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useEventProbabilities, type EventProbability } from "@/hooks/use-event-probabilities";
import { useNavigate } from "react-router-dom";

export default function EventProbabilityLab() {
  const { data: events = [], isLoading } = useEventProbabilities();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && events.length > 0) setSelectedId(events[0].id);
  }, [events, selectedId]);
  const selected: EventProbability | undefined = events.find(e => e.id === selectedId) ?? events[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FlaskConical className="h-6 w-6 text-primary" /> Event Probability Lab</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Scenario trees, branch probabilities, and portfolio impact for event and prediction markets</p>
      </div>

      {events.length === 0 && !isLoading && (
        <PremiumEmptyState
          variant="first-use"
          icon={FlaskConical}
          title="No event scenarios yet"
          description="Run your first probability scenario to see branch trees, market-implied odds, and portfolio impact."
          actions={[{ label: "Open Scenario Builder", icon: FlaskConical, variant: "primary", onClick: () => navigate("/investment-office/scenarios") }]}
        />
      )}

      {selected && (
      <>
      {/* Event Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {events.map(e => (
          <button key={e.id} onClick={() => setSelectedId(e.id)}
            className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-all ${selected.id === e.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
            <p className="text-xs font-bold text-foreground">{e.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-foreground">{e.probability}%</span>
              <span className={`text-[9px] font-medium ${e.trend === "rising" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {e.trend === "rising" ? "↑" : "↓"} from {e.previousProbability}%
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Event Detail */}
      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Hero */}
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
              <p className="text-sm text-muted-foreground">Catalyst: {selected.catalystDate} · Confidence: {selected.confidence}%</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{selected.probability}%</p>
              <p className="text-[10px] text-muted-foreground">Market-implied probability</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Sleeve Exposure</p>
              <p className="text-lg font-bold text-foreground">{selected.sleeveExposure}%</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Confidence</p>
              <p className="text-lg font-bold text-foreground">{selected.confidence}%</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Trend</p>
              <p className={`text-lg font-bold capitalize ${selected.trend === "rising" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{selected.trend}</p>
            </div>
          </div>
        </div>

        {/* Scenario Tree */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Scenario Branches</h3>
          <div className="space-y-3">
            {selected.branches.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl border p-4 ${
                  b.sentiment === "bullish" ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5" :
                  b.sentiment === "bearish" ? "border-destructive/15 bg-destructive/5" :
                  "border-border bg-secondary/20"
                }`}>
                <div className="flex items-center gap-3">
                  {b.sentiment === "bullish" ? <TrendingUp className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> :
                   b.sentiment === "bearish" ? <TrendingDown className="h-4 w-4 text-destructive" /> :
                   <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{b.label}</p>
                    <p className="text-[10px] text-muted-foreground">{b.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{b.probability}%</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${
                    b.sentiment === "bullish" ? "bg-[hsl(var(--trust-safe))]" :
                    b.sentiment === "bearish" ? "bg-destructive" : "bg-muted-foreground"
                  }`} style={{ width: `${b.probability}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
}
