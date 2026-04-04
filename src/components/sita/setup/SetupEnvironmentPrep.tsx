// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Final Environment Preparation + Ready
// Premium system initialization and arrival screen
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check, Brain, Shield, Database, Cpu, Radio, HardDrive,
  Globe, ChevronRight, Activity,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { cn } from "@/lib/utils";

interface Props {
  displayName: string;
  activeAdvisors: string[];
  autonomyLevel: number;
  onFinish: () => void;
}

const CHECKS = [
  { name: "Advisory intelligence layer", icon: Brain },
  { name: "Trust & governance engine", icon: Shield },
  { name: "Memory subsystem", icon: Database },
  { name: "Proof & receipt ledger", icon: HardDrive },
  { name: "Connector framework", icon: Radio },
  { name: "Workflow engine", icon: Cpu },
];

export function SetupEnvironmentPrep({ displayName, activeAdvisors, autonomyLevel, onFinish }: Props) {
  const [phase, setPhase] = useState<"checking" | "ready">("checking");
  const [checks, setChecks] = useState(CHECKS.map(c => ({ ...c, status: "pending" as "pending" | "running" | "done" })));

  useEffect(() => {
    let idx = 0;
    const run = () => {
      if (idx >= CHECKS.length) {
        setTimeout(() => setPhase("ready"), 500);
        return;
      }
      setChecks(prev => prev.map((c, i) => i === idx ? { ...c, status: "running" } : c));
      setTimeout(() => {
        setChecks(prev => prev.map((c, i) => i === idx ? { ...c, status: "done" } : c));
        idx++;
        setTimeout(run, 120);
      }, 250 + Math.random() * 150);
    };
    const t = setTimeout(run, 400);
    return () => clearTimeout(t);
  }, []);

  const trustLabel = ["Observe only", "Suggest", "Simulate first", "Ask before acting", "Handle routine tasks"][autonomyLevel] || "Balanced";

  if (phase === "ready") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-xl mx-auto text-center space-y-8"
      >
        {/* Logo with success badge */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="relative mx-auto w-24 h-24">
            <img src={logo} alt="SITA" className="h-24 w-24 rounded-3xl shadow-2xl shadow-primary/20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--trust-safe))] shadow-lg">
              <Check className="h-5 w-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {displayName ? `Welcome, ${displayName}` : "SITA OS Ready"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your operating system is configured and all systems are online.
          </p>
        </motion.div>

        {/* Summary cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[
            { label: "Advisors", value: String(activeAdvisors.length), icon: Brain },
            { label: "Trust", value: trustLabel, icon: Shield },
            { label: "Domains", value: "Active", icon: Globe },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground capitalize">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          onClick={onFinish}
          className="w-full max-w-sm mx-auto rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center gap-2"
        >
          Enter SITA OS <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    );
  }

  // System Check phase
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-2xl border border-border/30 bg-card/60 shadow-2xl shadow-primary/5 overflow-hidden p-8"
        style={{ backdropFilter: "blur(12px)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Cpu className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-1">Preparing Your Environment</h2>
        <p className="text-xs text-muted-foreground mb-6">Running final configuration checks…</p>

        <div className="space-y-2">
          {checks.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-secondary/20">
              {c.status === "done" && <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />}
              {c.status === "running" && (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </motion.div>
              )}
              {c.status === "pending" && <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />}
              <span className={cn("text-xs", c.status === "done" ? "text-foreground" : c.status === "running" ? "text-primary font-medium" : "text-muted-foreground")}>
                {c.name}
              </span>
              {c.status === "done" && <span className="ml-auto text-[10px] text-[hsl(var(--trust-safe))]">Ready</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
