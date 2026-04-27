// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Center (Premium, Fully Wired)
// A/B slots, preflight, download, staging, health, rollback
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Download, CheckCircle, Clock, RefreshCw, Shield, ArrowRight, Info,
  AlertTriangle, XCircle, Loader2, Lock, Zap, RotateCcw, ChevronDown,
  ChevronUp, HardDrive, Activity, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateDaemon } from "@/platform/runtime/hooks/useUpdateDaemon";
import { UpdateSlotVisualization } from "@/platform/sita/components/sita/os/UpdateSlotVisualization";
import { UpdateProgressOverlay } from "@/platform/sita/components/sita/os/UpdateProgressOverlay";
import type { CatalogEntry, UpdateChannel } from "@/lib/services/update-daemon";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

const formatBytes = (b: number) => {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`;
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(0)} MB`;
  return `${(b / 1_000).toFixed(0)} KB`;
};

const timeAgo = (iso: string | null) => {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const CHANNELS: { id: UpdateChannel; label: string; description: string; icon: typeof Radio }[] = [
  { id: "stable", label: "Stable", description: "Production-ready, fully tested", icon: Shield },
  { id: "beta", label: "Beta", description: "Preview features, may have rough edges", icon: Zap },
  { id: "canary", label: "Canary", description: "Bleeding edge, for testing only", icon: Activity },
];

const typeColor: Record<string, string> = {
  security: "bg-destructive/15 text-destructive border-destructive/30",
  full: "bg-primary/15 text-primary border-primary/30",
  delta: "bg-accent/15 text-accent border-accent/30",
  service: "bg-muted text-muted-foreground border-border",
  firmware: "bg-accent/15 text-accent border-accent/30",
};

const actionColor: Record<string, string> = {
  installed: "text-[hsl(var(--trust-safe))]",
  failed: "text-destructive",
  rolled_back: "text-accent",
  deferred: "text-muted-foreground",
};

const actionIcon: Record<string, typeof CheckCircle> = {
  installed: CheckCircle,
  failed: XCircle,
  rolled_back: RotateCcw,
  deferred: Clock,
};

export default function UpdateCenter() {
  const ud = useUpdateDaemon();
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [expandedRollback, setExpandedRollback] = useState<string | null>(null);

  const handleInstall = useCallback(async (entry: CatalogEntry) => {
    const preflight = await ud.runPreflight(entry.id);
    if (!preflight.passed) return;
    setShowOverlay(true);
    await ud.downloadUpdate(entry.id);
    await ud.stageUpdate();
  }, [ud]);

  const handleReboot = useCallback(async () => {
    setShowOverlay(true);
    await ud.rebootAndValidate();
  }, [ud]);

  const isChecking = ud.state === "checking";
  const isDownloading = ud.state === "downloading";
  const hasUpdates = ud.catalog.length > 0;

  return (
    <PageShell>
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <SitaPageHeader
        icon={<Download className="h-6 w-6" />}
        title="Update Center"
        subtitle="Manage update channels, system slots, and update lifecycle"
      />

      {/* Overlay */}
      <UpdateProgressOverlay
        visible={showOverlay}
        state={ud.state}
        downloadProgress={ud.downloadProgress}
        healthResults={ud.healthResults}
        error={ud.error}
        onDismiss={() => { setShowOverlay(false); ud.resetState(); }}
      />

      {/* ── Hero Status ── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center",
              ud.state === "succeeded" || ud.state === "idle" ? "bg-[hsl(var(--trust-safe))]/10" :
              ud.state === "rolled_back" ? "bg-accent/10" :
              ud.state === "failed" ? "bg-destructive/10" : "bg-primary/10"
            )}>
              {ud.state === "rolled_back" ? <RotateCcw className="h-7 w-7 text-accent" /> :
               ud.state === "failed" ? <XCircle className="h-7 w-7 text-destructive" /> :
               isChecking ? <Loader2 className="h-7 w-7 text-primary animate-spin" /> :
               <CheckCircle className="h-7 w-7 text-[hsl(var(--trust-safe))]" />}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">
                {ud.state === "rolled_back" ? "System restored to previous version" :
                 ud.state === "failed" ? "Update failed" :
                 ud.state === "succeeded" ? "Update installed successfully" :
                 isChecking ? "Checking for updates…" :
                 hasUpdates ? `${ud.catalog.length} update${ud.catalog.length > 1 ? "s" : ""} available` :
                 "Your system is up to date"}
              </p>
              <p className="text-sm text-muted-foreground">
                Running <span className="font-mono font-semibold">{ud.currentVersion}</span> on {ud.channel} channel
                {ud.lastCheckedAt && ` · Last checked ${timeAgo(ud.lastCheckedAt)}`}
              </p>
            </div>
            <button
              onClick={ud.checkForUpdates}
              disabled={isChecking}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
              {isChecking ? "Checking…" : "Check Now"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── A/B Slot Visualization ── */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <HardDrive className="h-4 w-4" /> System Slots
        </h2>
        <UpdateSlotVisualization slotA={ud.activeSlot} slotB={ud.inactiveSlot} />
      </div>

      {/* ── Channel Selector ── */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Radio className="h-4 w-4" /> Update Channel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CHANNELS.map(ch => {
            const isActive = ud.channel === ch.id;
            const isLocked = ch.id === "canary"; // policy-locked example
            return (
              <motion.button
                key={ch.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => !isLocked && ud.setChannel(ch.id)}
                disabled={isLocked}
                className={cn(
                  "relative rounded-2xl border p-4 text-left transition-all",
                  isActive ? "ring-1 ring-primary/40 border-primary/30 bg-primary/5" : "border-border hover:border-primary/20",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ch.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    <p className={cn("text-sm font-semibold", isActive ? "text-primary" : "text-foreground")}>{ch.label}</p>
                  </div>
                  {isActive && <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase">Active</span>}
                  {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{ch.description}</p>
                {isLocked && <p className="text-[10px] text-destructive mt-1">Blocked by policy</p>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Available Updates ── */}
      {hasUpdates && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Download className="h-4 w-4" /> Available Updates
          </h2>
          <div className="space-y-3">
            {ud.catalog.map(entry => {
              const expanded = expandedUpdate === entry.id;
              const isCritical = entry.critical;
              return (
                <motion.div key={entry.id} layout>
                  <Card className={cn(isCritical && "border-destructive/30")}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                            isCritical ? "bg-destructive/10" : "bg-primary/10"
                          )}>
                            {isCritical ? <Shield className="h-5 w-5 text-destructive" /> : <Download className="h-5 w-5 text-primary" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold font-mono">{entry.version}</p>
                              <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase", typeColor[entry.type] || typeColor.service)}>
                                {entry.type}
                              </span>
                              {isCritical && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30 font-bold uppercase">
                                  Critical
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">{formatBytes(entry.sizeBytes)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.releaseNotes}</p>

                            {/* Component chips */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.components.map(c => (
                                <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{c}</span>
                              ))}
                            </div>

                            {/* Rollout */}
                            {entry.rolloutPercent < 100 && (
                              <div className="mt-2 flex items-center gap-2">
                                <Progress value={entry.rolloutPercent} className="h-1 flex-1 max-w-32" />
                                <span className="text-[10px] text-muted-foreground">{entry.rolloutPercent}% rollout</span>
                              </div>
                            )}

                            {/* Expanded details */}
                            <AnimatePresence>
                              {expanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Build</span><span className="font-mono">{entry.buildId}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Min Version</span><span className="font-mono">{entry.minVersion}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Signature</span>
                                      <span className={cn("flex items-center gap-1", entry.signatureValid ? "text-[hsl(var(--trust-safe))]" : "text-destructive")}>
                                        {entry.signatureValid ? <><CheckCircle className="h-3 w-3" /> Valid</> : <><XCircle className="h-3 w-3" /> Invalid</>}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Published</span><span>{new Date(entry.publishedAt).toLocaleDateString()}</span></div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => handleInstall(entry)}
                            disabled={isDownloading || ud.state === "staging"}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                              isCritical ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90",
                              "disabled:opacity-50"
                            )}
                          >
                            <Download className="h-3.5 w-3.5" /> Install
                          </button>
                          <button onClick={() => setExpandedUpdate(expanded ? null : entry.id)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                            {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Details</>}
                          </button>
                        </div>
                      </div>

                      {/* Preflight Results (inline) */}
                      {ud.preflightResult && ud.activeUpdateId === entry.id && !ud.preflightResult.passed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                          <p className="text-xs font-semibold text-destructive flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Preflight Failed</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <PreflightRow label="Battery" value={`${ud.preflightResult.batteryPercent}%`} pass={ud.preflightResult.batteryPercent >= 40} />
                            <PreflightRow label="Storage" value={formatBytes(ud.preflightResult.freeStorageBytes)} pass={ud.preflightResult.freeStorageBytes > entry.sizeBytes * 2} />
                            <PreflightRow label="Network" value={ud.preflightResult.networkType} pass={true} />
                            <PreflightRow label="Channel" value={ud.preflightResult.channelAllowed ? "Allowed" : "Blocked"} pass={ud.preflightResult.channelAllowed} />
                            <PreflightRow label="Policy" value={ud.preflightResult.policyAllowed ? "Allowed" : "Blocked"} pass={ud.preflightResult.policyAllowed} />
                            <PreflightRow label="Slot" value={ud.preflightResult.slotAvailable ? "Available" : "Unavailable"} pass={ud.preflightResult.slotAvailable} />
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Awaiting Reboot ── */}
      {ud.state === "awaiting_reboot" && (
        <Card className="border-accent/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Update Staged — Reboot Required</p>
                <p className="text-xs text-muted-foreground">The update has been written to the inactive slot. Reboot to apply and validate.</p>
              </div>
              <button onClick={handleReboot} className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
                Reboot & Validate
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Rollback History ── */}
      {ud.rollbackHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Rollback History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ud.rollbackHistory.map(rb => (
              <div key={rb.id} className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <RotateCcw className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Slot {rb.fromSlot} → Slot {rb.toSlot}</p>
                      <p className="text-xs text-muted-foreground">{rb.triggerType.replace("_", " ")} · {new Date(rb.detectedAt).toLocaleString()}</p>
                      <p className="text-xs text-accent mt-1">{rb.reasonCode}</p>
                    </div>
                  </div>
                  <button onClick={() => setExpandedRollback(expandedRollback === rb.id ? null : rb.id)} className="text-[10px] text-muted-foreground hover:text-foreground">
                    {expandedRollback === rb.id ? "Hide" : "Details"}
                  </button>
                </div>
                <AnimatePresence>
                  {expandedRollback === rb.id && rb.healthResults.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-accent/20 space-y-1.5">
                        {rb.healthResults.map(hr => (
                          <div key={hr.component} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-foreground">{hr.component}</span>
                            <span className={hr.status === "pass" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}>{hr.details}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Manual Rollback */}
            {ud.inactiveSlot.healthStatus === "healthy" && (
              <button
                onClick={ud.manualRollback}
                className="w-full mt-2 rounded-xl border border-accent/20 bg-accent/5 py-3 text-sm font-medium text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Rollback to {ud.inactiveSlot.version} (Slot {ud.inactiveSlot.id})
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Update History ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Update History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(expandedHistory ? ud.updateHistory : ud.updateHistory.slice(0, 5)).map(h => {
            const Icon = actionIcon[h.action] || Clock;
            return (
              <div key={h.id} className="flex items-start gap-3 py-3 px-3 rounded-xl bg-muted/30">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  h.action === "installed" ? "bg-[hsl(var(--trust-safe))]/10" :
                  h.action === "rolled_back" ? "bg-accent/10" :
                  h.action === "failed" ? "bg-destructive/10" : "bg-muted"
                )}>
                  <Icon className={cn("h-4 w-4", actionColor[h.action])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold font-mono">{h.fromVersion} → {h.toVersion}</p>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                      h.action === "installed" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                      h.action === "rolled_back" ? "bg-accent/10 text-accent" :
                      h.action === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                    )}>{h.action.replace("_", " ")}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{h.reason}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Actor: {h.actor}</p>
                </div>
              </div>
            );
          })}
          {ud.updateHistory.length > 5 && (
            <button onClick={() => setExpandedHistory(!expandedHistory)} className="w-full text-center text-xs text-primary hover:text-primary/80 py-2">
              {expandedHistory ? "Show less" : `Show all ${ud.updateHistory.length} entries`}
            </button>
          )}
        </CardContent>
      </Card>

      {/* ── Auto-Update Policy ── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Automatic Update Policy</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> Security patches auto-applied</div>
                <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-accent" /> Feature updates require approval</div>
                <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" /> Minimum 40% battery required</div>
                <div className="flex items-center gap-2"><RefreshCw className="h-3 w-3 text-muted-foreground" /> OTA agent runs daily at 03:00</div>
                <div className="flex items-center gap-2"><HardDrive className="h-3 w-3 text-muted-foreground" /> A/B slot atomic install</div>
                <div className="flex items-center gap-2"><RotateCcw className="h-3 w-3 text-accent" /> Auto-rollback on health failure</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </PageShell>
  );
}

// ── Preflight Row ──
function PreflightRow({ label, value, pass }: { label: string; value: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded bg-background/50">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("flex items-center gap-1", pass ? "text-[hsl(var(--trust-safe))]" : "text-destructive")}>
        {pass ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {value}
      </span>
    </div>
  );
}
