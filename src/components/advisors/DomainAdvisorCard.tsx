// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain-Aware Advisor Card
// Replaces generic InAppAdvisorStrip with domain-specific identity
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Zap, Brain, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import type { LucideIcon } from "lucide-react";

type DomainId = "business" | "finance" | "concierge" | "files" | "trust";

interface AdvisorInsight {
  id: string;
  text: string;
  confidence: number;
  action?: string;
  onAction?: () => void;
}

interface DomainAdvisorCardProps {
  domain: DomainId;
  insights: AdvisorInsight[];
  className?: string;
}

const advisorConfig: Record<DomainId, {
  name: string;
  specialty: string;
  icon: LucideIcon;
  accentFrom: string;
  accentTo: string;
  tone: string;
}> = {
  business: {
    name: "Business Advisor",
    specialty: "Revenue, pipeline & execution",
    icon: Brain,
    accentFrom: "hsl(265 55% 58%)",
    accentTo: "hsl(285 50% 48%)",
    tone: "Sharp, operational insights",
  },
  finance: {
    name: "Finance Advisor",
    specialty: "Cash posture & obligations",
    icon: Shield,
    accentFrom: "hsl(152 55% 48%)",
    accentTo: "hsl(165 50% 42%)",
    tone: "Calm, confidence-building guidance",
  },
  concierge: {
    name: "Life Advisor",
    specialty: "Household & logistics support",
    icon: Heart,
    accentFrom: "hsl(285 55% 55%)",
    accentTo: "hsl(310 50% 48%)",
    tone: "Supportive, relief-oriented help",
  },
  files: {
    name: "Files Advisor",
    specialty: "Document intelligence & organization",
    icon: Brain,
    accentFrom: "hsl(220 15% 55%)",
    accentTo: "hsl(230 15% 45%)",
    tone: "Precise, organized guidance",
  },
  trust: {
    name: "Trust Advisor",
    specialty: "System integrity & governance",
    icon: Shield,
    accentFrom: "hsl(35 75% 55%)",
    accentTo: "hsl(25 70% 48%)",
    tone: "Serious, inspectable oversight",
  },
};

export function DomainAdvisorCard({ domain, insights, className }: DomainAdvisorCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const config = advisorConfig[domain];
  const Icon = config.icon;

  if (dismissed || insights.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          "rounded-xl border p-4 mb-4",
          className
        )}
        style={{
          borderColor: `${config.accentFrom}20`,
          background: `linear-gradient(135deg, ${config.accentFrom}06, ${config.accentTo}04)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})`,
          }}>
            <Icon className="h-4 w-4 text-[hsl(0_0%_100%/0.95)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" style={{ color: config.accentFrom }} />
              <span className="text-[11px] font-semibold" style={{ color: config.accentFrom }}>{config.name}</span>
            </div>
            <p className="text-[9px] text-muted-foreground">{config.specialty}</p>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground" aria-label="Dismiss">
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {insights.map(insight => (
            <div key={insight.id} className="flex items-start gap-2.5 rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.05)] px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground">{insight.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ConfidenceBar value={insight.confidence} className="w-14" />
                  <span className="text-[9px] text-muted-foreground">{insight.confidence}%</span>
                </div>
              </div>
              {insight.action && (
                <button
                  onClick={insight.onAction}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors flex items-center gap-1"
                  style={{
                    background: `${config.accentFrom}15`,
                    color: config.accentFrom,
                  }}
                >
                  <Zap className="h-2.5 w-2.5" />
                  {insight.action}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
