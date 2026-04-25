// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Center Window (Enhanced)
// A/B slot visualization, preflight checks, health validation,
// rollback display, signature badges, UpdateDaemon integration
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download, RotateCcw, CheckCircle, AlertTriangle, RefreshCw,
  ArrowDownToLine, Package, Shield, Battery, HardDrive, Wifi,
  Lock, Zap, Activity, Server, ChevronRight, Info, XCircle,
  CheckCircle2, Clock, Cpu, MonitorSmartphone, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  AppLayout, VStack, HStack, Divider,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaToolbar, NovaAvatar,
} from "@/platform/nova-sdk/ui/components";
import { AppStateWrapper } from "@/platform/sita/components/sita/shell/AppStateWrapper";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUpdateDaemon,
  type UpdateCatalogEntry,
  type UpdatePreflightResult,
  type HealthValidationResult,
  type RollbackEvent,
  type SystemSlot,
  type UpdateState,
} from "@/lib/os-security/updated";

// ── Helpers ──────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function stateColor(state: UpdateState): string {
  switch (state) {
    case "idle": return "text-muted-foreground";
    case "checking": return "text-[hsl(var(--primary))]";
    case "downloading": return "text-[hsl(210_80%_55%)]";
    case "staging": return "text-[hsl(var(--sita-gold))]";
    case "awaiting_reboot": return "text-[hsl(var(--sita-gold))]";
    case "validating": return "text-[hsl(var(--primary))]";
    case "succeeded": return "text-[hsl(var(--trust-safe))]";
    case "failed": return "text-destructive";
    case "rolled_back": return "text-[hsl(var(--sita-gold))]";
  }
}

function slotStatusColor(status: string): string {
  switch (status) {
    case "active": return "border-[hsl(var(--trust-safe))]/60 bg-[hsl(var(--trust-safe))]/5";
    case "pending": return "border-[hsl(var(--sita-gold))]/60 bg-[hsl(var(--sita-gold))]/5";
    case "inactive": return "border-border/40 bg-secondary/20";
    case "failed": return "border-destructive/60 bg-destructive/5";
    default: return "border-border/20 bg-secondary/10";
  }
}

// ── Slot Visualization ───────────────────────────────────────

function SlotCard({ slot, isActive }: { slot: SystemSlot; isActive: boolean }) {
  return (
    <motion.div
      layout
      className={cn(
        "flex-1 rounded-xl border p-3 transition-all relative overflow-hidden",
        slotStatusColor(slot.status)
      )}
    >
      {isActive && (
        <div className="absolute top-1.5 right-1.5">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--trust-safe))] animate-pulse" />
        </div>
      )}
      <VStack spacing="micro">
        <HStack spacing="micro" align="center">
          <Server className="h-3.5 w-3.5 text-muted-foreground" />
          <NovaText variant="body" className="!text-[12px] font-semibold">Slot {slot.slotId}</NovaText>
        </HStack>
        <NovaText variant="label" muted className="!text-[10px] font-mono">{slot.version}</NovaText>
        <HStack spacing="micro" className="flex-wrap gap-1">
          {isActive && <NovaBadge variant="success" className="!text-[8px] !py-0 !px-1.5">Active</NovaBadge>}
          {slot.status === "pending" && <NovaBadge variant="warning" className="!text-[8px] !py-0 !px-1.5">Pending</NovaBadge>}
          {slot.markedGood && <NovaBadge variant="default" className="!text-[8px] !py-0 !px-1.5">✓ Good</NovaBadge>}
          {slot.integrityVerified && (
            <div className="flex items-center gap-0.5">
              <Shield className="h-2.5 w-2.5 text-[hsl(var(--trust-safe))]" />
              <span className="text-[8px] text-[hsl(var(--trust-safe))]">Verified</span>
            </div>
          )}
        </HStack>
      </VStack>
    </motion.div>
  );
}

// ── Preflight Panel ──────────────────────────────────────────

function PreflightPanel({ preflight }: { preflight: UpdatePreflightResult }) {
  const checks = [
    { label: "Battery", ok: preflight.batteryOk, icon: Battery },
    { label: "Storage", ok: preflight.storageOk, icon: HardDrive },
    { label: "Network", ok: preflight.networkOk, icon: Wifi },
    { label: "Policy", ok: preflight.policyApproved, icon: Shield },
    { label: "Channel", ok: preflight.channelAllowed, icon: Lock },
  ];

  return (
    <NovaCard>
      <VStack spacing="tight">
        <NovaSectionLabel className="!px-0 !text-[10px]">Preflight Checks</NovaSectionLabel>
        <div className="grid grid-cols-5 gap-1.5">
          {checks.map(c => (
            <div key={c.label} className="flex flex-col items-center gap-1 py-1.5 rounded-lg bg-secondary/20">
              <c.icon className={cn("h-3.5 w-3.5", c.ok ? "text-[hsl(var(--trust-safe))]" : "text-destructive")} />
              <span className="text-[8px] font-medium text-muted-foreground">{c.label}</span>
              {c.ok ? (
                <CheckCircle2 className="h-2.5 w-2.5 text-[hsl(var(--trust-safe))]" />
              ) : (
                <XCircle className="h-2.5 w-2.5 text-destructive" />
              )}
            </div>
          ))}
        </div>
        {preflight.blockers.length > 0 && (
          <VStack spacing="micro" className="mt-1">
            {preflight.blockers.map((b, i) => (
              <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                <NovaText variant="label" className="!text-[9px] text-destructive/90">{b.message}</NovaText>
              </div>
            ))}
          </VStack>
        )}
        {preflight.warnings.length > 0 && (
          <VStack spacing="micro" className="mt-1">
            {preflight.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-[hsl(var(--sita-gold))]/10 border border-[hsl(var(--sita-gold))]/20">
                <Info className="h-3 w-3 text-[hsl(var(--sita-gold))] shrink-0 mt-0.5" />
                <NovaText variant="label" className="!text-[9px] text-[hsl(var(--sita-gold))]/90">{w.message}</NovaText>
              </div>
            ))}
          </VStack>
        )}
      </VStack>
    </NovaCard>
  );
}

// ── Health Validation Panel ──────────────────────────────────

function HealthPanel({ results }: { results: HealthValidationResult[] }) {
  if (results.length === 0) return null;

  const allPassed = results.every(r => r.status === "pass");

  return (
    <NovaCard>
      <VStack spacing="tight">
        <HStack spacing="tight" align="center" justify="between">
          <NovaSectionLabel className="!px-0 !text-[10px]">Health Validation</NovaSectionLabel>
          <NovaBadge variant={allPassed ? "success" : "danger"} className="!text-[8px]">
            {allPassed ? "All Passed" : "Issues Found"}
          </NovaBadge>
        </HStack>
        <div className="grid grid-cols-2 gap-1.5">
          {results.map(r => (
            <div key={r.component} className={cn(
              "flex items-center gap-1.5 p-1.5 rounded-lg border",
              r.status === "pass"
                ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5"
                : "border-destructive/20 bg-destructive/5"
            )}>
              {r.status === "pass" ? (
                <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))] shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 text-destructive shrink-0" />
              )}
              <VStack spacing="micro" className="min-w-0">
                <NovaText variant="label" className="!text-[9px] font-medium truncate">{r.component}</NovaText>
                <NovaText variant="label" muted className="!text-[8px]">{r.durationMs}ms</NovaText>
              </VStack>
            </div>
          ))}
        </div>
      </VStack>
    </NovaCard>
  );
}

// ── Rollback Event Display ───────────────────────────────────

function RollbackEventCard({ event }: { event: RollbackEvent }) {
  return (
    <div className="p-2.5 rounded-xl border border-[hsl(var(--sita-gold))]/30 bg-[hsl(var(--sita-gold))]/5">
      <VStack spacing="micro">
        <HStack spacing="tight" align="center" justify="between">
          <HStack spacing="micro" align="center">
            <RotateCcw className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
            <NovaText variant="body" className="!text-[11px] font-semibold">Rollback Event</NovaText>
          </HStack>
          <NovaBadge variant="warning" className="!text-[8px]">{event.triggerType.replace(/_/g, " ")}</NovaBadge>
        </HStack>
        <NovaText variant="label" muted className="!text-[9px]">
          Slot {event.sourceSlot} → Slot {event.rollbackToSlot}
        </NovaText>
        <NovaText variant="label" className="!text-[9px] text-[hsl(var(--sita-gold))]/80">
          {event.reasonCode}
        </NovaText>
        <NovaText variant="label" muted className="!text-[8px]">
          {new Date(event.detectedAt).toLocaleString()}
        </NovaText>
      </VStack>
    </div>
  );
}

// ── Tab: System Updates (Enhanced) ──────────────────────────

function SystemUpdatesTab() {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<UpdateCatalogEntry[]>([]);
  const [preflight, setPreflight] = useState<UpdatePreflightResult | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateCatalogEntry | null>(null);
  const [showSlots, setShowSlots] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const updated = useMemo(() => { try { return getUpdateDaemon(); } catch { return null; } }, []);
  const [daemonState, setDaemonState] = useState<UpdateState>("idle");
  const [progress, setProgress] = useState(updated?.getProgress() ?? null);
  const [slots, setSlots] = useState(updated?.getSlots() ?? null);
  const [healthResults, setHealthResults] = useState<HealthValidationResult[]>([]);
  const [activeSlot, setActiveSlot] = useState(updated?.getActiveSlot().slotId ?? "A");

  // Poll daemon state
  useEffect(() => {
    if (!updated) return;
    const iv = setInterval(() => {
      setDaemonState(updated.getState());
      setProgress(updated.getProgress());
      setSlots(updated.getSlots());
      setHealthResults(updated.getHealthResults());
      setActiveSlot(updated.getActiveSlot().slotId);
    }, 300);
    return () => clearInterval(iv);
  }, [updated]);

  const checkUpdates = useCallback(async () => {
    if (!updated) return;
    setChecking(true);
    const found = await updated.checkForUpdates();
    setAvailable(found);
    setChecking(false);
    if (found.length === 0) toast.info("SITA OS is up to date");
  }, [updated]);

  const runPreflight = useCallback((update: UpdateCatalogEntry) => {
    if (!updated) return;
    setSelectedUpdate(update);
    const result = updated.runPreflight(update);
    setPreflight(result);
  }, [updated]);

  const startInstall = useCallback(async () => {
    if (!updated || !selectedUpdate) return;
    const dl = await updated.downloadUpdate(selectedUpdate);
    if (!dl.success) { toast.error(dl.error); return; }
    const stage = await updated.stageUpdate();
    if (!stage.success) { toast.error(stage.error); return; }
    const validate = await updated.simulateRebootAndValidate();
    if (validate.success) toast.success(`Updated to ${selectedUpdate.version}`);
    else if (validate.rollback) toast.warning(`Rolled back: ${validate.reason}`);
    else toast.error(`Update failed: ${validate.reason}`);
    setSelectedUpdate(null);
    setPreflight(null);
  }, [updated, selectedUpdate]);

  const channel = updated?.getChannel() ?? "stable";

  const setChannel = useCallback((ch: "stable" | "beta" | "dev") => {
    if (!updated) return;
    const res = updated.setChannel(ch);
    if (!res.success) toast.error(res.error);
  }, [updated]);

  const isBusy = daemonState !== "idle" && daemonState !== "succeeded" && daemonState !== "failed" && daemonState !== "rolled_back";

  return (
    <VStack spacing="tight">
      {/* Status Header */}
      <NovaCard>
        <VStack spacing="normal" align="center" className="py-3">
          <div className="relative">
            <NovaAvatar icon="▣" size={48} gradient="from-[hsl(var(--primary))] to-[hsl(210_80%_55%)]" />
            {isBusy && (
              <motion.div
                className="absolute -inset-1 rounded-full border-2 border-[hsl(var(--primary))]/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          <NovaText variant="title">SITA OS</NovaText>
          <NovaText variant="label" muted className="font-mono">
            v{slots?.[activeSlot]?.version ?? "2026.4.0"}
          </NovaText>

          {/* State indicator */}
          {daemonState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex items-center gap-1.5", stateColor(daemonState))}
            >
              <Activity className="h-3 w-3" />
              <span className="text-[10px] font-medium capitalize">{daemonState.replace(/_/g, " ")}</span>
            </motion.div>
          )}

          {/* Channel selector */}
          <HStack spacing="tight">
            {(["stable", "beta", "dev"] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
                  channel === ch
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </button>
            ))}
          </HStack>
        </VStack>
      </NovaCard>

      {/* A/B Slot Visualization */}
      <NovaCard>
        <VStack spacing="tight">
          <button
            onClick={() => setShowSlots(!showSlots)}
            className="flex items-center justify-between w-full"
          >
            <NovaSectionLabel className="!px-0 !text-[10px]">System Slots</NovaSectionLabel>
            {showSlots ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showSlots && slots && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <HStack spacing="tight">
                  <SlotCard slot={slots.A} isActive={activeSlot === "A"} />
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                  <SlotCard slot={slots.B} isActive={activeSlot === "B"} />
                </HStack>
              </motion.div>
            )}
          </AnimatePresence>
        </VStack>
      </NovaCard>

      {/* Progress bar during operations */}
      {isBusy && progress && (
        <NovaCard>
          <VStack spacing="tight">
            <HStack spacing="tight" align="center" justify="between">
              <NovaText variant="body" className="!text-[11px]">{progress.currentStep}</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">{Math.round(progress.percentComplete)}%</NovaText>
            </HStack>
            <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(210_80%_55%)]"
                animate={{ width: `${Math.min(100, progress.percentComplete)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {progress.estimatedSecondsRemaining > 0 && (
              <NovaText variant="label" muted className="!text-[9px]">
                ~{progress.estimatedSecondsRemaining}s remaining
              </NovaText>
            )}
          </VStack>
        </NovaCard>
      )}

      {/* Available Updates */}
      {available.length > 0 && !isBusy && (
        <VStack spacing="tight">
          {available.map(u => (
            <NovaCard key={u.updateId}>
              <VStack spacing="tight">
                <HStack spacing="tight" align="center" justify="between">
                  <VStack spacing="micro">
                    <HStack spacing="micro" align="center">
                      <NovaText variant="body" className="!text-[12px] font-semibold">v{u.version}</NovaText>
                      {u.critical && <NovaBadge variant="danger" className="!text-[8px]">Critical</NovaBadge>}
                    </HStack>
                    <HStack spacing="micro" className="flex-wrap gap-1">
                      <NovaBadge variant="default" className="!text-[8px]">{u.type}</NovaBadge>
                      <NovaBadge variant="default" className="!text-[8px]">{formatBytes(u.sizeBytes)}</NovaBadge>
                      <div className="flex items-center gap-0.5">
                        <Shield className="h-2.5 w-2.5 text-[hsl(var(--trust-safe))]" />
                        <span className="text-[8px] text-[hsl(var(--trust-safe))]">Signed</span>
                      </div>
                    </HStack>
                  </VStack>
                </HStack>

                <NovaText variant="label" muted className="!text-[9px] whitespace-pre-wrap leading-relaxed">
                  {u.releaseNotes}
                </NovaText>

                <Divider />

                {/* Components affected */}
                <HStack spacing="micro" className="flex-wrap gap-1">
                  {u.components.map(c => (
                    <span key={c} className="text-[8px] px-1.5 py-0.5 rounded-md bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium">
                      {c}
                    </span>
                  ))}
                </HStack>

                {selectedUpdate?.updateId === u.updateId && preflight ? (
                  <VStack spacing="tight">
                    <PreflightPanel preflight={preflight} />
                    {preflight.eligible ? (
                      <NovaButton
                        variant="primary"
                        onClick={startInstall}
                        icon={<Download className="h-3.5 w-3.5" />}
                        className="w-full !text-[11px]"
                      >
                        Install & Reboot
                      </NovaButton>
                    ) : (
                      <NovaButton variant="secondary" disabled className="w-full !text-[11px]">
                        Cannot Install — See Blockers
                      </NovaButton>
                    )}
                  </VStack>
                ) : (
                  <NovaButton
                    variant="primary"
                    onClick={() => runPreflight(u)}
                    icon={<Zap className="h-3.5 w-3.5" />}
                    className="w-full !text-[11px]"
                  >
                    Run Preflight & Prepare
                  </NovaButton>
                )}
              </VStack>
            </NovaCard>
          ))}
        </VStack>
      )}

      {/* Health Results */}
      <HealthPanel results={healthResults} />

      {/* Auto-update + Check button */}
      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" justify="between" align="center">
            <NovaText variant="body" className="!text-[11px]">Auto-Update</NovaText>
            <NovaToggle checked={autoUpdate} onChange={setAutoUpdate} />
          </HStack>
          <Divider />
          <NovaButton
            variant="secondary"
            onClick={checkUpdates}
            disabled={checking || isBusy}
            icon={<RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} />}
            className="w-full !text-[11px]"
          >
            {checking ? "Checking…" : "Check for Updates"}
          </NovaButton>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Tab: App Updates ─────────────────────────────────────────

function AppUpdatesTab() {
  const { apps, updateApp } = useAppPlatform();
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const updatableApps = apps.filter(a => a.installStatus === "installed");

  const handleUpdate = useCallback(async (appId: string) => {
    setUpdating(prev => new Set(prev).add(appId));
    await updateApp(appId);
    setUpdating(prev => { const n = new Set(prev); n.delete(appId); return n; });
    toast.success("App updated");
  }, [updateApp]);

  const handleUpdateAll = useCallback(async () => {
    for (const app of updatableApps) {
      await handleUpdate(app.id);
    }
  }, [updatableApps, handleUpdate]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center">
          <VStack spacing="micro">
            <NovaText variant="body" className="!text-[12px]">{updatableApps.length} apps installed</NovaText>
            <NovaText variant="label" muted className="!text-[9px]">All apps are managed by SITA OS</NovaText>
          </VStack>
          <NovaButton variant="primary" onClick={handleUpdateAll} icon={<ArrowDownToLine className="h-3.5 w-3.5" />} className="!text-[10px] !py-1 !px-2">
            Update All
          </NovaButton>
        </HStack>
      </NovaCard>

      {updatableApps.map(app => (
        <NovaCard key={app.id}>
          <HStack spacing="tight" align="center" justify="between">
            <HStack spacing="tight" align="center" className="flex-1 min-w-0">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", app.iconBg)}>
                {app.icon}
              </div>
              <VStack spacing="micro" className="min-w-0">
                <NovaText variant="body" className="truncate !text-[11px]">{app.name}</NovaText>
                <NovaText variant="label" muted className="!text-[9px]">v{app.version}</NovaText>
              </VStack>
            </HStack>
            <NovaButton
              variant="secondary"
              onClick={() => handleUpdate(app.id)}
              disabled={updating.has(app.id)}
              className="!text-[9px] !py-0.5 !px-2"
            >
              {updating.has(app.id) ? "…" : "Update"}
            </NovaButton>
          </HStack>
        </NovaCard>
      ))}
    </VStack>
  );
}

// ── Tab: Rollback & History ──────────────────────────────────

function RollbackTab() {
  const updated = useMemo(() => { try { return getUpdateDaemon(); } catch { return null; } }, []);
  const [rollbackHistory, setRollbackHistory] = useState<RollbackEvent[]>([]);
  const [updateHistory, setUpdateHistory] = useState<Array<{ updateId: string; fromVersion: string; toVersion: string; action: string; timestamp: number; reason?: string }>>([]);
  const [healthResults, setHealthResults] = useState<HealthValidationResult[]>([]);

  useEffect(() => {
    if (!updated) return;
    setRollbackHistory(updated.getRollbackHistory());
    setUpdateHistory(updated.getUpdateHistory());
    setHealthResults(updated.getHealthResults());
  }, [updated]);

  const manualRollback = useCallback(async () => {
    if (!updated) return;
    const result = await updated.manualRollback();
    if (result.success) {
      toast.success("Rolled back to previous version");
      setRollbackHistory(updated.getRollbackHistory());
      setUpdateHistory(updated.getUpdateHistory());
    } else {
      toast.error(result.reason || "Rollback failed");
    }
  }, [updated]);

  return (
    <VStack spacing="tight">
      {/* Manual Rollback */}
      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" align="center">
            <RotateCcw className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
            <VStack spacing="micro">
              <NovaText variant="body" className="!text-[12px] font-semibold">Manual Rollback</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">Revert to previous system slot</NovaText>
            </VStack>
          </HStack>
          <NovaButton
            variant="secondary"
            onClick={manualRollback}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            className="w-full !text-[11px]"
          >
            Rollback to Previous Version
          </NovaButton>
        </VStack>
      </NovaCard>

      {/* Last Health Validation */}
      <HealthPanel results={healthResults} />

      {/* Rollback Events */}
      {rollbackHistory.length > 0 && (
        <NovaCard>
          <VStack spacing="tight">
            <NovaSectionLabel className="!px-0 !text-[10px]">Rollback Events</NovaSectionLabel>
            {rollbackHistory.map(e => (
              <RollbackEventCard key={e.eventId} event={e} />
            ))}
          </VStack>
        </NovaCard>
      )}

      {/* Update History */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0 !text-[10px]">Update History</NovaSectionLabel>
          {updateHistory.length === 0 ? (
            <NovaText variant="label" muted className="!text-[10px] py-2 text-center">No update history yet</NovaText>
          ) : (
            <VStack spacing="micro">
              {updateHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/10 last:border-0">
                  {h.action === "installed" && <CheckCircle className="h-3 w-3 text-[hsl(var(--trust-safe))] shrink-0" />}
                  {h.action === "rolled_back" && <RotateCcw className="h-3 w-3 text-[hsl(var(--sita-gold))] shrink-0" />}
                  {h.action === "failed" && <XCircle className="h-3 w-3 text-destructive shrink-0" />}
                  <VStack spacing="micro" className="flex-1 min-w-0">
                    <NovaText variant="body" className="!text-[10px]">
                      {h.fromVersion} → {h.toVersion}
                    </NovaText>
                    <NovaText variant="label" muted className="!text-[8px]">
                      {new Date(h.timestamp).toLocaleString()} · {h.action}
                    </NovaText>
                  </VStack>
                </div>
              ))}
            </VStack>
          )}
        </VStack>
      </NovaCard>

      {/* Recovery Panel */}
      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" align="center">
            <MonitorSmartphone className="h-4 w-4 text-[hsl(var(--primary))]" />
            <VStack spacing="micro">
              <NovaText variant="body" className="!text-[12px] font-semibold">Recovery Mode</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">Boot into recovery environment</NovaText>
            </VStack>
          </HStack>
          <NovaText variant="label" muted className="!text-[9px] leading-relaxed">
            Recovery mode provides a minimal environment for system repair, data backup, and factory reset. Use only if the system is unresponsive after a failed update.
          </NovaText>
          <NovaButton variant="ghost" className="w-full !text-[10px] text-muted-foreground">
            Reboot to Recovery…
          </NovaButton>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Main ─────────────────────────────────────────────────────

type Tab = "system" | "apps" | "rollback";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "system", label: "System", icon: <Cpu className="h-3 w-3" /> },
  { id: "apps", label: "Apps", icon: <Package className="h-3 w-3" /> },
  { id: "rollback", label: "Recovery", icon: <RotateCcw className="h-3 w-3" /> },
];

export function UpdateCenterWindow() {
  const [tab, setTab] = useState<Tab>("system");

  const toolbar = (
    <NovaToolbar title="Update Center" leading={<Download className="h-4 w-4 text-[hsl(var(--primary))]" />} />
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(210_80%_55%)] to-[hsl(var(--trust-safe))]">
      <AppLayout toolbar={toolbar} minHeight={400}>
        <VStack spacing="tight">
          {/* Tab bar */}
          <HStack spacing="tight" className="px-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  tab === t.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </HStack>

          {tab === "system" && <SystemUpdatesTab />}
          {tab === "apps" && <AppUpdatesTab />}
          {tab === "rollback" && <RollbackTab />}
        </VStack>
      </AppLayout>
    </AppStateWrapper>
  );
}
