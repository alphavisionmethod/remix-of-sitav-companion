// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Window (Unified, Full Nova SDK)
// Single source of truth for ALL settings — 26 sections, 8 groups
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import {
  User, Shield, Key, Settings, Palette, Monitor, Eye, Lock, Bell, Volume2,
  Wifi, Bluetooth, Cloud, Globe, Keyboard, Brain, DollarSign, BellOff,
  Home, TrendingUp, Workflow, Database, Download, HelpCircle, Info,
  Activity, Accessibility, Smartphone, LayoutGrid,
} from "lucide-react";
import { AppLayout, VStack } from "@/platform/nova-sdk/ui/layout";
import { NovaList, NovaSectionLabel, NovaToolbar } from "@/platform/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { SettingsSearch } from "./settings/shared";

// Sub-section imports
import { ProfileContent, SecurityContent, ConnectedAccountsContent } from "./settings/AccountSections";
import { GeneralContent, AppearanceContent, DisplayContent, AccessibilityContent, OperatingModesContent, DeviceModeContent, WidgetsContent } from "./settings/SystemSections";
import { NetworkContent, BluetoothContent, CloudSyncContent, IntegrationsContent } from "./settings/ConnectivitySections";
import { SoundContent, KeyboardContent } from "./settings/SoundInputSections";
import { AdvisorsAIContent, PlanUsageContent } from "./settings/AISections";
import { NotificationsContent } from "./settings/NotificationSections";
import { PrivacyContent, TrustSecurityContent, DevicesSessionsContent } from "./settings/PrivacyTrustSections";
import { HouseholdContent, BusinessRulesContent, WorkflowsContent, BackupRecoveryContent, SystemUpdatesContent, SupportDiagnosticsContent, AboutContent } from "./settings/AdvancedSections";

// ── Section definitions (26 sections, 8 groups) ─────────────

const SECTIONS = [
  // Account
  { id: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5" />, group: "Account" },
  { id: "security", label: "Security", icon: <Shield className="h-3.5 w-3.5" />, group: "Account" },
  { id: "connected", label: "Connected Accounts", icon: <Key className="h-3.5 w-3.5" />, group: "Account" },
  // System
  { id: "general", label: "General", icon: <Settings className="h-3.5 w-3.5" />, group: "System" },
  { id: "appearance", label: "Appearance", icon: <Palette className="h-3.5 w-3.5" />, group: "System" },
  { id: "display", label: "Display", icon: <Monitor className="h-3.5 w-3.5" />, group: "System" },
  { id: "accessibility", label: "Accessibility", icon: <Accessibility className="h-3.5 w-3.5" />, group: "System" },
  { id: "opmodes", label: "Operating Modes", icon: <Activity className="h-3.5 w-3.5" />, group: "System" },
  { id: "devicemode", label: "Device Mode", icon: <Lock className="h-3.5 w-3.5" />, group: "System" },
  { id: "widgets", label: "Desktop Widgets", icon: <LayoutGrid className="h-3.5 w-3.5" />, group: "System" },
  // Connectivity
  { id: "network", label: "Network", icon: <Wifi className="h-3.5 w-3.5" />, group: "Connectivity" },
  { id: "bluetooth", label: "Bluetooth", icon: <Bluetooth className="h-3.5 w-3.5" />, group: "Connectivity" },
  { id: "cloudsync", label: "Cloud & Sync", icon: <Cloud className="h-3.5 w-3.5" />, group: "Connectivity" },
  { id: "integrations", label: "Integrations", icon: <Globe className="h-3.5 w-3.5" />, group: "Connectivity" },
  // Sound & Input
  { id: "sound", label: "Sound", icon: <Volume2 className="h-3.5 w-3.5" />, group: "Sound & Input" },
  { id: "keyboard", label: "Keyboard", icon: <Keyboard className="h-3.5 w-3.5" />, group: "Sound & Input" },
  // AI & Intelligence
  { id: "advisors", label: "Advisors & AI", icon: <Brain className="h-3.5 w-3.5" />, group: "AI & Intelligence" },
  { id: "planusage", label: "Plan & Usage", icon: <DollarSign className="h-3.5 w-3.5" />, group: "AI & Intelligence" },
  // Notifications
  { id: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" />, group: "Notifications" },
  // Privacy & Trust
  { id: "privacy", label: "Privacy", icon: <Eye className="h-3.5 w-3.5" />, group: "Privacy & Trust" },
  { id: "trustsec", label: "Trust & Security", icon: <Shield className="h-3.5 w-3.5" />, group: "Privacy & Trust" },
  { id: "devices", label: "Devices & Sessions", icon: <Smartphone className="h-3.5 w-3.5" />, group: "Privacy & Trust" },
  // Advanced
  { id: "household", label: "Household", icon: <Home className="h-3.5 w-3.5" />, group: "Advanced" },
  { id: "business", label: "Business Rules", icon: <TrendingUp className="h-3.5 w-3.5" />, group: "Advanced" },
  { id: "workflows", label: "Workflows", icon: <Workflow className="h-3.5 w-3.5" />, group: "Advanced" },
  { id: "backup", label: "Backup & Recovery", icon: <Database className="h-3.5 w-3.5" />, group: "Advanced" },
  { id: "updates", label: "System Updates", icon: <Download className="h-3.5 w-3.5" />, group: "Advanced" },
  { id: "support", label: "Support", icon: <HelpCircle className="h-3.5 w-3.5" />, group: "Advanced" },
  { id: "about", label: "About", icon: <Info className="h-3.5 w-3.5" />, group: "Advanced" },
];

const GROUPS = ["Account", "System", "Connectivity", "Sound & Input", "AI & Intelligence", "Notifications", "Privacy & Trust", "Advanced"];

// ── Content map ────────────────────────────────────────────

const CONTENT: Record<string, () => JSX.Element> = {
  profile: ProfileContent,
  security: SecurityContent,
  connected: ConnectedAccountsContent,
  general: GeneralContent,
  appearance: AppearanceContent,
  display: DisplayContent,
  accessibility: AccessibilityContent,
  opmodes: OperatingModesContent,
  devicemode: DeviceModeContent,
  widgets: WidgetsContent,
  network: NetworkContent,
  bluetooth: BluetoothContent,
  cloudsync: CloudSyncContent,
  integrations: IntegrationsContent,
  sound: SoundContent,
  keyboard: KeyboardContent,
  advisors: AdvisorsAIContent,
  planusage: PlanUsageContent,
  notifications: NotificationsContent,
  privacy: PrivacyContent,
  trustsec: TrustSecurityContent,
  devices: DevicesSessionsContent,
  household: HouseholdContent,
  business: BusinessRulesContent,
  workflows: WorkflowsContent,
  backup: BackupRecoveryContent,
  updates: SystemUpdatesContent,
  support: SupportDiagnosticsContent,
  about: AboutContent,
};

// ── Main component ─────────────────────────────────────────

export function SettingsWindow() {
  const [active, setActive] = useState("profile");
  const [search, setSearch] = useState("");
  const Content = CONTENT[active] || ProfileContent;
  const activeSection = SECTIONS.find(s => s.id === active);

  // Deep link navigation: listen for sita-settings-navigate events from DeepLink buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const section = (e as CustomEvent).detail?.section;
      if (section && CONTENT[section]) {
        setActive(section);
        setSearch("");
      }
    };
    window.addEventListener("sita-settings-navigate", handler);
    return () => window.removeEventListener("sita-settings-navigate", handler);
  }, []);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return SECTIONS.filter(s =>
      s.label.toLowerCase().includes(q) || s.group.toLowerCase().includes(q)
    );
  }, [search]);

  const sidebar = (
    <VStack spacing="tight" className="h-full">
      <SettingsSearch value={search} onChange={setSearch} />
      {filteredSections ? (
        // Search results mode
        <div>
          <NovaSectionLabel className="!text-[8px]">Results ({filteredSections.length})</NovaSectionLabel>
          <NovaList
            items={filteredSections.map(s => ({ id: s.id, label: s.label, icon: s.icon }))}
            activeId={active}
            onSelect={(id) => { setActive(id); setSearch(""); }}
          />
        </div>
      ) : (
        // Normal grouped mode
        GROUPS.map(group => {
          const items = SECTIONS.filter(s => s.group === group);
          return (
            <div key={group}>
              <NovaSectionLabel className="!text-[8px]">{group}</NovaSectionLabel>
              <NovaList
                items={items.map(s => ({ id: s.id, label: s.label, icon: s.icon }))}
                activeId={active}
                onSelect={setActive}
              />
            </div>
          );
        })
      )}
    </VStack>
  );

  const toolbar = (
    <NovaToolbar
      title={activeSection?.label || "Settings"}
      leading={activeSection?.icon && (
        <span className="text-[hsl(var(--primary))]">{activeSection.icon}</span>
      )}
    />
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(0_0%_45%)] to-[hsl(0_0%_35%)]">
      <AppLayout sidebar={sidebar} sidebarWidth={170} toolbar={toolbar} minHeight={340}>
        <Content />
      </AppLayout>
    </AppStateWrapper>
  );
}
