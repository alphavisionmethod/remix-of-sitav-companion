// ═══════════════════════════════════════════════════════════════
// SITA OS — Contextual Rail (Persistent Right Panel)
// Entity details, proof chain, advisor notes — always visible
// ═══════════════════════════════════════════════════════════════

import { useInspector } from "@/contexts/InspectorContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Brain, GitBranch, Link2, Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrustBadge } from "./TrustBadge";
import type { TrustLevel } from "./TrustBadge";
import { ConfidenceBar } from "./primitives/ConfidenceBar";

const domainAccent: Record<string, string> = {
  business: "border-l-[hsl(var(--domain-business))]",
  finance: "border-l-[hsl(var(--domain-money))]",
  concierge: "border-l-[hsl(var(--domain-concierge))]",
  system: "border-l-border",
};

const domainBadge: Record<string, string> = {
  business: "bg-primary/10 text-primary",
  finance: "bg-trust-safe/10 text-trust-safe",
  concierge: "bg-accent/10 text-accent",
  system: "bg-muted text-muted-foreground",
};

const proofIcon = (result: string) => {
  if (result === "confirmed") return <CheckCircle className="h-3 w-3 text-trust-safe" />;
  if (result === "partial") return <AlertTriangle className="h-3 w-3 text-accent" />;
  if (result === "disputed") return <XCircle className="h-3 w-3 text-destructive" />;
  return <Clock className="h-3 w-3 text-muted-foreground" />;
};

export const ContextualRail = () => {
  const { entity, isOpen, close } = useInspector();

  return (
    <AnimatePresence>
      {isOpen && entity && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="hidden lg:flex flex-col h-full border-l border-border/50 glass-panel overflow-hidden shrink-0"
        >
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", domainBadge[entity.domain])}>
                      {entity.domain}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{entity.type}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground leading-tight">{entity.title}</h3>
                  {entity.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{entity.subtitle}</p>}
                </div>
                <button onClick={close} className="rounded-lg p-1 hover:bg-secondary transition-colors shrink-0" title="Close rail">
                  <PanelRightClose className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Status + Trust */}
              {(entity.status || entity.trustLevel) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entity.status && (
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground">{entity.status}</span>
                  )}
                  {entity.trustLevel && (
                    <TrustBadge level={entity.trustLevel as TrustLevel} label={entity.trustLevel} size="sm" />
                  )}
                </div>
              )}

              {/* Details grid */}
              <RailSection icon={<ChevronRight className="h-3 w-3" />} title="Details">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {Object.entries(entity.details).filter(([, v]) => v !== null).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{key.replace(/_/g, " ")}</p>
                      <p className="text-[11px] text-foreground font-medium truncate">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </RailSection>

              {/* Proof Chain */}
              {entity.proofChain && entity.proofChain.length > 0 && (
                <RailSection icon={<Shield className="h-3 w-3 text-trust-safe" />} title="Proof Chain">
                  <div className="space-y-1.5">
                    {entity.proofChain.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 rounded-lg bg-secondary/40 px-2.5 py-1.5">
                        {proofIcon(item.result)}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground">{item.action}</p>
                          <p className="text-[9px] text-muted-foreground">{item.timestamp}</p>
                          {item.hash && <p className="text-[9px] font-mono text-muted-foreground/60 truncate">#{item.hash.slice(0, 12)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </RailSection>
              )}

              {/* Advisor Reasoning */}
              {entity.advisorReasoning && entity.advisorReasoning.length > 0 && (
                <RailSection icon={<Brain className="h-3 w-3 text-primary" />} title="Advisor Notes">
                  <div className="space-y-2">
                    {entity.advisorReasoning.map((ar, i) => (
                      <div key={i} className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-foreground">{ar.advisor}</p>
                          <ConfidenceBar value={Math.round(ar.confidence * 100)} size="sm" />
                        </div>
                        <p className="text-[11px] text-foreground">{ar.recommendation}</p>
                        <p className="text-[10px] text-muted-foreground italic">{ar.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </RailSection>
              )}

              {/* Linked Workflows */}
              {entity.linkedWorkflows && entity.linkedWorkflows.length > 0 && (
                <RailSection icon={<GitBranch className="h-3 w-3 text-primary" />} title="Workflows">
                  <div className="space-y-1">
                    {entity.linkedWorkflows.map((wf) => (
                      <div key={wf.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5">
                        <div>
                          <p className="text-[11px] font-medium text-foreground">{wf.name}</p>
                          <p className="text-[9px] text-muted-foreground">Step: {wf.step}</p>
                        </div>
                        <span className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                          wf.status === "active" ? "bg-primary/10 text-primary" :
                          wf.status === "completed" ? "bg-trust-safe/10 text-trust-safe" :
                          wf.status === "failed" ? "bg-destructive/10 text-destructive" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {wf.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </RailSection>
              )}

              {/* Linked Entities */}
              {entity.linkedEntities && entity.linkedEntities.length > 0 && (
                <RailSection icon={<Link2 className="h-3 w-3 text-accent" />} title="Related">
                  <div className="space-y-1">
                    {entity.linkedEntities.map((le) => (
                      <div key={le.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5">
                        <div>
                          <p className="text-[11px] font-medium text-foreground">{le.title}</p>
                          <p className="text-[9px] text-muted-foreground">{le.relationship}</p>
                        </div>
                        <span className="text-[9px] uppercase text-muted-foreground tracking-wider">{le.type}</span>
                      </div>
                    ))}
                  </div>
                </RailSection>
              )}

              {/* Timeline */}
              {entity.timeline && entity.timeline.length > 0 && (
                <RailSection icon={<Clock className="h-3 w-3 text-muted-foreground" />} title="Timeline">
                  <div className="space-y-1.5">
                    {entity.timeline.map((t, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-border mt-1.5" />
                          {i < entity.timeline!.length - 1 && <div className="flex-1 w-px bg-border" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-[11px] font-medium text-foreground">{t.action}</p>
                          <p className="text-[9px] text-muted-foreground">{t.actor} · {t.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RailSection>
              )}
            </div>
          </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const RailSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5">
      {icon}
      <h4 className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h4>
    </div>
    {children}
  </div>
);
