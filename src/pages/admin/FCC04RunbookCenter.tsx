// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Center (FCC04) — Phase 28.A
// Reads from canonical RUNBOOK_REGISTRY (19 real runbooks) and
// renders live drill status from runbook_drill_results.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, Play, Search, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, Wrench, Activity, Shield, FileText, Zap,
} from "lucide-react";
import {
  RUNBOOK_REGISTRY,
  type RunbookEntry,
  getDrillSummaries,
  triggerRunbookDrill,
  type DrillSummary,
} from "@/lib/support";

const SEVERITY_BADGES: Record<string, string> = {
  low: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
  medium: "bg-sita-gold/10 text-sita-gold border-sita-gold/20",
  high: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_BADGES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-white/10",
  reviewed: "bg-primary/10 text-primary border-primary/20",
  approved: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
  tested: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
};

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

export default function FCC04RunbookCenter() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(RUNBOOK_REGISTRY[0]?.runbookId ?? null);
  const [drills, setDrills] = useState<Record<string, DrillSummary>>({});
  const [drillingId, setDrillingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "critical" | "untested">("all");

  useEffect(() => {
    let alive = true;
    getDrillSummaries().then((d) => { if (alive) setDrills(d); }).catch(() => {});
    return () => { alive = false; };
  }, [drillingId]);

  const filtered = useMemo(() => {
    let list: readonly RunbookEntry[] = RUNBOOK_REGISTRY;
    if (tab === "critical") list = list.filter((r) => r.severity === "critical" || r.severity === "high");
    if (tab === "untested") list = list.filter((r) => !drills[r.runbookId]?.lastDrillAt);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.runbookId.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.subsystem.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, tab, drills]);

  const selected = useMemo(() => RUNBOOK_REGISTRY.find((r) => r.runbookId === selectedId) ?? null, [selectedId]);

  async function handleDrill(rb: RunbookEntry) {
    setDrillingId(rb.runbookId);
    const result = await triggerRunbookDrill(rb.runbookId, { mode: "dry-run", triggeredBy: "manual" });
    setDrillingId(null);
    if (result.ok) {
      toast({ title: "Drill complete", description: `${rb.runbookId} dry-run ${result.result?.passed ? "passed ✅" : "found issues"}` });
    } else {
      toast({ title: "Drill failed", description: result.error ?? "Unknown error", variant: "destructive" });
    }
  }

  const totalCount = RUNBOOK_REGISTRY.length;
  const drilledCount = Object.values(drills).filter((d) => d.lastDrillAt).length;
  const criticalCount = RUNBOOK_REGISTRY.filter((r) => r.severity === "critical" || r.severity === "high").length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={BookOpen}
        title="Runbook Center"
        subtitle={`${totalCount} canonical runbooks · ${drilledCount} drilled · ${criticalCount} critical/high severity`}
        accent="trust"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Total runbooks</p>
            <p className="text-xl font-semibold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Drilled (any time)</p>
            <p className="text-xl font-semibold text-trust-safe">{drilledCount}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Critical / high</p>
            <p className="text-xl font-semibold text-destructive">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Drills (30d)</p>
            <p className="text-xl font-semibold">{Object.values(drills).reduce((s, d) => s + d.drillsLast30Days, 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, title, subsystem…"
          className="pl-10 bg-white/[0.03] border-white/10"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All ({RUNBOOK_REGISTRY.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical & High</TabsTrigger>
          <TabsTrigger value="untested">Untested</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map((rb, i) => {
                const drill = drills[rb.runbookId];
                const isSelected = selectedId === rb.runbookId;
                return (
                  <motion.div key={rb.runbookId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                    <Card
                      onClick={() => setSelectedId(rb.runbookId)}
                      className={`cursor-pointer transition-all ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 p-1.5 rounded bg-white/[0.05] text-primary">
                            <BookOpen className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-muted-foreground">{rb.runbookId}</span>
                              <Badge variant="outline" className={`text-[9px] ${SEVERITY_BADGES[rb.severity] ?? ""}`}>{rb.severity}</Badge>
                            </div>
                            <p className="text-xs font-medium line-clamp-1 mt-1">{rb.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {rb.subsystem} · last drill: {formatRelative(drill?.lastDrillAt ?? rb.lastTestedAt)}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-1 shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">No runbooks match.</CardContent>
                </Card>
              )}
            </div>

            <div className="xl:col-span-2">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div key={selected.runbookId} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <Card className="border-white/10 bg-white/[0.02]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">{selected.runbookId}</span>
                              <Badge variant="outline" className={`text-[10px] ${SEVERITY_BADGES[selected.severity]}`}>{selected.severity}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${STATUS_BADGES[selected.status]}`}>{selected.status}</Badge>
                              {selected.killSwitchRef && (
                                <Badge variant="outline" className="text-[10px] text-sita-gold border-sita-gold/20">
                                  <Shield className="h-2.5 w-2.5 mr-1" />{selected.killSwitchRef}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base mt-1.5">{selected.title}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
                          </div>
                          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => handleDrill(selected)} disabled={drillingId === selected.runbookId}>
                            <Play className="h-3.5 w-3.5" />
                            {drillingId === selected.runbookId ? "Drilling…" : "Run Drill"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-muted-foreground">Subsystem</p>
                            <p className="font-medium">{selected.subsystem}</p>
                          </div>
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-muted-foreground">Bounded context</p>
                            <p className="font-medium">{selected.boundedContextId}</p>
                          </div>
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-muted-foreground">Owner</p>
                            <p className="font-medium">{selected.owner}</p>
                          </div>
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-muted-foreground">Escalation</p>
                            <p className="font-medium">{selected.escalationTarget}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" /> Trigger condition
                          </p>
                          <div className="text-xs p-2 rounded bg-white/[0.02] border border-white/5 font-mono text-muted-foreground">
                            {selected.triggerCondition}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Wrench className="h-3.5 w-3.5" /> Recovery steps ({selected.steps.length})
                          </p>
                          <div className="space-y-1">
                            {selected.steps.map((step) => (
                              <div key={step.order} className="flex items-start gap-3 text-xs p-2.5 rounded bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] text-muted-foreground w-5 mt-0.5">{step.order}.</span>
                                <div className="flex-1 min-w-0">
                                  <p>{step.action}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">→ {step.expectedOutcome}</p>
                                  {step.rollbackAction && <p className="text-[10px] text-sita-gold/80 mt-0.5">↩ rollback: {step.rollbackAction}</p>}
                                </div>
                                <Badge variant="outline" className="text-[9px] shrink-0">{Math.round(step.timeoutMs / 1000)}s</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selected.affectedServices.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5" /> Affected services
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.affectedServices.map((s) => (
                                <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {(() => {
                          const d = drills[selected.runbookId];
                          if (!d) return null;
                          return (
                            <div className={`p-3 rounded-lg border ${d.lastDrillPassed ? "bg-trust-safe/5 border-trust-safe/10" : "bg-destructive/5 border-destructive/10"}`}>
                              <div className="flex items-center gap-2 text-xs">
                                {d.lastDrillPassed ? <CheckCircle2 className="h-3.5 w-3.5 text-trust-safe" /> : <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                                <span className="font-medium">Last drill: {d.lastDrillPassed ? "passed" : "found issues"}</span>
                                <span className="text-muted-foreground ml-auto">{formatRelative(d.lastDrillAt)} · {d.drillsLast30Days} in last 30d</span>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span className="font-mono">{selected.markdownRef}</span>
                          <span className="ml-auto">Est. resolution: {Math.round(selected.estimatedResolutionMs / 60_000)}m</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card className="border-white/10 bg-white/[0.02]">
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-40" />
                      <p>Select a runbook to view details.</p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
