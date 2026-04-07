import { motion } from "framer-motion";
import { History, TrendingUp, TrendingDown, AlertTriangle, Brain, RefreshCw, Zap, Shield, FileText, Globe } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_MEMORY_EVENTS = [
  { id: "m1", time: "2 hours ago", type: "holding", icon: "📉", title: "NVDA dipped -1.74%", detail: "No fundamental news. Likely positioning ahead of GTC conference catalyst.", severity: "info" },
  { id: "m2", time: "4 hours ago", type: "advisor", icon: "🌍", title: "Atlas updated macro view", detail: "Fed speaker tone shifted slightly dovish this week. Updated rate cut probability assessment.", severity: "info" },
  { id: "m3", time: "6 hours ago", type: "catalyst", icon: "📅", title: "CPI Release in 39 days", detail: "Key inflation data approaches — determines Fed rate path. 45% of portfolio exposed.", severity: "warning" },
  { id: "m4", time: "Today", type: "risk", icon: "🛡️", title: "Crypto allocation breach continues", detail: "Crypto at 28% vs 20% target — 3rd consecutive week above policy limit. Sentinel recommends action.", severity: "alert" },
  { id: "m5", time: "Today", type: "holding", icon: "◎", title: "SOL rallied +4.04%", detail: "Ecosystem TVL crossed $8B milestone. Network congestion event earlier this week didn't dampen momentum.", severity: "positive" },
  { id: "m6", time: "Yesterday", type: "thesis", icon: "📝", title: "BTC thesis still valid", detail: "Post-halving dynamics intact. ETF inflows positive for 5 consecutive days. No invalidation events.", severity: "info" },
  { id: "m7", time: "Yesterday", type: "advisor", icon: "🪞", title: "Mirror flagged attention pattern", detail: "NVDA checked 12 times this week — behavioral monitoring triggered. Suggested price alerts instead.", severity: "warning" },
  { id: "m8", time: "2 days ago", type: "platform", icon: "🔄", title: "All platforms synced successfully", detail: "Interactive Brokers, Schwab, Coinbase, and Polymarket — all account data up to date.", severity: "positive" },
  { id: "m9", time: "3 days ago", type: "regime", icon: "📊", title: "Market regime unchanged", detail: "Bull regime continues. VIX stable. No regime shift detected.", severity: "info" },
  { id: "m10", time: "This week", type: "advisor", icon: "⛏️", title: "Terra: Gold broke $2640 resistance", detail: "Central bank buying remains at record pace. Gold acting as portfolio insurance.", severity: "positive" },
  { id: "m11", time: "This week", type: "receipt", icon: "📄", title: "NVDA limit order still pending", detail: "Buy 50 NVDA @ $130 — limit order placed. 35% fill probability within 5 days based on volatility.", severity: "info" },
  { id: "m12", time: "Last week", type: "advisor", icon: "🔐", title: "Cipher warned of SOL network risk", detail: "Prediction of network congestion during high activity validated this week.", severity: "info" },
];

const SEVERITY_STYLES: Record<string, string> = {
  alert: "border-destructive/20 bg-destructive/5",
  warning: "border-[hsl(var(--trust-warn))]/15 bg-[hsl(var(--trust-warn))]/5",
  positive: "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5",
  info: "border-border bg-card",
};

export default function MarketMemoryFeed() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Market Memory Feed</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A living stream of everything that changed in your investment world</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Holdings Moved", value: "3", sub: "NVDA ↓, SOL ↑, BTC →" },
          { label: "Advisor Updates", value: "4", sub: "New views from council" },
          { label: "Active Alerts", value: "2", sub: "Risk + Behavioral" },
          { label: "Catalysts Near", value: "3", sub: "Within 60 days" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {DEMO_MEMORY_EVENTS.map((evt, i) => (
          <motion.div key={evt.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className={`rounded-xl border p-4 ${SEVERITY_STYLES[evt.severity] || SEVERITY_STYLES.info}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">{evt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-foreground">{evt.title}</p>
                  <span className="text-[9px] text-muted-foreground">{evt.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{evt.detail}</p>
              </div>
              {evt.severity === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
