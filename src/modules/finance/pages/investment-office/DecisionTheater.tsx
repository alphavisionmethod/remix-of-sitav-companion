import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Theater, Shield, AlertTriangle, Check, X, Brain, Target, Zap, Clock, FileText, Volume2 } from "lucide-react";
import { INVESTMENT_ADVISORS, SAMPLE_ORDERS, SAMPLE_SCENARIOS } from "@/hooks/useInvestmentOfficeData";
import { useInvestmentDecisions } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// Advisor votes for the cinematic voting panel
const ADVISOR_VOTES: Record<string, "approve" | "reject" | "abstain"> = {
  "adv-macro": "approve",
  "adv-equity": "approve",
  "adv-crypto": "abstain",
  "adv-commodities": "approve",
  "adv-risk": "reject",
};

function SpotlightOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: "radial-gradient(ellipse 600px 400px at center 40%, transparent 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

function AdvisorVotingPanel() {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  const revealAll = () => {
    INVESTMENT_ADVISORS.slice(0, 5).forEach((adv, i) => {
      setTimeout(() => {
        setRevealed(prev => new Set([...prev, adv.id]));
        if (i === 4) setAllRevealed(true);
      }, i * 600);
    });
  };

  const voteStyles = {
    approve: { bg: "bg-[hsl(var(--trust-safe))]/15", border: "border-[hsl(var(--trust-safe))]/30", text: "text-[hsl(var(--trust-safe))]", label: "APPROVE", icon: Check },
    reject: { bg: "bg-destructive/15", border: "border-destructive/30", text: "text-destructive", label: "REJECT", icon: X },
    abstain: { bg: "bg-secondary", border: "border-border", text: "text-muted-foreground", label: "ABSTAIN", icon: Clock },
  };

  const approveCount = Object.values(ADVISOR_VOTES).filter(v => v === "approve").length;
  const rejectCount = Object.values(ADVISOR_VOTES).filter(v => v === "reject").length;

  return (
    <div className="rounded-3xl border border-primary/20 bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> Advisor Voting Panel
        </h2>
        {!allRevealed && (
          <motion.button
            onClick={revealAll}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reveal Votes
          </motion.button>
        )}
        {allRevealed && (
          <div className="flex gap-2">
            <span className="rounded-full bg-[hsl(var(--trust-safe))]/10 px-3 py-1 text-xs font-bold text-[hsl(var(--trust-safe))]">
              {approveCount} Approve
            </span>
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
              {rejectCount} Reject
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {INVESTMENT_ADVISORS.slice(0, 5).map((adv) => {
          const isRevealed = revealed.has(adv.id);
          const vote = ADVISOR_VOTES[adv.id] || "abstain";
          const style = voteStyles[vote];

          return (
            <motion.div
              key={adv.id}
              className="relative perspective-[600px]"
              style={{ minHeight: 140 }}
            >
              {/* Card flip */}
              <motion.div
                className="w-full h-full"
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front (unrevealed) */}
                <div className="absolute inset-0 rounded-xl border border-border bg-secondary/50 p-3 flex flex-col items-center justify-center gap-2 backface-hidden">
                  <span className="text-2xl">{adv.icon}</span>
                  <p className="text-[10px] font-semibold text-foreground text-center">{adv.name}</p>
                  <p className="text-[8px] text-muted-foreground">Vote hidden</p>
                </div>
                {/* Back (revealed) */}
                <div
                  className={`absolute inset-0 rounded-xl border ${style.border} ${style.bg} p-3 flex flex-col items-center justify-center gap-2`}
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <span className="text-2xl">{adv.icon}</span>
                  <p className="text-[10px] font-semibold text-foreground text-center">{adv.name}</p>
                  <div className={`flex items-center gap-1 ${style.text}`}>
                    <style.icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold">{style.label}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CountdownTimer({ seconds: initialSeconds }: { seconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [active, setActive] = useState(false);
  const progress = (seconds / initialSeconds) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="stroke-secondary" strokeWidth="4" fill="none" />
          <circle
            cx="50" cy="50" r={radius}
            className={seconds <= 10 ? "stroke-destructive" : "stroke-primary"}
            strokeWidth="4" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${seconds <= 10 ? "text-destructive" : "text-foreground"}`}>
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      <button
        onClick={() => {
          setActive(!active);
          if (!active) {
            const timer = setInterval(() => {
              setSeconds(s => {
                if (s <= 1) { clearInterval(timer); setActive(false); return 0; }
                return s - 1;
              });
            }, 1000);
          }
        }}
        className="text-[10px] font-medium text-primary hover:underline"
      >
        {active ? "Pause" : seconds === 0 ? "Expired" : "Start Timer"}
      </button>
    </div>
  );
}

function AudioWaveIndicator() {
  return (
    <div className="flex items-center gap-1">
      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-end gap-0.5 h-4">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="w-0.5 rounded-full bg-primary/40"
            animate={{ height: [2, 6 + Math.random() * 10, 2] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DecisionTheater() {
  const { data: liveData, isLoading } = useInvestmentDecisions();
  const navigate = useNavigate();
  const [spotlightActive, setSpotlightActive] = useState(false);
  const order = SAMPLE_ORDERS[0];
  const overallReadiness = Math.round(([] as any[]).reduce((s, d) => s + d.score, 0) / ([] as any[]).length);
  const readinessLabel = overallReadiness >= 80 ? "Ready" : overallReadiness >= 65 ? "Needs Review" : overallReadiness >= 50 ? "Simulate First" : "Wait";

  return (
    <div className="mx-auto max-w-5xl space-y-6 relative">
      <SpotlightOverlay active={spotlightActive} />
<div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Theater className="h-7 w-7 text-primary" /> Decision Theater
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          A cinematic pre-execution review room for important capital decisions.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setSpotlightActive(!spotlightActive)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              spotlightActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {spotlightActive ? "Exit Spotlight" : "🎬 Spotlight Mode"}
          </button>
          <AudioWaveIndicator />
          <CountdownTimer seconds={300} />
        </div>
      </div>

      {/* Trade Summary Hero — elevated in spotlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8 space-y-4 transition-all duration-500 ${
          spotlightActive ? "relative z-40 shadow-2xl shadow-primary/20 ring-2 ring-primary/30" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{order.instrument.logoIcon}</span>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{order.action.toUpperCase()} {order.quantity} {order.instrument.symbol}</p>
            <p className="text-sm text-muted-foreground">{order.instrument.name} · {order.platform}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">${order.estimatedCost.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{order.orderType} @ ${order.limitPrice}</p>
          </div>
        </div>
        <div className="rounded-xl bg-secondary/30 p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
          <p className="text-sm text-foreground">{order.rationale}</p>
        </div>
      </motion.div>

      {/* Advisor Voting Panel */}
      <AdvisorVotingPanel />

      {/* Decision Readiness */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground flex-1">Decision Readiness</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{overallReadiness}%</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
              overallReadiness >= 80 ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
              overallReadiness >= 65 ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
              "bg-destructive/10 text-destructive"
            }`}>{readinessLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([] as any[]).map(d => (
            <div key={d.label} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground">{d.label}</p>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    d.score >= 80 ? "bg-[hsl(var(--trust-safe))]" : d.score >= 60 ? "bg-[hsl(var(--trust-warn))]" : "bg-destructive"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.score}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-xs font-bold text-foreground">{d.score}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Review */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-3xl border border-destructive/15 bg-destructive/5 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Risk Review</h2>
        </div>
        <p className="text-sm text-foreground">{order.riskPreview}</p>
      </motion.div>

      {/* Scenario Preview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Scenario Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SAMPLE_SCENARIOS.map(sc => (
            <div key={sc.id} className={`rounded-xl border p-4 space-y-2 ${
              sc.projectedReturn >= 0 ? "border-border bg-card" : "border-destructive/20 bg-destructive/5"
            }`}>
              <p className="text-[10px] font-semibold text-muted-foreground">{sc.name}</p>
              <p className={`text-xl font-bold ${sc.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {sc.projectedReturn >= 0 ? "+" : ""}{sc.projectedReturn}%
              </p>
              <p className="text-[9px] text-muted-foreground">{sc.probability}% probability</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="rounded-xl bg-secondary px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Save as Draft
          </button>
          <button className="rounded-xl bg-primary/10 px-5 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            Simulate Again
          </button>
          <button onClick={() => navigate("/investments/execute")}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
            Authorize Deployment →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
