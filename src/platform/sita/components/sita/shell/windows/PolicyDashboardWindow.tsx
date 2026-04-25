// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Dashboard Window
// Device mode switcher, active policy viewer, decision log,
// bundle manager, protection summary — all wired to policyd
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield, Lock, Wifi, Bluetooth, Battery, Zap, Eye, Moon,
  Server, Activity, ChevronRight, CheckCircle2, XCircle,
  AlertTriangle, Info, RefreshCw, Globe, Cpu, Monitor,
  Users, FileKey, Layers, Settings2, BookOpen, History,
} from "lucide-react";
import {
  AppLayout, VStack, HStack, Divider,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaToolbar,
} from "@/platform/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useOSSecurity } from "@/hooks/useOSSecurity";
import {
  DEVICE_MODES, type DeviceMode, type DeviceModeDefinition,
  getPolicyBundleManager,
} from "@/lib/os-security/policyd-bundles";
import { getPolicyDaemon } from "@/lib/os-security/policyd";

// ── Device Mode Card ─────────────────────────────────────────

function DeviceModeCard({
  mode,
  isActive,
  onSelect,
}: {
  mode: DeviceModeDefinition;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
        isActive
          ? "border-[hsl(var(--primary))]/60 bg-[hsl(var(--primary))]/8 shadow-sm shadow-[hsl(var(--primary))]/10"
          : "border-border/30 bg-card/40 hover:border-border/60 hover:bg-card/60"
      )}
    >
      {isActive && (
        <div className="absolute top-1.5 right-1.5">
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--primary))]" />
        </div>
      )}
      <span className="text-xl">{mode.icon}</span>
      <NovaText variant="body" className="!text-[11px] font-semibold">{mode.displayName}</NovaText>
      <NovaText variant="label" muted className="!text-[8px] leading-tight">{mode.description}</NovaText>
      {mode.lockedDown && (
        <NovaBadge variant="warning" className="!text-[7px] !py-0 !px-1">
          <Lock className="h-2 w-2 mr-0.5" /> Restricted
        </NovaBadge>
      )}
    </motion.button>
  );
}

// ── Policy Domain Row ────────────────────────────────────────

function PolicyRow({
  icon, label, value, status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: "enforced" | "recommended" | "optional" | "restricted";
}) {
  const statusColors = {
    enforced: "text-[hsl(var(--trust-safe))]",
    recommended: "text-[hsl(var(--sita-gold))]",
    optional: "text-muted-foreground",
    restricted: "text-destructive",
  };
  const statusBg = {
    enforced: "bg-[hsl(var(--trust-safe))]/10",
    recommended: "bg-[hsl(var(--sita-gold))]/10",
    optional: "bg-secondary/30",
    restricted: "bg-destructive/10",
  };

  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-border/10 last:border-0">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", statusBg[status])}>
        <span className={statusColors[status]}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <NovaText variant="body" className="!text-[11px]">{label}</NovaText>
        <NovaText variant="label" muted className="!text-[9px]">{value}</NovaText>
      </div>
      <NovaBadge
        variant={status === "enforced" ? "success" : status === "restricted" ? "danger" : "default"}
        className="!text-[7px] !py-0 !px-1.5 shrink-0"
      >
        {status}
      </NovaBadge>
    </div>
  );
}

// ── Tab: Device Mode ─────────────────────────────────────────

function DeviceModeTab() {
  const { deviceMode, switchDeviceMode } = useOSSecurity();

  const handleSwitch = useCallback((mode: DeviceMode) => {
    const result = switchDeviceMode(mode);
    if (result) {
      toast.success(`Switched to ${DEVICE_MODES.find(m => m.mode === mode)?.displayName || mode} mode`);
    }
  }, [switchDeviceMode]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" align="center">
            <Monitor className="h-4 w-4 text-[hsl(var(--primary))]" />
            <VStack spacing="micro">
              <NovaText variant="body" className="!text-[12px] font-semibold">Device Mode</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">
                Controls security posture, network rules, and available settings
              </NovaText>
            </VStack>
          </HStack>
        </VStack>
      </NovaCard>

      <div className="grid grid-cols-2 gap-2">
        {DEVICE_MODES.map(mode => (
          <DeviceModeCard
            key={mode.mode}
            mode={mode}
            isActive={deviceMode === mode.mode}
            onSelect={() => handleSwitch(mode.mode)}
          />
        ))}
      </div>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0 !text-[10px]">Mode Effects</NovaSectionLabel>
          <NovaText variant="label" muted className="!text-[9px] leading-relaxed">
            Switching modes immediately updates network rules, Bluetooth pairing, app permissions,
            privacy defaults, and update behavior. Required security baselines are always enforced
            regardless of mode.
          </NovaText>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Tab: Active Policy ───────────────────────────────────────

function ActivePolicyTab() {
  const bundleManager = useMemo(() => { try { return getPolicyBundleManager(); } catch { return null; } }, []);
  const policy = useMemo(() => bundleManager?.getEffective(), [bundleManager]);

  if (!policy) {
    return <NovaText variant="label" muted className="py-4 text-center">Policy engine not available</NovaText>;
  }

  return (
    <VStack spacing="tight">
      {/* WiFi */}
      <NovaCard>
        <VStack spacing="micro">
          <NovaSectionLabel className="!px-0 !text-[10px]">
            <Wifi className="h-3 w-3 inline mr-1" /> Network
          </NovaSectionLabel>
          <PolicyRow
            icon={<Wifi className="h-3.5 w-3.5" />}
            label="Open Networks"
            value={policy.wifi.allow_open_networks ? "Allowed with confirmation" : "Blocked"}
            status={policy.wifi.allow_open_networks ? "recommended" : "restricted"}
          />
          <PolicyRow
            icon={<Shield className="h-3.5 w-3.5" />}
            label="Auto-VPN on Public Wi-Fi"
            value={policy.wifi.auto_enable_vpn_on_public_wifi ? "Enabled" : "Disabled"}
            status={policy.wifi.auto_enable_vpn_on_public_wifi ? "enforced" : "optional"}
          />
          <PolicyRow
            icon={<Lock className="h-3.5 w-3.5" />}
            label="WiFi Toggle While Locked"
            value={policy.wifi.allow_wifi_toggle_while_locked ? "Allowed" : "Blocked"}
            status={policy.wifi.allow_wifi_toggle_while_locked ? "optional" : "restricted"}
          />
        </VStack>
      </NovaCard>

      {/* Shield */}
      <NovaCard>
        <VStack spacing="micro">
          <NovaSectionLabel className="!px-0 !text-[10px]">
            <Shield className="h-3 w-3 inline mr-1" /> Shield
          </NovaSectionLabel>
          <PolicyRow
            icon={<Shield className="h-3.5 w-3.5" />}
            label="Baseline Firewall"
            value={policy.shield.baseline_firewall_required ? "Required — Always On" : "Optional"}
            status="enforced"
          />
          <PolicyRow
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Threat Monitoring"
            value={policy.shield.auto_enable_threat_monitoring ? "Active" : "Inactive"}
            status={policy.shield.auto_enable_threat_monitoring ? "enforced" : "optional"}
          />
          <PolicyRow
            icon={<Lock className="h-3.5 w-3.5" />}
            label="User Disable Firewall"
            value={policy.shield.allow_user_disable_firewall ? "Allowed" : "Blocked"}
            status={policy.shield.allow_user_disable_firewall ? "optional" : "restricted"}
          />
        </VStack>
      </NovaCard>

      {/* Bluetooth */}
      <NovaCard>
        <VStack spacing="micro">
          <NovaSectionLabel className="!px-0 !text-[10px]">
            <Bluetooth className="h-3 w-3 inline mr-1" /> Bluetooth
          </NovaSectionLabel>
          <PolicyRow
            icon={<Bluetooth className="h-3.5 w-3.5" />}
            label="Pair While Locked"
            value={policy.bluetooth.allow_new_pairing_while_locked ? "Allowed" : "Blocked"}
            status={policy.bluetooth.allow_new_pairing_while_locked ? "optional" : "restricted"}
          />
          <PolicyRow
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            label="Unknown Keyboard Pairing"
            value={policy.bluetooth.require_admin_for_unknown_keyboard_pairing ? "Admin Required" : "Standard"}
            status={policy.bluetooth.require_admin_for_unknown_keyboard_pairing ? "enforced" : "optional"}
          />
        </VStack>
      </NovaCard>

      {/* Power */}
      <NovaCard>
        <VStack spacing="micro">
          <NovaSectionLabel className="!px-0 !text-[10px]">
            <Battery className="h-3 w-3 inline mr-1" /> Power
          </NovaSectionLabel>
          <PolicyRow
            icon={<Battery className="h-3.5 w-3.5" />}
            label="Auto Battery Saver"
            value={`Below ${policy.power.auto_enable_saver_below_percent}%`}
            status="enforced"
          />
          <PolicyRow
            icon={<Moon className="h-3.5 w-3.5" />}
            label="Quiet Mode in Presentations"
            value={policy.power.enforce_quiet_mode_in_presentations ? "Enforced" : "Optional"}
            status={policy.power.enforce_quiet_mode_in_presentations ? "enforced" : "optional"}
          />
        </VStack>
      </NovaCard>

      {/* Updates */}
      <NovaCard>
        <VStack spacing="micro">
          <NovaSectionLabel className="!px-0 !text-[10px]">
            <RefreshCw className="h-3 w-3 inline mr-1" /> Updates
          </NovaSectionLabel>
          <PolicyRow
            icon={<Battery className="h-3.5 w-3.5" />}
            label="Min Battery for Update"
            value={`${policy.updates.require_battery_percent_min}%`}
            status="enforced"
          />
          <PolicyRow
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Charger for Firmware"
            value={policy.updates.require_charger_for_firmware ? "Required" : "Not Required"}
            status={policy.updates.require_charger_for_firmware ? "enforced" : "optional"}
          />
          <PolicyRow
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Auto-Rollback on Failure"
            value={policy.updates.rollback_on_health_failure ? "Enabled" : "Disabled"}
            status={policy.updates.rollback_on_health_failure ? "enforced" : "optional"}
          />
          <PolicyRow
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Beta Channel"
            value={policy.updates.allow_beta_channel ? "Allowed" : "Blocked"}
            status={policy.updates.allow_beta_channel ? "optional" : "restricted"}
          />
        </VStack>
      </NovaCard>

      {/* Privacy */}
      <NovaCard>
        <VStack spacing="micro">
          <NovaSectionLabel className="!px-0 !text-[10px]">
            <Eye className="h-3 w-3 inline mr-1" /> Privacy & Apps
          </NovaSectionLabel>
          <PolicyRow
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Telemetry"
            value={policy.privacy.allow_telemetry === "opt_in" ? "Opt-In Only" : policy.privacy.allow_telemetry}
            status="enforced"
          />
          <PolicyRow
            icon={<Cpu className="h-3.5 w-3.5" />}
            label="Untrusted App Network"
            value={policy.apps.default_network_for_untrusted === "deny" ? "Denied by Default" : "Allowed"}
            status={policy.apps.default_network_for_untrusted === "deny" ? "restricted" : "optional"}
          />
          <PolicyRow
            icon={<FileKey className="h-3.5 w-3.5" />}
            label="Unsigned Kernel Modules"
            value={policy.kernel.allow_unsigned_modules ? "Allowed" : "Blocked"}
            status={policy.kernel.allow_unsigned_modules ? "optional" : "restricted"}
          />
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Tab: Decision Log ────────────────────────────────────────

function DecisionLogTab() {
  const policyd = useMemo(() => { try { return getPolicyDaemon(); } catch { return null; } }, []);
  const [decisions, setDecisions] = useState<Array<{
    action: string; allowed: boolean; reason: string; severity: string; timestamp: number;
  }>>([]);

  useEffect(() => {
    if (!policyd) return;
    const raw = policyd.getDecisionLog();
    setDecisions(raw.slice(-50).reverse().map(d => ({
      action: d.action,
      allowed: d.decision.allowed,
      reason: d.decision.reason,
      severity: d.decision.severity,
      timestamp: d.timestamp,
    })));
  }, [policyd]);

  const severityColors: Record<string, string> = {
    info: "text-muted-foreground",
    warning: "text-[hsl(var(--sita-gold))]",
    high: "text-[hsl(var(--primary))]",
    critical: "text-destructive",
  };

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" align="center" justify="between">
            <HStack spacing="tight" align="center">
              <History className="h-4 w-4 text-[hsl(var(--primary))]" />
              <NovaText variant="body" className="!text-[12px] font-semibold">Policy Decisions</NovaText>
            </HStack>
            <NovaBadge variant="default" className="!text-[8px]">{decisions.length} entries</NovaBadge>
          </HStack>
        </VStack>
      </NovaCard>

      {decisions.length === 0 ? (
        <NovaCard>
          <NovaText variant="label" muted className="!text-[10px] py-4 text-center">
            No policy decisions recorded yet. Actions will appear here as the system evaluates requests.
          </NovaText>
        </NovaCard>
      ) : (
        <VStack spacing="micro">
          {decisions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "p-2 rounded-lg border transition-all",
                d.allowed
                  ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/3"
                  : "border-destructive/15 bg-destructive/3"
              )}
            >
              <HStack spacing="tight" align="center" justify="between">
                <HStack spacing="micro" align="center" className="flex-1 min-w-0">
                  {d.allowed ? (
                    <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))] shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive shrink-0" />
                  )}
                  <VStack spacing="micro" className="min-w-0">
                    <NovaText variant="body" className="!text-[10px] font-mono truncate">{d.action}</NovaText>
                    <NovaText variant="label" muted className="!text-[8px] truncate">{d.reason}</NovaText>
                  </VStack>
                </HStack>
                <VStack spacing="micro" align="end" className="shrink-0">
                  <span className={cn("text-[8px] font-medium", severityColors[d.severity] || "text-muted-foreground")}>
                    {d.severity}
                  </span>
                  <NovaText variant="label" muted className="!text-[7px]">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </NovaText>
                </VStack>
              </HStack>
            </motion.div>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// ── Tab: Protection Summary ──────────────────────────────────

function ProtectionSummaryTab() {
  const { securityScore, deviceMode, enrolledMethods } = useOSSecurity();
  const bundleManager = useMemo(() => { try { return getPolicyBundleManager(); } catch { return null; } }, []);
  const policy = useMemo(() => bundleManager?.getEffective(), [bundleManager]);

  const protections = useMemo(() => {
    if (!policy) return [];
    return [
      { label: "Firewall Baseline", active: policy.shield.baseline_firewall_required, icon: <Shield className="h-4 w-4" />, critical: true },
      { label: "Threat Monitoring", active: policy.shield.auto_enable_threat_monitoring, icon: <Eye className="h-4 w-4" />, critical: false },
      { label: "VPN on Public WiFi", active: policy.wifi.auto_enable_vpn_on_public_wifi, icon: <Globe className="h-4 w-4" />, critical: false },
      { label: "Kernel Lockdown", active: policy.kernel.lockdown_mode, icon: <Lock className="h-4 w-4" />, critical: true },
      { label: "Unsigned Modules Blocked", active: !policy.kernel.allow_unsigned_modules, icon: <FileKey className="h-4 w-4" />, critical: true },
      { label: "Rollback on Failure", active: policy.updates.rollback_on_health_failure, icon: <RefreshCw className="h-4 w-4" />, critical: false },
      { label: "BT Pair Locked Blocked", active: !policy.bluetooth.allow_new_pairing_while_locked, icon: <Bluetooth className="h-4 w-4" />, critical: false },
      { label: "Battery Saver Auto", active: policy.power.auto_enable_saver_below_percent > 0, icon: <Battery className="h-4 w-4" />, critical: false },
    ];
  }, [policy]);

  const activeCount = protections.filter(p => p.active).length;

  return (
    <VStack spacing="tight">
      {/* Score Card */}
      <NovaCard>
        <VStack spacing="normal" align="center" className="py-4">
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--trust-safe))] to-[hsl(152_55%_38%)] flex items-center justify-center shadow-lg shadow-[hsl(152_55%_48%/0.2)]">
              <span className="text-2xl font-bold text-white">{securityScore}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-[hsl(var(--trust-safe))] flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
            </div>
          </motion.div>
          <VStack spacing="micro" align="center">
            <NovaText variant="title" className="!text-[16px]">Protection Score</NovaText>
            <NovaText variant="label" muted className="!text-[10px]">
              {activeCount} of {protections.length} protections active · {DEVICE_MODES.find(m => m.mode === deviceMode)?.displayName} mode
            </NovaText>
          </VStack>
          <HStack spacing="tight" className="flex-wrap justify-center gap-1">
            {enrolledMethods.map(m => (
              <NovaBadge key={m} variant="default" className="!text-[8px]">
                {m === "password" ? "🔑" : m === "biometric" ? "👆" : m === "pin" ? "🔢" : "🗝️"} {m}
              </NovaBadge>
            ))}
          </HStack>
        </VStack>
      </NovaCard>

      {/* Protection Grid */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0 !text-[10px]">Active Protections</NovaSectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {protections.map(p => (
              <div
                key={p.label}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-all",
                  p.active
                    ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5"
                    : "border-border/20 bg-secondary/10 opacity-60"
                )}
              >
                <div className={cn(
                  "shrink-0",
                  p.active ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"
                )}>
                  {p.icon}
                </div>
                <VStack spacing="micro" className="min-w-0">
                  <NovaText variant="label" className="!text-[9px] font-medium truncate">{p.label}</NovaText>
                  <NovaText variant="label" muted className="!text-[7px]">
                    {p.active ? (p.critical ? "Required" : "Active") : "Inactive"}
                  </NovaText>
                </VStack>
              </div>
            ))}
          </div>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Main ─────────────────────────────────────────────────────

type Tab = "mode" | "policy" | "decisions" | "protection";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "protection", label: "Overview", icon: <Shield className="h-3 w-3" /> },
  { id: "mode", label: "Mode", icon: <Monitor className="h-3 w-3" /> },
  { id: "policy", label: "Policy", icon: <Layers className="h-3 w-3" /> },
  { id: "decisions", label: "Log", icon: <History className="h-3 w-3" /> },
];

export function PolicyDashboardWindow() {
  const [tab, setTab] = useState<Tab>("protection");

  const toolbar = (
    <NovaToolbar
      title="Policy Center"
      leading={<Shield className="h-4 w-4 text-[hsl(var(--primary))]" />}
    />
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(var(--primary))] to-[hsl(var(--trust-safe))]">
      <AppLayout toolbar={toolbar} minHeight={400}>
        <VStack spacing="tight">
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

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "protection" && <ProtectionSummaryTab />}
              {tab === "mode" && <DeviceModeTab />}
              {tab === "policy" && <ActivePolicyTab />}
              {tab === "decisions" && <DecisionLogTab />}
            </motion.div>
          </AnimatePresence>
        </VStack>
      </AppLayout>
    </AppStateWrapper>
  );
}
