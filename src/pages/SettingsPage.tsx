// ═══════════════════════════════════════════════════════════════
// SITA OS — System Settings
// The governing control center of the operating environment
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { KPITile } from "@/components/sita/SitaComponents";
import { Progress } from "@/components/ui/progress";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const db: any = supabase;
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  User, Shield, Bell, Palette, Eye, Lock, Globe, Sliders, Brain, Heart,
  ToggleLeft, ToggleRight, Zap, DollarSign, Workflow, TrendingUp, FileText,
  ChevronRight, Check, AlertTriangle, Clock, Wifi, Download, Trash2, ShieldAlert,
  Settings, Home, Users, Monitor, Smartphone, Key, Volume2, VolumeX,
  HelpCircle, Wrench, Database, RefreshCw, Cpu, Search
} from "lucide-react";
import { useDemoMode } from "@/hooks/use-brain-core";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GovernanceSimulatorService, type SimulationResult } from "@/lib/core-services/governance-simulator";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

type SettingsSection = "identity" | "trust" | "privacy" | "advisors" | "integrations" | "appearance" |
  "notifications" | "devices" | "household" | "business" | "workflows" | "backup" | "support";

const settingsSections: { key: SettingsSection; label: string; icon: typeof Settings; description: string }[] = [
  { key: "identity", label: "Identity", icon: User, description: "Profile, account, and environment" },
  { key: "trust", label: "Trust & Security", icon: Shield, description: "Trust mode, approvals, and boundaries" },
  { key: "privacy", label: "Privacy", icon: Lock, description: "Data visibility, learning, and export" },
  { key: "advisors", label: "Advisors & AI", icon: Brain, description: "AI behavior, autonomy, and budget" },
  { key: "notifications", label: "Notifications", icon: Bell, description: "Urgency, channels, and quiet mode" },
  { key: "integrations", label: "Integrations", icon: Globe, description: "Connected services and sync" },
  { key: "appearance", label: "Appearance", icon: Palette, description: "Theme, density, and display" },
  { key: "devices", label: "Devices", icon: Monitor, description: "Trusted devices and sessions" },
  { key: "household", label: "Household", icon: Home, description: "Family, shared users, and roles" },
  { key: "business", label: "Business Rules", icon: TrendingUp, description: "Pipeline, follow-up, and policies" },
  { key: "workflows", label: "Workflows", icon: Workflow, description: "Automations and routines" },
  { key: "backup", label: "Backup & Recovery", icon: Database, description: "Data backup and restore" },
  { key: "support", label: "Support & Diagnostics", icon: HelpCircle, description: "Help, diagnostics, and issues" },
];

/* ── Toggle Setting ──────────────────────────────── */
const ToggleSetting = ({ label, description, enabled, onChange }: {
  label: string; description: string; enabled: boolean; onChange: () => void;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <button onClick={onChange} className={cn("relative h-6 w-11 rounded-full transition-colors", enabled ? "bg-primary" : "bg-muted")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform left-0.5")}
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  </div>
);

/* ── Choice Group ────────────────────────────────── */
const ChoiceGroup = ({ label, options, value, onChange }: {
  label: string; options: { key: string; label: string; desc?: string }[]; value: string; onChange: (v: string) => void;
}) => (
  <div className="py-3 border-b border-border last:border-0">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map(opt => (
        <button key={opt.key} onClick={() => onChange(opt.key)} className={cn(
          "rounded-xl border p-3 text-left transition-all",
          value === opt.key ? "border-primary/40 bg-primary/8" : "border-border hover:border-primary/20"
        )}>
          <p className={cn("text-xs font-medium", value === opt.key ? "text-primary" : "text-foreground")}>{opt.label}</p>
          {opt.desc && <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>}
        </button>
      ))}
    </div>
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const { isLoading, toggleDemoMode } = useDemoMode();
  const [activeSection, setActiveSection] = useState<SettingsSection>("identity");
  const [autonomy, setAutonomy] = useState("simulate-first");
  const [confidence, setConfidence] = useState("70");
  const [budgetMode, setBudgetMode] = useState("standard");
  const [simPref, setSimPref] = useState("smart");
  const [contradictions, setContradictions] = useState("always");
  const [notifFreq, setNotifFreq] = useState("realtime");
  const [docRetention, setDocRetention] = useState("7years");
  const [piiRedaction, setPiiRedaction] = useState(false);
  const [largeFontMode, setLargeFontMode] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(true);
  const [trustMode, setTrustMode] = useState("balanced");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditResult, setAuditResult] = useState<SimulationResult | null>(null);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await (db as any).from("profiles").select("*").eq("user_id", user!.id).single();
      if (data?.display_name) setDisplayName(data.display_name);
      return data;
    },
  });

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await (db as any).from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch devices
  const { data: devices = [] } = useQuery({
    queryKey: ["settings_devices", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await (db as any).from("device_statuses").select("*").order("last_seen", { ascending: false }).limit(10);
      return data || [];
    },
  });

  // Fetch connectors
  const { data: connectors = [] } = useQuery({
    queryKey: ["settings_connectors", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await (db as any).from("connector_configs").select("*").order("updated_at", { ascending: false });
      return data || [];
    },
  });

  const handleToggle = () => {
    toggleDemoMode();
    toast.success(isDemoMode ? "Switched to Live Mode" : "Switched to Demo Mode");
  };

  const runAudit = () => {
    const gov = new GovernanceSimulatorService();
    const result = gov.runComplianceAudit([
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "high", amount: 8000 },
      { domain: "finance", capabilityId: "finance.budget.update", riskTier: "medium", amount: 500 },
      { domain: "business", capabilityId: "crm.lead.update", riskTier: "low" },
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "critical", amount: 50000 },
    ]);
    setAuditResult(result);
    toast.success(`Audit complete — ${(result.summary.overallCompliance * 100).toFixed(0)}% compliant`);
  };

  const filteredSections = searchQuery
    ? settingsSections.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : settingsSections;

  const renderSection = () => {
    switch (activeSection) {
      case "identity":
        return (
          <SitaCard hover={false} className="p-5">
      <DemoModeBadge />
            <SitaCardTitle sub="Your profile and environment identity">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Identity & Profile</div>
            </SitaCardTitle>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="text-sm font-semibold text-foreground bg-transparent border-b border-transparent focus:border-primary/40 outline-none w-full"
                  />
                  <p className="text-xs text-muted-foreground">{user?.email || "Demo User"}</p>
                </div>
                <SitaButton variant="primary" size="sm" onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </SitaButton>
              </div>
              {/* Intelligence mode */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/8 p-2"><Brain className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Intelligence Mode</p>
                    <p className="text-xs text-muted-foreground">{isDemoMode ? "Demo — sample data" : "Live — real intelligence"}</p>
                  </div>
                </div>
                <button onClick={handleToggle} disabled={isLoading}
                  className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]",
                    isDemoMode ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                  )}>
                  {isDemoMode ? <><ToggleLeft className="h-4 w-4" /><span>Demo</span></> : <><ToggleRight className="h-4 w-4" /><span>Live</span></>}
                </button>
              </div>
            </div>
          </SitaCard>
        );

      case "trust":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Control trust behavior and approval boundaries">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Trust & Security</div>
            </SitaCardTitle>
            <div className="mt-4">
              <ChoiceGroup label="Trust Mode" value={trustMode} onChange={setTrustMode} options={[
                { key: "cautious", label: "Cautious", desc: "Approve everything" },
                { key: "balanced", label: "Balanced", desc: "Smart thresholds" },
                { key: "confident", label: "Confident", desc: "Auto-execute routine" },
              ]} />
              <ChoiceGroup label="Simulation Preference" value={simPref} onChange={setSimPref} options={[
                { key: "always", label: "Always Simulate" },
                { key: "smart", label: "Smart (High-risk)" },
                { key: "never", label: "Skip" },
              ]} />
              <div className="py-4">
                <SitaButton variant="secondary" size="sm" onClick={runAudit}>
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Run Compliance Audit
                </SitaButton>
                {auditResult && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                      <p className={cn("font-display text-lg font-bold", auditResult.summary.overallCompliance >= 0.8 ? "text-trust-safe" : "text-accent")}>{(auditResult.summary.overallCompliance * 100).toFixed(0)}%</p>
                      <p className="text-[10px] text-muted-foreground">Compliance</p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                      <p className="font-display text-lg font-bold text-destructive">{auditResult.summary.blocked}</p>
                      <p className="text-[10px] text-muted-foreground">Blocked</p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                      <p className="font-display text-lg font-bold text-accent">{auditResult.summary.riskBreaches}</p>
                      <p className="text-[10px] text-muted-foreground">Risk Flags</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SitaCard>
        );

      case "privacy":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Data access, retention, and controls">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Privacy & Security</div>
            </SitaCardTitle>
            <div className="mt-4">
              <ChoiceGroup label="Document Retention" value={docRetention} onChange={setDocRetention} options={[
                { key: "1year", label: "1 Year" },
                { key: "7years", label: "7 Years", desc: "Financial default" },
                { key: "forever", label: "Forever" },
              ]} />
              <ToggleSetting label="PII Redaction" description="Strip names from documents before AI processing" enabled={piiRedaction} onChange={() => setPiiRedaction(!piiRedaction)} />
              <div className="py-3 space-y-2">
                <button className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80 transition-colors w-full">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export All Data (JSON)
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive hover:bg-destructive/20 transition-colors w-full">
                  <Trash2 className="h-3.5 w-3.5" /> Delete All Data
                </button>
              </div>
            </div>
          </SitaCard>
        );

      case "advisors":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Control how SITA acts on your behalf">
              <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Behavior</div>
            </SitaCardTitle>
            <div className="mt-4">
              <ChoiceGroup label="Autonomy Level" value={autonomy} onChange={setAutonomy} options={[
                { key: "always-ask", label: "Always Ask", desc: "Every action needs approval" },
                { key: "simulate-first", label: "Simulate First", desc: "AI simulates, you approve" },
                { key: "trusted", label: "Trusted", desc: "Routine tasks auto-execute" },
              ]} />
              <ChoiceGroup label="Contradiction Display" value={contradictions} onChange={setContradictions} options={[
                { key: "always", label: "Show All" },
                { key: "major", label: "Major Only" },
                { key: "hide", label: "Hide" },
              ]} />
              <div className="py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confidence Threshold</p>
                <div className="flex items-center gap-3">
                  <input type="range" min="30" max="95" step="5" value={confidence} onChange={e => setConfidence(e.target.value)}
                    className="flex-1 h-1.5 rounded-full bg-secondary accent-primary" />
                  <span className="text-sm font-semibold text-foreground w-10 text-right">{confidence}%</span>
                </div>
              </div>
              {/* Budget */}
              <ChoiceGroup label="Budget Mode" value={budgetMode} onChange={setBudgetMode} options={[
                { key: "conservative", label: "$10–$20/mo", desc: "Key decisions only" },
                { key: "standard", label: "$50/mo", desc: "Full access" },
                { key: "premium", label: "$200+/mo", desc: "Unlimited" },
              ]} />
              <div className="py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Spend</p>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-display text-lg font-bold gradient-sita-text">$4.32</span>
                  <span className="text-xs text-muted-foreground">of $50.00 (9%)</span>
                </div>
                <Progress value={9} className="h-1.5" />
              </div>
            </div>
          </SitaCard>
        );

      case "notifications":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Alert preferences and timing">
              <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</div>
            </SitaCardTitle>
            <div className="mt-4">
              <ChoiceGroup label="Frequency" value={notifFreq} onChange={setNotifFreq} options={[
                { key: "realtime", label: "Real-time" },
                { key: "daily", label: "Daily Digest" },
                { key: "weekly", label: "Weekly" },
              ]} />
              <ToggleSetting label="Do Not Disturb" description="Silence notifications 10pm–7am" enabled={dndEnabled} onChange={() => setDndEnabled(!dndEnabled)} />
              <div className="py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alert Types</p>
                <div className="space-y-1">
                  {["Threshold breaches", "Contradictions", "New opportunities", "Automations completed", "Approval requests", "Follow-up risks", "System issues"].map(a => (
                    <label key={a} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-border accent-primary" /> {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SitaCard>
        );

      case "integrations":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="External integrations and sync">
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Connections</div>
            </SitaCardTitle>
            <div className="mt-4 space-y-2">
              {(connectors.length > 0 ? connectors : [
                { service: "Gmail", status: "active", last_sync_at: new Date(Date.now() - 120000).toISOString() },
                { service: "Stripe", status: "active", last_sync_at: new Date(Date.now() - 300000).toISOString() },
                { service: "QuickBooks", status: "inactive", last_sync_at: null },
                { service: "Google Calendar", status: "active", last_sync_at: new Date(Date.now() - 60000).toISOString() },
              ]).map((conn: any) => (
                <div key={conn.service} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <Wifi className={cn("h-4 w-4", conn.status === "active" ? "text-trust-verified" : "text-muted-foreground")} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{conn.service}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {conn.last_sync_at ? `Synced ${new Date(conn.last_sync_at).toLocaleTimeString()}` : "Never synced"}
                      </p>
                    </div>
                  </div>
                  <TrustBadge level={conn.status === "active" ? "verified" : "degraded"} label={conn.status === "active" ? "Connected" : "Disconnected"} size="sm" />
                </div>
              ))}
            </div>
          </SitaCard>
        );

      case "appearance":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Theme, density, and display">
              <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</div>
            </SitaCardTitle>
            <div className="mt-4">
              <ToggleSetting label="Large Font Mode" description="Increase body text for comfortable reading" enabled={largeFontMode} onChange={() => setLargeFontMode(!largeFontMode)} />
              <div className="py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
                <div className="space-y-1.5 text-[11px]">
                  {[["Command Palette", "⌘K"], ["Focus Mode", "⌘."], ["Calm Mode", "⌘,"], ["Search", "⌘/"], ["Quick Capture", "⌘N"]].map(([label, shortcut]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">{shortcut}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SitaCard>
        );

      case "devices":
        return (
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Trusted devices and sessions">
              <div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> Devices</div>
            </SitaCardTitle>
            <div className="mt-4 space-y-2">
              {(devices.length > 0 ? devices : [
                { device_name: "MacBook Pro", device_type: "laptop", os: "macOS 15", status: "online", last_seen: new Date().toISOString() },
                { device_name: "iPhone 16", device_type: "phone", os: "iOS 19", status: "online", last_seen: new Date(Date.now() - 300000).toISOString() },
              ]).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    {d.device_type === "phone" ? <Smartphone className="h-4 w-4 text-primary" /> : <Monitor className="h-4 w-4 text-primary" />}
                    <div>
                      <p className="text-xs font-medium text-foreground">{d.device_name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.os} · Last seen {new Date(d.last_seen).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <TrustBadge level={d.status === "online" ? "verified" : "degraded"} label={d.status} size="sm" />
                </div>
              ))}
            </div>
          </SitaCard>
        );

      default:
        return (
          <SitaCard hover={false} className="p-8 text-center">
            <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{settingsSections.find(s => s.key === activeSection)?.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{settingsSections.find(s => s.key === activeSection)?.description}</p>
            <p className="text-xs text-muted-foreground mt-3">Configure from your environment settings</p>
          </SitaCard>
        );
    }
  };

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DomainHeader
        title="Settings"
        subtitle="Control every aspect of your operating environment"
        icon={Settings}
        domain="system"
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left nav */}
        <div className="space-y-1">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {filteredSections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  activeSection === section.key
                    ? "bg-primary/8 border border-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", activeSection === section.key ? "text-primary" : "")} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{section.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{section.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {renderSection()}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
