// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Center (App-in-OS Shell)
// ═══════════════════════════════════════════════════════════════

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
import { useDataMode } from "@/contexts/DataModeContext";
import { TrustDebtEngine } from "@/lib/engines/trust-debt-engine";
import { cn } from "@/lib/utils";
import {
  Shield, LayoutDashboard, Smartphone, Key, Lock, Eye, Settings,
  ShieldCheck, ShieldAlert, Wifi, WifiOff, Globe, Pause, Play,
  RotateCcw, FileText, Clock, CheckCircle, AlertTriangle
} from "lucide-react";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";

const DOMAIN_CONFIG: DomainConfig = {
  id: "trust" as any,
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
  {
    label: "Overview",
    tabs: [
      { key: "overview", label: "Dashboard", icon: LayoutDashboard },
      { key: "autonomy", label: "Autonomy", icon: Key },
    ],
  },
  {
    label: "Access",
    tabs: [
      { key: "devices", label: "Devices", icon: Smartphone },
      { key: "permissions", label: "Permissions", icon: Lock },
    ],
  },
  {
    label: "Audit",
    tabs: [
      { key: "proof", label: "Proof Log", icon: FileText },
      { key: "audit", label: "Audit Trail", icon: Eye },
    ],
  },
  {
    label: "System",
    tabs: [
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

/* ── Overview Page ── */
const TrustOverviewPage = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const [automationsPaused, setAutomationsPaused] = useState(false);
  const [trustMode, setTrustMode] = useState<"suggest" | "approve-execute" | "autonomous">("approve-execute");

  const trustDebtEngine = useMemo(() => new TrustDebtEngine(), []);
  const debtScore = useMemo(() => trustDebtEngine.computeDebtScore(), [trustDebtEngine]);

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
    <div className="space-y-6">
      {/* Trust Score Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SitaCard className="p-5 bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400">Trust Posture: Secure</div>
                <div className="text-xs text-muted-foreground">{displayDevices.filter((d: Record<string, any>) => d.status === "online").length} devices online · Approvals up to date</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div><div className={cn("text-2xl font-bold", debtScore === 0 ? "text-emerald-400" : debtScore < 0.3 ? "text-amber-400" : "text-destructive")}>{Math.round((1 - debtScore) * 100)}%</div><div className="text-[10px] text-muted-foreground">Trust Health</div></div>
              <div><div className="text-2xl font-bold">{displayDevices.length}</div><div className="text-[10px] text-muted-foreground">Devices</div></div>
            </div>
          </div>
        </SitaCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Autonomy level */}
        <SitaCard className="p-4">
          <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><Key className="w-3 h-3" /> Autonomy Level</SitaCardTitle>
          <div className="space-y-2">
            {(["suggest", "approve-execute", "autonomous"] as const).map(mode => (
              <button key={mode} onClick={() => setTrustMode(mode)} className={cn("w-full text-left p-3 rounded-xl border transition-all", trustMode === mode ? "bg-primary/10 border-primary/30" : "border-border/20 hover:bg-accent/20")}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium capitalize">{mode.replace("-", " & ")}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {mode === "suggest" && "SITA suggests, you decide and execute everything"}
                      {mode === "approve-execute" && "SITA plans, you approve, SITA executes"}
                      {mode === "autonomous" && "SITA acts within boundaries, you review after"}
                    </div>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full border-2 transition-colors", trustMode === mode ? "bg-primary border-primary" : "border-border/50")} />
                </div>
              </button>
            ))}
          </div>
        </SitaCard>

        {/* Quick toggles */}
        <SitaCard className="p-4">
          <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Quick Controls</SitaCardTitle>
          <div className="space-y-3">
            {[
              { label: "Require approval for payments > $500", key: "payments", defaultOn: true },
              { label: "Require approval for outbound emails", key: "emails", defaultOn: true },
              { label: "Allow automated follow-up reminders", key: "reminders", defaultOn: true },
              { label: "Enable learning from my actions", key: "learning", defaultOn: false },
              { label: "Show proof badges on actions", key: "proof", defaultOn: true },
            ].map(toggle => (
              <div key={toggle.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 transition-colors">
                <span className="text-xs">{toggle.label}</span>
                <Switch defaultChecked={toggle.defaultOn} />
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Devices */}
        <SitaCard className="p-4">
          <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> Trusted Devices</SitaCardTitle>
          <div className="space-y-2">
            {displayDevices.map((dev: Record<string, any>) => (
              <div key={dev.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                <div className={cn("w-2 h-2 rounded-full", dev.status === "online" ? "bg-emerald-400" : "bg-muted-foreground/30")} />
                <div className="flex-1">
                  <div className="text-xs font-medium">{dev.device_name}</div>
                  <div className="text-[10px] text-muted-foreground">{dev.os || dev.device_type}</div>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 border-border/20">{dev.status}</Badge>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Emergency */}
        <SitaCard className="p-4 border-red-500/10">
          <SitaCardTitle className="text-xs mb-3 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-red-400" /> Emergency Actions</SitaCardTitle>
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={() => setAutomationsPaused(!automationsPaused)}
              className={cn("w-full justify-start text-xs gap-2", automationsPaused ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "border-amber-500/20 text-amber-400 hover:bg-amber-500/10")}>
              {automationsPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {automationsPaused ? "Resume Automations" : "Pause All Automations"}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"><Lock className="w-3 h-3" /> Lock to Suggest-Only</Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"><RotateCcw className="w-3 h-3" /> Revoke All Device Trust</Button>
          </div>
        </SitaCard>
      </div>

      <DomainAdvisorCard
        domain="trust" as any
        advisorName="Trust Advisor"
        advisorRole="System Integrity & Governance"
        insights={[
          { label: "Trust health", value: `${Math.round((1 - debtScore) * 100)}%`, trend: debtScore < 0.1 ? "stable" : "down" },
          { label: "Devices online", value: String(displayDevices.filter((d: Record<string, any>) => d.status === "online").length) },
        ]}
        recommendation="All systems nominal. Consider reviewing device trust quarterly and rotating approval thresholds."
        confidence={debtScore < 0.1 ? 95 : debtScore < 0.3 ? 78 : 55}
      />
    </div>
  );
};

/* ── Devices Page ── */
const TrustDevicesPage = () => {
  const { user } = useAuth();
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
        <SitaCard key={dev.id} className="p-4" hover>
          <div className="flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", dev.status === "online" ? "bg-emerald-500/15" : "bg-muted/20")}>
              {dev.device_type === "mobile" || dev.device_type === "tablet" ? <Smartphone className={cn("w-5 h-5", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")} /> :
                <Globe className={cn("w-5 h-5", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")} />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{dev.device_name}</div>
              <div className="text-xs text-muted-foreground">{dev.os} {dev.ip_address ? `· ${dev.ip_address}` : ""}</div>
            </div>
            <div className={cn("flex items-center gap-1.5 text-xs", dev.status === "online" ? "text-emerald-400" : "text-muted-foreground")}>
              {dev.status === "online" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {dev.status}
            </div>
            <Button size="sm" variant="outline" className="text-xs border-red-500/20 text-red-400 hover:bg-red-500/10">Revoke</Button>
          </div>
        </SitaCard>
      ))}
    </div>
  );
};

/* ── Placeholder Page ── */
const TrustPlaceholderPage = ({ title }: { title: string }) => (
  <EmptyState icon={Shield} title={`${title} Settings`} description={`Detailed ${title.toLowerCase()} controls and history will be available here`} />
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
      <DomainAppShell
        domain={DOMAIN_CONFIG}
        activePage={activePage}
        onNavigate={goTo}
        tabGroups={TAB_GROUPS}
      >
        <h1 className="sr-only">Trust Center</h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </DomainAppShell>
    </AppOpenTransition>
  );
};

const TrustCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <TrustCenter />
  </GlobalErrorBoundary>
);

export default TrustCenterWithBoundary;
