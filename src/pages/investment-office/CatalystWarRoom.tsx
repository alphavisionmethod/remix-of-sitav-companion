import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Zap, AlertTriangle, Clock, Target, TrendingUp } from "lucide-react";
import { useInvestmentData } from "@/hooks/use-investment-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const CATALYST_EVENTS = [
  { id: "ce1", title: "CPI Release", date: "2026-05-14", type: "macro", impact: "high", assets: ["SPY", "XAUUSD", "FED-CUT-JUN"], description: "Key inflation data — determines Fed rate path", portfolioExposure: 45 },
  { id: "ce2", title: "Fed FOMC Meeting", date: "2026-06-18", type: "macro", impact: "high", assets: ["SPY", "XAUUSD", "BTC", "FED-CUT-JUN"], description: "Rate decision and forward guidance", portfolioExposure: 80 },
  { id: "ce3", title: "AAPL Q3 Earnings", date: "2026-07-31", type: "earnings", impact: "moderate", assets: ["AAPL"], description: "Fiscal Q3 results — AI integration and Services growth", portfolioExposure: 8 },
  { id: "ce4", title: "BTC Halving Anniversary", date: "2026-04-20", type: "event", impact: "moderate", assets: ["BTC", "ETH", "SOL"], description: "One year post-halving — supply dynamics catalyst", portfolioExposure: 28 },
  { id: "ce5", title: "TSLA Robotaxi Launch", date: "2026-08-08", type: "product", impact: "high", assets: ["TSLA"], description: "Autonomous ride-hailing service commercial launch", portfolioExposure: 3 },
  { id: "ce6", title: "NVDA GTC Conference", date: "2026-09-15", type: "product", impact: "high", assets: ["NVDA"], description: "Next-gen architecture reveal expected", portfolioExposure: 6 },
  { id: "ce7", title: "Jobs Report", date: "2026-05-02", type: "macro", impact: "moderate", assets: ["SPY", "FED-CUT-JUN"], description: "Non-farm payrolls and unemployment rate", portfolioExposure: 50 },
  { id: "ce8", title: "OPEC+ Meeting", date: "2026-06-01", type: "macro", impact: "moderate", assets: ["CL"], description: "Production quota review — OPEC discipline under pressure", portfolioExposure: 0 },
];

const TYPE_COLORS: Record<string, string> = {
  macro: "bg-primary/10 text-primary",
  earnings: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  product: "bg-[hsl(38,85%,58%)]/10 text-[hsl(38,85%,58%)]",
  event: "bg-[hsl(280,60%,55%)]/10 text-[hsl(280,60%,55%)]",
};

export default function CatalystWarRoom() {
  const [filter, setFilter] = useState<string>("all");
  const sorted = [...CATALYST_EVENTS]
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
    </div>
  );
}
