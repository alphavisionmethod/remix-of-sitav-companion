import { useState } from "react";
import { Monitor, Volume2, Wifi, Settings, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "relative w-9 h-5 rounded-full transition-colors",
        checked ? "bg-[hsl(210_80%_55%)]" : "bg-[hsl(0_0%_75%)] dark:bg-[hsl(0_0%_30%)]"
      )}
    >
      <div className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
        checked ? "left-[18px]" : "left-0.5"
      )} />
    </button>
  );
}

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]">{label}</span>
        <span className="text-[11px] font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]">{value}%</span>
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

function GeneralContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="h-3.5 w-3.5 text-[hsl(0_0%_50%)]" />
          <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Dark Mode</span>
        </div>
        <Toggle checked={darkMode} onChange={setDarkMode} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Notifications</span>
        <Toggle checked={notifications} onChange={setNotifications} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Language</span>
        <span className="text-xs font-medium text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]">English</span>
      </div>
    </div>
  );
}

function DisplayContent() {
  const [brightness, setBrightness] = useState(80);
  const [nightShift, setNightShift] = useState(false);
  return (
    <div className="space-y-4">
      <Slider value={brightness} onChange={setBrightness} label="Brightness" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="h-3.5 w-3.5 text-[hsl(35_80%_50%)]" />
          <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Night Shift</span>
        </div>
        <Toggle checked={nightShift} onChange={setNightShift} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Resolution</span>
        <span className="text-xs font-medium text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]">Default</span>
      </div>
    </div>
  );
}

function SoundContent() {
  const [volume, setVolume] = useState(65);
  const [alertSounds, setAlertSounds] = useState(true);
  return (
    <div className="space-y-4">
      <Slider value={volume} onChange={setVolume} label="Volume" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Alert Sounds</span>
        <Toggle checked={alertSounds} onChange={setAlertSounds} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Output Device</span>
        <span className="text-xs font-medium text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]">Built-in Speakers</span>
      </div>
    </div>
  );
}

function NetworkContent() {
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-[hsl(210_80%_55%)]" />
          <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Wi-Fi</span>
        </div>
        <Toggle checked={wifiOn} onChange={setWifiOn} />
      </div>
      {wifiOn && (
        <div className="rounded-lg bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.04)] p-2.5 text-[11px] text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]">
          Connected to <span className="font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]">SITA-Network</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]">Bluetooth</span>
        <Toggle checked={bluetoothOn} onChange={setBluetoothOn} />
      </div>
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
    <div className="flex min-h-[260px]">
      <div className="w-40 border-r border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] p-2 space-y-0.5">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
              active === id
                ? "bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.08)] font-medium text-[hsl(0_0%_10%)] dark:text-[hsl(0_0%_90%)]"
                : "text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_0%/0.03)] dark:hover:bg-[hsl(0_0%_100%/0.04)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)] mb-3 capitalize">{active}</h3>
        <Content />
      </div>
    </div>
  );
}
