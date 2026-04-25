// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Money Operating Modes
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { DomainHeader } from "@/platform/sita/components/sita/primitives/DomainHeader";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import {
  Shield, TrendingDown, RefreshCw, TrendingUp, Rocket, Zap,
  ShieldAlert, Briefcase, Users, Flame, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { MoneyModeId, MoneyMode } from "@/packages/finance-contracts/advanced-intelligence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const MODES: MoneyMode[] = [
  { id: "stable", label: "Stable", description: "Normal operating rhythm. Balanced allocations, standard warnings.", icon: "Shield",
    safeToSpendPosture: "normal", warningThreshold: "standard", reserveTargetMultiplier: 1, advisorTone: "supportive",
    billPrioritization: "Due-date order", discretionaryGuidance: "Spend freely within budgets" },
  { id: "tighten", label: "Tighten", description: "Reduce spending, increase reserves. More aggressive warnings.", icon: "TrendingDown",
    safeToSpendPosture: "conservative", warningThreshold: "elevated", reserveTargetMultiplier: 1.5, advisorTone: "cautious",
    billPrioritization: "Essential bills first", discretionaryGuidance: "Cut discretionary by 30%" },
  { id: "recovery", label: "Recovery", description: "Rebuilding after a setback. Gentle, supportive guidance.", icon: "RefreshCw",
    safeToSpendPosture: "conservative", warningThreshold: "standard", reserveTargetMultiplier: 1.2, advisorTone: "supportive",
    billPrioritization: "Minimum payments, protect essentials", discretionaryGuidance: "Small wins — modest spending ok" },
  { id: "growth", label: "Growth", description: "Income rising, expanding capacity. Optimize allocation.", icon: "TrendingUp",
    safeToSpendPosture: "normal", warningThreshold: "standard", reserveTargetMultiplier: 1, advisorTone: "ambitious",
    billPrioritization: "Standard order", discretionaryGuidance: "Invest surplus in goals & growth" },
  { id: "expansion", label: "Expansion", description: "Active business growth. Higher risk tolerance, bigger moves.", icon: "Rocket",
    safeToSpendPosture: "aggressive", warningThreshold: "standard", reserveTargetMultiplier: 0.8, advisorTone: "ambitious",
    billPrioritization: "Revenue-generating first", discretionaryGuidance: "Accept higher burn for growth" },
  { id: "debt-attack", label: "Debt Attack", description: "Maximum debt reduction. All surplus to payoff.", icon: "Zap",
    safeToSpendPosture: "minimal", warningThreshold: "strict", reserveTargetMultiplier: 0.8, advisorTone: "aggressive",
    billPrioritization: "Highest interest first", discretionaryGuidance: "Bare minimum — every dollar to debt" },
  { id: "tax-protection", label: "Tax Protection", description: "Maximize deductions, build tax reserves.", icon: "ShieldAlert",
    safeToSpendPosture: "conservative", warningThreshold: "elevated", reserveTargetMultiplier: 1.3, advisorTone: "cautious",
    billPrioritization: "Tax-deductible expenses prioritized", discretionaryGuidance: "Defer non-deductible spending" },
  { id: "founder-conservation", label: "Founder Conservation", description: "Protect personal finances from business volatility.", icon: "Briefcase",
    safeToSpendPosture: "conservative", warningThreshold: "strict", reserveTargetMultiplier: 1.5, advisorTone: "protective",
    billPrioritization: "Personal essentials first", discretionaryGuidance: "Minimize founder draw, build runway" },
  { id: "household-protection", label: "Household Protection", description: "Prioritize family financial stability.", icon: "Users",
    safeToSpendPosture: "conservative", warningThreshold: "elevated", reserveTargetMultiplier: 1.4, advisorTone: "protective",
    billPrioritization: "Household essentials first", discretionaryGuidance: "Protect shared goals, reduce individual spending" },
  { id: "launch-mode", label: "Launch Mode", description: "Pre-launch spending burst. Time-limited aggressive allocation.", icon: "Flame",
    safeToSpendPosture: "aggressive", warningThreshold: "standard", reserveTargetMultiplier: 0.7, advisorTone: "ambitious",
    billPrioritization: "Launch-critical expenses first", discretionaryGuidance: "Accept temporary cash pressure for launch ROI" },
];

const modeIcons: Record<string, typeof Shield> = {
  Shield, TrendingDown, RefreshCw, TrendingUp, Rocket, Zap, ShieldAlert, Briefcase, Users, Flame,
};

const postureColors: Record<string, string> = {
  normal: "text-trust-verified",
  conservative: "text-[hsl(var(--sita-gold))]",
  aggressive: "text-urgency-high",
  minimal: "text-destructive",
};

const MoneyModes = () => {
  const [activeMode, setActiveMode] = useState<MoneyModeId>("stable");
  const currentMode = MODES.find(m => m.id === activeMode)!;
  const CurrentIcon = modeIcons[currentMode.icon] || Shield;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Money Operating Modes" subtitle="Change how your money system behaves based on your current season" />
{/* Current Mode */}
      <SitaCard hover={false} className="p-6 gradient-sita-subtle">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-2xl bg-primary/15 p-3"><CurrentIcon className="h-6 w-6 text-primary" /></div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-xl font-bold text-foreground">{currentMode.label} Mode</p>
              <TrustBadge level="verified" label="Active" size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{currentMode.description}</p>
          </div>
        </div>
      </SitaCard>

      {/* Mode Selector */}
      <SitaSectionHeader title="Select Operating Mode" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MODES.map(mode => {
          const Icon = modeIcons[mode.icon] || Shield;
          const isActive = activeMode === mode.id;
          return (
            <SitaCard key={mode.id} hover onClick={() => setActiveMode(mode.id)}
              className={`p-3 cursor-pointer transition-all text-center ${isActive ? "ring-2 ring-primary bg-primary/5" : ""}`}>
              <Icon className={`h-5 w-5 mx-auto mb-2 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-xs font-semibold text-foreground">{mode.label}</p>
              {isActive && <CheckCircle className="h-3 w-3 text-primary mx-auto mt-1" />}
            </SitaCard>
          );
        })}
      </div>

      {/* Mode Behavior Details */}
      <SitaSectionHeader title="Mode Behavior" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Safe-to-Spend Posture", value: currentMode.safeToSpendPosture, colorKey: currentMode.safeToSpendPosture },
          { label: "Warning Threshold", value: currentMode.warningThreshold, colorKey: currentMode.warningThreshold === "strict" ? "minimal" : currentMode.warningThreshold === "elevated" ? "conservative" : "normal" },
          { label: "Reserve Target", value: `${currentMode.reserveTargetMultiplier}x`, colorKey: currentMode.reserveTargetMultiplier >= 1.3 ? "conservative" : "normal" },
          { label: "Advisor Tone", value: currentMode.advisorTone, colorKey: "normal" },
          { label: "Bill Prioritization", value: currentMode.billPrioritization, colorKey: "normal" },
          { label: "Discretionary Guidance", value: currentMode.discretionaryGuidance, colorKey: currentMode.safeToSpendPosture },
        ].map((item, i) => (
          <SitaCard key={i} hover={false} className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{item.label}</p>
            <p className={`text-sm font-semibold capitalize ${postureColors[item.colorKey] || "text-foreground"}`}>{item.value}</p>
          </SitaCard>
        ))}
      </div>
    </motion.div>
  );
};

export default MoneyModes;
