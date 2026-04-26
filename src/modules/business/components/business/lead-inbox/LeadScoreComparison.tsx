import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { LeadScoreRadar } from "./LeadScoreRadar";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { LeadHeatIndicator } from "./LeadHeatIndicator";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadScoreResult } from "@/domains/business";
import { X, ArrowLeftRight } from "lucide-react";

interface Props {
  leadA: InboxItem;
  leadB: InboxItem;
  scoreA: LeadScoreResult;
  scoreB: LeadScoreResult;
  onClose: () => void;
  onAccept: (id: string) => void;
}

const CompareBar = ({ label, a, b }: { label: string; a: number; b: number }) => {
  const max = Math.max(a, b, 1);
  return (
    <div className="space-y-1">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <div className="flex gap-1 items-center">
        <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(a / max) * 100}%` }} />
        </div>
        <span className="text-[9px] text-muted-foreground w-6 text-center tabular-nums">{a}</span>
        <span className="text-[8px] text-muted-foreground/40">vs</span>
        <span className="text-[9px] text-muted-foreground w-6 text-center tabular-nums">{b}</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
          <div className="h-full rounded-full bg-accent ml-auto" style={{ width: `${(b / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
};

const LeadColumn = ({ item, score, color }: { item: InboxItem; score: LeadScoreResult; color: string }) => {
  const initials = item.contact_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="text-center space-y-2">
      <div className={cn("mx-auto h-12 w-12 rounded-xl flex items-center justify-center font-display text-sm font-bold text-primary-foreground", color)}>
        {initials}
      </div>
      <p className="text-xs font-semibold text-foreground truncate">{item.contact_name}</p>
      <p className="text-[10px] text-muted-foreground truncate">{item.company || "—"}</p>
      <div className={cn("font-display text-2xl font-bold tabular-nums", score.priorityScore >= 70 ? "text-[hsl(var(--trust-safe))]" : score.priorityScore >= 50 ? "text-[hsl(var(--sita-gold))]" : "text-[hsl(var(--trust-degraded))]")}>
        {score.priorityScore}
      </div>
      <div className="flex justify-center gap-1 flex-wrap">
        <LeadPriorityBadge tier={score.priorityTier} size="sm" />
        <LeadHeatIndicator heat={score.heatStatus} size="sm" />
      </div>
    </div>
  );
};

export const LeadScoreComparison = ({ leadA, leadB, scoreA, scoreB, onClose, onAccept }: Props) => {
  const compareFactors = scoreA.allFactors.map(fA => {
    const fB = scoreB.allFactors.find(f => f.key === fA.key);
    return { label: fA.label, a: fA.normalizedScore, b: fB?.normalizedScore ?? 0 };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <SitaCard hover={false} glass className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-accent" />
            <SitaCardTitle>Score Comparison</SitaCardTitle>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lead headers */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <LeadColumn item={leadA} score={scoreA} color="gradient-sita" />
          <LeadColumn item={leadB} score={scoreB} color="bg-accent" />
        </div>

        {/* Radar overlay */}
        <div className="flex justify-center mb-4 relative">
          <div className="relative">
            <LeadScoreRadar factors={scoreA.allFactors} size={180} showLabels />
            <div className="absolute inset-0 opacity-40">
              <LeadScoreRadar factors={scoreB.allFactors} size={180} showLabels={false} />
            </div>
          </div>
        </div>

        {/* Factor comparison bars */}
        <div className="space-y-2">
          {compareFactors.map(f => (
            <CompareBar key={f.label} label={f.label} a={f.a} b={f.b} />
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/20">
          <div className="space-y-1.5 text-center">
            <p className="text-[9px] text-muted-foreground">Stale Risk</p>
            <p className="text-sm font-bold text-foreground">{scoreA.staleRisk}%</p>
          </div>
          <div className="space-y-1.5 text-center">
            <p className="text-[9px] text-muted-foreground">Stale Risk</p>
            <p className="text-sm font-bold text-foreground">{scoreB.staleRisk}%</p>
          </div>
          <div className="space-y-1.5 text-center">
            <p className="text-[9px] text-muted-foreground">Est. Value</p>
            <p className="text-sm font-bold text-foreground">${(leadA.estimated_value || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-1.5 text-center">
            <p className="text-[9px] text-muted-foreground">Est. Value</p>
            <p className="text-sm font-bold text-foreground">${(leadB.estimated_value || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <SitaButton variant="primary" size="sm" onClick={() => onAccept(leadA.id)}>Accept {leadA.contact_name.split(" ")[0]}</SitaButton>
          <SitaButton variant="accent" size="sm" onClick={() => onAccept(leadB.id)}>Accept {leadB.contact_name.split(" ")[0]}</SitaButton>
        </div>
      </SitaCard>
    </motion.div>
  );
};
