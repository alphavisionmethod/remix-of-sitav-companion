// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Center (App-in-OS Shell)
// ═══════════════════════════════════════════════════════════════

import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { DomainAppShell } from "@/components/sita/shell/DomainAppShell";
import type { DomainConfig } from "@/components/sita/shell/DomainAppShell";
import type { NavTabGroup } from "@/components/sita/shell/AppSidebarNav";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppOpenTransition } from "@/components/sita/shell/AppOpenTransition";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { TrustDebtEngine } from "@/domains/engines/trust-debt-engine";
import { cn } from "@/lib/utils";
import {
  Shield, LayoutDashboard, Smartphone, Key, Lock, Eye, Settings,
  ShieldCheck, ShieldAlert, Wifi, WifiOff, Globe, Pause, Play,
  RotateCcw, FileText
} from "lucide-react";
import { HeroCard, StatusCard, ProofCard, AdvisorCard } from "@/components/sita/cards";
import { TrustBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { EmptyState } from "@/components/sita/SitaComponents";
import { PageErrorState } from "@/components/sita/PageErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";

const DOMAIN_CONFIG: DomainConfig = {
  id: "trust" as DomainConfig["id"],
  title: "Trust Center",
  icon: Shield,
  accentFrom: "hsl(35 75% 55%)",
  accentTo: "hsl(25 70% 48%)",
  statusLabel: "Trust Posture: Secure",
  version: "Trust v2.0",
};

type SubPage = "overview" | "autonomy" | "devices" | "permissions" | "proof" | "audit" | "settings";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/trust/autonomy")) return "autonomy";
  if (path.includes("/trust/devices")) return "devices";
  if (path.includes("/trust/permissions")) return "permissions";
  if (path.includes("/trust/proof")) return "proof";
  if (path.includes("/trust/audit")) return "audit";
  if (path.includes("/trust/settings")) return "settings";
  return "overview";
};

const TAB_GROUPS: NavTabGroup[] = [
  { label: "Overview", tabs: [{ key: "overview", label: "Dashboard", icon: LayoutDashboard }, { key: "autonomy", label: "Autonomy", icon: Key }] },
  { label: "Access", tabs: [{ key: "devices", label: "Devices", icon: Smartphone }, { key: "permissions", label: "Permissions", icon: Lock }] },
  { label: "Audit", tabs: [{ key: "proof", label: "Proof Log", icon: FileText }, { key: "audit", label: "Audit Trail", icon: Eye }] },
  { label: "System", tabs: [{ key: "settings", label: "Settings", icon: Settings }] },
];

/* ── Overview ── */
const TrustOverviewPage = () => {
  const { user , isDemo} = useAuth();
  const [automationsPaused, setAutomationsPaused] = useState(false);
  const [trustMode, setTrustMode] = useState<"suggest" | "approve-execute" | "autonomous">("approve-execute");

  const trustDebtEngine = useMemo(() => new TrustDebtEngine(), []);
  const debtScore = useMemo(() => trustDebtEngine.computeDebtScore(), [trustDebtEngine]);

  const { data: devices = [], isError: devicesError, refetch: refetchDevices } = useQuery({
    queryKey: ["trust_devices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("device_statuses").select("*").eq("user_id", user.id).order("last_seen", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const displayDevices = devices.length > 0 ? devices : [
    { id: "d1", device_name: "MacBook Pro", device_type: "desktop", os: "macOS 14.3", status: "online", last_seen: new Date().toISOString(), ip_address: "192.168.1.5" },
    { id: "d2", device_name: "iPhone 15 Pro", device_type: "mobile", os: "iOS 17.4", status: "online", last_seen: new Date(Date.now() - 300000).toISOString() },
    { id: "d3", device_name: "iPad Air", device_type: "tablet", os: "iPadOS 17.3", status: "offline", last_seen: new Date(Date.now() - 86400000).toISOString() },
  ];

  const healthPct = Math.round((1 - debtScore) * 100);

  if (devicesError) {
    return (
      <div className="space-y-5">
        <PageTruthBanner truthState="live" />
        <PageErrorState onRetry={refetchDevices} context="trust data" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageTruthBanner truthState="live" />

      <HeroCard
        title="Trust Posture"
        metric={`${healthPct}% Healthy`}
        subtitle={`${displayDevices.filter((d: Record<string, any>) => d.status === "online").length} devices online · Approvals up to date`}
        accentFrom="hsl(38 85% 58%)"
        accentTo="hsl(28 80% 50%)"
        icon={<ShieldCheck className="h-5 w-5 text-[hsl(38_85%_68%)]" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Autonomy level */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mb-3 flex items-center gap-1.5")}><Key className="w-3 h-3" /> Autonomy Level</h4>
          <div className="space-y-2">
            {(["suggest", "approve-execute", "autonomous"] as const).map(mode => (
              <button key={mode} onClick={() => setTrustMode(mode)} className={cn("w-full text-left p-3 rounded-xl border transition-all", trustMode === mode ? "bg-[hsl(38_85%_58%/0.08)] border-[hsl(38_85%_58%/0.2)]" : "border-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.03)]")}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)] capitalize")}>{mode.replace("-", " & ")}</div>
                    <div className={cn(SITA_TYPE.timelineMeta)}>
                      {mode === "suggest" && "SITA suggests, you decide everything"}
                      {mode === "approve-execute" && "SITA plans, you approve, SITA executes"}
                      {mode === "autonomous" && "SITA acts within boundaries, you review after"}
                    </div>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full border-2 transition-colors", trustMode === mode ? "bg-[hsl(38_85%_58%)] border-[hsl(38_85%_58%)]" : "border-[hsl(0_0%_100%/0.2)]")} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick controls */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mb-3 flex items-center gap-1.5")}><Shield className="w-3 h-3" /> Quick Controls</h4>
          <div className="space-y-3">
            {[
              { label: "Require approval for payments > $500", defaultOn: true },
              { label: "Require approval for outbound emails", defaultOn: true },
              { label: "Allow automated follow-up reminders", defaultOn: true },
              { label: "Enable learning from my actions", defaultOn: false },
              { label: "Show proof badges on actions", defaultOn: true },
            ].map(toggle => (
              <div key={toggle.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(0_0%_100%/0.03)] transition-colors">
                <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_75%)]")}>{toggle.label}</span>
                <Switch defaultChecked={toggle.defaultOn} />
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mb-3 flex items-center gap-1.5")}><Smartphone className="w-3 h-3" /> Trusted Devices</h4>
          <div className="space-y-2">
            {displayDevices.map((dev: Record<string, any>) => (
              <StatusCard
                key={dev.id}
                label={dev.device_name}
                status={dev.status === "online" ? "healthy" : "unknown"}
                lastChecked={dev.os || dev.device_type}
                icon={dev.device_type === "mobile" || dev.device_type === "tablet" ? <Smartphone className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
              />
            ))}
          </div>
        </div>

        {/* Emergency */}
        <div className="rounded-xl border border-[hsl(0_70%_55%/0.1)] bg-[hsl(0_0%_9%)] p-4">
          <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_70%_60%)] mb-3 flex items-center gap-1.5")}><ShieldAlert className="w-3 h-3" /> Emergency Actions</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={() => setAutomationsPaused(!automationsPaused)} className="w-full justify-start text-xs gap-2 border-[hsl(38_85%_58%/0.2)] text-[hsl(38_85%_58%)]">
              {automationsPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {automationsPaused ? "Resume Automations" : "Pause All Automations"}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-[hsl(0_70%_55%/0.2)] text-[hsl(0_70%_55%)]"><Lock className="w-3 h-3" /> Lock to Suggest-Only</Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-[hsl(0_70%_55%/0.2)] text-[hsl(0_70%_55%)]"><RotateCcw className="w-3 h-3" /> Revoke All Device Trust</Button>
          </div>
        </div>
      </div>

      <ProofCard
        title="Trust Verification Chain"
        status="verified"
        chain={[
          { label: "Authentication verified", verified: true },
          { label: "Device trust established", verified: true },
          { label: "Autonomy level set", verified: true },
          { label: "Proof badges active", verified: true },
        ]}
      />

      <AdvisorCard
        advisorName="Trust Advisor"
        domain="Trust"
        insight={`Trust health: ${healthPct}% — ${debtScore < 0.1 ? "all systems nominal" : "review recommended"}. ${displayDevices.filter((d: Record<string, any>) => d.status === "online").length} devices online.`}
        confidence={debtScore < 0.1 ? 95 : 72}
        accentColor="hsl(38 85% 58%)"
      />
    </div>
  );
};

/* ── Devices Page ── */
const TrustDevicesPage = () => {
  const { user , isDemo} = useAuth();
  const { data: devices = [] } = useQuery({
    queryKey: ["trust_devices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("device_statuses").select("*").eq("user_id", user.id).order("last_seen", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const displayDevices = devices.length > 0 ? devices : [
    { id: "d1", device_name: "MacBook Pro", device_type: "desktop", os: "macOS 14.3", status: "online", last_seen: new Date().toISOString(), ip_address: "192.168.1.5" },
    { id: "d2", device_name: "iPhone 15 Pro", device_type: "mobile", os: "iOS 17.4", status: "online", last_seen: new Date(Date.now() - 300000).toISOString() },
    { id: "d3", device_name: "iPad Air", device_type: "tablet", os: "iPadOS 17.3", status: "offline", last_seen: new Date(Date.now() - 86400000).toISOString() },
  ];

  return (
    <div className="space-y-3">
      {displayDevices.map((dev: Record<string, any>) => (
        <div key={dev.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", dev.status === "online" ? "bg-[hsl(152_55%_48%/0.12)]" : "bg-[hsl(0_0%_100%/0.04)]")}>
            {dev.device_type === "mobile" || dev.device_type === "tablet" ? <Smartphone className={cn("w-5 h-5", dev.status === "online" ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_50%)]")} /> :
              <Globe className={cn("w-5 h-5", dev.status === "online" ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_50%)]")} />}
          </div>
          <div className="flex-1">
            <div className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>{dev.device_name}</div>
            <div className={cn(SITA_TYPE.timelineMeta)}>{dev.os} {dev.ip_address ? `· ${dev.ip_address}` : ""}</div>
          </div>
          <div className={cn("flex items-center gap-1.5 text-xs", dev.status === "online" ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_50%)]")}>
            {dev.status === "online" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {dev.status}
          </div>
          <Button size="sm" variant="outline" className="text-xs border-[hsl(0_70%_55%/0.2)] text-[hsl(0_70%_55%)]">Revoke</Button>
        </div>
      ))}
    </div>
  );
};

/* ── Placeholder ── */
const TrustPlaceholderPage = ({ title }: { title: string }) => (
  <EmptyState icon={Shield} title={`${title} Settings`} description={`Detailed ${title.toLowerCase()} controls and history`} />
);

/* ── Page Map ── */
const trustPages: Record<SubPage, React.ComponentType> = {
  overview: TrustOverviewPage,
  autonomy: () => <TrustPlaceholderPage title="Autonomy" />,
  devices: TrustDevicesPage,
  permissions: () => <TrustPlaceholderPage title="Permissions" />,
  proof: () => <TrustPlaceholderPage title="Proof Log" />,
  audit: () => <TrustPlaceholderPage title="Audit Trail" />,
  settings: () => <TrustPlaceholderPage title="Trust Settings" />,
};

const TrustCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "overview") navigate("/trust");
    else navigate(`/trust/${key}`);
  };

  const PageComponent = trustPages[activePage];

  return (
    <AppOpenTransition>
      <DomainAppShell domain={DOMAIN_CONFIG} activePage={activePage} onNavigate={goTo} tabGroups={TAB_GROUPS}>
        <h1 className="sr-only">Trust Center</h1>
        <AnimatePresence mode="wait">
          <motion.div key={activePage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </DomainAppShell>
    </AppOpenTransition>
  );
};

const TrustCenterWithBoundary = () => (
  <GlobalErrorBoundary><TrustCenter /></GlobalErrorBoundary>
);

export default TrustCenterWithBoundary;
