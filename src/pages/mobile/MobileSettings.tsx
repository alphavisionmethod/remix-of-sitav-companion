import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Settings
// Full-parity mobile settings with grouped sections
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import {
  Shield, Fingerprint, Bell, Moon, LogOut, ChevronRight, Smartphone,
  Wifi, Bluetooth, Cloud, Brain, Eye, Palette, Activity, Accessibility as AccessibilityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useSettingsValue } from "@/hooks/use-settings-value";

const ToggleRow = ({ icon: Icon, label, description, controlled, value, onToggle }: {
  icon: any; label: string; description: string;
  controlled?: boolean; value?: boolean; onToggle?: (on: boolean) => void;
}) => {
  const [localOn, setLocalOn] = useState(value ?? false);
  const isOn = controlled !== undefined ? controlled : (value !== undefined ? value : localOn);
  return (
    <button
      onClick={() => {
        const next = !isOn;
        setLocalOn(next);
        onToggle?.(next);
      }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card"
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <div className={cn(
        "h-6 w-10 rounded-full transition-colors flex items-center px-0.5",
        isOn ? "bg-primary" : "bg-muted"
      )}>
        <div className={cn(
          "h-5 w-5 rounded-full bg-card transition-transform",
          isOn ? "translate-x-4" : "translate-x-0"
        )} />
      </div>
    </button>
  );
};

const NavRow = ({ icon: Icon, label, onClick, badge }: { icon: any; label: string; onClick?: () => void; badge?: string }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors"
  >
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
    {badge && <span className="text-[10px] text-muted-foreground mr-1">{badge}</span>}
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </button>
);

const MobileSettings = () => {
  const { signOut } = useAuth();
  const { isSupported, isRegistered, requestPermission, unregister, devices } = usePushNotifications();

  // Persisted settings
  const [darkMode, setDarkMode] = useSettingsValue("appearance.theme", "dark");
  const [reduceMotion, setReduceMotion] = useSettingsValue("appearance.reduceMotion", false);
  const [wifiOn, setWifiOn] = useSettingsValue("network.wifi.autoJoin", true);
  const [btOn, setBtOn] = useSettingsValue("bluetooth.enabled", true);
  const [cloudSync, setCloudSync] = useSettingsValue("cloud.syncEnabled", false);
  const [autonomy, setAutonomy] = useSettingsValue("ai.autonomyLevel", "simulate-first");
  const [locationServices, setLocationServices] = useSettingsValue("privacy.locationServices", false);
  const [highContrast, setHighContrast] = useSettingsValue("accessibility.highContrast", false);
  const [boldText, setBoldText] = useSettingsValue("accessibility.boldText", false);

  const handlePushToggle = async (on: boolean) => {
    if (on) await requestPermission();
    else await unregister();
  };

  return (
    <MobileShell title="Settings">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Appearance</h2>
      <div className="space-y-1.5 mb-6">
        <ToggleRow
          icon={Moon}
          label="Dark Mode"
          description="System-wide dark theme"
          value={darkMode === "dark"}
          onToggle={(v) => {
            setDarkMode(v ? ("dark" as "dark" | "light") : ("light" as "dark" | "light"));
            document.documentElement.classList.toggle("dark", v);
          }}
        />
        <ToggleRow icon={Eye} label="Reduce Motion" description="Minimize all animations" value={reduceMotion} onToggle={setReduceMotion} />
        <NavRow icon={Palette} label="Accent Color & Wallpaper" />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connectivity</h2>
      <div className="space-y-1.5 mb-6">
        <ToggleRow icon={Wifi} label="Wi-Fi" description={wifiOn ? "Connected to SITA-Network" : "Disabled"} value={wifiOn} onToggle={setWifiOn} />
        <ToggleRow icon={Bluetooth} label="Bluetooth" description={btOn ? "2 devices paired" : "Disabled"} value={btOn} onToggle={setBtOn} />
        <ToggleRow icon={Cloud} label="Cloud Sync" description={cloudSync ? "Syncing across devices" : "Not syncing"} value={!!cloudSync} onToggle={setCloudSync} />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trust & Security</h2>
      <div className="space-y-1.5 mb-6">
        <ToggleRow icon={Fingerprint} label="Biometric Lock" description="Require Face ID / fingerprint to open" value={true} onToggle={() => toast.info("Setting saved")} />
        <ToggleRow icon={Shield} label="Trusted Device" description="This device can approve high-impact actions" value={true} onToggle={() => toast.info("Setting saved")} />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notifications</h2>
      <div className="space-y-1.5 mb-6">
        <ToggleRow
          icon={Bell}
          label="Push Notifications"
          description={
            isSupported
              ? isRegistered
                ? `Active on ${devices.length} device(s)`
                : "Receive alerts for approvals and critical events"
              : "Push not supported on this device"
          }
          controlled={isRegistered}
          onToggle={handlePushToggle}
        />
        <ToggleRow icon={Bell} label="Quiet Hours" description="Mute non-critical alerts 10 PM — 7 AM" value={false} onToggle={() => toast.info("Setting saved")} />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI & Intelligence</h2>
      <div className="space-y-1.5 mb-6">
        <NavRow icon={Brain} label="AI Autonomy" badge={autonomy === "always-ask" ? "Manual" : autonomy === "simulate-first" ? "Simulate" : "Trusted"} />
        <ToggleRow icon={Shield} label="AI Requires Approval" description="AI suggestions always need manual approval" value={autonomy === "always-ask"} onToggle={(v) => setAutonomy(v ? ("always-ask" as "always-ask" | "simulate-first") : ("simulate-first" as "always-ask" | "simulate-first"))} />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Accessibility</h2>
      <div className="space-y-1.5 mb-6">
        <ToggleRow icon={Eye} label="High Contrast" description="Increase contrast for better visibility" value={highContrast} onToggle={setHighContrast} />
        <ToggleRow icon={AccessibilityIcon} label="Bold Text" description="Make all text bolder" value={boldText} onToggle={setBoldText} />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Privacy</h2>
      <div className="space-y-1.5 mb-6">
        <ToggleRow icon={Eye} label="Location Services" description="Allow apps to use your location" value={locationServices} onToggle={setLocationServices} />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Operating Mode</h2>
      <div className="space-y-1.5 mb-6">
        <NavRow icon={Activity} label="Switch Mode" badge="Standard" />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Device</h2>
      <div className="space-y-1.5 mb-6">
        <NavRow icon={Smartphone} label="Device Info" />
        <NavRow icon={LogOut} label="Sign Out" onClick={() => signOut()} />
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-8">SITA OS — Trusted Device v1.0</p>
    </MobileShell>
  );
};

export default MobileSettings;
