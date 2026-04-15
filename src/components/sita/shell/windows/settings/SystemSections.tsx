// ═══════════════════════════════════════════════════════════════
// Settings — System Group (General, Appearance, Display, Accessibility, Operating Modes, Device Mode)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import {
  Moon, Sun, Bell, Palette, Monitor, Eye, Globe, Check, ChevronRight, Lock,
  Type, Accessibility, Activity,
} from "lucide-react";
import { VStack, HStack, Divider } from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaSlider, NovaBadge,
} from "@/lib/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { toast } from "sonner";
import { SettingRow, ResetSectionButton } from "./shared";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { Link as LinkIcon } from "lucide-react";

// Wallpaper imports
import wallpaperNebula from "@/assets/wallpapers/nebula.jpg";
import wallpaperAmber from "@/assets/wallpapers/amber.jpg";
import wallpaperOcean from "@/assets/wallpapers/ocean.jpg";
import wallpaperAurora from "@/assets/wallpapers/aurora.jpg";
import wallpaperRose from "@/assets/wallpapers/rose.jpg";
import { WALLPAPER_THEMES, getCustomWallpaperUrl, setCustomWallpaperUrl } from "@/hooks/use-wallpaper";

const PHOTO_WALLPAPERS = [
  { id: "nebula", label: "Nebula", src: wallpaperNebula, description: "Deep purple & blue" },
  { id: "amber", label: "Amber", src: wallpaperAmber, description: "Warm golden tones" },
  { id: "ocean", label: "Ocean", src: wallpaperOcean, description: "Deep blue waves" },
  { id: "aurora-photo", label: "Aurora", src: wallpaperAurora, description: "Northern lights" },
  { id: "rose", label: "Rose", src: wallpaperRose, description: "Pink bokeh glow" },
];

const GRADIENT_WALLPAPERS = WALLPAPER_THEMES.filter(t => t.id !== "sita-hero" && t.category !== "custom");

type WallpaperCategory = "all" | "photos" | "gradients" | "custom";
const WP_TABS: { id: WallpaperCategory; label: string }[] = [
  { id: "all", label: "All" }, { id: "photos", label: "Photos" },
  { id: "gradients", label: "Gradients" }, { id: "custom", label: "Custom" },
];

function WallpaperThumb({ id, label, active, onClick, preview, imgSrc, isImage, isCustomPlaceholder }: {
  id: string; label: string; active: boolean; onClick: () => void;
  preview?: string; imgSrc?: string; isImage?: boolean; isCustomPlaceholder?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "relative rounded-xl overflow-hidden aspect-[16/10] transition-all duration-200 group border-2",
      active ? "border-[hsl(210_80%_55%)] shadow-[0_0_12px_hsl(210_80%_55%/0.3)]" : "border-[hsl(0_0%_100%/0.08)] hover:border-[hsl(0_0%_100%/0.2)]"
    )}>
      {imgSrc ? (
        <img src={imgSrc} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      ) : isCustomPlaceholder ? (
        <div className="w-full h-full bg-[hsl(0_0%_8%)] flex flex-col items-center justify-center gap-1">
          <LinkIcon className="w-4 h-4 text-[hsl(0_0%_40%)]" />
          <span className="text-[8px] text-[hsl(0_0%_40%)]">Paste URL</span>
        </div>
      ) : (
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-300" style={{ background: preview || "hsl(0 0% 10%)", backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      {active && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[hsl(210_80%_55%)] flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-[hsl(0_0%_100%)]" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(0_0%_0%/0.7)] to-transparent px-1.5 py-1">
        <div className="text-[9px] font-medium text-[hsl(0_0%_90%)]">{label}</div>
      </div>
    </button>
  );
}

export function GeneralContent() {
  const [theme, setTheme] = useSettingsValue("appearance.theme", "dark");
  const darkMode = theme === "dark";
  const [uiSounds, setUiSounds] = useSettingsValue("sound.uiSounds", true);
  const [reducedMotion, setReducedMotion] = useSettingsValue("appearance.reduceMotion", false);

  const toggleDark = useCallback((v: boolean) => {
    const newTheme = v ? "dark" : "light";
    setTheme(newTheme as any);
    document.documentElement.classList.toggle("dark", v);
  }, [setTheme]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Dark Mode" description="System-wide dark theme" icon={<Moon className="h-3.5 w-3.5" />}>
            <NovaToggle checked={darkMode} onChange={toggleDark} />
          </SettingRow>
          <Divider />
          <SettingRow label="UI Sounds" description="Play interface sounds" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={uiSounds} onChange={setUiSounds} />
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
      <ResetSectionButton sectionId="general" />
    </VStack>
  );
}

export function AppearanceContent() {
  const [accentColor, setAccentColor] = useSettingsValue("appearance.accentColor", "hsl(265, 55%, 58%)");
  const accents = [
    { id: "hsl(265, 55%, 58%)", label: "purple", color: "hsl(265 55% 58%)", hsl: "265 55% 58%" },
    { id: "hsl(210, 80%, 55%)", label: "blue", color: "hsl(210 80% 55%)", hsl: "210 80% 55%" },
    { id: "hsl(152, 55%, 48%)", label: "green", color: "hsl(152 55% 48%)", hsl: "152 55% 48%" },
    { id: "hsl(38, 85%, 58%)", label: "orange", color: "hsl(38 85% 58%)", hsl: "38 85% 58%" },
    { id: "hsl(0, 65%, 50%)", label: "red", color: "hsl(0 65% 50%)", hsl: "0 65% 50%" },
    { id: "hsl(330, 65%, 55%)", label: "pink", color: "hsl(330 65% 55%)", hsl: "330 65% 55%" },
  ];
  const [reduceTransparency, setReduceTransparency] = useSettingsValue("appearance.reduceTransparency", false);
  const [wallpaperId, setWallpaperId] = useSettingsValue("appearance.wallpaper", "dynamic");
  const [wpTab, setWpTab] = useState<WallpaperCategory>("all");
  const [customUrl, setCustomUrl] = useState(getCustomWallpaperUrl);
  const [customUrlInput, setCustomUrlInput] = useState(getCustomWallpaperUrl);

  useEffect(() => {
    const match = accents.find(a => a.id === accentColor);
    if (!match) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", match.hsl);
    const hueMatch = match.hsl.match(/^(\d+)\s/);
    if (hueMatch) {
      const shifted = (parseInt(hueMatch[1]) + 133) % 360;
      root.style.setProperty("--accent", `${shifted} 85% 58%`);
    }
  }, [accentColor]);

  useEffect(() => {
    const photo = PHOTO_WALLPAPERS.find(w => w.id === wallpaperId);
    if (photo) { window.dispatchEvent(new CustomEvent("nova-wallpaper-change", { detail: { id: photo.id, src: photo.src } })); return; }
    if (wallpaperId === "custom") { window.dispatchEvent(new CustomEvent("nova-wallpaper-change", { detail: { id: "custom", src: customUrl } })); return; }
    window.dispatchEvent(new CustomEvent("nova-wallpaper-change", { detail: { id: wallpaperId, src: "" } }));
  }, [wallpaperId, customUrl]);

  const handleSetCustomUrl = useCallback(() => {
    if (!customUrlInput.trim()) return;
    setCustomWallpaperUrl(customUrlInput.trim());
    setCustomUrl(customUrlInput.trim());
    setWallpaperId("custom");
  }, [customUrlInput, setWallpaperId]);

  const showPhotos = wpTab === "all" || wpTab === "photos";
  const showGradients = wpTab === "all" || wpTab === "gradients";
  const showCustom = wpTab === "all" || wpTab === "custom";

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Wallpaper</NovaSectionLabel>
          <HStack spacing="micro" className="mb-1">
            {WP_TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setWpTab(tab.id)} className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-medium transition-all",
                wpTab === tab.id ? "bg-[hsl(265_55%_58%/0.2)] text-[hsl(265_55%_70%)]" : "text-[hsl(0_0%_55%)] hover:text-[hsl(0_0%_75%)] hover:bg-[hsl(0_0%_100%/0.04)]"
              )}>
                {tab.label}
              </button>
            ))}
          </HStack>
          <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
            {wpTab === "all" && (
              <WallpaperThumb id="sita-hero" label="SITA Hero" active={wallpaperId === "sita-hero"} onClick={() => setWallpaperId("sita-hero")} preview="url('/wallpapers/sita-hero.png')" isImage />
            )}
            {showPhotos && PHOTO_WALLPAPERS.map(wp => (
              <WallpaperThumb key={wp.id} id={wp.id} label={wp.label} active={wallpaperId === wp.id} onClick={() => setWallpaperId(wp.id)} imgSrc={wp.src} />
            ))}
            {showGradients && GRADIENT_WALLPAPERS.map(wp => (
              <WallpaperThumb key={wp.id} id={wp.id} label={wp.name} active={wallpaperId === wp.id} onClick={() => setWallpaperId(wp.id)} preview={wp.preview} />
            ))}
            {showCustom && (
              <WallpaperThumb id="custom" label="Custom URL" active={wallpaperId === "custom"} onClick={() => { if (customUrl) setWallpaperId("custom"); }} preview={customUrl ? `url('${customUrl}')` : undefined} isCustomPlaceholder={!customUrl} />
            )}
          </div>
          {showCustom && (
            <div className="mt-2 flex gap-1.5">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(0_0%_50%)]" />
                <input type="url" value={customUrlInput} onChange={(e) => setCustomUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSetCustomUrl()} placeholder="Paste image URL…" className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[10px] bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_90%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:border-[hsl(265_55%_58%/0.4)]" />
              </div>
              <NovaButton variant="primary" onClick={handleSetCustomUrl} className="!text-[10px] !py-1 !px-3">Apply</NovaButton>
            </div>
          )}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Accent Color</NovaSectionLabel>
          <HStack spacing="tight">
            {accents.map(a => (
              <button key={a.id} onClick={() => setAccentColor(a.id)} className={cn(
                "w-6 h-6 rounded-full transition-all duration-100 ring-offset-2 ring-offset-[hsl(0_0%_100%)] dark:ring-offset-[hsl(0_0%_8%)]",
                accentColor === a.id && "ring-2 ring-[hsl(0_0%_0%/0.2)] dark:ring-[hsl(0_0%_100%/0.3)] scale-110"
              )} style={{ background: a.color }}>
                {accentColor === a.id && <Check className="w-3 h-3 text-[hsl(0_0%_100%)] mx-auto" />}
              </button>
            ))}
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="Reduce Transparency" description="Solid backgrounds" icon={<Palette className="h-3.5 w-3.5" />}>
          <NovaToggle checked={reduceTransparency} onChange={setReduceTransparency} />
        </SettingRow>
      </NovaCard>
      <ResetSectionButton sectionId="appearance" />
    </VStack>
  );
}

export function DisplayContent() {
  const [brightness, setBrightness] = useSettingsValue("display.brightness", 0.8);
  const brightnessPercent = Math.round(brightness * 100);
  const [nightShift, setNightShift] = useSettingsValue("display.nightShift", false);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={brightnessPercent} onChange={(v) => setBrightness(v / 100 as any)} label="Brightness" />
          <Divider />
          <SettingRow label="Night Shift" description="Warm colors after sunset" icon={<Sun className="h-3.5 w-3.5" />}>
            <NovaToggle checked={nightShift} onChange={setNightShift} />
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
      <ResetSectionButton sectionId="display" />
    </VStack>
  );
}

export function AccessibilityContent() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useSettingsValue("appearance.reduceMotion", false);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? "18px" : "";
  }, [largeText]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="High Contrast" description="Increase contrast for better visibility" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={highContrast} onChange={setHighContrast} />
          </SettingRow>
          <Divider />
          <SettingRow label="Large Text" description="Increase base text size to 18px" icon={<Type className="h-3.5 w-3.5" />}>
            <NovaToggle checked={largeText} onChange={setLargeText} />
          </SettingRow>
          <Divider />
          <SettingRow label="Reduce Motion" description="Minimize all animations" icon={<Activity className="h-3.5 w-3.5" />}>
            <NovaToggle checked={reduceMotion} onChange={setReduceMotion} />
          </SettingRow>
          <Divider />
          <SettingRow label="Screen Reader Mode" description="Optimize for assistive technologies" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <NovaToggle checked={screenReader} onChange={(v) => { setScreenReader(v); if (v) toast.success("Screen reader optimizations enabled"); }} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function OperatingModesContent() {
  const os = useOSOrchestration();
  const currentMode = os.getCurrentMode();
  const modes = [
    "standard", "focus", "executive", "family", "travel", "emergency",
    "recovery", "execution", "founder", "investor_demo", "boardroom", "stealth",
  ];
  const modeDescriptions: Record<string, string> = {
    standard: "Balanced view across all domains",
    focus: "Deep work, minimal interruptions",
    executive: "Strategic overview, formal tone",
    family: "Home-first, suppress business",
    travel: "Itineraries, on-the-go essentials",
    emergency: "Critical actions only",
    recovery: "Calm, minimal cognitive load",
    execution: "Action-dense, rapid execution",
    founder: "Full visibility, all domains",
    investor_demo: "Polished demo posture",
    boardroom: "Strategic presentation mode",
    stealth: "Minimal footprint, privacy-first",
  };

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Active Mode</NovaSectionLabel>
          <HStack spacing="tight" align="center">
            <div className="w-2 h-2 rounded-full bg-[hsl(152_55%_48%)]" />
            <NovaText variant="body" className="capitalize">{currentMode.replace("_", " ")}</NovaText>
            <NovaBadge variant="success">Active</NovaBadge>
          </HStack>
        </VStack>
      </NovaCard>
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Switch Mode</NovaSectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {modes.map(m => (
              <button
                key={m}
                onClick={() => { os.setMode(m as any); toast.success(`Switched to ${m.replace("_", " ")} mode`); }}
                className={cn(
                  "p-2 rounded-lg text-left transition-all border text-[10px]",
                  currentMode === m
                    ? "border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/8"
                    : "border-transparent hover:bg-[hsl(0_0%_100%/0.04)]"
                )}
              >
                <span className={cn("font-medium capitalize", currentMode === m && "text-[hsl(var(--primary))]")}>
                  {m.replace("_", " ")}
                </span>
                <p className="text-[8px] text-[hsl(0_0%_55%)] mt-0.5 line-clamp-1">{modeDescriptions[m]}</p>
              </button>
            ))}
          </div>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function DeviceModeContent() {
  const [deviceMode, setDeviceModeLocal] = useState("home");

  useEffect(() => {
    try {
      const { getPolicyBundleManager } = require("@/lib/os-security/policyd-bundles");
      const bm = getPolicyBundleManager();
      setDeviceModeLocal(bm.getCurrentMode());
    } catch { /* not ready */ }
  }, []);

  const modes = [
    { id: "home", label: "Home", icon: "🏠", desc: "Consumer-friendly, moderate defaults" },
    { id: "work", label: "Work", icon: "💼", desc: "Stronger security, VPN defaults" },
    { id: "school", label: "School", icon: "🎓", desc: "Restricted installs, content controls" },
    { id: "kiosk", label: "Kiosk", icon: "🖥️", desc: "Near-lockdown mode" },
    { id: "guest_demo", label: "Guest", icon: "👤", desc: "Temporary session" },
  ];

  const handleSwitch = useCallback((mode: string) => {
    try {
      const { getPolicyBundleManager } = require("@/lib/os-security/policyd-bundles");
      const bm = getPolicyBundleManager();
      bm.switchMode(mode as any);
      setDeviceModeLocal(mode);
      toast.success(`Switched to ${modes.find(m => m.id === mode)?.label} mode`);
    } catch { toast.error("Policy engine not available"); }
  }, []);

  return (
    <VStack spacing="normal">
      <NovaSectionLabel>Device Mode</NovaSectionLabel>
      <NovaCard>
        <VStack spacing="tight">
          <NovaText variant="label" muted className="!text-[10px]">
            Device mode controls security posture, network rules, Bluetooth pairing, app permissions, and update behavior.
          </NovaText>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {modes.map(m => (
              <button key={m.id} onClick={() => handleSwitch(m.id)} className={cn(
                "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                deviceMode === m.id ? "border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/8" : "border-border/30 bg-card/40 hover:border-border/60"
              )}>
                <span className="text-lg">{m.icon}</span>
                <VStack spacing="micro">
                  <NovaText variant="body" className="!text-[11px] font-medium">{m.label}</NovaText>
                  <NovaText variant="label" muted className="!text-[8px]">{m.desc}</NovaText>
                </VStack>
                {deviceMode === m.id && <Check className="h-3.5 w-3.5 text-[hsl(var(--primary))] ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </VStack>
      </NovaCard>
      <NovaSectionLabel>Policy Center</NovaSectionLabel>
      <NovaCard>
        <HStack spacing="tight" align="center" justify="between">
          <VStack spacing="micro">
            <NovaText variant="body">View Active Policies</NovaText>
            <NovaText variant="label" muted className="!text-[10px]">See all enforced rules and protection status</NovaText>
          </VStack>
          <NovaButton variant="secondary" className="!text-[10px]" icon={<ChevronRight className="h-3 w-3" />}>Open</NovaButton>
        </HStack>
      </NovaCard>
    </VStack>
  );
}
