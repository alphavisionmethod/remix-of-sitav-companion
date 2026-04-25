import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, Pause, Shield, Clock, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import type { DomainType } from "./WhatMattersNow";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  active: boolean;
  riskTier: "low" | "medium" | "high";
  lastRun?: string;
  runCount: number;
  domain: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  status: "success" | "failed" | "simulated" | "approval-required";
  result: string;
}

const riskBadge = {
  low: { bg: "bg-chart-2/10 text-chart-2", label: "Low Risk" },
  medium: { bg: "bg-amber-500/10 text-amber-500", label: "Medium" },
  high: { bg: "bg-destructive/10 text-destructive", label: "High Risk" },
};

const statusIcon = {
  success: <CheckCircle className="h-3 w-3 text-chart-2" />,
  failed: <AlertTriangle className="h-3 w-3 text-destructive" />,
  simulated: <Play className="h-3 w-3 text-primary" />,
  "approval-required": <Shield className="h-3 w-3 text-amber-500" />,
};

export const AutomationCenter = ({ rules: initialRules, executions, domain }: {
  rules: AutomationRule[];
  executions: AutomationExecution[];
  domain: DomainType;
}) => {
  const [rules, setRules] = useState(initialRules);
  const [showHistory, setShowHistory] = useState(false);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-4">
      {/* Rules */}
      <GlassCard glow="primary" intensity="subtle" className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">Active Automations</p>
          <span className="ml-auto text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
            {rules.filter((r) => r.active).length} active
          </span>
        </div>
        <div className="space-y-2">
          {rules.map((rule, i) => {
            const risk = riskBadge[rule.riskTier];
            return (
              <motion.div
                key={rule.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  rule.active ? "border-border/30 bg-secondary/20" : "border-border/10 bg-secondary/5 opacity-60"
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    rule.active ? "bg-chart-2/20 text-chart-2" : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {rule.active ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold text-foreground truncate">{rule.name}</p>
                    <span className={`text-[8px] font-semibold rounded-full px-1.5 py-0.5 ${risk.bg}`}>
                      {risk.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">{rule.trigger}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-muted-foreground">{rule.runCount} runs</p>
                  {rule.lastRun && (
                    <p className="text-[8px] text-muted-foreground">{rule.lastRun}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Execution History */}
      <GlassCard glow="none" className="p-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 w-full"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">Execution History</p>
          <span className="text-[10px] text-muted-foreground ml-1">Last 10 runs</span>
          <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform ${showHistory ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="space-y-1.5 mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {executions.slice(0, 10).map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center gap-2.5 rounded-lg bg-secondary/20 px-3 py-2"
                >
                  {statusIcon[exec.status]}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground truncate">{exec.ruleName}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{exec.result}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground shrink-0">{exec.timestamp}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};
