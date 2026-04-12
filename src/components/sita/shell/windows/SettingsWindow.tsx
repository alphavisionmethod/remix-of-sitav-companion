// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Window (Full Nova SDK)
// Uses: AppLayout, NovaSidebar, NovaList, NovaCard, NovaButton,
//       NovaText, NovaToggle, NovaSlider, NovaBadge, NovaToolbar,
//       VStack, HStack, Divider, NovaSectionLabel
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import {
  Monitor, Volume2, Wifi, Settings, Moon, Sun, Shield, Palette,
  Bell, User, HardDrive, Globe, Keyboard, Lock, Eye, Bluetooth,
  Battery, Zap, Info, ChevronRight, Check,
} from "lucide-react";
import {
  AppLayout,
  VStack, HStack, Divider,
} from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaList,
  NovaSectionLabel, NovaToggle, NovaSlider,
  NovaBadge, NovaToolbar, NovaAvatar,
} from "@/lib/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";

// ── Section definitions ────────────────────────────────────

const SECTIONS = [
  { id: "general",     label: "General",     icon: <Settings className="h-3.5 w-3.5" />, group: "System" },
  { id: "appearance",  label: "Appearance",  icon: <Palette className="h-3.5 w-3.5" />,  group: "System" },
  { id: "display",     label: "Display",     icon: <Monitor className="h-3.5 w-3.5" />,  group: "System" },
  { id: "sound",       label: "Sound",       icon: <Volume2 className="h-3.5 w-3.5" />,  group: "System" },
  { id: "network",     label: "Network",     icon: <Wifi className="h-3.5 w-3.5" />,     group: "Connectivity" },
  { id: "bluetooth",   label: "Bluetooth",   icon: <Bluetooth className="h-3.5 w-3.5" />,group: "Connectivity" },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" />,group: "Preferences" },
  { id: "privacy",     label: "Privacy",     icon: <Shield className="h-3.5 w-3.5" />,   group: "Preferences" },
  { id: "keyboard",    label: "Keyboard",    icon: <Keyboard className="h-3.5 w-3.5" />, group: "Preferences" },
  { id: "about",       label: "About",       icon: <Info className="h-3.5 w-3.5" />,     group: "Info" },
];

const GROUPS = ["System", "Connectivity", "Preferences", "Info"];

// ── Setting row helper ─────────────────────────────────────

function SettingRow({ label, description, icon, children }: {
  label: string; description?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <HStack spacing="normal" justify="between" align="center" className="min-h-[36px]">
      <HStack spacing="tight" align="center" className="flex-1 min-w-0">
        {icon && <span className="text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] flex-shrink-0">{icon}</span>}
        <VStack spacing="none">
          <NovaText variant="body">{label}</NovaText>
          {description && <NovaText variant="label" muted className="!text-[10px]">{description}</NovaText>}
        </VStack>
      </HStack>
      <div className="flex-shrink-0">{children}</div>
    </HStack>
  );
}

// ── Section content components ─────────────────────────────

function GeneralContent() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const toggleDark = useCallback((v: boolean) => {
    setDarkMode(v);
    document.documentElement.classList.toggle("dark", v);
  }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Dark Mode" description="System-wide dark theme" icon={<Moon className="h-3.5 w-3.5" />}>
            <NovaToggle checked={darkMode} onChange={toggleDark} />
          </SettingRow>
          <Divider />
          <SettingRow label="Notifications" description="Show system alerts" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={notifications} onChange={setNotifications} />
          </SettingRow>
          <Divider />
          <SettingRow label="Auto-Update" description="Keep apps up to date" icon={<Zap className="h-3.5 w-3.5" />}>
            <NovaToggle checked={autoUpdate} onChange={setAutoUpdate} />
          </SettingRow>
          <Divider />
          <SettingRow label="Reduced Motion" description="Minimize animations" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={reducedMotion} onChange={setReducedMotion} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="Language" icon={<Globe className="h-3.5 w-3.5" />}>
          <HStack spacing="tight" align="center">
            <NovaText variant="label" muted>English</NovaText>
            <ChevronRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
          </HStack>
        </SettingRow>
      </NovaCard>
    </VStack>
  );
}

function AppearanceContent() {
  const [accentColor, setAccentColor] = useState("purple");
  const accents = [
    { id: "purple", color: "hsl(265 55% 58%)" },
    { id: "blue",   color: "hsl(210 80% 55%)" },
    { id: "green",  color: "hsl(152 55% 48%)" },
    { id: "orange", color: "hsl(38 85% 58%)" },
    { id: "red",    color: "hsl(0 65% 50%)" },
    { id: "pink",   color: "hsl(330 65% 55%)" },
  ];
  const [wallpaperBlur, setWallpaperBlur] = useState(true);
  const [transparency, setTransparency] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Accent Color</NovaSectionLabel>
          <HStack spacing="tight">
            {accents.map(a => (
              <button
                key={a.id}
                onClick={() => setAccentColor(a.id)}
                className={cn(
                  "w-6 h-6 rounded-full transition-all duration-100 ring-offset-2 ring-offset-[hsl(0_0%_100%)] dark:ring-offset-[hsl(0_0%_8%)]",
                  accentColor === a.id && "ring-2 ring-[hsl(0_0%_0%/0.2)] dark:ring-[hsl(0_0%_100%/0.3)] scale-110"
                )}
                style={{ background: a.color }}
              >
                {accentColor === a.id && <Check className="w-3 h-3 text-[hsl(0_0%_100%)] mx-auto" />}
              </button>
            ))}
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Wallpaper Blur" description="Blur behind windows" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={wallpaperBlur} onChange={setWallpaperBlur} />
          </SettingRow>
          <Divider />
          <SettingRow label="Transparency" description="Translucent UI elements" icon={<Palette className="h-3.5 w-3.5" />}>
            <NovaToggle checked={transparency} onChange={setTransparency} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

function DisplayContent() {
  const [brightness, setBrightness] = useState(80);
  const [nightShift, setNightShift] = useState(false);
  const [trueTone, setTrueTone] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={brightness} onChange={setBrightness} label="Brightness" />
          <Divider />
          <SettingRow label="Night Shift" description="Warm colors after sunset" icon={<Sun className="h-3.5 w-3.5" />}>
            <NovaToggle checked={nightShift} onChange={setNightShift} />
          </SettingRow>
          <Divider />
          <SettingRow label="True Tone" description="Adapt to ambient lighting" icon={<Monitor className="h-3.5 w-3.5" />}>
            <NovaToggle checked={trueTone} onChange={setTrueTone} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="Resolution" icon={<Monitor className="h-3.5 w-3.5" />}>
          <HStack spacing="tight" align="center">
            <NovaBadge variant="info">Default</NovaBadge>
            <ChevronRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
          </HStack>
        </SettingRow>
      </NovaCard>
    </VStack>
  );
}

function SoundContent() {
  const [volume, setVolume] = useState(65);
  const [alertSounds, setAlertSounds] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={volume} onChange={setVolume} label="Output Volume" />
          <Divider />
          <SettingRow label="Alert Sounds" description="Play sounds for alerts" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={alertSounds} onChange={setAlertSounds} />
          </SettingRow>
          <Divider />
          <SettingRow label="Haptic Feedback" description="Vibration on interactions" icon={<Zap className="h-3.5 w-3.5" />}>
            <NovaToggle checked={hapticFeedback} onChange={setHapticFeedback} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="Output Device" icon={<Volume2 className="h-3.5 w-3.5" />}>
          <HStack spacing="tight" align="center">
            <NovaBadge>Built-in Speakers</NovaBadge>
            <ChevronRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
          </HStack>
        </SettingRow>
      </NovaCard>
    </VStack>
  );
}

function NetworkContent() {
  const [wifiOn, setWifiOn] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Wi-Fi" icon={<Wifi className="h-3.5 w-3.5" />}>
            <NovaToggle checked={wifiOn} onChange={setWifiOn} />
          </SettingRow>
          {wifiOn && (
            <>
              <Divider />
              <HStack spacing="tight" align="center" className="py-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(152_55%_48%)]" />
                <NovaText variant="body">SITA-Network</NovaText>
                <NovaBadge variant="success">Connected</NovaBadge>
              </HStack>
            </>
          )}
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="VPN" icon={<Lock className="h-3.5 w-3.5" />}>
          <NovaBadge variant="default">Not Connected</NovaBadge>
        </SettingRow>
      </NovaCard>
    </VStack>
  );
}

function BluetoothContent() {
  const [btOn, setBtOn] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <SettingRow label="Bluetooth" icon={<Bluetooth className="h-3.5 w-3.5" />}>
          <NovaToggle checked={btOn} onChange={setBtOn} />
        </SettingRow>
      </NovaCard>

      {btOn && (
        <NovaCard>
          <VStack spacing="tight">
            <NovaSectionLabel className="!px-0">Nearby Devices</NovaSectionLabel>
            <HStack spacing="tight" align="center">
              <NovaAvatar icon="🎧" size={24} gradient="from-[hsl(210_80%_55%)] to-[hsl(265_55%_58%)]" />
              <VStack spacing="none" className="flex-1">
                <NovaText variant="body">AirPods Pro</NovaText>
                <NovaText variant="label" muted className="!text-[10px]">Available</NovaText>
              </VStack>
              <NovaButton variant="secondary" className="!text-[10px] !py-0.5 !px-2">Connect</NovaButton>
            </HStack>
            <Divider />
            <HStack spacing="tight" align="center">
              <NovaAvatar icon="⌨️" size={24} gradient="from-[hsl(0_0%_40%)] to-[hsl(0_0%_25%)]" />
              <VStack spacing="none" className="flex-1">
                <NovaText variant="body">Magic Keyboard</NovaText>
                <NovaText variant="label" muted className="!text-[10px]">Connected</NovaText>
              </VStack>
              <NovaBadge variant="success">Paired</NovaBadge>
            </HStack>
          </VStack>
        </NovaCard>
      )}
    </VStack>
  );
}

function NotificationsContent() {
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [showPreviews, setShowPreviews] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [badges, setBadges] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <SettingRow label="Do Not Disturb" description="Silence all notifications" icon={<Moon className="h-3.5 w-3.5" />}>
          <NovaToggle checked={doNotDisturb} onChange={setDoNotDisturb} />
        </SettingRow>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">When Receiving</NovaSectionLabel>
          <SettingRow label="Show Previews" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={showPreviews} onChange={setShowPreviews} />
          </SettingRow>
          <Divider />
          <SettingRow label="Play Sound" icon={<Volume2 className="h-3.5 w-3.5" />}>
            <NovaToggle checked={sounds} onChange={setSounds} />
          </SettingRow>
          <Divider />
          <SettingRow label="Show Badges" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={badges} onChange={setBadges} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

function PrivacyContent() {
  const [locationServices, setLocationServices] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Location Services" description="Allow apps to use location" icon={<Globe className="h-3.5 w-3.5" />}>
            <NovaToggle checked={locationServices} onChange={setLocationServices} />
          </SettingRow>
          <Divider />
          <SettingRow label="Analytics" description="Help improve SITA OS" icon={<HardDrive className="h-3.5 w-3.5" />}>
            <NovaToggle checked={analytics} onChange={setAnalytics} />
          </SettingRow>
          <Divider />
          <SettingRow label="Crash Reports" description="Send anonymous crash data" icon={<Shield className="h-3.5 w-3.5" />}>
            <NovaToggle checked={crashReports} onChange={setCrashReports} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

function KeyboardContent() {
  const [keyRepeatSpeed, setKeyRepeatSpeed] = useState(70);
  const [autocorrect, setAutocorrect] = useState(true);
  const [capsLockDelay, setCapsLockDelay] = useState(false);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={keyRepeatSpeed} onChange={setKeyRepeatSpeed} label="Key Repeat Speed" />
          <Divider />
          <SettingRow label="Autocorrect" icon={<Keyboard className="h-3.5 w-3.5" />}>
            <NovaToggle checked={autocorrect} onChange={setAutocorrect} />
          </SettingRow>
          <Divider />
          <SettingRow label="Caps Lock Delay" description="Prevent accidental activation" icon={<Lock className="h-3.5 w-3.5" />}>
            <NovaToggle checked={capsLockDelay} onChange={setCapsLockDelay} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

function AboutContent() {
  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight" align="center" className="py-2">
          <NovaAvatar icon="▣" size={48} gradient="from-[hsl(265_55%_58%)] to-[hsl(210_80%_55%)]" />
          <NovaText variant="title">SITA OS</NovaText>
          <NovaText variant="label" muted>Version 2.0.0 (NovaKernel)</NovaText>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">Processor</NovaText>
            <NovaText variant="label" muted>NovaKernel aarch64</NovaText>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">Memory</NovaText>
            <NovaText variant="label" muted>{Math.round(((performance as any).memory?.jsHeapSizeLimit || 536870912) / 1048576)} MB</NovaText>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">Display</NovaText>
            <NovaText variant="label" muted>{window.innerWidth}×{window.innerHeight} @{window.devicePixelRatio}x</NovaText>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">SDK</NovaText>
            <NovaBadge variant="info">Nova SDK 1.0</NovaBadge>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <HStack spacing="tight" justify="between" align="center">
          <VStack spacing="none">
            <NovaText variant="body">Software Update</NovaText>
            <NovaText variant="label" muted className="!text-[10px]">SITA OS is up to date</NovaText>
          </VStack>
          <NovaBadge variant="success">Up to Date</NovaBadge>
        </HStack>
      </NovaCard>
    </VStack>
  );
}

// ── Content map ────────────────────────────────────────────

const CONTENT: Record<string, () => JSX.Element> = {
  general: GeneralContent,
  appearance: AppearanceContent,
  display: DisplayContent,
  sound: SoundContent,
  network: NetworkContent,
  bluetooth: BluetoothContent,
  notifications: NotificationsContent,
  privacy: PrivacyContent,
  keyboard: KeyboardContent,
  about: AboutContent,
};

// ── Main component ─────────────────────────────────────────

export function SettingsWindow() {
  const [active, setActive] = useState("general");
  const Content = CONTENT[active] || GeneralContent;
  const activeSection = SECTIONS.find(s => s.id === active);

  const sidebar = (
    <VStack spacing="tight" className="h-full">
      {GROUPS.map(group => {
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
      })}
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
      <AppLayout sidebar={sidebar} sidebarWidth={160} toolbar={toolbar} minHeight={340}>
        <Content />
      </AppLayout>
    </AppStateWrapper>
  );
}
