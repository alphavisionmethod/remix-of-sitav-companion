import { useState } from "react";
import { Monitor, Volume2, Wifi, Settings, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_TYPE, APP_COMPONENTS, APP_MATERIALS, SPACE } from "@/lib/design-system/app-window-system";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "display", label: "Display", icon: Monitor },
  { id: "sound", label: "Sound", icon: Volume2 },
  { id: "network", label: "Network", icon: Wifi },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all duration-150",
        checked
          ? "bg-[hsl(210_80%_55%)] shadow-[0_0_8px_hsl(210_80%_55%/0.3)]"
          : "bg-[hsl(0_0%_75%)] dark:bg-[hsl(0_0%_30%)]"
      )}
    >
      <div className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-[hsl(0_0%_100%)] shadow-sm transition-transform duration-150",
        checked ? "left-[18px]" : "left-0.5"
      )} />
    </button>
  );
}

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div style={{ marginBottom: SPACE.tight }}>
      <div className="flex items-center justify-between mb-1">
        <span className={cn(APP_TYPE.label, "text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]")}>{label}</span>
        <span className={cn(APP_TYPE.label, "font-semibold text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]")}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-[hsl(0_0%_80%)] dark:bg-[hsl(0_0%_25%)] accent-[hsl(210_80%_55%)] cursor-pointer"
      />
    </div>
  );
}

function SettingRow({ label, icon: Icon, iconColor, children }: { label: string; icon?: React.ElementType; iconColor?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: SPACE.normal }}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("h-3.5 w-3.5", iconColor || "text-[hsl(0_0%_50%)]")} />}
        <span className={cn(APP_TYPE.body, "text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]")}>{label}</span>
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
      <SettingRow label="Dark Mode" icon={Moon} iconColor="text-[hsl(265_55%_60%)]">
        <Toggle checked={darkMode} onChange={setDarkMode} />
      </SettingRow>
      <SettingRow label="Notifications">
        <Toggle checked={notifications} onChange={setNotifications} />
      </SettingRow>
      <SettingRow label="Language">
        <span className={cn(APP_TYPE.label, "font-semibold text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]")}>English</span>
      </SettingRow>
    </div>
  );
}

function DisplayContent() {
  const [brightness, setBrightness] = useState(80);
  const [nightShift, setNightShift] = useState(false);
  return (
    <div>
      <Slider value={brightness} onChange={setBrightness} label="Brightness" />
      <SettingRow label="Night Shift" icon={Sun} iconColor="text-[hsl(35_80%_50%)]">
        <Toggle checked={nightShift} onChange={setNightShift} />
      </SettingRow>
      <SettingRow label="Resolution">
        <span className={cn(APP_TYPE.label, "font-semibold text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]")}>Default</span>
      </SettingRow>
    </div>
  );
}

function SoundContent() {
  const [volume, setVolume] = useState(65);
  const [alertSounds, setAlertSounds] = useState(true);
  return (
    <div>
      <Slider value={volume} onChange={setVolume} label="Volume" />
      <SettingRow label="Alert Sounds">
        <Toggle checked={alertSounds} onChange={setAlertSounds} />
      </SettingRow>
      <SettingRow label="Output Device">
        <span className={cn(APP_TYPE.label, "font-semibold text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]")}>Built-in Speakers</span>
      </SettingRow>
    </div>
  );
}

function NetworkContent() {
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  return (
    <div>
      <SettingRow label="Wi-Fi" icon={Wifi} iconColor="text-[hsl(210_80%_55%)]">
        <Toggle checked={wifiOn} onChange={setWifiOn} />
      </SettingRow>
      {wifiOn && (
        <div className={cn(APP_COMPONENTS.card.base, "mb-4 text-[11px] text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]")}>
          Connected to <span className="font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]">SITA-Network</span>
        </div>
      )}
      <SettingRow label="Bluetooth">
        <Toggle checked={bluetoothOn} onChange={setBluetoothOn} />
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

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(0_0%_45%)] to-[hsl(0_0%_35%)]">
      <div className="flex min-h-[280px]">
        <div
          className={cn("border-r", APP_MATERIALS.sidebarBorder)}
          style={{ width: 160, padding: SPACE.tight }}
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                APP_COMPONENTS.listItem.base,
                active === id ? APP_COMPONENTS.listItem.active : APP_COMPONENTS.listItem.inactive
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: SPACE.section }} className="flex-1">
          <h3 className={cn(APP_TYPE.title, "text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)] capitalize")} style={{ marginBottom: SPACE.normal }}>
            {active}
          </h3>
          <Content />
        </div>
      </div>
    </AppStateWrapper>
  );
}
