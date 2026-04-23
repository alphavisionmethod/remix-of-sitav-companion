// ═══════════════════════════════════════════════════════════════
// Settings — System Group (General, Appearance, Display, Accessibility, Operating Modes, Device Mode)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import {
  Moon, Sun, Bell, Palette, Monitor, Eye, Globe, Check, ChevronRight, Lock,
  Type, Accessibility, Activity, Clock, Home as HomeIcon, Layout,
} from "lucide-react";
import { RotateCcw, Trash2, Download, Star, Search, X, AlertTriangle } from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaSlider, NovaBadge,
} from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { toast } from "sonner";
import { SettingRow } from "./shared";
import { ResetSectionButton } from "./shared";
import { SettingsService } from "@/platform/nova-sdk/services/settings-service";
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

function ChoiceRow({ label, options, value, onChange }: {
  label: string; options: { key: string; label: string; desc?: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <VStack spacing="tight">
      <NovaSectionLabel className="!px-0">{label}</NovaSectionLabel>
      <div className={cn("grid gap-1.5", options.length <= 3 ? "grid-cols-3" : "grid-cols-2")}>
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={cn(
            "rounded-lg border p-2 text-left transition-all text-[10px]",
            value === opt.key ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8" : "border-border/30 hover:border-border/60"
          )}>
            <span className={cn("font-medium", value === opt.key && "text-[hsl(var(--primary))]")}>{opt.label}</span>
            {opt.desc && <p className="text-[8px] text-[hsl(0_0%_55%)] mt-0.5">{opt.desc}</p>}
          </button>
        ))}
      </div>
    </VStack>
  );
}

export function GeneralContent() {
  return <GeneralContentFull />;
}

function GeneralSelect({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "text-[10px] bg-[hsl(0_0%_100%/0.12)] border border-border/60 rounded-md px-2.5 py-1.5 text-foreground min-w-[120px] appearance-none cursor-pointer hover:bg-[hsl(0_0%_100%/0.18)] focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors",
        className
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: "24px" }}
    >
      {options.map(o => <option key={o.value} value={o.value} className="bg-[hsl(225,12%,12%)] text-white">{o.label}</option>)}
    </select>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-1">
      <NovaSectionLabel className="!px-0 !text-[9px] !tracking-wider">{title}</NovaSectionLabel>
      {description && <NovaText variant="label" muted className="!text-[9px] !mt-0.5 !px-0">{description}</NovaText>}
    </div>
  );
}

function ManagedBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[8px] font-medium text-[hsl(var(--primary))]/70 bg-[hsl(var(--primary))]/8 border border-[hsl(var(--primary))]/15 rounded-full px-1.5 py-0.5 ml-1">
      Synced with {source}
    </span>
  );
}

function DeepLink({ label, section }: { label: string; section: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("sita-settings-navigate", { detail: { section } }));
      }}
      className="inline-flex items-center gap-1 text-[9px] text-[hsl(var(--primary))] hover:underline mt-0.5"
    >
      {label}
      <ChevronRight className="h-2.5 w-2.5" />
    </button>
  );
}

function GeneralContentFull() {
  // ── Section 1: Everyday Preferences ──
  const [theme, setTheme] = useSettingsValue("appearance.theme", "dark");
  const darkMode = theme === "dark";
  const [uiSounds, setUiSounds] = useSettingsValue("sound.uiSounds", true);
  const [reducedMotion, setReducedMotion] = useSettingsValue("appearance.reduceMotion", false);
  const [language, setLanguage] = useSettingsValue("general.language", "en");

  // ── Section 2: Region & Formatting ──
  const [region, setRegion] = useSettingsValue("general.region", "US");
  const [currency, setCurrency] = useSettingsValue("general.currency", "USD");
  const [measurementUnits, setMeasurementUnits] = useSettingsValue("general.measurementUnits", "metric");
  const [numberFormat, setNumberFormat] = useSettingsValue("general.numberFormat", "comma-dot");
  const [weekStartsOn, setWeekStartsOn] = useSettingsValue("general.weekStartsOn", "monday");

  // ── Section 3: Date & Time ──
  const [dateFormat, setDateFormat] = useSettingsValue("general.dateFormat", "mdy");
  const [timeFormat, setTimeFormat] = useSettingsValue("general.timeFormat", "12h");
  const [timezone] = useSettingsValue("general.timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [calendarView, setCalendarView] = useSettingsValue("general.defaultCalendarView", "week");

  // ── Section 4: Startup & Session ──
  const [startup, setStartup] = useSettingsValue("general.startupBehavior", "lastState");
  const [restoreSession, setRestoreSession] = useSettingsValue("general.restoreLastSession", true);
  const [reopenPanels, setReopenPanels] = useSettingsValue("general.reopenPanels", true);
  const [resumeTasks, setResumeTasks] = useSettingsValue("general.resumePendingTasks", false);

  // ── Section 5: Navigation & Behavior ──
  const [navPref, setNavPref] = useSettingsValue("general.navigationPreference", "expanded");
  const [rememberPanels, setRememberPanels] = useSettingsValue("general.rememberLastOpenPanels", true);
  const [confirmLeave, setConfirmLeave] = useSettingsValue("general.confirmBeforeLeaving", true);
  const [openLinksIn, setOpenLinksIn] = useSettingsValue("general.openLinksIn", "same");

  // ── Section 6: Personalization ──
  const [displayName, setDisplayName] = useSettingsValue("general.displayName", "");
  const [focusDomain, setFocusDomain] = useSettingsValue("general.defaultFocusDomain", "mixed");

  // ── Section 7: Guidance & Recommendations ──
  const [guidanceLevel, setGuidanceLevel] = useSettingsValue("general.guidanceLevel", "standard");
  const [featureTips, setFeatureTips] = useSettingsValue("general.showNewFeatureTips", true);
  const [updateHighlights, setUpdateHighlights] = useSettingsValue("general.showUpdateHighlights", true);
  const [setupRecs, setSetupRecs] = useSettingsValue("general.showSetupRecommendations", true);

  // ── Section 8: Approval Experience ──
  const [approvalStyle, setApprovalStyle] = useSettingsValue("general.approvalStyle", "ask-as-needed");

  // ── Accessibility Sync ──
  const [syncAccessibility, setSyncAccessibility] = useSettingsValue("general.syncAccessibility", true);
  const [a11yReduceMotion, setA11yReduceMotion] = useSettingsValue("appearance.reduceMotion", false);
  const [a11yFocusIndicators, setA11yFocusIndicators] = useSettingsValue("accessibility.focusIndicators", true);
  const [a11yFullKbNav, setA11yFullKbNav] = useSettingsValue("accessibility.fullKeyboardNav", true);

  // When sync is on and reducedMotion changes, mirror to accessibility
  useEffect(() => {
    if (!syncAccessibility) return;
    SettingsService.set("accessibility.reduceAutoPlayEffects", a11yReduceMotion);
  }, [a11yReduceMotion, syncAccessibility]);

  // When sync is on and focus settings change, mirror to accessibility
  useEffect(() => {
    if (!syncAccessibility) return;
    SettingsService.set("accessibility.focusIndicators", a11yFocusIndicators);
    SettingsService.set("accessibility.fullKeyboardNav", a11yFullKbNav);
  }, [a11yFocusIndicators, a11yFullKbNav, syncAccessibility]);

  const toggleDark = useCallback((v: boolean) => {
    const newTheme = v ? "dark" : "light";
    setTheme(newTheme as any);
    document.documentElement.classList.toggle("dark", v);
    trackSettingChange("appearance.theme", darkMode ? "dark" : "light", newTheme);
  }, [setTheme]);

  // Analytics-wrapped setters
  const trackAndSet = useCallback(<T,>(key: string, setter: (v: T) => void, oldVal: T) => (newVal: T) => {
    setter(newVal);
    trackSettingChange(key, oldVal, newVal);
  }, []);

  return (
    <VStack spacing="tight">
      {/* ── SECTION 1: Everyday Preferences ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Everyday Preferences" description="Core system-wide defaults" />
          <SettingRow label="Dark Mode" description={<>Use the system-wide dark theme across SITA OS <ManagedBadge source="Appearance" /></>} icon={<Moon className="h-3.5 w-3.5" />}>
            <NovaToggle checked={darkMode} onChange={toggleDark} />
          </SettingRow>
          <Divider />
          <SettingRow label="UI Sounds" description="Play subtle interface sounds for actions and confirmations" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={uiSounds} onChange={setUiSounds} />
          </SettingRow>
          <Divider />
          <SettingRow label="Reduced Motion" description={<>Minimize animations and motion across the interface <ManagedBadge source="Accessibility" /></>} icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={reducedMotion} onChange={setReducedMotion} />
          </SettingRow>
          <Divider />
          <SettingRow
            label="Sync to Accessibility"
            description={<>Automatically mirror Reduced Motion and focus behavior changes into Accessibility settings</>}
            icon={<Accessibility className="h-3.5 w-3.5" />}
          >
            <NovaToggle checked={syncAccessibility} onChange={setSyncAccessibility} />
          </SettingRow>
          <Divider />
          <SettingRow label="Language" description="Primary language for SITA OS" icon={<Globe className="h-3.5 w-3.5" />}>
            <GeneralSelect value={language} onChange={(v) => setLanguage(v as any)} options={[
              { value: "en", label: "English" },
              { value: "es", label: "Español" },
              { value: "pt", label: "Português" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
            ]} />
          </SettingRow>
          <DeepLink label="More appearance controls" section="appearance" />
          <DeepLink label="More accessibility controls" section="accessibility" />
        </VStack>
      </NovaCard>

      {/* ── SECTION 2: Region & Formatting ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Region & Formatting" description="Influences finance, planning, and display formatting" />
          <SettingRow label="Region" description="Local formatting, planning, and system defaults" icon={<Globe className="h-3.5 w-3.5" />}>
            <GeneralSelect value={region} onChange={(v) => setRegion(v as any)} options={[
              { value: "US", label: "United States" },
              { value: "GB", label: "United Kingdom" },
              { value: "CA", label: "Canada" },
              { value: "AU", label: "Australia" },
              { value: "DE", label: "Germany" },
              { value: "FR", label: "France" },
              { value: "ES", label: "Spain" },
              { value: "IT", label: "Italy" },
              { value: "PT", label: "Portugal" },
              { value: "NL", label: "Netherlands" },
              { value: "BE", label: "Belgium" },
              { value: "CH", label: "Switzerland" },
              { value: "AT", label: "Austria" },
              { value: "SE", label: "Sweden" },
              { value: "NO", label: "Norway" },
              { value: "DK", label: "Denmark" },
              { value: "FI", label: "Finland" },
              { value: "IE", label: "Ireland" },
              { value: "PL", label: "Poland" },
              { value: "CZ", label: "Czech Republic" },
              { value: "RO", label: "Romania" },
              { value: "HU", label: "Hungary" },
              { value: "GR", label: "Greece" },
              { value: "HR", label: "Croatia" },
              { value: "BG", label: "Bulgaria" },
              { value: "SK", label: "Slovakia" },
              { value: "SI", label: "Slovenia" },
              { value: "LT", label: "Lithuania" },
              { value: "LV", label: "Latvia" },
              { value: "EE", label: "Estonia" },
              { value: "MT", label: "Malta" },
              { value: "CY", label: "Cyprus" },
              { value: "LU", label: "Luxembourg" },
              { value: "IS", label: "Iceland" },
              { value: "UA", label: "Ukraine" },
              { value: "RS", label: "Serbia" },
              { value: "BA", label: "Bosnia & Herzegovina" },
              { value: "ME", label: "Montenegro" },
              { value: "AL", label: "Albania" },
              { value: "MK", label: "North Macedonia" },
              { value: "GE", label: "Georgia" },
              { value: "MD", label: "Moldova" },
              { value: "RU", label: "Russia" },
              { value: "TR", label: "Turkey" },
              { value: "IL", label: "Israel" },
              { value: "AE", label: "United Arab Emirates" },
              { value: "SA", label: "Saudi Arabia" },
              { value: "QA", label: "Qatar" },
              { value: "KW", label: "Kuwait" },
              { value: "BH", label: "Bahrain" },
              { value: "OM", label: "Oman" },
              { value: "JO", label: "Jordan" },
              { value: "LB", label: "Lebanon" },
              { value: "IQ", label: "Iraq" },
              { value: "IR", label: "Iran" },
              { value: "EG", label: "Egypt" },
              { value: "MA", label: "Morocco" },
              { value: "TN", label: "Tunisia" },
              { value: "DZ", label: "Algeria" },
              { value: "LY", label: "Libya" },
              { value: "NG", label: "Nigeria" },
              { value: "GH", label: "Ghana" },
              { value: "KE", label: "Kenya" },
              { value: "TZ", label: "Tanzania" },
              { value: "UG", label: "Uganda" },
              { value: "ET", label: "Ethiopia" },
              { value: "ZA", label: "South Africa" },
              { value: "SN", label: "Senegal" },
              { value: "CI", label: "Ivory Coast" },
              { value: "CM", label: "Cameroon" },
              { value: "CD", label: "DR Congo" },
              { value: "AO", label: "Angola" },
              { value: "MZ", label: "Mozambique" },
              { value: "MG", label: "Madagascar" },
              { value: "RW", label: "Rwanda" },
              { value: "ZW", label: "Zimbabwe" },
              { value: "BW", label: "Botswana" },
              { value: "MU", label: "Mauritius" },
              { value: "NA", label: "Namibia" },
              { value: "JP", label: "Japan" },
              { value: "KR", label: "South Korea" },
              { value: "CN", label: "China" },
              { value: "TW", label: "Taiwan" },
              { value: "HK", label: "Hong Kong" },
              { value: "SG", label: "Singapore" },
              { value: "MY", label: "Malaysia" },
              { value: "TH", label: "Thailand" },
              { value: "VN", label: "Vietnam" },
              { value: "PH", label: "Philippines" },
              { value: "ID", label: "Indonesia" },
              { value: "IN", label: "India" },
              { value: "PK", label: "Pakistan" },
              { value: "BD", label: "Bangladesh" },
              { value: "LK", label: "Sri Lanka" },
              { value: "NP", label: "Nepal" },
              { value: "MM", label: "Myanmar" },
              { value: "KH", label: "Cambodia" },
              { value: "LA", label: "Laos" },
              { value: "MN", label: "Mongolia" },
              { value: "KZ", label: "Kazakhstan" },
              { value: "UZ", label: "Uzbekistan" },
              { value: "AZ", label: "Azerbaijan" },
              { value: "NZ", label: "New Zealand" },
              { value: "FJ", label: "Fiji" },
              { value: "PG", label: "Papua New Guinea" },
              { value: "BR", label: "Brazil" },
              { value: "MX", label: "Mexico" },
              { value: "CO", label: "Colombia" },
              { value: "AR", label: "Argentina" },
              { value: "CL", label: "Chile" },
              { value: "PE", label: "Peru" },
              { value: "EC", label: "Ecuador" },
              { value: "VE", label: "Venezuela" },
              { value: "UY", label: "Uruguay" },
              { value: "PY", label: "Paraguay" },
              { value: "BO", label: "Bolivia" },
              { value: "CR", label: "Costa Rica" },
              { value: "PA", label: "Panama" },
              { value: "GT", label: "Guatemala" },
              { value: "HN", label: "Honduras" },
              { value: "SV", label: "El Salvador" },
              { value: "NI", label: "Nicaragua" },
              { value: "DO", label: "Dominican Republic" },
              { value: "CU", label: "Cuba" },
              { value: "PR", label: "Puerto Rico" },
              { value: "JM", label: "Jamaica" },
              { value: "TT", label: "Trinidad & Tobago" },
              { value: "HT", label: "Haiti" },
            ]} />
          </SettingRow>
          <Divider />
          <SettingRow label="Currency" description="Default currency for financial views and budgeting" icon={<Activity className="h-3.5 w-3.5" />}>
            <GeneralSelect value={currency} onChange={(v) => setCurrency(v as any)} options={[
              { value: "USD", label: "USD ($)" },
              { value: "EUR", label: "EUR (€)" },
              { value: "GBP", label: "GBP (£)" },
              { value: "CAD", label: "CAD ($)" },
              { value: "AUD", label: "AUD ($)" },
              { value: "CHF", label: "CHF (Fr)" },
              { value: "SEK", label: "SEK (kr)" },
              { value: "NOK", label: "NOK (kr)" },
              { value: "DKK", label: "DKK (kr)" },
              { value: "PLN", label: "PLN (zł)" },
              { value: "CZK", label: "CZK (Kč)" },
              { value: "HUF", label: "HUF (Ft)" },
              { value: "RON", label: "RON (lei)" },
              { value: "BGN", label: "BGN (лв)" },
              { value: "HRK", label: "HRK (kn)" },
              { value: "ISK", label: "ISK (kr)" },
              { value: "UAH", label: "UAH (₴)" },
              { value: "RSD", label: "RSD (din)" },
              { value: "RUB", label: "RUB (₽)" },
              { value: "TRY", label: "TRY (₺)" },
              { value: "ILS", label: "ILS (₪)" },
              { value: "AED", label: "AED (د.إ)" },
              { value: "SAR", label: "SAR (﷼)" },
              { value: "QAR", label: "QAR (﷼)" },
              { value: "KWD", label: "KWD (د.ك)" },
              { value: "BHD", label: "BHD (BD)" },
              { value: "OMR", label: "OMR (﷼)" },
              { value: "JOD", label: "JOD (JD)" },
              { value: "EGP", label: "EGP (£)" },
              { value: "MAD", label: "MAD (د.م.)" },
              { value: "TND", label: "TND (DT)" },
              { value: "DZD", label: "DZD (د.ج)" },
              { value: "NGN", label: "NGN (₦)" },
              { value: "GHS", label: "GHS (₵)" },
              { value: "KES", label: "KES (KSh)" },
              { value: "TZS", label: "TZS (TSh)" },
              { value: "UGX", label: "UGX (USh)" },
              { value: "ETB", label: "ETB (Br)" },
              { value: "ZAR", label: "ZAR (R)" },
              { value: "XOF", label: "XOF (CFA)" },
              { value: "XAF", label: "XAF (FCFA)" },
              { value: "BWP", label: "BWP (P)" },
              { value: "MUR", label: "MUR (₨)" },
              { value: "JPY", label: "JPY (¥)" },
              { value: "KRW", label: "KRW (₩)" },
              { value: "CNY", label: "CNY (¥)" },
              { value: "TWD", label: "TWD (NT$)" },
              { value: "HKD", label: "HKD ($)" },
              { value: "SGD", label: "SGD ($)" },
              { value: "MYR", label: "MYR (RM)" },
              { value: "THB", label: "THB (฿)" },
              { value: "VND", label: "VND (₫)" },
              { value: "PHP", label: "PHP (₱)" },
              { value: "IDR", label: "IDR (Rp)" },
              { value: "INR", label: "INR (₹)" },
              { value: "PKR", label: "PKR (₨)" },
              { value: "BDT", label: "BDT (৳)" },
              { value: "LKR", label: "LKR (₨)" },
              { value: "NPR", label: "NPR (₨)" },
              { value: "MMK", label: "MMK (K)" },
              { value: "KZT", label: "KZT (₸)" },
              { value: "NZD", label: "NZD ($)" },
              { value: "FJD", label: "FJD ($)" },
              { value: "BRL", label: "BRL (R$)" },
              { value: "MXN", label: "MXN ($)" },
              { value: "COP", label: "COP ($)" },
              { value: "ARS", label: "ARS ($)" },
              { value: "CLP", label: "CLP ($)" },
              { value: "PEN", label: "PEN (S/)" },
              { value: "UYU", label: "UYU ($)" },
              { value: "PYG", label: "PYG (₲)" },
              { value: "BOB", label: "BOB (Bs)" },
              { value: "CRC", label: "CRC (₡)" },
              { value: "PAB", label: "PAB (B/)" },
              { value: "GTQ", label: "GTQ (Q)" },
              { value: "HNL", label: "HNL (L)" },
              { value: "DOP", label: "DOP ($)" },
              { value: "JMD", label: "JMD ($)" },
              { value: "TTD", label: "TTD ($)" },
              { value: "BTC", label: "BTC (₿)" },
              { value: "ETH", label: "ETH (Ξ)" },
            ]} />
          </SettingRow>
          <Divider />
          <SettingRow label="Measurement Units" description="How measurements are shown across the system">
            <GeneralSelect value={measurementUnits} onChange={(v) => setMeasurementUnits(v as any)} options={[
              { value: "metric", label: "Metric" },
              { value: "imperial", label: "Imperial" },
            ]} />
          </SettingRow>
          <Divider />
          <SettingRow label="Number Format" description="How numbers and decimals are displayed">
            <GeneralSelect value={numberFormat} onChange={(v) => setNumberFormat(v as any)} options={[
              { value: "comma-dot", label: "1,234.56" },
              { value: "dot-comma", label: "1.234,56" },
            ]} />
          </SettingRow>
          <Divider />
          <SettingRow label="Week Starts On" description="First day of the week for calendars and planning">
            <GeneralSelect value={weekStartsOn} onChange={(v) => setWeekStartsOn(v as any)} options={[
              { value: "sunday", label: "Sunday" },
              { value: "monday", label: "Monday" },
            ]} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* ── SECTION 3: Date & Time ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Date & Time" />
          <SettingRow label="Date Format" icon={<Clock className="h-3.5 w-3.5" />}>
            <GeneralSelect value={dateFormat} onChange={(v) => setDateFormat(v as any)} options={[
              { value: "mdy", label: "MM/DD/YYYY" },
              { value: "dmy", label: "DD/MM/YYYY" },
              { value: "ymd", label: "YYYY-MM-DD" },
            ]} />
          </SettingRow>
          <Divider />
          <SettingRow label="Time Format" icon={<Clock className="h-3.5 w-3.5" />}>
            <GeneralSelect value={timeFormat} onChange={(v) => setTimeFormat(v as any)} options={[
              { value: "12h", label: "12-hour" },
              { value: "24h", label: "24-hour" },
            ]} />
          </SettingRow>
          <Divider />
          <TimezonePicker />
          <Divider />
          <SettingRow label="Default Calendar View" description="Planning view to open by default">
            <GeneralSelect value={calendarView} onChange={(v) => setCalendarView(v as any)} options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "agenda", label: "Agenda" },
            ]} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* ── SECTION 4: Startup & Session ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Startup & Session" description="How SITA behaves when launched or reopened" />
          <ChoiceRow label="Startup Behavior" value={startup} onChange={(v) => setStartup(v as any)} options={[
            { key: "lastState", label: "Last State", desc: "Resume where you left off" },
            { key: "home", label: "Home", desc: "Start at home screen" },
            { key: "dashboard", label: "Dashboard", desc: "Open main dashboard" },
          ]} />
          <Divider />
          <SettingRow label="Restore Last Session" description="Reopen your last active workspace and context" icon={<Layout className="h-3.5 w-3.5" />}>
            <NovaToggle checked={restoreSession} onChange={setRestoreSession} />
          </SettingRow>
          <Divider />
          <SettingRow label="Reopen Panels & Widgets" description="Restore panels and widgets from your previous session">
            <NovaToggle checked={reopenPanels} onChange={setReopenPanels} />
          </SettingRow>
          <Divider />
          <SettingRow label="Resume Pending Tasks" description="Bring unfinished tasks back into view when you return">
            <NovaToggle checked={resumeTasks} onChange={setResumeTasks} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* ── SECTION 5: Navigation & Behavior ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Navigation & Behavior" />
          <ChoiceRow label="Navigation Preference" value={navPref} onChange={(v) => setNavPref(v as any)} options={[
            { key: "expanded", label: "Expanded", desc: "Full sidebar visible" },
            { key: "collapsed", label: "Collapsed", desc: "Icons only" },
            { key: "minimal", label: "Minimal", desc: "Hidden until hover" },
          ]} />
          <Divider />
          <SettingRow label="Remember Last Open Panels" description="Keep recently used panels ready when you return">
            <NovaToggle checked={rememberPanels} onChange={setRememberPanels} />
          </SettingRow>
          <Divider />
          <SettingRow label="Confirm Before Leaving" description="Ask before leaving screens with unsaved work" icon={<Lock className="h-3.5 w-3.5" />}>
            <NovaToggle checked={confirmLeave} onChange={setConfirmLeave} />
          </SettingRow>
          <Divider />
          <SettingRow label="Open Links In" description="How internal links open by default">
            <GeneralSelect value={openLinksIn} onChange={(v) => setOpenLinksIn(v as any)} options={[
              { value: "same", label: "Same Workspace" },
              { value: "new", label: "New Workspace" },
              { value: "ask", label: "Ask Each Time" },
            ]} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* ── SECTION 6: Personalization ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Personalization" description="Lightweight defaults for your experience" />
          <SettingRow label="Display Name" description="How your name appears across the system" icon={<Monitor className="h-3.5 w-3.5" />}>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value as any)}
              placeholder="Your name…"
              className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground w-[140px] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:border-[hsl(var(--primary))]/40"
            />
          </SettingRow>
          <Divider />
          <ChoiceRow label="Default Focus Domain" value={focusDomain} onChange={(v) => setFocusDomain(v as any)} options={[
            { key: "business", label: "Business", desc: "Emphasize business tools" },
            { key: "household", label: "Household", desc: "Home & family focus" },
            { key: "planning", label: "Planning", desc: "Calendars & goals" },
            { key: "mixed", label: "Mixed", desc: "Balanced experience" },
          ]} />
        </VStack>
      </NovaCard>
      {/* ── SECTION 6b: Personalization — Quick Access Favorites ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Quick Access Favorites" description="Choose the tools and views you want closest at hand" />
          <QuickAccessFavorites />
        </VStack>
      </NovaCard>

      {/* ── SECTION 7: Guidance & Recommendations ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Guidance & Recommendations" description="Control in-product guidance" />
          <ChoiceRow label="Guidance Level" value={guidanceLevel} onChange={(v) => setGuidanceLevel(v as any)} options={[
            { key: "minimal", label: "Minimal", desc: "Less help, more space" },
            { key: "standard", label: "Standard", desc: "Balanced guidance" },
            { key: "guided", label: "Guided", desc: "Full onboarding cues" },
          ]} />
          <Divider />
          <SettingRow label="Show New Feature Tips" description="Highlight newly available tools as they are added">
            <NovaToggle checked={featureTips} onChange={setFeatureTips} />
          </SettingRow>
          <Divider />
          <SettingRow label="Show Update Highlights" description="Summary of what changed after major updates">
            <NovaToggle checked={updateHighlights} onChange={setUpdateHighlights} />
          </SettingRow>
          <Divider />
          <SettingRow label="Show Setup Recommendations" description="Suggest configuration improvements as your system evolves">
            <NovaToggle checked={setupRecs} onChange={setSetupRecs} />
          </SettingRow>
          <DeepLink label="More AI & advisor controls" section="advisors" />
        </VStack>
      </NovaCard>

      {/* ── SECTION 8: Approval Experience ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Approval Experience" description="How SITA presents approvals for important actions" />
          <ChoiceRow label="Approval Style" value={approvalStyle} onChange={(v) => setApprovalStyle(v as any)} options={[
            { key: "ask-as-needed", label: "Ask as Needed", desc: "Prompt close to each action" },
            { key: "batch-reviews", label: "Batch Reviews", desc: "Group approvals into digests" },
            { key: "minimal-interruptions", label: "Minimal", desc: "Only high-signal approvals" },
          ]} />
          <DeepLink label="More trust & security controls" section="trustsec" />
        </VStack>
      </NovaCard>

      {/* ── SECTION 9: Reset & Restore ── */}
      <NovaCard>
        <VStack spacing="tight">
          <SectionHeader title="Reset & Restore" description="Safely manage your General settings" />
          <GeneralResetActions />
        </VStack>
      </NovaCard>
    </VStack>
  );
}

const QUICK_ACCESS_OPTIONS = [
  { id: "home", label: "Home", icon: <HomeIcon className="h-3 w-3" /> },
  { id: "dashboard", label: "Dashboard", icon: <Layout className="h-3 w-3" /> },
  { id: "boardroom", label: "Boardroom", icon: <Activity className="h-3 w-3" /> },
  { id: "finance", label: "Finance", icon: <Activity className="h-3 w-3" /> },
  { id: "business", label: "Business", icon: <Activity className="h-3 w-3" /> },
  { id: "household", label: "Household", icon: <HomeIcon className="h-3 w-3" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-3 w-3" /> },
  { id: "launchpad", label: "Launchpad", icon: <Layout className="h-3 w-3" /> },
];

function QuickAccessFavorites() {
  const [favorites, setFavorites] = useSettingsValue("general.quickAccessFavorites", ["home", "dashboard", "boardroom", "finance"] as any);
  const favList = Array.isArray(favorites) ? favorites as string[] : ["home", "dashboard", "boardroom", "finance"];

  const toggle = useCallback((id: string) => {
    const next = favList.includes(id) ? favList.filter(f => f !== id) : [...favList, id];
    setFavorites(next as any);
    trackSettingChange("general.quickAccessFavorites", favList, next);
  }, [favList, setFavorites]);

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {QUICK_ACCESS_OPTIONS.map(opt => {
        const active = favList.includes(opt.id);
        return (
          <button key={opt.id} onClick={() => toggle(opt.id)} className={cn(
            "flex flex-col items-center gap-1 rounded-lg border p-2 text-[9px] transition-all",
            active
              ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]"
              : "border-border/30 text-[hsl(0_0%_50%)] hover:border-border/60 hover:text-foreground"
          )}>
            {opt.icon}
            <span className="font-medium">{opt.label}</span>
            {active && <Star className="h-2 w-2 fill-current" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Timezone Picker ──

const ALL_TIMEZONES = (() => {
  try {
    return (Intl as any).supportedValuesOf("timeZone") as string[];
  } catch {
    return [
      "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
      "America/Bogota", "America/Sao_Paulo", "America/Mexico_City", "America/Toronto",
      "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
      "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
      "Australia/Sydney", "Pacific/Auckland", "UTC",
    ];
  }
})();

function TimezonePicker() {
  const [tz, setTz] = useSettingsValue("general.timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [favorites, setFavorites] = useSettingsValue("general.timezoneFavorites", [] as any);
  const favList = (Array.isArray(favorites) ? favorites : []) as string[];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const recentKey = "sita:tz-recent";
  const [recents] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(recentKey) || "[]").slice(0, 5); } catch { return []; }
  });

  const filtered = query.trim()
    ? ALL_TIMEZONES.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 30)
    : [];

  // Group timezones by region for browsable list (like macOS/Windows)
  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const t of ALL_TIMEZONES) {
      const slash = t.indexOf("/");
      const region = slash > 0 ? t.substring(0, slash) : "Other";
      if (!groups[region]) groups[region] = [];
      groups[region].push(t);
    }
    // Sort regions sensibly
    const order = ["America", "Europe", "Asia", "Africa", "Australia", "Pacific", "Atlantic", "Indian", "Arctic", "Antarctica", "Other"];
    return order
      .filter(r => groups[r]?.length)
      .map(r => ({ region: r, zones: groups[r].sort() }));
  }, []);

  const selectTz = useCallback((newTz: string) => {
    setTz(newTz as any);
    setOpen(false);
    setQuery("");
    try {
      const prev = JSON.parse(localStorage.getItem(recentKey) || "[]") as string[];
      const next = [newTz, ...prev.filter(t => t !== newTz)].slice(0, 5);
      localStorage.setItem(recentKey, JSON.stringify(next));
    } catch {}
    trackSettingChange("general.timezone", tz, newTz);
  }, [tz, setTz]);

  const toggleFav = useCallback((tzId: string) => {
    const next = favList.includes(tzId) ? favList.filter(f => f !== tzId) : [...favList, tzId].slice(0, 5);
    setFavorites(next as any);
  }, [favList, setFavorites]);

  if (!open) {
    return (
      <SettingRow label="Timezone" description={tz} icon={<Globe className="h-3.5 w-3.5" />}>
        <NovaButton variant="secondary" onClick={() => setOpen(true)} className="!text-[9px] !py-1 !px-2">
          Change
        </NovaButton>
      </SettingRow>
    );
  }

  return (
    <VStack spacing="tight">
      <HStack spacing="tight" align="center" justify="between">
        <NovaSectionLabel className="!px-0 !text-[9px]">Select Timezone</NovaSectionLabel>
        <button onClick={() => { setOpen(false); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </HStack>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search timezone…"
          className="w-full text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md pl-6 pr-2 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--primary))]/40"
        />
      </div>
      {/* Favorites */}
      {favList.length > 0 && !query && (
        <VStack spacing="micro">
          <NovaText variant="label" muted className="!text-[8px] !uppercase !tracking-wider">Favorites</NovaText>
          {favList.map(f => (
            <TzRow key={f} tz={f} active={tz === f} isFav onSelect={selectTz} onToggleFav={toggleFav} />
          ))}
        </VStack>
      )}
      {/* Recents */}
      {recents.length > 0 && !query && (
        <VStack spacing="micro">
          <NovaText variant="label" muted className="!text-[8px] !uppercase !tracking-wider">Recent</NovaText>
          {recents.filter(r => !favList.includes(r)).map(r => (
            <TzRow key={r} tz={r} active={tz === r} isFav={false} onSelect={selectTz} onToggleFav={toggleFav} />
          ))}
        </VStack>
      )}
      {/* Search results */}
      {query && (
        <div className="max-h-36 overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <NovaText variant="label" muted className="!text-[9px] py-2 text-center">No timezones match "{query}"</NovaText>
          ) : filtered.map(t => (
            <TzRow key={t} tz={t} active={tz === t} isFav={favList.includes(t)} onSelect={selectTz} onToggleFav={toggleFav} />
          ))}
        </div>
      )}
      {/* All timezones grouped by region (when not searching) */}
      {!query && (
        <div className="max-h-52 overflow-y-auto space-y-2 scrollbar-thin">
          {grouped.map(g => (
            <VStack key={g.region} spacing="micro">
              <NovaText variant="label" muted className="!text-[8px] !uppercase !tracking-wider sticky top-0 bg-[hsl(225_12%_10%)] z-10 py-0.5">{g.region}</NovaText>
              {g.zones.map(t => (
                <TzRow key={t} tz={t} active={tz === t} isFav={favList.includes(t)} onSelect={selectTz} onToggleFav={toggleFav} />
              ))}
            </VStack>
          ))}
        </div>
      )}
    </VStack>
  );
}

function TzRow({ tz, active, isFav, onSelect, onToggleFav }: {
  tz: string; active: boolean; isFav: boolean; onSelect: (tz: string) => void; onToggleFav: (tz: string) => void;
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] transition-colors cursor-pointer",
      active ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]" : "hover:bg-[hsl(0_0%_100%/0.04)] text-foreground"
    )}>
      <button onClick={() => onSelect(tz)} className="flex-1 text-left truncate">{tz.replace(/_/g, " ")}</button>
      <button onClick={(e) => { e.stopPropagation(); onToggleFav(tz); }} className="shrink-0" title={isFav ? "Remove from favorites" : "Add to favorites"}>
        <Star className={cn("h-2.5 w-2.5", isFav ? "fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "text-muted-foreground/40")} />
      </button>
      {active && <Check className="h-2.5 w-2.5 shrink-0" />}
    </div>
  );
}

function trackSettingChange(key: string, oldValue: unknown, newValue: unknown) {
  try {
    window.dispatchEvent(new CustomEvent("sita-analytics", {
      detail: {
        event: "settings.general.changed",
        properties: { key, oldValue, newValue, timestamp: new Date().toISOString() },
      },
    }));
  } catch {}
}

function GeneralResetActions() {
  type Phase = "idle" | "preview-restore" | "preview-reset";
  const [phase, setPhase] = useState<Phase>("idle");

  // Compute which user-layer general keys differ from defaults
  const changedKeys = (() => {
    const userNs = SettingsService.getNamespace("general.");
    const diffs: { key: string; current: unknown; default_: unknown }[] = [];
    // Also check cross-section keys managed from General
    const crossKeys = ["appearance.theme", "sound.uiSounds", "appearance.reduceMotion"];
    const allKeys = [...Object.keys(userNs), ...crossKeys];
    for (const key of new Set(allKeys)) {
      const layers = (SettingsService as any).layers as Record<string, Map<string, unknown>>;
      if (!layers.user.has(key)) continue;
      const userVal = layers.user.get(key);
      const defVal = layers.default.get(key);
      if (JSON.stringify(userVal) !== JSON.stringify(defVal)) {
        diffs.push({ key, current: userVal, default_: defVal });
      }
    }
    return diffs;
  })();

  const executeReset = useCallback((mode: "restore" | "reset") => {
    const ns = SettingsService.getNamespace("general.");
    for (const key of Object.keys(ns)) SettingsService.delete(key as any, "user");
    if (mode === "restore") {
      SettingsService.delete("appearance.theme", "user");
      SettingsService.delete("sound.uiSounds", "user");
      SettingsService.delete("appearance.reduceMotion", "user");
    }
    toast.success(mode === "restore" ? "Restored recommended defaults" : "General preferences reset");
    setPhase("idle");
    trackSettingChange("general.*", "custom", mode);
    window.dispatchEvent(new CustomEvent("nova-settings-reset", { detail: { section: "general" } }));
  }, []);

  const doExport = useCallback(() => {
    const snapshot = SettingsService.exportSettings();
    const blob = new Blob([snapshot], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sita-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings snapshot exported");
  }, []);

  // ── Step 2: Preview panel ──
  if (phase === "preview-restore" || phase === "preview-reset") {
    const mode = phase === "preview-restore" ? "restore" : "reset";
    const label = mode === "restore" ? "Restore Defaults" : "Reset Preferences";
    return (
      <VStack spacing="tight">
        <HStack spacing="tight" align="center" justify="between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-[hsl(38_85%_50%)]" />
            <NovaText variant="body" className="!font-semibold">{label}</NovaText>
          </div>
          <NovaButton variant="secondary" onClick={() => setPhase("idle")} className="!text-[9px] !py-1 !px-2">
            Cancel
          </NovaButton>
        </HStack>
        <NovaText variant="label" muted className="!text-[9px]">
          {changedKeys.length === 0
            ? "No custom overrides found — settings are already at defaults."
            : `The following ${changedKeys.length} setting${changedKeys.length > 1 ? "s" : ""} will revert:`}
        </NovaText>
        {changedKeys.length > 0 && (
          <div className="max-h-32 overflow-y-auto rounded-lg border border-border/30 bg-[hsl(0_0%_100%/0.02)]">
            {changedKeys.map(({ key, current, default_ }) => (
              <div key={key} className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/10 last:border-b-0 text-[9px]">
                <span className="text-foreground font-medium truncate max-w-[140px]" title={key}>
                  {key.replace("general.", "").replace("appearance.", "").replace("sound.", "")}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-destructive/70 line-through">{String(current)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-[hsl(var(--trust-safe))]">{String(default_)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {changedKeys.length > 0 && (
          <NovaButton
            variant="primary"
            onClick={() => executeReset(mode)}
            icon={<RotateCcw className="h-3 w-3" />}
            className="!text-[9px] !py-1.5 !bg-[hsl(0_65%_50%)] hover:!bg-[hsl(0_65%_45%)] w-full"
          >
            Confirm — Revert {changedKeys.length} Setting{changedKeys.length > 1 ? "s" : ""}
          </NovaButton>
        )}
      </VStack>
    );
  }

  // ── Step 1: Action buttons ──
  return (
    <VStack spacing="tight">
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="body">Restore Recommended Defaults</NovaText>
          <NovaText variant="label" muted className="!text-[9px]">Return to SITA's recommended configuration</NovaText>
        </VStack>
        <NovaButton variant="secondary" onClick={() => setPhase("preview-restore")} icon={<RotateCcw className="h-3 w-3" />} className="!text-[9px] !py-1 !px-2.5">
          Restore
        </NovaButton>
      </HStack>
      <Divider />
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="body">Reset General Preferences</NovaText>
          <NovaText variant="label" muted className="!text-[9px]">Clear all custom settings on this page</NovaText>
        </VStack>
        <NovaButton variant="secondary" onClick={() => setPhase("preview-reset")} icon={<Trash2 className="h-3 w-3" />} className="!text-[9px] !py-1 !px-2.5">
          Reset
        </NovaButton>
      </HStack>
      <Divider />
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="body">Export Settings Snapshot</NovaText>
          <NovaText variant="label" muted className="!text-[9px]">Download a JSON snapshot of all your settings</NovaText>
        </VStack>
        <NovaButton variant="secondary" onClick={doExport} icon={<Download className="h-3 w-3" />} className="!text-[9px] !py-1 !px-2.5">
          Export
        </NovaButton>
      </HStack>
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
  const [nightShiftIntensity, setNightShiftIntensity] = useSettingsValue("display.nightShiftIntensity", 0.5);
  const [scaling, setScaling] = useSettingsValue("display.scaling", 1);
  const [autoBrightness, setAutoBrightness] = useSettingsValue("display.autoBrightness", true);
  const [trueTone, setTrueTone] = useSettingsValue("display.trueTone", true);
  const [refreshRate, setRefreshRate] = useSettingsValue("display.refreshRate", "auto");

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={brightnessPercent} onChange={(v) => setBrightness(v / 100 as any)} label="Brightness" />
          <Divider />
          <SettingRow label="Auto-Brightness" description="Adjust based on ambient light" icon={<Sun className="h-3.5 w-3.5" />}>
            <NovaToggle checked={autoBrightness} onChange={setAutoBrightness} />
          </SettingRow>
          <Divider />
          <SettingRow label="True Tone" description="Adapt display to ambient lighting" icon={<Monitor className="h-3.5 w-3.5" />}>
            <NovaToggle checked={trueTone} onChange={setTrueTone} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Night Shift" description="Warm colors after sunset" icon={<Sun className="h-3.5 w-3.5" />}>
            <NovaToggle checked={nightShift} onChange={setNightShift} />
          </SettingRow>
          {nightShift && (
            <>
              <Divider />
              <NovaSlider
                value={Math.round(nightShiftIntensity * 100)}
                onChange={(v) => setNightShiftIntensity(v / 100 as any)}
                label="Warmth Intensity"
              />
            </>
          )}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider
            value={Math.round(scaling * 100)}
            onChange={(v) => setScaling(v / 100 as any)}
            label={`Display Scaling — ${Math.round(scaling * 100)}%`}
          />
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="Refresh Rate" icon={<Monitor className="h-3.5 w-3.5" />}>
          <select
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value as any)}
            className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground"
          >
            <option value="auto">Auto (ProMotion)</option>
            <option value="60">60 Hz</option>
            <option value="120">120 Hz</option>
          </select>
        </SettingRow>
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
  const [highContrast, setHighContrast] = useSettingsValue("accessibility.highContrast", false);
  const [boldText, setBoldText] = useSettingsValue("accessibility.boldText", false);
  const [textSize, setTextSize] = useSettingsValue("accessibility.textSize", 100);
  const [reduceMotion, setReduceMotion] = useSettingsValue("appearance.reduceMotion", false);
  const [reduceAutoPlay, setReduceAutoPlay] = useSettingsValue("accessibility.reduceAutoPlayEffects", false);
  const [voiceOver, setVoiceOver] = useSettingsValue("accessibility.voiceOver", false);
  const [zoom, setZoom] = useSettingsValue("accessibility.zoom", false);
  const [zoomLevel, setZoomLevel] = useSettingsValue("accessibility.zoomLevel", 1);
  const [stickyKeys, setStickyKeys] = useSettingsValue("accessibility.stickyKeys", false);
  const [fullKeyboardNav, setFullKeyboardNav] = useSettingsValue("accessibility.fullKeyboardNav", true);
  const [focusIndicators, setFocusIndicators] = useSettingsValue("accessibility.focusIndicators", true);
  const [cursorSize, setCursorSize] = useSettingsValue("accessibility.cursorSize", "normal");
  const [screenReader, setScreenReader] = useSettingsValue("accessibility.screenReaderOptimized", false);
  const [verbosity, setVerbosity] = useSettingsValue("accessibility.announcementVerbosity", "standard");

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = textSize !== 100 ? `${textSize}%` : "";
  }, [textSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("bold-text", boldText);
  }, [boldText]);

  return (
    <VStack spacing="tight">
      {/* Vision */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Vision</NovaSectionLabel>
          <SettingRow label="VoiceOver" description="Screen reader for spoken feedback" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <NovaToggle checked={voiceOver} onChange={(v) => { setVoiceOver(v); if (v) toast.success("VoiceOver enabled"); }} />
          </SettingRow>
          <Divider />
          <SettingRow label="Zoom" description="Magnify screen content" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={zoom} onChange={setZoom} />
          </SettingRow>
          {zoom && (
            <>
              <Divider />
              <NovaSlider value={zoomLevel * 10} onChange={(v) => setZoomLevel(v / 10 as any)} label={`Zoom Level — ${zoomLevel.toFixed(1)}×`} />
            </>
          )}
          <Divider />
          <SettingRow label="High Contrast" description="Increase contrast for visibility" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={highContrast} onChange={setHighContrast} />
          </SettingRow>
          <Divider />
          <SettingRow label="Bold Text" description="Make all text bolder" icon={<Type className="h-3.5 w-3.5" />}>
            <NovaToggle checked={boldText} onChange={setBoldText} />
          </SettingRow>
          <Divider />
          <NovaSlider value={textSize} onChange={(v) => setTextSize(v as any)} label={`Text Size — ${textSize}%`} />
          <Divider />
          <SettingRow label="Cursor Size" icon={<Monitor className="h-3.5 w-3.5" />}>
            <select
              value={cursorSize}
              onChange={(e) => setCursorSize(e.target.value as any)}
              className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground"
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* Motion */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Motion</NovaSectionLabel>
          <SettingRow label="Reduce Motion" description="Minimize all animations" icon={<Activity className="h-3.5 w-3.5" />}>
            <NovaToggle checked={reduceMotion} onChange={setReduceMotion} />
          </SettingRow>
          <Divider />
          <SettingRow label="Reduce Auto-Play" description="Stop auto-playing media" icon={<Activity className="h-3.5 w-3.5" />}>
            <NovaToggle checked={reduceAutoPlay} onChange={setReduceAutoPlay} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* Interaction */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Interaction</NovaSectionLabel>
          <SettingRow label="Sticky Keys" description="Press modifier keys sequentially" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <NovaToggle checked={stickyKeys} onChange={setStickyKeys} />
          </SettingRow>
          <Divider />
          <SettingRow label="Full Keyboard Navigation" description="Tab through all controls" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <NovaToggle checked={fullKeyboardNav} onChange={setFullKeyboardNav} />
          </SettingRow>
          <Divider />
          <SettingRow label="Focus Indicators" description="Visible focus outlines" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <NovaToggle checked={focusIndicators} onChange={setFocusIndicators} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* Screen Reader */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Screen Reader</NovaSectionLabel>
          <SettingRow label="Screen Reader Optimized" description="Optimize layout for assistive tech" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <NovaToggle checked={screenReader} onChange={(v) => { setScreenReader(v); if (v) toast.success("Screen reader optimizations enabled"); }} />
          </SettingRow>
          <Divider />
          <SettingRow label="Announcement Verbosity" icon={<Accessibility className="h-3.5 w-3.5" />}>
            <select
              value={verbosity}
              onChange={(e) => setVerbosity(e.target.value as any)}
              className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground"
            >
              <option value="minimal">Minimal</option>
              <option value="standard">Standard</option>
              <option value="verbose">Verbose</option>
            </select>
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

// ── Desktop Widgets ──────────────────────────────────────────

const WIDGET_CATEGORIES: { key: string; label: string; types: string[] }[] = [
  { key: "core", label: "Core", types: ["clock", "system", "quick-actions", "calendar", "notifications", "continuity", "apps-rail"] },
  { key: "business", label: "Business", types: ["crm-pipeline", "leads-recovered", "business-kpi", "boardroom-brief"] },
  { key: "finance", label: "Finance", types: ["investment-pulse", "finance-snapshot", "portfolio-globe"] },
  { key: "lifestyle", label: "Lifestyle", types: ["weather", "concierge-tasks", "what-matters", "advisor-council", "notifications-feed", "calendar-today"] },
];

const WIDGET_ICON_MAP: Record<string, any> = {
  clock: Clock, system: Activity, "quick-actions": Layout, calendar: Clock,
  notifications: Bell, continuity: ChevronRight, "apps-rail": Layout,
  "crm-pipeline": TrendingUp, "leads-recovered": Eye, "business-kpi": TrendingUp,
  "boardroom-brief": Brain, "investment-pulse": TrendingUp, "finance-snapshot": DollarSign,
  "portfolio-globe": Globe, weather: Sun, "concierge-tasks": Activity,
  "what-matters": Activity, "advisor-council": Brain, "notifications-feed": Bell,
  "calendar-today": Clock,
};

import { useDesktopWidgets } from "@/hooks/useDesktopWidgets";
import { DollarSign, TrendingUp, Brain } from "lucide-react";

export function WidgetsContent() {
  const { widgets, hiddenWidgets, allWidgets, addWidget, removeWidget, resizeWidget, resetWidgets, allTypes } = useDesktopWidgets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const visibleCount = widgets.length;
  const totalCount = allTypes.length;

  const filteredTypes = allTypes.filter(w => {
    const q = search.toLowerCase();
    const matchSearch = !q || w.label.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q);
    const matchCat = activeCategory === "all" || WIDGET_CATEGORIES.find(c => c.key === activeCategory)?.types.includes(w.type);
    return matchSearch && matchCat;
  });

  const isVisible = (type: string) => allWidgets.find(w => w.type === type)?.visible ?? false;

  const toggleWidget = (type: string) => {
    if (isVisible(type)) {
      const w = allWidgets.find(ww => ww.type === type);
      if (w) removeWidget(w.id);
    } else {
      addWidget(type);
    }
  };

  const getSize = (type: string) => allWidgets.find(w => w.type === type)?.size || "md";

  const handleResize = (type: string, size: "sm" | "md" | "lg") => {
    const w = allWidgets.find(ww => ww.type === type);
    if (w) resizeWidget(w.id, size);
  };

  return (
    <VStack spacing="tight">
      {/* Stats */}
      <NovaCard>
        <HStack spacing="tight" align="center" className="justify-between">
          <VStack spacing="micro">
            <NovaText variant="label" className="!text-[11px] font-semibold">Desktop Widgets</NovaText>
            <NovaText variant="label" muted>{visibleCount} active of {totalCount} available</NovaText>
          </VStack>
          <HStack spacing="micro">
            <NovaBadge variant="info" className="!text-[9px]">{visibleCount} Active</NovaBadge>
            <NovaBadge variant="default" className="!text-[9px]">{totalCount - visibleCount} Hidden</NovaBadge>
          </HStack>
        </HStack>
      </NovaCard>

      {/* Search & Filter */}
      <NovaCard>
        <VStack spacing="tight">
          <div className="relative">
            <Eye className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(0_0%_50%)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search widgets…"
              className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[10px] bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] text-foreground placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:border-[hsl(var(--primary)/0.4)]"
            />
          </div>
          <HStack spacing="micro">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[9px] font-medium transition-all",
                activeCategory === "all"
                  ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                  : "text-[hsl(0_0%_55%)] hover:text-[hsl(0_0%_75%)] hover:bg-[hsl(0_0%_100%/0.04)]"
              )}
            >All</button>
            {WIDGET_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[9px] font-medium transition-all",
                  activeCategory === cat.key
                    ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                    : "text-[hsl(0_0%_55%)] hover:text-[hsl(0_0%_75%)] hover:bg-[hsl(0_0%_100%/0.04)]"
                )}
              >{cat.label}</button>
            ))}
          </HStack>
        </VStack>
      </NovaCard>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 gap-1.5">
        {filteredTypes.map(w => {
          const IconComp = WIDGET_ICON_MAP[w.type] || Layout;
          const active = isVisible(w.type);
          const currentSize = getSize(w.type);
          return (
            <NovaCard key={w.type} className={cn(
              "transition-all",
              active && "ring-1 ring-[hsl(var(--primary)/0.2)]"
            )}>
              <HStack spacing="tight" align="center" className="justify-between">
                <HStack spacing="tight" align="center" className="flex-1 min-w-0">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    active ? "bg-[hsl(var(--primary)/0.15)]" : "bg-[hsl(0_0%_100%/0.04)]"
                  )}>
                    <IconComp className={cn("h-3.5 w-3.5", active ? "text-[hsl(var(--primary))]" : "text-[hsl(0_0%_50%)]")} />
                  </div>
                  <VStack spacing="micro" className="min-w-0">
                    <NovaText variant="label" className="!text-[10px] font-medium truncate">{w.label}</NovaText>
                    <NovaText variant="label" muted className="!text-[8px] truncate">{w.description}</NovaText>
                  </VStack>
                </HStack>
                <HStack spacing="micro" align="center">
                  {active && (
                    <HStack spacing="micro">
                      {(["sm", "md", "lg"] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => handleResize(w.type, s)}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-medium transition-all",
                            currentSize === s
                              ? "bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]"
                              : "text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_65%)]"
                          )}
                        >{s.toUpperCase()}</button>
                      ))}
                    </HStack>
                  )}
                  <NovaToggle checked={active} onChange={() => toggleWidget(w.type)} />
                </HStack>
              </HStack>
            </NovaCard>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <NovaCard>
          <NovaText variant="label" muted className="text-center py-4">No widgets match your search</NovaText>
        </NovaCard>
      )}

      {/* Reset */}
      <NovaCard>
        <HStack spacing="tight" align="center" className="justify-between">
          <VStack spacing="micro">
            <NovaText variant="label" className="!text-[10px] font-medium">Reset Widget Layout</NovaText>
            <NovaText variant="label" muted className="!text-[8px]">Restore default positions and visibility</NovaText>
          </VStack>
          <NovaButton variant="secondary" className="!text-[10px]" onClick={() => { resetWidgets(); toast.success("Widgets reset to defaults"); }}>
            Reset
          </NovaButton>
        </HStack>
      </NovaCard>
    </VStack>
  );
}
