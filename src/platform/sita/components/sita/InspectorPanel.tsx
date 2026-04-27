// ═══════════════════════════════════════════════════════════════
// SITA OS — Contextual Inspector Panel
// macOS-quality slide-in showing entity details, proof chain,
// advisor reasoning, and linked workflows
// ═══════════════════════════════════════════════════════════════

import { useInspector } from "@/contexts/InspectorContext";
import { useSharedTrust, useKernelStatus } from "@/platform/sita/contexts/SitaKernelContext";
import { useProofTimeline } from "@/hooks/use-proof-timeline";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Brain, GitBranch, Link2, Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrustBadge } from "./TrustBadge";
import type { TrustLevel } from "./TrustBadge";

const domainColor: Record<string, string> = {
  business: "bg-primary/10 text-primary",
  finance: "bg-accent/10 text-accent",
  concierge: "bg-trust-safe/10 text-trust-safe",
  system: "bg-muted text-muted-foreground",
};

const proofIcon = (result: string) => {
  if (result === "confirmed") return <CheckCircle className="h-3.5 w-3.5 text-trust-safe" />;
  if (result === "partial") return <AlertTriangle className="h-3.5 w-3.5 text-accent" />;
  if (result === "disputed") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
};

export const InspectorPanel = () => {
  const { entity, isOpen, close } = useInspector();
  const { trustState } = useSharedTrust(entity?.id);
  const { receipts: kernelReceipts, chainValid } = useProofTimeline({ limit: 5 });
  const kernelStatus = useKernelStatus();

  return (
    <AnimatePresence>
      {isOpen && entity && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] border-l border-border bg-card shadow-2xl"
          >
            <ScrollArea className="h-full">
              <div className="p-5 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", domainColor[entity.domain])}>
                        {entity.domain}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{entity.type}</span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground leading-tight">{entity.title}</h2>
                    {entity.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{entity.subtitle}</p>}
                  </div>
                  <button onClick={close} className="rounded-lg p-1.5 hover:bg-secondary transition-colors shrink-0">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Status + Trust */}
                {(entity.status || entity.trustLevel) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {entity.status && (
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-foreground">{entity.status}</span>
                    )}
                    {entity.trustLevel && (
                      <TrustBadge level={entity.trustLevel as TrustLevel} label={entity.trustLevel} size="sm" />
                    )}
                  </div>
                )}

                {/* Details */}
                <Section icon={<ChevronRight className="h-3.5 w-3.5" />} title="Details">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(entity.details).filter(([, v]) => v !== null).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm text-foreground font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Proof Chain */}
                {entity.proofChain && entity.proofChain.length > 0 && (
                  <Section icon={<Shield className="h-3.5 w-3.5 text-trust-safe" />} title="Proof Chain">
                    <div className="space-y-2">
                      {entity.proofChain.map((item) => (
                        <div key={item.id} className="flex items-start gap-2.5 rounded-lg bg-secondary/50 px-3 py-2">
                          {proofIcon(item.result)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{item.action}</p>
                            <p className="text-[10px] text-muted-foreground">{item.timestamp}</p>
                            {item.hash && <p className="text-[10px] font-mono text-muted-foreground/60 truncate">#{item.hash.slice(0, 12)}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Advisor Reasoning */}
                {entity.advisorReasoning && entity.advisorReasoning.length > 0 && (
                  <Section icon={<Brain className="h-3.5 w-3.5 text-primary" />} title="Advisor Reasoning">
                    <div className="space-y-3">
                      {entity.advisorReasoning.map((ar, i) => (
                        <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">{ar.advisor}</p>
                            <span className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                              ar.confidence >= 0.8 ? "bg-trust-safe/10 text-trust-safe" :
                              ar.confidence >= 0.5 ? "bg-accent/10 text-accent" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {Math.round(ar.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{ar.recommendation}</p>
                          <p className="text-xs text-muted-foreground italic">{ar.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Linked Workflows */}
                {entity.linkedWorkflows && entity.linkedWorkflows.length > 0 && (
                  <Section icon={<GitBranch className="h-3.5 w-3.5 text-primary" />} title="Linked Workflows">
                    <div className="space-y-2">
                      {entity.linkedWorkflows.map((wf) => (
                        <div key={wf.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                          <div>
                            <p className="text-xs font-medium text-foreground">{wf.name}</p>
                            <p className="text-[10px] text-muted-foreground">Step: {wf.step}</p>
                          </div>
                          <span className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
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
                  </Section>
                )}

                {/* Linked Entities */}
                {entity.linkedEntities && entity.linkedEntities.length > 0 && (
                  <Section icon={<Link2 className="h-3.5 w-3.5 text-accent" />} title="Linked Entities">
                    <div className="space-y-1.5">
                      {entity.linkedEntities.map((le) => (
                        <div key={le.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                          <div>
                            <p className="text-xs font-medium text-foreground">{le.title}</p>
                            <p className="text-[10px] text-muted-foreground">{le.relationship}</p>
                          </div>
                          <span className="text-[10px] uppercase text-muted-foreground tracking-wider">{le.type}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Timeline */}
                {entity.timeline && entity.timeline.length > 0 && (
                  <Section icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />} title="Activity Timeline">
                    <div className="space-y-2">
                      {entity.timeline.map((t, i) => (
                        <div key={i} className="flex gap-2.5">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-border mt-1.5" />
                            {i < entity.timeline!.length - 1 && <div className="flex-1 w-px bg-border" />}
                          </div>
                          <div className="pb-3">
                            <p className="text-xs font-medium text-foreground">{t.action}</p>
                            <p className="text-[10px] text-muted-foreground">{t.actor} · {t.timestamp}</p>
                            {t.detail && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{t.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Kernel Trust & Proof Status */}
                <Section icon={<Activity className="h-3.5 w-3.5 text-primary" />} title="Kernel Status">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-xs text-muted-foreground">Trust Score</span>
                      <span className="text-xs font-semibold text-foreground">{trustState?.score ?? "—"}/100</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-xs text-muted-foreground">Chain Integrity</span>
                      <span className={cn("text-xs font-semibold", chainValid ? "text-trust-safe" : "text-destructive")}>{chainValid ? "Valid" : "Broken"}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-xs text-muted-foreground">Receipt Chain</span>
                      <span className="text-xs font-semibold text-foreground">{kernelReceipts.length} receipts</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-xs text-muted-foreground">Events Processed</span>
                      <span className="text-xs font-semibold text-foreground">{kernelStatus.totalEvents}</span>
                    </div>
                  </div>
                </Section>
              </div>
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
    </div>
    {children}
  </div>
);
