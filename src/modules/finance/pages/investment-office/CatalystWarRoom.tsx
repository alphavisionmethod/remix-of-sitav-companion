// truth-allow: ia-config
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertTriangle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useCatalystEvents } from "@/hooks/use-catalyst-events";
import { useNavigate } from "react-router-dom";
const TYPE_COLORS: Record<string, string> = {
  macro: "bg-primary/10 text-primary",
  earnings: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  product: "bg-[hsl(38,85%,58%)]/10 text-[hsl(38,85%,58%)]",
  event: "bg-[hsl(280,60%,55%)]/10 text-[hsl(280,60%,55%)]",
  catalyst: "bg-[hsl(200,60%,55%)]/10 text-[hsl(200,60%,55%)]",
};

export default function CatalystWarRoom() {
  const { data: events = [], isLoading } = useCatalystEvents();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const sorted = [...events]
    .filter(e => filter === "all" || e.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  const daysUntil = (date: string) => {
    const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return d <= 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Calendar className="h-6 w-6 text-primary" /> Catalyst War Room</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Calendar intelligence center — every event that could move your portfolio</p>
      </div>

      {sorted.length === 0 && !isLoading && (
        <PremiumEmptyState
          variant="first-use"
          icon={Calendar}
          title="No catalysts on the horizon"
          description="Add earnings dates, macro events, or catalyst markers to your money calendar — they'll appear here ranked by portfolio exposure."
          actions={[{ label: "Open Money Calendar", icon: Calendar, variant: "primary", onClick: () => navigate("/calendar?domain=money") }]}
        />
      )}

      {sorted.length > 0 && (
      <>
      {/* Upcoming Urgency Band */}
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Next Major Catalyst</p>
        <div className="flex items-center gap-4">
          <span className="text-3xl">📊</span>
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">{sorted[0]?.title}</p>
            <p className="text-sm text-muted-foreground">{sorted[0]?.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{daysUntil(sorted[0]?.date)}</p>
            <p className="text-[10px] text-muted-foreground">{sorted[0]?.date}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {[{ v: "all", l: "All Events" }, { v: "macro", l: "Macro" }, { v: "earnings", l: "Earnings" }, { v: "product", l: "Product" }, { v: "event", l: "Events" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              filter === f.v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{f.l}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {sorted.map((evt, i) => (
          <motion.div key={evt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="text-center shrink-0 w-16">
                <p className="text-xl font-bold text-foreground">{new Date(evt.date).getDate()}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(evt.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                <p className="text-[10px] font-medium text-primary mt-1">{daysUntil(evt.date)}</p>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">{evt.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${TYPE_COLORS[evt.type] || "bg-secondary text-muted-foreground"}`}>{evt.type}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                    evt.impact === "high" ? "bg-destructive/10 text-destructive" : "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                  }`}>{evt.impact} impact</span>
                </div>
                <p className="text-xs text-muted-foreground">{evt.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {evt.assets.map(a => (
                      <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">{a}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className={`text-[10px] font-medium ${evt.portfolioExposure > 30 ? "text-[hsl(var(--trust-warn))]" : "text-muted-foreground"}`}>
                    {evt.portfolioExposure}% portfolio exposed
                  </span>
                </div>
              </div>
              {evt.portfolioExposure > 50 && <AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-warn))] shrink-0" />}
            </div>
          </motion.div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
