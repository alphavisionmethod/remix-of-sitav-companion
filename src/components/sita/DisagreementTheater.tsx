// ═══════════════════════════════════════════════════════════════
// SITA OS — Disagreement Theater
// Split-screen debate view when advisors disagree
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Scale, Brain, AlertTriangle, ChevronRight } from "lucide-react";

interface AdvisorPosition {
  name: string;
  domain: string;
  color: string;
  position: string;
  reasoning: string;
  confidence: number;
  evidence: string[];
}

interface DisagreementTheaterProps {
  topic: string;
  sideA: AdvisorPosition;
  sideB: AdvisorPosition;
  resolution?: string;
  className?: string;
}

export function DisagreementTheater({ topic, sideA, sideB, resolution, className }: DisagreementTheaterProps) {
  return (
    <div className={cn("rounded-xl border border-[hsl(var(--sita-gold)/0.3)] bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[hsl(var(--sita-gold)/0.05)]">
        <Scale className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
        <span className="text-[12px] font-semibold text-foreground">Advisor Disagreement</span>
        <span className="text-[10px] text-muted-foreground ml-2">— {topic}</span>
      </div>

      {/* Split Debate View */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Side A */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-4 space-y-3"
        >
          {/* Advisor Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${sideA.color}22` }}>
              <Brain className="h-4 w-4" style={{ color: sideA.color }} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-foreground">{sideA.name}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{sideA.domain}</p>
            </div>
          </div>

          {/* Position */}
          <div className="rounded-lg p-3" style={{ background: `${sideA.color}08`, borderLeft: `3px solid ${sideA.color}` }}>
            <p className="text-[12px] font-medium text-foreground">{sideA.position}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{sideA.reasoning}</p>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sideA.confidence}%` }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: sideA.color }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: sideA.color }}>{sideA.confidence}%</span>
          </div>

          {/* Evidence */}
          <div className="space-y-1">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Evidence</p>
            {sideA.evidence.map((e, i) => (
              <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" style={{ color: sideA.color }} />{e}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Side B */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${sideB.color}22` }}>
              <Brain className="h-4 w-4" style={{ color: sideB.color }} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-foreground">{sideB.name}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{sideB.domain}</p>
            </div>
          </div>

          <div className="rounded-lg p-3" style={{ background: `${sideB.color}08`, borderLeft: `3px solid ${sideB.color}` }}>
            <p className="text-[12px] font-medium text-foreground">{sideB.position}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{sideB.reasoning}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sideB.confidence}%` }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="h-full rounded-full"
                style={{ background: sideB.color }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: sideB.color }}>{sideB.confidence}%</span>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Evidence</p>
            {sideB.evidence.map((e, i) => (
              <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" style={{ color: sideB.color }} />{e}
              </p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Resolution */}
      {resolution && (
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resolution</p>
              <p className="text-[11px] text-foreground mt-0.5">{resolution}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
