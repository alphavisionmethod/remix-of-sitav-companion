import { useState } from "react";
import { Monitor, Volume2, Wifi, Settings, Moon, Sun } from "lucide-react";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { NovaText, NovaList, NovaSectionLabel, NovaToggle, NovaSlider } from "@/lib/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";
import { APP_TYPE, SPACE } from "@/lib/design-system/app-window-system";

const sections = [
  { id: "general", label: "General", icon: <Settings className="h-3.5 w-3.5" /> },
  { id: "display", label: "Display", icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: "sound", label: "Sound", icon: <Volume2 className="h-3.5 w-3.5" /> },
  { id: "network", label: "Network", icon: <Wifi className="h-3.5 w-3.5" /> },
];

function SettingRow({ label, icon, iconColor, children }: { label: string; icon?: React.ReactNode; iconColor?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: SPACE.normal }}>
      <div className="flex items-center gap-2">
        {icon && <span className={cn("h-3.5 w-3.5", iconColor || "text-[hsl(0_0%_50%)]")}>{icon}</span>}
        <NovaText variant="body">{label}</NovaText>
      </div>
      {children}
    </div>
  );
}

function GeneralContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  return (
    <div>
      <SettingRow label="Dark Mode" icon={<Moon className="h-3.5 w-3.5" />} iconColor="text-[hsl(265_55%_60%)]">
        <NovaToggle checked={darkMode} onChange={setDarkMode} />
      </SettingRow>
      <SettingRow label="Notifications">
        <NovaToggle checked={notifications} onChange={setNotifications} />
      </SettingRow>
      <SettingRow label="Language">
        <NovaText variant="label" className="font-semibold" muted>English</NovaText>
      </SettingRow>
    </div>
  );
}

function DisplayContent() {
  const [brightness, setBrightness] = useState(80);
  const [nightShift, setNightShift] = useState(false);
  return (
    <div>
      <NovaSlider value={brightness} onChange={setBrightness} label="Brightness" />
      <SettingRow label="Night Shift" icon={<Sun className="h-3.5 w-3.5" />} iconColor="text-[hsl(35_80%_50%)]">
        <NovaToggle checked={nightShift} onChange={setNightShift} />
      </SettingRow>
      <SettingRow label="Resolution">
        <NovaText variant="label" className="font-semibold" muted>Default</NovaText>
      </SettingRow>
    </div>
  );
}

function SoundContent() {
  const [volume, setVolume] = useState(65);
  const [alertSounds, setAlertSounds] = useState(true);
  return (
    <div>
      <NovaSlider value={volume} onChange={setVolume} label="Volume" />
      <SettingRow label="Alert Sounds">
        <NovaToggle checked={alertSounds} onChange={setAlertSounds} />
      </SettingRow>
      <SettingRow label="Output Device">
        <NovaText variant="label" className="font-semibold" muted>Built-in Speakers</NovaText>
      </SettingRow>
    </div>
  );
}

function NetworkContent() {
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  return (
    <div>
      <SettingRow label="Wi-Fi" icon={<Wifi className="h-3.5 w-3.5" />} iconColor="text-[hsl(210_80%_55%)]">
        <NovaToggle checked={wifiOn} onChange={setWifiOn} />
      </SettingRow>
      {wifiOn && (
        <div className="mb-4 rounded-xl border border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_0%/0.02)] dark:bg-[hsl(0_0%_100%/0.03)] p-3">
          <NovaText variant="label" muted>
            Connected to <span className="font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]">SITA-Network</span>
          </NovaText>
        </div>
      )}
      <SettingRow label="Bluetooth">
        <NovaToggle checked={bluetoothOn} onChange={setBluetoothOn} />
      </SettingRow>
    </div>
  );
}

const contentMap: Record<string, () => JSX.Element> = {
  general: GeneralContent,
  display: DisplayContent,
  sound: SoundContent,
  network: NetworkContent,
};

export function SettingsWindow() {
  const [active, setActive] = useState("general");
  const Content = contentMap[active] || GeneralContent;

  const sidebarItems = sections.map(s => ({ id: s.id, label: s.label, icon: s.icon }));

  const sidebar = (
    <div>
      <NovaSectionLabel>Settings</NovaSectionLabel>
      <NovaList items={sidebarItems} activeId={active} onSelect={setActive} />
    </div>
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(0_0%_45%)] to-[hsl(0_0%_35%)]">
      <AppLayout sidebar={sidebar} sidebarWidth={160} minHeight={280}>
        <NovaText variant="title" as="h3" className="capitalize" style={{ marginBottom: SPACE.normal }}>
          {active}
        </NovaText>
        <Content />
      </AppLayout>
    </AppStateWrapper>
  );
}
