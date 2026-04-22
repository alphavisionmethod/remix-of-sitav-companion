// ═══════════════════════════════════════════════════════════════
// SITA OS — Wealth Command Center
// Cinematic full-screen financial dashboard
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, Globe, Activity,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet,
  PiggyBank, CreditCard, Building2, BarChart3, Zap
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { PageShell } from "@/components/sita/PageShell";

// ─── Simulated data ───
const ACCOUNTS = [
  { name: "Operating", balance: 284500, change: 2.3, icon: Building2 },
  { name: "Savings", balance: 152000, change: 0.8, icon: PiggyBank },
  { name: "Investment", balance: 891200, change: -1.2, icon: BarChart3 },
  { name: "Crypto", balance: 67800, change: 5.4, icon: Wallet },
];

const FLOW_STREAMS = [
  { from: "Revenue", to: "Operating", amount: 45000, color: "hsl(var(--trust-safe))" },
  { from: "Operating", to: "Payroll", amount: 28000, color: "hsl(var(--sita-gold))" },
  { from: "Operating", to: "Savings", amount: 8000, color: "hsl(var(--sita-purple))" },
  { from: "Savings", to: "Investment", amount: 5000, color: "hsl(var(--sita-purple-light))" },
  { from: "Revenue", to: "Tax Reserve", amount: 12000, color: "hsl(var(--destructive))" },
];

const GLOBAL_POSITIONS = [
  { city: "New York", lat: 40.7, lng: -74, value: 420000, type: "stocks" },
  { city: "London", lat: 51.5, lng: -0.1, value: 185000, type: "bonds" },
  { city: "Singapore", lat: 1.35, lng: 103.8, value: 67800, type: "crypto" },
  { city: "Dubai", lat: 25.2, lng: 55.3, value: 95000, type: "property" },
  { city: "San Francisco", lat: 37.8, lng: -122.4, value: 312000, type: "startup" },
];

const DANGER_ZONES = [
  { label: "Credit card payment due in 3 days", severity: "warning" as const, amount: 4200 },
  { label: "TSLA position down 8% this week", severity: "danger" as const, amount: -12400 },
];

function usePulsingValue(base: number, volatility = 0.001, interval = 2000) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const t = setInterval(() => {
      setValue(prev => prev + prev * (Math.random() - 0.48) * volatility);
    }, interval);
    return () => clearInterval(t);
  }, [base, volatility, interval]);
  return value;
}

// ─── Net Worth Ticker ───
function NetWorthTicker({ value }: { value: number }) {
  const displayed = useCountUp(Math.round(value), 1200);
  const formatted = displayed.toLocaleString();

  return (
    <PageShell>
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Total Net Worth</p>
      <motion.div
        className="text-5xl md:text-7xl font-thin tracking-tight text-foreground font-mono tabular-nums"
        key={Math.floor(value / 1000)}
        initial={{ scale: 1.02, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <span className="text-muted-foreground/60">$</span>{formatted}
      </motion.div>
      <motion.div
        className="mt-3 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="flex items-center gap-1 text-sm text-[hsl(var(--trust-safe))]">
          <ArrowUpRight className="h-4 w-4" />
          +2.4% this month
        </span>
        <span className="text-muted-foreground/40">•</span>
        <span className="text-sm text-muted-foreground">+$32,400</span>
      </motion.div>
    </div>
    </PageShell>
  );
}

// ─── Account Card ───
function AccountCard({ account, index }: { account: typeof ACCOUNTS[0]; index: number }) {
  const Icon = account.icon;
  const isPositive = account.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        "bg-card/60 backdrop-blur-xl border border-border/40",
        "hover:border-[hsl(var(--sita-purple)/0.4)] transition-all duration-500",
        "group cursor-pointer"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--sita-purple)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{account.name}</span>
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-foreground">
            ${account.balance.toLocaleString()}
          </p>
        </div>
        <span className={cn(
          "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
          isPositive
            ? "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe)/0.1)]"
            : "text-destructive bg-destructive/10"
        )}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(account.change)}%
        </span>
      </div>
      {/* Mini sparkline */}
      <div className="mt-3 h-8 relative">
        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={isPositive
              ? "M0,25 Q10,22 20,20 T40,15 T60,12 T80,8 T100,5"
              : "M0,8 Q10,10 20,12 T40,18 T60,20 T80,22 T100,25"}
            fill="none"
            stroke={isPositive ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"}
            strokeWidth="1.5"
          />
          <path
            d={isPositive
              ? "M0,25 Q10,22 20,20 T40,15 T60,12 T80,8 T100,5 V30 H0 Z"
              : "M0,8 Q10,10 20,12 T40,18 T60,20 T80,22 T100,25 V30 H0 Z"}
            fill={`url(#grad-${index})`}
          />
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Money Flow Sankey ───
function MoneyFlowDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[hsl(var(--sita-purple))]" />
        Money Flow — This Month
      </h3>
      <div className="space-y-2">
        {FLOW_STREAMS.map((stream, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
            className="flex items-center gap-3"
            style={{ transformOrigin: "left" }}
          >
            <span className="text-xs text-muted-foreground w-20 text-right truncate">{stream.from}</span>
            <div className="flex-1 relative h-6 rounded-full overflow-hidden bg-muted/30">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${stream.color}, ${stream.color}80)`,
                  width: `${(stream.amount / 45000) * 100}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(stream.amount / 45000) * 100}%` }}
                transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
              >
                {/* Animated glow pulse */}
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-4 rounded-full"
                  style={{ background: `${stream.color}` }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <span className="text-xs text-muted-foreground w-20 truncate">{stream.to}</span>
            <span className="text-xs font-mono text-foreground w-16 text-right">
              ${(stream.amount / 1000).toFixed(0)}K
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Global Position Map ───
function GlobalPositionMap() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Globe className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
        Global Positions
      </h3>
      {/* Simplified world map with dots */}
      <div className="relative h-40 rounded-xl bg-muted/20 overflow-hidden">
        {/* Grid lines for map feel */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 180">
          {[30, 60, 90, 120, 150].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="360" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="4 4" />
          ))}
          {[60, 120, 180, 240, 300].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="4 4" />
          ))}
          {GLOBAL_POSITIONS.map((pos, i) => {
            const x = ((pos.lng + 180) / 360) * 360;
            const y = ((90 - pos.lat) / 180) * 180;
            const r = Math.max(3, (pos.value / 420000) * 8);
            return (
              <g key={i}>
                <motion.circle
                  cx={x} cy={y} r={r * 2.5}
                  fill="hsl(var(--sita-purple))"
                  opacity={0.15}
                  animate={{ r: [r * 2, r * 3, r * 2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
                <motion.circle
                  cx={x} cy={y} r={r}
                  fill="hsl(var(--sita-purple))"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.15 }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
        {GLOBAL_POSITIONS.map((pos, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--sita-purple))]" />
            <span className="text-muted-foreground truncate">{pos.city}</span>
            <span className="font-mono text-foreground ml-auto">${(pos.value / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Live P&L Ribbon ───
function LivePLRibbon() {
  const [points, setPoints] = useState<number[]>(() =>
    Array.from({ length: 60 }, (_, i) => 50 + Math.sin(i * 0.3) * 15 + Math.random() * 10)
  );

  useEffect(() => {
    const t = setInterval(() => {
      setPoints(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(10, Math.min(90, last + (Math.random() - 0.48) * 8));
        return [...prev.slice(1), next];
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const path = useMemo(() => {
    return points.map((p, i) => `${(i / (points.length - 1)) * 100},${100 - p}`).join(" L");
  }, [points]);

  const isUp = points[points.length - 1] > points[points.length - 2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
          Live P&L
        </h3>
        <span className={cn(
          "text-xs font-mono px-2 py-0.5 rounded-full",
          isUp ? "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe)/0.1)]" : "text-destructive bg-destructive/10"
        )}>
          {isUp ? "▲" : "▼"} ${Math.abs(Math.round((points[points.length - 1] - 50) * 100)).toLocaleString()}
        </span>
      </div>
      <div className="h-20 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isUp ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M0,${100 - points[0]} L${path} V100 H0 Z`} fill="url(#pl-grad)" />
          <path d={`M0,${100 - points[0]} L${path}`} fill="none" stroke={isUp ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"} strokeWidth="1.5" />
          {/* Pulse dot at end */}
          <motion.circle
            cx="100"
            cy={100 - points[points.length - 1]}
            r="2"
            fill={isUp ? "hsl(var(--trust-safe))" : "hsl(var(--destructive))"}
            animate={{ r: [2, 4, 2], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Danger Zones ───
function DangerZones() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="space-y-2"
    >
      {DANGER_ZONES.map((zone, i) => (
        <motion.div
          key={i}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.3 + i * 0.15 }}
          className={cn(
            "rounded-xl p-3 flex items-center gap-3 border",
            zone.severity === "danger"
              ? "bg-destructive/5 border-destructive/20"
              : "bg-[hsl(var(--sita-gold)/0.05)] border-[hsl(var(--sita-gold)/0.2)]"
          )}
        >
          <AlertTriangle className={cn(
            "h-4 w-4 flex-shrink-0",
            zone.severity === "danger" ? "text-destructive" : "text-[hsl(var(--sita-gold))]"
          )} />
          <span className="text-xs text-foreground flex-1">{zone.label}</span>
          <span className={cn(
            "text-xs font-mono",
            zone.severity === "danger" ? "text-destructive" : "text-[hsl(var(--sita-gold))]"
          )}>
            {zone.amount > 0 ? "$" : "-$"}{Math.abs(zone.amount).toLocaleString()}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main Page ───
export default function WealthCommandCenter() {
  const netWorth = usePulsingValue(1395500, 0.0005, 3000);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ background: "hsl(var(--sita-purple) / 0.04)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "hsl(var(--trust-safe) / 0.03)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero: Net Worth */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-4"
        >
          <NetWorthTicker value={netWorth} />
        </motion.div>

        {/* Account Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACCOUNTS.map((account, i) => (
            <AccountCard key={account.name} account={account} index={i} />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoneyFlowDiagram />
          <GlobalPositionMap />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <LivePLRibbon />
          </div>
          <DangerZones />
        </div>
      </div>
    </div>
  );
}
