// truth-allow: ia-config
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, TrendingUp, Zap, Clock, Send, Brain, ChevronRight } from "lucide-react";
import { INVESTMENT_ADVISORS, SAMPLE_SCENARIOS, SAMPLE_ORDERS } from "@/modules/finance/hooks/useInvestmentOfficeData";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// Demo crisis events
const CRISIS_EVENTS = [
  { id: "ev1", time: "09:32 AM", severity: "critical" as const, title: "Flash crash in tech sector", detail: "NVDA down 4.2% in 15 minutes on high volume. No news catalyst identified." },
  { id: "ev2", time: "09:45 AM", severity: "warning" as const, title: "VIX spike above 25", detail: "Volatility index surging. Options market pricing 3% move in S&P 500." },
  { id: "ev3", time: "10:01 AM", severity: "info" as const, title: "Fed speaker scheduled", detail: "Governor Waller speaking at 11 AM. Markets may be pre-positioning." },
  { id: "ev4", time: "10:15 AM", severity: "warning" as const, title: "Crypto correlated selloff", detail: "BTC down 2.1%, SOL down 3.8%. Risk-off sentiment spreading across assets." },
];

const SEVERITY_STYLES = {
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-[hsl(var(--trust-warn))]/30 bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]",
  info: "border-primary/30 bg-primary/10 text-primary",
};

function CrisisTimeline() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-4 w-4 text-destructive" /> Crisis Timeline
      </h3>
      <div className="relative pl-4 space-y-4">
        <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-destructive via-[hsl(var(--trust-warn))] to-primary" />
        {CRISIS_EVENTS.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="relative"
          >
      <PageTruthBanner truthState="partial" />
            <div className={`absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
              ev.severity === "critical" ? "bg-destructive border-destructive" :
              ev.severity === "warning" ? "bg-[hsl(var(--trust-warn))] border-[hsl(var(--trust-warn))]" :
              "bg-primary border-primary"
            }`} />
            <div className={`ml-3 rounded-xl border p-3 ${SEVERITY_STYLES[ev.severity]}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono font-bold">{ev.time}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">{ev.severity}</span>
              </div>
              <p className="text-xs font-semibold">{ev.title}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{ev.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ImpactSimulation() {
  const impacts = [
    { label: "Portfolio Value", before: "$547,200", after: "$531,400", change: -2.9 },
    { label: "Tech Exposure", before: "42%", after: "39%", change: -3 },
    { label: "Risk Score", before: "62/100", after: "78/100", change: 25.8 },
    { label: "Cash Buffer", before: "$52,800", after: "$52,800", change: 0 },
  ];

  return (
    <div className="rounded-2xl border border-destructive/15 bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Shield className="h-4 w-4 text-destructive" /> Impact Simulation
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {impacts.map(imp => (
          <div key={imp.label} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{imp.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground line-through">{imp.before}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className={`text-xs font-bold ${imp.change < 0 ? "text-destructive" : imp.change > 0 ? "text-[hsl(var(--trust-warn))]" : "text-foreground"}`}>
                {imp.after}
              </span>
            </div>
            <span className={`text-[9px] font-bold ${imp.change < 0 ? "text-destructive" : imp.change > 0 ? "text-[hsl(var(--trust-warn))]" : "text-muted-foreground"}`}>
              {imp.change > 0 ? "+" : ""}{imp.change !== 0 ? `${imp.change}%` : "No change"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvisorRapidResponse() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const simulateResponses = useCallback(() => {
    setStarted(true);
    const advisors = INVESTMENT_ADVISORS.slice(0, 5);
    const demoResponses: Record<string, string> = {
      "adv-macro": "This looks like a positioning-driven move, not fundamental. VIX spike is pre-Fed-speaker positioning. I'd wait for the 11 AM speech before making any decisions. Macro backdrop hasn't changed.",
      "adv-equity": "NVDA sell-off on no news with high volume suggests institutional rebalancing. The -4.2% creates an entry opportunity if thesis is intact. Check if GTC catalysts are still on track.",
      "adv-crypto": "Crypto correlation confirms risk-off sentiment. BTC holding above key support at $93K. SOL weakness is concerning but ecosystem fundamentals unchanged. Don't panic sell.",
      "adv-commodities": "Gold likely to benefit as safe haven. This is exactly the scenario where your GLD position provides portfolio insurance. Consider if oil correlation increases.",
      "adv-risk": "Portfolio risk score spiking from 62 to 78. Tech concentration at 42% is the vulnerability. Recommend tightening stops on NVDA but NOT selling into the panic. Behavioral firewall engaged.",
    };

    advisors.forEach((adv, i) => {
      setTimeout(() => {
        setLoading(adv.id);
        setTimeout(() => {
          setResponses(prev => ({ ...prev, [adv.id]: demoResponses[adv.id] || "Analyzing situation..." }));
          setLoading(null);
        }, 800);
      }, i * 1200);
    });
  }, []);

  return (
    <div className="rounded-2xl border border-primary/15 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" /> Advisor Rapid Response
        </h3>
        {!started && (
          <motion.button
            onClick={simulateResponses}
            className="rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="h-3.5 w-3.5 inline mr-1" /> Activate All Advisors
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        {INVESTMENT_ADVISORS.slice(0, 5).map((adv, i) => (
          <motion.div
            key={adv.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{adv.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{adv.name}</p>
                <p className="text-[9px] text-muted-foreground">{adv.title}</p>
              </div>
              {loading === adv.id && (
                <div className="flex gap-0.5">
                  {[0, 1, 2].map(j => (
                    <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.2 }}
                    />
                  ))}
                </div>
              )}
              {responses[adv.id] && (
                <span className="rounded-full bg-[hsl(var(--trust-safe))]/10 px-2 py-0.5 text-[8px] font-bold text-[hsl(var(--trust-safe))]">RESPONDED</span>
              )}
            </div>
            <AnimatePresence>
              {responses[adv.id] && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-[11px] text-foreground leading-relaxed"
                >
                  {responses[adv.id]}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActionPanel() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--trust-warn))]/20 bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Zap className="h-4 w-4 text-[hsl(var(--trust-warn))]" /> Recommended Actions
      </h3>
      {[
        { action: "Tighten NVDA stop-loss", detail: "Move from $850 to $880 (-3.5% from current)", risk: "low", gate: "Auto-approved" },
        { action: "Hold all positions", detail: "Wait for Fed speaker at 11 AM before any trades", risk: "none", gate: "Behavioral gate: cooling period" },
        { action: "Review BTC allocation", detail: "Currently 15% — above 12% policy target", risk: "moderate", gate: "Requires manual approval" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground flex-1">{item.action}</p>
            <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
              item.risk === "low" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
              item.risk === "moderate" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
              "bg-secondary text-muted-foreground"
            }`}>{item.risk} risk</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{item.detail}</p>
          <p className="text-[9px] text-primary flex items-center gap-1">
            <Shield className="h-3 w-3" /> {item.gate}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default function WarRoom() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
{/* Header with urgency styling */}
      <motion.div
        className="rounded-2xl border border-destructive/30 bg-gradient-to-r from-destructive/10 via-card to-[hsl(var(--trust-warn))]/10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Investment War Room</h1>
            <p className="text-sm text-muted-foreground">High-urgency event response & advisor rapid deployment</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider">ACTIVE EVENT</p>
            <p className="text-sm font-bold text-foreground">Tech Sector Flash Crash</p>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Timeline + Impact */}
        <div className="space-y-4">
          <CrisisTimeline />
          <ImpactSimulation />
        </div>

        {/* Center: Advisor rapid response */}
        <div className="lg:col-span-2 space-y-4">
          <AdvisorRapidResponse />
          <ActionPanel />
        </div>
      </div>

      {/* Scenario impact */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Scenario Outcomes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SAMPLE_SCENARIOS.map(sc => (
            <div key={sc.id} className={`rounded-xl border p-3 space-y-1.5 ${
              sc.projectedReturn >= 0 ? "border-border bg-card" : "border-destructive/20 bg-destructive/5"
            }`}>
              <p className="text-[10px] font-semibold text-muted-foreground">{sc.name}</p>
              <p className={`text-lg font-bold ${sc.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {sc.projectedReturn >= 0 ? "+" : ""}{sc.projectedReturn}%
              </p>
              <p className="text-[9px] text-muted-foreground">{sc.probability}% probability</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
