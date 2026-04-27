// SITA OS — CRM Proof Trail Component
// Immutable audit trail + data provenance for CRM entities.
// Phase 7.2: now reads canonical receipts from `ai_action_receipts`
// via `useCRMEntityProofTrail`. Demo mode falls back to the bundled
// fixture trail so the surface remains alive in the showcase.
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Shield, FileCheck2, CheckCircle, AlertTriangle,
  Hash, Link2, User, Sparkles, Lock, ChevronDown, ChevronRight,
  Fingerprint, BookOpen, ArrowRight, History, Scale
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useCRMEntityProofTrail, type CRMProofEntityType } from "@/hooks/use-crm-proof-trail";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import type { ProofEntry, ProofActionKind } from "@/lib/trust";

// ── Types ──

interface ProofSummary {
  totalEntries: number;
  dataAge: string;
  lastModified: string;
  provenanceScore: number; // 0-100 — how well-documented is the data origin
  automatedChanges: number;
  manualChanges: number;
  advisorActions: number;
  verifiedFields: number;
  totalFields: number;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  created: { label: "Created", icon: <CheckCircle className="h-3 w-3" />, className: "bg-green-500/15 text-green-400 border-green-500/25" },
  updated: { label: "Updated", icon: <History className="h-3 w-3" />, className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  imported: { label: "Imported", icon: <FileCheck2 className="h-3 w-3" />, className: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  merged: { label: "Merged", icon: <Link2 className="h-3 w-3" />, className: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  escalated: { label: "Escalated", icon: <Shield className="h-3 w-3" />, className: "bg-red-500/15 text-red-400 border-red-500/25" },
  automated: { label: "Automated", icon: <Sparkles className="h-3 w-3" />, className: "bg-primary/15 text-primary border-primary/25" },
  verified: { label: "Verified", icon: <Fingerprint className="h-3 w-3" />, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  linked: { label: "Linked", icon: <Link2 className="h-3 w-3" />, className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
  deleted: { label: "Deleted", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-red-500/15 text-red-400 border-red-500/25" },
  approved: { label: "Approved", icon: <CheckCircle className="h-3 w-3" />, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  rejected: { label: "Rejected", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-red-500/15 text-red-400 border-red-500/25" },
  executed: { label: "Executed", icon: <CheckCircle className="h-3 w-3" />, className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  rolled_back: { label: "Rolled back", icon: <History className="h-3 w-3" />, className: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  failed: { label: "Failed", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-red-500/15 text-red-400 border-red-500/25" },
};

const ACTOR_ICONS: Record<string, React.ReactNode> = {
  user: <User className="h-3 w-3" />,
  system: <Lock className="h-3 w-3" />,
  advisor: <Sparkles className="h-3 w-3" />,
  automation: <Sparkles className="h-3 w-3" />,
};

// ── Demo fallback (only used when realityMode === "demo") ──

function generateDemoTrail(entityName: string): ProofEntry[] {
  const entries: ProofEntry[] = [
    { id: "p1", timestamp: "2025-06-15T10:30:00Z", action: "created" as const, actor: { type: "user" as const, name: "You" }, source: "manual_entry", receipt_hash: "0xa3f2...d819" },
    { id: "p2", timestamp: "2025-06-15T10:31:00Z", action: "verified" as const, actor: { type: "system" as const, name: "Import Validator" }, field: "email", source: "email_verification", confidence: 98, receipt_hash: "0xb7e1...4f22" },
    { id: "p3", timestamp: "2025-09-01T14:00:00Z", action: "updated" as const, actor: { type: "user" as const, name: "You" }, field: "lifecycle_stage", oldValue: "lead", newValue: "qualified", source: "manual_update" },
    { id: "p4", timestamp: "2025-11-10T09:15:00Z", action: "linked" as const, actor: { type: "system" as const, name: "CRM Engine" }, field: "company", newValue: "Meridian Ventures", source: "auto_link", confidence: 92 },
    { id: "p5", timestamp: "2026-01-20T16:45:00Z", action: "automated" as const, actor: { type: "automation" as const, name: "Follow-Up Workflow" }, field: "next_follow_up_at", newValue: "2026-01-27", source: "crm_automation_1", receipt_hash: "0xc4d3...a891" },
    { id: "p6", timestamp: "2026-02-15T11:00:00Z", action: "updated" as const, actor: { type: "advisor" as const, name: "Relationship Advisor" }, field: "health_score", oldValue: "72", newValue: "85", source: "advisor_assessment", confidence: 88 },
    { id: "p7", timestamp: "2026-03-28T08:30:00Z", action: "imported" as const, actor: { type: "system" as const, name: "CSV Import" }, source: "import_job_42", metadata: { file: "contacts_march.csv", row: 15 }, receipt_hash: "0xd5e4...b912" },
    { id: "p8", timestamp: "2026-04-10T13:00:00Z", action: "escalated" as const, actor: { type: "user" as const, name: "You" }, source: "boardroom_escalation", metadata: { severity: "high", boardroom_item_id: "bi_123" }, receipt_hash: "0xe6f5...c023" },
  ];
  return entries.reverse();
}

function computeProvenanceSummary(entries: ProofEntry[]): ProofSummary {
  const automated = entries.filter(e => e.actor.type === "automation" || e.actor.type === "system").length;
  const manual = entries.filter(e => e.actor.type === "user").length;
  const advisor = entries.filter(e => e.actor.type === "advisor").length;
  const verified = entries.filter(e => e.action === "verified").length;
  const withReceipts = entries.filter(e => e.receipt_hash).length;
  const provenanceScore = Math.min(100, Math.round((withReceipts / Math.max(entries.length, 1)) * 60 + (verified / Math.max(entries.length, 1)) * 40));

  return {
    totalEntries: entries.length,
    dataAge: entries.length > 0 ? formatDistanceToNow(new Date(entries[entries.length - 1].timestamp)) : "N/A",
    lastModified: entries.length > 0 ? formatDistanceToNow(new Date(entries[0].timestamp), { addSuffix: true }) : "N/A",
    provenanceScore,
    automatedChanges: automated,
    manualChanges: manual,
    advisorActions: advisor,
    verifiedFields: verified,
    totalFields: 12, // typical CRM field count
  };
}

// ── Component ──

interface CRMProofTrailProps {
  entityType: "contact" | "company" | "deal";
  entityId: string;
  entityName: string;
}

export function CRMProofTrail({ entityType, entityId, entityName }: CRMProofTrailProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterAction, setFilterAction] = useState<string | null>(null);

  const { isDemo } = useRealityModeSafe();
  const { data: realEntries, isLoading } = useCRMEntityProofTrail(
    entityType as CRMProofEntityType,
    entityId,
    { enabled: !isDemo },
  );

  const entries = useMemo<ProofEntry[]>(() => {
    if (isDemo) return generateDemoTrail(entityName);
    return realEntries ?? [];
  }, [isDemo, realEntries, entityName]);
  const summary = useMemo(() => computeProvenanceSummary(entries), [entries]);

  const filtered = filterAction ? entries.filter(e => e.action === filterAction) : entries;
  const actionCounts = useMemo(() => {
    const counts: Partial<Record<ProofActionKind, number>> = {};
    entries.forEach(e => { counts[e.action] = (counts[e.action] || 0) + 1; });
    return counts as Record<string, number>;
  }, [entries]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const showEmpty = !isDemo && !isLoading && entries.length === 0;

  return (
    <div className="space-y-4">
      {/* Provenance Score */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-primary" /> Data Provenance
            {!isDemo && (
              <span className="ml-2 text-[9px] uppercase tracking-wider text-muted-foreground/70 border border-border/40 rounded px-1.5 py-0.5">Live receipts</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className={`text-lg font-bold ${summary.provenanceScore >= 70 ? "text-green-400" : summary.provenanceScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {summary.provenanceScore}%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Provenance</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">{summary.totalEntries}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trail Events</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">{summary.verifiedFields}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verified</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">{summary.dataAge}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Data Age</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {summary.manualChanges} manual</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {summary.automatedChanges} automated</span>
            <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> {summary.advisorActions} advisor</span>
          </div>
        </CardContent>
      </Card>

      {/* Loading / empty states (real mode only) */}
      {!isDemo && isLoading && (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            Loading proof trail…
          </CardContent>
        </Card>
      )}
      {showEmpty && (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">No receipts yet.</p>
            <p>Mutations on this {entityType} will appear here as they happen.</p>
          </CardContent>
        </Card>
      )}

      {/* Filter chips */}
      {entries.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilterAction(null)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
            !filterAction ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border/50"
          }`}
        >All ({entries.length})</button>
        {Object.entries(actionCounts).map(([action, count]) => {
          const cfg = ACTION_CONFIG[action];
          if (!cfg) return null;
          return (
            <button
              key={action}
              onClick={() => setFilterAction(filterAction === action ? null : action)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all flex items-center gap-1 ${
                filterAction === action ? cfg.className : "bg-muted/30 text-muted-foreground border-border/50"
              }`}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>
      )}

      {/* Trail entries */}
      {entries.length > 0 && (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {filtered.map(entry => {
              const cfg = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.updated;
              const isExpanded = expanded.has(entry.id);
              return (
                <div key={entry.id} className="hover:bg-muted/10 transition-colors">
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left"
                  >
                    {/* Timeline dot */}
                    <div className="mt-1 flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cfg.className}`}>
                        {cfg.icon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.className}`}>{cfg.label}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {ACTOR_ICONS[entry.actor.type]}
                          <span className="font-medium text-foreground">{entry.actor.name}</span>
                        </span>
                        {entry.field && (
                          <span className="text-[10px] text-muted-foreground/60 font-mono">{entry.field}</span>
                        )}
                      </div>

                      {entry.field && (entry.oldValue || entry.newValue) && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          {entry.oldValue && <span className="line-through text-red-400/60">{entry.oldValue}</span>}
                          {entry.oldValue && entry.newValue && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                          {entry.newValue && <span className="text-green-400">{entry.newValue}</span>}
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        {entry.source && <> · <span className="font-mono">{entry.source}</span></>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {entry.receipt_hash && (
                        <span className="text-[9px] font-mono text-primary/60 flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5" />{entry.receipt_hash.slice(0, 8)}…
                        </span>
                      )}
                      {entry.confidence != null && (
                        <span className={`text-[10px] font-medium ${entry.confidence >= 90 ? "text-green-400" : entry.confidence >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                          {entry.confidence}%
                        </span>
                      )}
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 pl-[3.25rem]">
                      <div className="rounded-lg bg-muted/20 border border-border/30 p-3 space-y-1.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div><span className="text-muted-foreground">Actor Type:</span> <span className="text-foreground capitalize">{entry.actor.type}</span></div>
                          <div><span className="text-muted-foreground">Source:</span> <span className="text-foreground font-mono">{entry.source}</span></div>
                          {entry.receipt_hash && (
                            <div className="col-span-2"><span className="text-muted-foreground">Receipt:</span> <span className="text-primary font-mono">{entry.receipt_hash}</span></div>
                          )}
                          {entry.confidence != null && (
                            <div><span className="text-muted-foreground">Confidence:</span> <span className="text-foreground">{entry.confidence}%</span></div>
                          )}
                        </div>
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <>
                            <Separator className="bg-border/20" />
                            <div className="space-y-1">
                              {Object.entries(entry.metadata).map(([k, v]) => (
                                <div key={k} className="text-xs"><span className="text-muted-foreground">{k}:</span> <span className="text-foreground font-mono">{String(v)}</span></div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
