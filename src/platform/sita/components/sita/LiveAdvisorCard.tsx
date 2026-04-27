import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { TrustBadge, TrustLevel } from "@/platform/sita/components/sita/TrustBadge";
import { useBrainCore, useDemoMode } from "@/platform/personal-brain/hooks/use-brain-core";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, RefreshCw, AlertTriangle, CheckCircle, Cpu, Zap } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

interface LiveAdvisorCardProps {
  advisor: "money" | "business" | "concierge" | "general";
  intent: string;
  context?: Record<string, unknown>;
  // Demo fallback props
  demoName: string;
  demoRole: string;
  demoConfidence: string;
  demoRecommendation: string;
  demoReasoning: string;
}

/**
 * LiveAdvisorCard replaces the hardcoded AdvisorCard.
 * In Demo Mode: shows hardcoded content.
 * In Live Mode: calls Brain Core on mount and displays real intelligence.
 */
export const LiveAdvisorCard = ({
  advisor,
  intent,
  context,
  demoName,
  demoRole,
  demoConfidence,
  demoRecommendation,
  demoReasoning,
}: LiveAdvisorCardProps) => {
  const { isDemoMode } = useDemoMode();
  const { ask, isLoading, lastResponse, error } = useBrainCore({ advisor });
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    if (!isDemoMode && !hasAsked && !isLoading) {
      setHasAsked(true);
      ask(intent, context);
    }
  }, [isDemoMode, hasAsked, isLoading, intent, context, ask]);

  // Reset when switching modes
  useEffect(() => {
    setHasAsked(false);
  }, [isDemoMode]);

  const handleRefresh = () => {
    setHasAsked(false);
  };

  // Demo mode: render the classic hardcoded card
  if (isDemoMode) {
    return (
      <SitaCard hover={false} glow className="p-5 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground border border-border">
            <Zap className="h-2.5 w-2.5" /> DEMO
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-primary/8 p-1.5"><Brain className="h-4 w-4 text-primary" /></div>
          <div>
            <SitaCardTitle>{demoName}</SitaCardTitle>
            <p className="text-[10px] text-muted-foreground">{demoRole}</p>
          </div>
        </div>
        <div className="mb-3">
          <TrustBadge level={demoConfidence === "High" ? "verified" : demoConfidence === "Medium" ? "review" : "degraded"} label={`Confidence: ${demoConfidence}`} size="sm" />
        </div>
        <p className="text-xs text-foreground leading-relaxed">{demoRecommendation}</p>
        <p className="mt-2 text-[10px] text-muted-foreground italic">{demoReasoning}</p>
      </SitaCard>
    );
  }

  // Live mode
  const confidenceLevel: TrustLevel = lastResponse
    ? lastResponse.confidence >= 0.8 ? "verified" : lastResponse.confidence >= 0.5 ? "review" : "degraded"
    : "review";

  const SourceIcon = lastResponse?.source === "rules" ? CheckCircle : lastResponse?.source === "ai" ? Sparkles : Cpu;
  const sourceLabel = lastResponse?.source === "rules" ? "Rules Engine" : lastResponse?.source === "ai" ? "AI Intelligence" : "Processing";

  return (
    <SitaCard hover={false} glow className="p-5 relative overflow-hidden">
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary border border-primary/20">
          <Sparkles className="h-2.5 w-2.5" /> LIVE
        </span>
        <button onClick={handleRefresh} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Refresh">
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-lg bg-primary/8 p-1.5"><Brain className="h-4 w-4 text-primary" /></div>
        <div>
          <SitaCardTitle>{demoName}</SitaCardTitle>
          <p className="text-[10px] text-muted-foreground">{demoRole}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 py-2">
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            <p className="text-[10px] text-muted-foreground mt-2">Brain Core processing...</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 text-urgency-high mb-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Error</span>
            </div>
            <p className="text-xs text-muted-foreground">{error}</p>
          </motion.div>
        ) : lastResponse ? (
          <motion.div key="response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <TrustBadge level={confidenceLevel} label={`${Math.round(lastResponse.confidence * 100)}% confidence`} size="sm" />
              <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                via <SourceIcon className="h-2.5 w-2.5" /> {sourceLabel}
              </span>
            </div>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{lastResponse.recommendation}</p>
            {lastResponse.reasoning && (
              <p className="mt-2 text-[10px] text-muted-foreground italic">{lastResponse.reasoning}</p>
            )}
            {lastResponse.actions && lastResponse.actions.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Suggested Actions</p>
                {lastResponse.actions.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <div className="h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{a.description || a.type}</span>
                  </div>
                ))}
              </div>
            )}
            {lastResponse.requiresApproval && (
              <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-2 text-xs text-accent">
                ⚡ This recommendation requires your approval before execution.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-muted-foreground">No intelligence data yet. Click refresh to ask the advisor.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </SitaCard>
  );
};
