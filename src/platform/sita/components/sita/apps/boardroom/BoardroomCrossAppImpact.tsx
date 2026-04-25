// ============================================================
// SITA OS — Boardroom Cross-App Impact
// Visual dependency map showing decision ripple effects
// ============================================================

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Briefcase, DollarSign, Users, ArrowRight, Zap } from "lucide-react";

interface Props {
  scope: string;
}

interface DomainNode {
  id: string;
  label: string;
  icon: typeof Briefcase;
  color: string;
  metrics: string[];
}

interface RippleEffect {
  from: string;
  to: string;
  effect: string;
  magnitude: "high" | "medium" | "low";
  timing: string;
}

const DOMAINS: DomainNode[] = [
  { id: "business", label: "Business", icon: Briefcase, color: "hsl(280 50% 60%)", metrics: ["Pipeline: 12 active deals", "Collections: $18.5K overdue", "NPS: 72"] },
  { id: "finance", label: "Finance", icon: DollarSign, color: "hsl(152 55% 48%)", metrics: ["Reserves: $7,200", "Burn rate: $3,200/mo", "Runway: 2.3 months"] },
  { id: "concierge", label: "Concierge", icon: Users, color: "hsl(38 85% 58%)", metrics: ["Errands: 4 pending", "Obligations: 2 due", "Travel: 1 upcoming"] },
];

const RIPPLE_EFFECTS: RippleEffect[] = [
  { from: "business", to: "finance", effect: "Collections recovery → $16.8K expected to flow into reserves within 3 weeks", magnitude: "high", timing: "10-21 days" },
  { from: "business", to: "concierge", effect: "Client visit prep depends on travel approval. Pipeline health affects scheduling.", magnitude: "low", timing: "Immediate" },
  { from: "finance", to: "business", effect: "Reserve shortfall may force subscription cuts → potential CRM tool downgrade", magnitude: "medium", timing: "30 days" },
  { from: "finance", to: "concierge", effect: "Budget constraints may defer non-essential errands and household services", magnitude: "low", timing: "14 days" },
  { from: "concierge", to: "business", effect: "NYC client visit success impacts $45K deal. Logistics readiness is critical.", magnitude: "high", timing: "10 days" },
  { from: "concierge", to: "finance", effect: "Travel package approval creates $1,840 obligation against reserves", magnitude: "medium", timing: "Immediate" },
];

const magnitudeStyles = {
  high: { color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "High Impact" },
  medium: { color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", label: "Medium" },
  low: { color: "text-[hsl(0_0%_100%/0.4)]", bg: "bg-[hsl(0_0%_100%/0.04)]", label: "Low" },
};

export function BoardroomCrossAppImpact({ scope }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const filteredRipples = selectedDomain
    ? RIPPLE_EFFECTS.filter(r => r.from === selectedDomain || r.to === selectedDomain)
    : RIPPLE_EFFECTS;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(320_50%_50%)] to-[hsl(320_50%_30%)] flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[hsl(0_0%_100%/0.9)]">Cross-App Impact Map</p>
          <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">How boardroom decisions ripple across domains</p>
        </div>
      </div>

      {/* Domain Cards — Interactive */}
      <div className="grid grid-cols-3 gap-4">
        {DOMAINS.map((domain, i) => {
          const Icon = domain.icon;
          const isSelected = selectedDomain === domain.id;
          const outgoing = RIPPLE_EFFECTS.filter(r => r.from === domain.id);
          const incoming = RIPPLE_EFFECTS.filter(r => r.to === domain.id);

          return (
            <motion.button
              key={domain.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedDomain(isSelected ? null : domain.id)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all relative overflow-hidden",
                isSelected
                  ? "border-[hsl(280_50%_50%/0.3)] bg-[hsl(280_40%_50%/0.06)] shadow-[0_0_30px_hsl(280_50%_50%/0.1)]"
                  : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]",
              )}
            >
              {/* Ripple animation when selected */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ border: `2px solid ${domain.color}30` }}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}

              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${domain.color}20` }}
                >
                  <Icon size={16} style={{ color: domain.color }} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[hsl(0_0%_100%/0.85)]">{domain.label}</p>
                  <p className="text-[9px] text-[hsl(0_0%_100%/0.3)]">
                    {outgoing.length} outgoing · {incoming.length} incoming
                  </p>
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                {domain.metrics.map((m, j) => (
                  <p key={j} className="text-[10px] text-[hsl(0_0%_100%/0.45)]">• {m}</p>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Ripple Effects List */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          {selectedDomain ? `Effects involving ${selectedDomain}` : "All Cross-Domain Effects"}
          <span className="text-[hsl(0_0%_100%/0.25)] ml-2 normal-case">
            {filteredRipples.length} connections
          </span>
        </p>
        <div className="space-y-2">
          {filteredRipples.map((ripple, i) => {
            const fromDomain = DOMAINS.find(d => d.id === ripple.from)!;
            const toDomain = DOMAINS.find(d => d.id === ripple.to)!;
            const mag = magnitudeStyles[ripple.magnitude];
            const FromIcon = fromDomain.icon;
            const ToIcon = toDomain.icon;

            return (
              <motion.div
                key={`${ripple.from}-${ripple.to}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 relative overflow-hidden group"
              >
                {/* Animated ripple line */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                  style={{ backgroundColor: fromDomain.color }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                />

                <div className="flex items-center gap-3 mb-2 pl-3">
                  <div className="flex items-center gap-1.5">
                    <FromIcon size={12} style={{ color: fromDomain.color }} />
                    <span className="text-[10px] font-bold" style={{ color: fromDomain.color }}>{fromDomain.label}</span>
                  </div>
                  <ArrowRight size={12} className="text-[hsl(0_0%_100%/0.2)]" />
                  <div className="flex items-center gap-1.5">
                    <ToIcon size={12} style={{ color: toDomain.color }} />
                    <span className="text-[10px] font-bold" style={{ color: toDomain.color }}>{toDomain.label}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full", mag.bg, mag.color)}>
                      {mag.label}
                    </span>
                    <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">{ripple.timing}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[hsl(0_0%_100%/0.55)] leading-relaxed pl-3">{ripple.effect}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
