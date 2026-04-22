import { motion } from "framer-motion";
import { X, MessageSquare, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdvisorPersona } from "@/domains/engines/business-advisor-personas";
import type { AIRecommendation } from "@/hooks/useBusinessAdvisorBoard";
import { AdvisorImage } from "@/components/advisors/AdvisorImage";

interface Props {
  advisor: AdvisorPersona;
  recommendation: AIRecommendation | undefined;
  onClose: () => void;
}

export function AdvisorDetailSheet({ advisor, recommendation, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 bottom-0 w-[400px] z-50 bg-background border-l border-[hsl(0_0%_100%/0.08)] shadow-2xl overflow-y-auto"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <AdvisorImage
              domain={(advisor as any).domain ?? "business"}
              src={advisor.portraitUrl}
              size="lg"
              className="border-2 rounded-full"
              style={{ borderColor: `hsl(${advisor.colorAccent})` }}
            />
            <div>
              <h3 className="text-sm font-display font-bold text-foreground">{advisor.displayName}</h3>
              <p className="text-[10px] text-muted-foreground">{advisor.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Greeting */}
        <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-3 w-3" style={{ color: `hsl(${advisor.colorAccent})` }} />
            <span className="text-[9px] text-muted-foreground">Current Stance</span>
          </div>
          <p className="text-xs text-foreground italic">"{advisor.greeting}"</p>
        </div>

        {/* Personality */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personality</h4>
          <div className="flex flex-wrap gap-1">
            {advisor.personalityTraits.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[9px] bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.06)] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Communication Style */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Communication Style</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Tone", value: advisor.communicationStyle.tone },
              { label: "Verbosity", value: advisor.communicationStyle.verbosity },
              { label: "Formality", value: advisor.communicationStyle.formality },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
                <p className="text-[8px] text-muted-foreground">{s.label}</p>
                <p className="text-[10px] font-semibold capitalize" style={{ color: `hsl(${advisor.colorAccent})` }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Scope */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Domain Scope</h4>
          <div className="flex flex-wrap gap-1">
            {advisor.domainScope.map(d => (
              <span key={d} className="px-2 py-0.5 rounded-full text-[9px] border border-[hsl(265_55%_58%/0.2)] text-[hsl(265_55%_70%)] bg-[hsl(265_55%_58%/0.05)]">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Decision & Risk */}
        <div className="mb-4 flex gap-2">
          <div className="flex-1 rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2 text-center">
            <Brain className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[8px] text-muted-foreground">Decision Style</p>
            <p className="text-[10px] font-semibold capitalize text-foreground">{advisor.decisionStyle}</p>
          </div>
          <div className="flex-1 rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2 text-center">
            <Shield className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[8px] text-muted-foreground">Risk Tolerance</p>
            <p className="text-[10px] font-semibold capitalize text-foreground">{advisor.riskTolerance}</p>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Latest Recommendation</h4>
            <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] p-3">
              <p className="text-xs font-semibold text-foreground mb-1">{recommendation.title}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{recommendation.summary}</p>
              <div className="space-y-1">
                {recommendation.suggestedActions.map((a, i) => (
                  <p key={i} className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[hsl(265_55%_58%)]" />
                    {a}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="mt-6 pt-4 border-t border-[hsl(0_0%_100%/0.06)]">
          <p className="text-[10px] italic text-muted-foreground text-center">"{advisor.signaturePhrase}"</p>
        </div>
      </div>
    </motion.div>
  );
}
