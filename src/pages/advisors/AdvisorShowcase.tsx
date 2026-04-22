import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";
import { X, Shield, Zap, Brain, Target } from "lucide-react";
import showcaseBg from "@/assets/advisors/showcase-bg.jpg";
import holographicAdvisor from "@/assets/advisors/holographic-advisor.jpg";

/* ── Advisor data ─────────────────────────────────────── */
const ADVISORS = [
  {
    id: "financial",
    title: "FINANCIAL STRATEGIST",
    icon: Shield,
    accent: "139,92,246",   // purple
    accentTw: "violet",
    confidence: 92,
    data: [{ v: 40 }, { v: 65 }, { v: 50 }, { v: 80 }, { v: 60 }, { v: 75 }],
  },
  {
    id: "growth",
    title: "GROWTH ARCHITECT",
    icon: Zap,
    accent: "16,185,129",   // emerald
    accentTw: "emerald",
    confidence: 87,
    data: [{ v: 55 }, { v: 70 }, { v: 45 }, { v: 90 }, { v: 65 }, { v: 85 }],
  },
  {
    id: "operations",
    title: "OPERATIONS COMMANDER",
    icon: Brain,
    accent: "6,182,212",    // cyan
    accentTw: "cyan",
    confidence: 78,
    data: [{ v: 60 }, { v: 45 }, { v: 70 }, { v: 55 }, { v: 80 }, { v: 50 }],
  },
  {
    id: "strategy",
    title: "STRATEGY DIRECTOR",
    icon: Target,
    accent: "245,158,11",   // amber
    accentTw: "amber",
    confidence: 95,
    data: [{ v: 75 }, { v: 60 }, { v: 85 }, { v: 70 }, { v: 55 }, { v: 90 }],
  },
];

const EVIDENCE_ITEMS = [
  { label: "Market Trend Analysis Q1-Q4", score: 94, age: "2h ago" },
  { label: "Competitor Financial Filings", score: 87, age: "6h ago" },
  { label: "Customer Revenue Segments", score: 91, age: "1d ago" },
  { label: "Macro-Economic Indicators", score: 76, age: "3d ago" },
];

const CONFIDENCE_ITEMS = [
  { label: "Data Quality", pct: 96 },
  { label: "Source Coverage", pct: 84 },
  { label: "Memory Depth", pct: 72 },
  { label: "Historical Accuracy", pct: 91 },
];

/* ── Neon particles ───────────────────────────────────── */
function Particles() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    dur: 4 + Math.random() * 6,
    delay: Math.random() * 5,
    color: ["139,92,246", "6,182,212", "245,158,11"][i % 3],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: `rgba(${d.color},0.6)`,
            boxShadow: `0 0 6px rgba(${d.color},0.8)`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Confidence gauge SVG ─────────────────────────────── */
function ConfidenceGauge({ value, accent }: { value: number; accent: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={72} height={72} className="mx-auto">
      <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle
        cx={36} cy={36} r={r} fill="none"
        stroke={`rgba(${accent},0.9)`}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ filter: `drop-shadow(0 0 6px rgba(${accent},0.6))` }}
      />
      <text x={36} y={40} textAnchor="middle" fill="white" fontSize={14} fontWeight={700}>
        {value}%
      </text>
    </svg>
  );
}

/* ── Debate timer ─────────────────────────────────────── */
function DebateTimer() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => (e >= 60 ? 0 : e + 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (elapsed / 60) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={110} height={110}>
        <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <motion.circle
          cx={55} cy={55} r={r} fill="none"
          stroke="rgba(139,92,246,0.9)"
          strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ filter: "drop-shadow(0 0 10px rgba(139,92,246,0.7))" }}
          animate={{ filter: ["drop-shadow(0 0 8px rgba(139,92,246,0.5))", "drop-shadow(0 0 16px rgba(139,92,246,0.9))", "drop-shadow(0 0 8px rgba(139,92,246,0.5))"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <text x={55} y={60} textAnchor="middle" fill="white" fontSize={20} fontWeight={700}>
          {60 - elapsed}
        </text>
      </svg>
      <span className="text-[10px] uppercase tracking-widest text-white/40">Debate Timer</span>
    </div>
  );
}

/* ── Debate overlay ───────────────────────────────────── */
function DebateOverlay({ advisor, onClose }: { advisor: typeof ADVISORS[0]; onClose: () => void }) {
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [handleKey]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full max-w-5xl"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* close */}
        <button onClick={onClose} className="absolute -top-3 -right-3 z-20 rounded-full bg-white/10 p-2 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>

        {/* title */}
        <h2 className="text-center text-lg font-bold tracking-widest text-white/90 mb-6 uppercase">
          {advisor.title} — <span className="text-violet-400">Debate Mode</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Evidence panel */}
          <div className="rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-xl p-5 space-y-4">
            <h3 className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase">Evidence</h3>
            {EVIDENCE_ITEMS.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70">{item.label}</span>
                  <span className="text-amber-300/70">{item.age}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }}
                  />
                </div>
                <span className="text-[10px] text-white/40">{item.score}% reliability</span>
              </div>
            ))}
          </div>

          {/* Center timer */}
          <div className="hidden md:flex items-center justify-center">
            <DebateTimer />
          </div>

          {/* Confidence panel */}
          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 backdrop-blur-xl p-5 space-y-4">
            <h3 className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">Confidence</h3>
            {CONFIDENCE_ITEMS.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70">{item.label}</span>
                  <span className="text-cyan-300/70">{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ filter: "drop-shadow(0 0 4px rgba(6,182,212,0.5))" }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 py-2 px-3">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">Trust Level: High</span>
            </div>
          </div>
        </div>

        {/* mobile timer */}
        <div className="flex md:hidden items-center justify-center mt-6">
          <DebateTimer />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main page ────────────────────────────────────────── */
export default function AdvisorShowcase() {
  const [active, setActive] = useState<typeof ADVISORS[0] | null>(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-white">
      {/* BG */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url(${showcaseBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 z-0 bg-black/50" />

      <Particles />

      {/* Header */}
      <div className="relative z-10 text-center mb-10 px-4">
        <motion.h1
          className="text-3xl md:text-5xl font-black tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
            Advisory Council
          </span>
        </motion.h1>
        <motion.p
          className="mt-2 text-sm text-white/50 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Select an advisor to enter Debate Mode
        </motion.p>
      </div>

      {/* Cards grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 max-w-6xl w-full">
        {ADVISORS.map((adv, i) => (
          <motion.div
            key={adv.id}
            className="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex flex-col items-center gap-3 transition-all"
            style={{ boxShadow: `0 0 30px rgba(${adv.accent},0.12)` }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i, type: "spring", stiffness: 200, damping: 25 }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 50px rgba(${adv.accent},0.3)`,
              rotate: 1,
            }}
            onClick={() => setActive(adv)}
          >
            {/* float animation wrapper */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-full flex flex-col items-center"
            >
              {/* Hologram image */}
              <div className="w-28 h-28 rounded-full overflow-hidden mb-1" style={{ filter: `drop-shadow(0 0 12px rgba(${adv.accent},0.4))` }}>
                <img
                  src={holographicAdvisor}
                  alt={adv.title}
                  className="w-full h-full object-cover"
                  style={{ mixBlendMode: "screen" }}
                />
              </div>

              {/* Title with glitch */}
              <h3
                className="text-[11px] font-bold tracking-[0.2em] uppercase text-center glitch-text"
                style={{ color: `rgba(${adv.accent},0.9)` }}
              >
                {adv.title}
              </h3>

              {/* Mini chart */}
              <div className="w-full h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adv.data} barCategoryGap={4}>
                    <Bar dataKey="v" radius={[2, 2, 0, 0]}>
                      {adv.data.map((_, j) => (
                        <Cell
                          key={j}
                          fill={`rgba(${adv.accent},${0.5 + (j / adv.data.length) * 0.5})`}
                          style={{ filter: `drop-shadow(0 0 4px rgba(${adv.accent},0.4))` }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence gauge */}
              <ConfidenceGauge value={adv.confidence} accent={adv.accent} />
              <span className="text-[9px] uppercase tracking-widest text-white/30">Confidence</span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Debate overlay */}
      <AnimatePresence>
        {active && <DebateOverlay advisor={active} onClose={() => setActive(null)} />}
      </AnimatePresence>

      {/* Glitch CSS */}
      <style>{`
        @keyframes glitch {
          0%, 90%, 100% { text-shadow: none; clip-path: none; }
          92% { text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,255,0.5); clip-path: inset(20% 0 30% 0); }
          94% { text-shadow: -2px 0 rgba(255,0,0,0.5), 2px 0 rgba(0,255,255,0.5); clip-path: inset(50% 0 10% 0); }
          96% { text-shadow: none; clip-path: none; }
        }
        .glitch-text { animation: glitch 4s infinite; }
      `}</style>
    </div>
  );
}