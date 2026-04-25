// ═══════════════════════════════════════════════════════════════
// SITA OS — Incident Response Timeline (FCC11)
// Severity classification, incident lifecycle, postmortem generation,
// maintenance mode, feature disable, user messaging
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Siren, Clock, AlertTriangle, CheckCircle2, XCircle, Activity, Users,
  Server, Zap, RotateCcw, FileText, MessageSquare, ToggleRight, ToggleLeft,
  ChevronRight, Shield, Target, Play, Pause, TrendingDown, Eye, Bell, BookOpen,
} from "lucide-react";
import { RUNBOOK_REGISTRY, resolveRunbooksForIncident } from "@/lib/support";

// ── Severity Definitions ──
type Severity = "P1" | "P2" | "P3" | "P4";

const SEVERITY_CONFIG: Record<Severity, { label: string; description: string; sla: string; color: string }> = {
  P1: { label: "Critical", description: "Complete service outage or data loss risk", sla: "Acknowledge: 5m, Mitigate: 1h", color: "text-destructive" },
  P2: { label: "Major", description: "Significant degradation affecting many users", sla: "Acknowledge: 15m, Mitigate: 4h", color: "text-destructive" },
  P3: { label: "Moderate", description: "Partial degradation with workaround available", sla: "Acknowledge: 1h, Mitigate: 24h", color: "text-sita-gold" },
  P4: { label: "Minor", description: "Cosmetic or low-impact issue", sla: "Acknowledge: 4h, Mitigate: 72h", color: "text-muted-foreground" },
};

// ── Incident Data ──
interface IncidentEvent {
  timestamp: string;
  type: "detected" | "acknowledged" | "investigating" | "identified" | "mitigating" | "resolved" | "postmortem" | "escalated" | "rollback" | "communication";
  description: string;
  actor: string;
}

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: "active" | "mitigating" | "resolved" | "postmortem";
  affectedServices: string[];
  affectedUsers: number;
  startedAt: string;
  resolvedAt: string | null;
  commander: string;
  timeline: IncidentEvent[];
  mitigations: string[];
  rootCause: string | null;
}

const INCIDENTS: Incident[] = [
  {
    id: "inc-001", title: "Sync Service Upload Timeout Spike", severity: "P2", status: "resolved",
    affectedServices: ["sync-service", "upload-worker", "storage-gateway"],
    affectedUsers: 2340, startedAt: "2026-04-14T14:22:00Z", resolvedAt: "2026-04-14T16:48:00Z",
    commander: "James L.",
    timeline: [
      { timestamp: "2026-04-14T14:22:00Z", type: "detected", description: "Alert: Upload timeout rate exceeded 5% threshold", actor: "Monitoring System" },
      { timestamp: "2026-04-14T14:25:00Z", type: "acknowledged", description: "Incident acknowledged by on-call engineer", actor: "James L." },
      { timestamp: "2026-04-14T14:30:00Z", type: "investigating", description: "Correlating with recent deployment (v2.14.2)", actor: "AI Ops Agent" },
      { timestamp: "2026-04-14T14:45:00Z", type: "identified", description: "Root cause: new upload finalization handler has 30s timeout vs 60s needed for large files", actor: "AI Dev Agent" },
      { timestamp: "2026-04-14T14:50:00Z", type: "communication", description: "Status page updated: Investigating file upload delays", actor: "James L." },
      { timestamp: "2026-04-14T15:00:00Z", type: "rollback", description: "Rolled back sync-service to v2.14.1", actor: "AI Ops Agent" },
      { timestamp: "2026-04-14T15:15:00Z", type: "mitigating", description: "Upload success rate recovering: 94% → 98.5%", actor: "Monitoring System" },
      { timestamp: "2026-04-14T16:48:00Z", type: "resolved", description: "All metrics back to baseline. Incident closed.", actor: "James L." },
      { timestamp: "2026-04-15T10:00:00Z", type: "postmortem", description: "Postmortem completed. Fix PR merged with updated timeout + integration test.", actor: "Sarah M." },
    ],
    mitigations: ["Rollback to v2.14.1", "Temporary upload size limit increase", "Enhanced monitoring thresholds"],
    rootCause: "Upload finalization handler had a 30s timeout that was insufficient for files >100MB on slower connections. Introduced in v2.14.2.",
  },
  {
    id: "inc-002", title: "Auth Service Latency Degradation", severity: "P3", status: "active",
    affectedServices: ["auth-service", "session-manager"],
    affectedUsers: 450, startedAt: "2026-04-15T11:30:00Z", resolvedAt: null,
    commander: "Maria R.",
    timeline: [
      { timestamp: "2026-04-15T11:30:00Z", type: "detected", description: "Alert: Auth response p99 latency > 2s (baseline: 200ms)", actor: "Monitoring System" },
      { timestamp: "2026-04-15T11:35:00Z", type: "acknowledged", description: "Investigating auth latency spike", actor: "Maria R." },
      { timestamp: "2026-04-15T11:45:00Z", type: "investigating", description: "Database connection pool saturation detected", actor: "AI Ops Agent" },
      { timestamp: "2026-04-15T12:00:00Z", type: "mitigating", description: "Increased connection pool from 20 to 50", actor: "AI Ops Agent" },
    ],
    mitigations: ["Connection pool increase", "Session cache warm-up"],
    rootCause: null,
  },
];

// ── Maintenance Controls ──
interface MaintenanceControl {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
  risk: "low" | "medium" | "high";
}

const MAINTENANCE_CONTROLS: MaintenanceControl[] = [
  { id: "mc1", label: "Maintenance Mode", description: "Show maintenance page to all non-admin users", enabled: false, icon: Pause, risk: "high" },
  { id: "mc2", label: "Read-Only Mode", description: "Allow reads but block all write operations", enabled: false, icon: Eye, risk: "medium" },
  { id: "mc3", label: "Disable Sync", description: "Temporarily halt all sync operations", enabled: false, icon: ToggleLeft, risk: "medium" },
  { id: "mc4", label: "Disable File Upload", description: "Block new file uploads while maintaining downloads", enabled: false, icon: ToggleLeft, risk: "low" },
  { id: "mc5", label: "Disable AI Features", description: "Turn off all AI-powered features platform-wide", enabled: false, icon: ToggleLeft, risk: "medium" },
  { id: "mc6", label: "Emergency Notification", description: "Push emergency notification to all active users", enabled: false, icon: Bell, risk: "low" },
];

// ── Message Templates ──
const MESSAGE_TEMPLATES = [
  { label: "Investigating Issue", template: "We are currently investigating an issue affecting [SERVICE]. Some users may experience [SYMPTOM]. We will provide updates as we learn more." },
  { label: "Issue Identified", template: "We have identified the cause of [SYMPTOM] and are implementing a fix. Expected resolution: [TIME]." },
  { label: "Issue Resolved", template: "The issue affecting [SERVICE] has been resolved. All systems are operating normally. We apologize for any inconvenience." },
  { label: "Planned Maintenance", template: "We will be performing scheduled maintenance on [DATE] from [START] to [END]. During this time, [SERVICE] may be temporarily unavailable." },
];

export default function FCC11IncidentResponseTimeline() {
  const [selectedIncident, setSelectedIncident] = useState<Incident>(INCIDENTS[0]);
  const [maintenanceControls, setMaintenanceControls] = useState(MAINTENANCE_CONTROLS);
  const [messageText, setMessageText] = useState("");

  function toggleMaintenance(id: string) {
    setMaintenanceControls(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  }

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Siren}
        title="Incident Response Center"
        subtitle="Severity classification, incident timeline, maintenance controls, and postmortem generation"
        accent="destructive"
      />

      {/* Severity Reference */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG[Severity]][]).map(([key, cfg], i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`h-3.5 w-3.5 ${cfg.color}`} />
                  <span className={`text-sm font-bold ${cfg.color}`}>{key}</span>
                  <span className="text-xs text-muted-foreground">— {cfg.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{cfg.sla}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/10">
          <TabsTrigger value="timeline">Incident Timeline</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Controls</TabsTrigger>
          <TabsTrigger value="messaging">User Messaging</TabsTrigger>
          <TabsTrigger value="postmortem">Postmortem</TabsTrigger>
        </TabsList>

        {/* Incident Timeline */}
        <TabsContent value="timeline">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              {INCIDENTS.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const sevCfg = SEVERITY_CONFIG[inc.severity];
                return (
                  <Card
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`cursor-pointer transition-all border ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full ${inc.status === "active" ? "bg-destructive animate-pulse" : inc.status === "mitigating" ? "bg-sita-gold" : "bg-trust-safe"}`} />
                        <Badge className={`text-[9px] ${sevCfg.color}`}>{inc.severity}</Badge>
                        <Badge variant="outline" className="text-[9px]">{inc.status}</Badge>
                      </div>
                      <p className="text-xs font-medium line-clamp-1">{inc.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{inc.affectedUsers.toLocaleString()} users</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{new Date(inc.startedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedIncident && (
                  <motion.div key={selectedIncident.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <Card className="border-white/10 bg-white/[0.02]">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${selectedIncident.status === "active" ? "bg-destructive animate-pulse" : selectedIncident.status === "mitigating" ? "bg-sita-gold" : "bg-trust-safe"}`} />
                          <CardTitle className="text-sm">{selectedIncident.title}</CardTitle>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className={`text-[9px] ${SEVERITY_CONFIG[selectedIncident.severity].color}`}>{selectedIncident.severity} — {SEVERITY_CONFIG[selectedIncident.severity].label}</Badge>
                          <Badge variant="outline" className="text-[9px]">Commander: {selectedIncident.commander}</Badge>
                          <Badge variant="outline" className="text-[9px]">{selectedIncident.affectedServices.length} services affected</Badge>
                          <Badge variant="outline" className="text-[9px]">{selectedIncident.affectedUsers.toLocaleString()} users</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Affected Services */}
                        <div className="flex flex-wrap gap-1.5">
                          {selectedIncident.affectedServices.map(s => (
                            <Badge key={s} variant="outline" className="text-[9px] font-mono">{s}</Badge>
                          ))}
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-6 space-y-0">
                          {selectedIncident.timeline.map((event, i) => {
                            const typeIcons: Record<string, React.ElementType> = {
                              detected: Siren, acknowledged: CheckCircle2, investigating: Eye,
                              identified: Target, mitigating: Zap, resolved: CheckCircle2,
                              postmortem: FileText, escalated: AlertTriangle, rollback: RotateCcw,
                              communication: MessageSquare,
                            };
                            const typeColors: Record<string, string> = {
                              detected: "text-destructive", acknowledged: "text-primary", investigating: "text-sita-gold",
                              identified: "text-primary", mitigating: "text-sita-gold", resolved: "text-trust-safe",
                              postmortem: "text-muted-foreground", escalated: "text-destructive", rollback: "text-sita-gold",
                              communication: "text-primary",
                            };
                            const Icon = typeIcons[event.type] || Clock;
                            const color = typeColors[event.type] || "text-muted-foreground";
                            return (
                              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                <div className="relative pb-4">
                                  {i < selectedIncident.timeline.length - 1 && (
                                    <div className="absolute left-[-18px] top-5 bottom-0 w-px bg-white/10" />
                                  )}
                                  <div className="absolute left-[-22px] top-0.5">
                                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                                  </div>
                                  <div className="pl-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[9px]">{event.type}</Badge>
                                      <span className="text-[10px] text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                      <span className="text-[10px] text-muted-foreground ml-auto">{event.actor}</span>
                                    </div>
                                    <p className="text-xs mt-1">{event.description}</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Root Cause */}
                        {selectedIncident.rootCause && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <p className="text-[10px] font-medium text-primary mb-1">Root Cause</p>
                            <p className="text-xs">{selectedIncident.rootCause}</p>
                          </div>
                        )}

                        {/* Mitigations */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Applied Mitigations</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedIncident.mitigations.map((m, i) => (
                              <Badge key={i} variant="outline" className="text-[9px]">{m}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Linked Runbooks (Phase 28.C) — auto-resolved from affectedServices */}
                        {(() => {
                          const linked = resolveRunbooksForIncident({
                            affectedServices: selectedIncident.affectedServices,
                            severity: selectedIncident.severity === "P1" || selectedIncident.severity === "P2" ? "high" : "medium",
                          });
                          const linkedEntries = linked.all
                            .map((id) => RUNBOOK_REGISTRY.find((r) => r.runbookId === id))
                            .filter((r): r is typeof RUNBOOK_REGISTRY[number] => Boolean(r));
                          if (linkedEntries.length === 0) return null;
                          return (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                                <p className="text-[10px] font-medium text-primary">Linked Recovery Runbooks ({linkedEntries.length})</p>
                              </div>
                              <div className="space-y-1.5">
                                {linkedEntries.map((rb) => (
                                  <Link
                                    key={rb.runbookId}
                                    to={`/admin/support?runbook=${rb.runbookId}`}
                                    className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-colors"
                                  >
                                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{rb.runbookId}</Badge>
                                    <span className="text-xs flex-1 min-w-0 truncate">{rb.title}</span>
                                    <Badge variant="outline" className="text-[9px] shrink-0">{rb.severity}</Badge>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>

        {/* Maintenance Controls */}
        <TabsContent value="maintenance" className="space-y-3">
          {maintenanceControls.map((ctrl, i) => {
            const Icon = ctrl.icon;
            const riskColors = { low: "text-muted-foreground", medium: "text-sita-gold", high: "text-destructive" };
            return (
              <motion.div key={ctrl.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`border-white/10 ${ctrl.enabled ? "bg-destructive/5 border-destructive/20" : "bg-white/[0.02]"}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Icon className={`h-5 w-5 shrink-0 ${ctrl.enabled ? "text-destructive" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ctrl.label}</p>
                      <p className="text-xs text-muted-foreground">{ctrl.description}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${riskColors[ctrl.risk]}`}>risk: {ctrl.risk}</Badge>
                    <Button
                      size="sm"
                      variant={ctrl.enabled ? "destructive" : "outline"}
                      className="gap-1.5"
                      onClick={() => toggleMaintenance(ctrl.id)}
                    >
                      {ctrl.enabled ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      {ctrl.enabled ? "Disable" : "Enable"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* User Messaging */}
        <TabsContent value="messaging">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Compose Status Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write your status update message..."
                  className="min-h-[120px] bg-white/[0.02] border-white/10 resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Publish Update</Button>
                  <Button size="sm" variant="outline" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Preview</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Message Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MESSAGE_TEMPLATES.map((tmpl, i) => (
                  <div
                    key={i}
                    onClick={() => setMessageText(tmpl.template)}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all"
                  >
                    <p className="text-xs font-medium mb-1">{tmpl.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{tmpl.template}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Postmortem */}
        <TabsContent value="postmortem">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Postmortem Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {INCIDENTS.filter(i => i.status === "resolved").map((inc) => (
                <div key={inc.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{inc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {inc.resolvedAt ? Math.round((new Date(inc.resolvedAt).getTime() - new Date(inc.startedAt).getTime()) / 60000) : "?"} minutes · {inc.affectedUsers.toLocaleString()} users affected
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-trust-safe">Resolved</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted-foreground mb-1">Root Cause</p>
                      <p className="text-xs">{inc.rootCause || "Not yet identified"}</p>
                    </div>
                    <div className="p-2.5 rounded bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted-foreground mb-1">Mitigations Applied</p>
                      <div className="flex flex-wrap gap-1">{inc.mitigations.map((m, i) => <Badge key={i} variant="outline" className="text-[9px]">{m}</Badge>)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Generate Postmortem</Button>
                    <Button size="sm" variant="outline" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> View Full Timeline</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
