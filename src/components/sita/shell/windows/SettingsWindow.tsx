// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Window (Full Nova SDK)
// Wired to SettingsService for persistent settings
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Monitor, Volume2, Wifi, Settings, Moon, Sun, Shield, Palette,
  Bell, User, HardDrive, Globe, Keyboard, Lock, Eye, Bluetooth,
  Battery, Zap, Info, ChevronRight, Check, Camera, LogOut, Trash2, KeyRound,
  Cloud, RefreshCw, RotateCcw,
} from "lucide-react";
import {
  AppLayout,
  VStack, HStack, Divider,
} from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaList,
  NovaSectionLabel, NovaToggle, NovaSlider,
  NovaBadge, NovaToolbar, NovaAvatar, NovaInput, NovaModal,
} from "@/lib/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { SettingsService } from "@/lib/nova-sdk/services/settings-service";
import type { SettingsSchema } from "@/lib/nova-sdk/services/settings-service";

// ── Section definitions ────────────────────────────────────

const SECTIONS = [
  { id: "profile",     label: "Profile",     icon: <User className="h-3.5 w-3.5" />,    group: "Account" },
  { id: "security",    label: "Security",    icon: <Shield className="h-3.5 w-3.5" />,   group: "Account" },
  { id: "general",     label: "General",     icon: <Settings className="h-3.5 w-3.5" />, group: "System" },
  { id: "appearance",  label: "Appearance",  icon: <Palette className="h-3.5 w-3.5" />,  group: "System" },
  { id: "display",     label: "Display",     icon: <Monitor className="h-3.5 w-3.5" />,  group: "System" },
  { id: "sound",       label: "Sound",       icon: <Volume2 className="h-3.5 w-3.5" />,  group: "System" },
  { id: "network",     label: "Network",     icon: <Wifi className="h-3.5 w-3.5" />,     group: "Connectivity" },
  { id: "bluetooth",   label: "Bluetooth",   icon: <Bluetooth className="h-3.5 w-3.5" />,group: "Connectivity" },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" />,group: "Preferences" },
  { id: "privacy",     label: "Privacy",     icon: <Shield className="h-3.5 w-3.5" />,   group: "Preferences" },
  { id: "keyboard",    label: "Keyboard",    icon: <Keyboard className="h-3.5 w-3.5" />, group: "Preferences" },
  { id: "cloudsync",   label: "Cloud & Sync", icon: <Cloud className="h-3.5 w-3.5" />,   group: "Connectivity" },
  { id: "about",       label: "About",       icon: <Info className="h-3.5 w-3.5" />,     group: "Info" },
];

const GROUPS = ["Account", "System", "Connectivity", "Preferences", "Info"];

// ── Setting row helper ─────────────────────────────────────

function SettingRow({ label, description, icon, children }: {
  label: string; description?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <HStack spacing="normal" justify="between" align="center" className="min-h-[36px]">
      <HStack spacing="tight" align="center" className="flex-1 min-w-0">
        {icon && <span className="text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] flex-shrink-0">{icon}</span>}
        <VStack spacing="micro">
          <NovaText variant="body">{label}</NovaText>
          {description && <NovaText variant="label" muted className="!text-[10px]">{description}</NovaText>}
        </VStack>
      </HStack>
      <div className="flex-shrink-0">{children}</div>
    </HStack>
  );
}

// ── Reset to Defaults Button ───────────────────────────────

const SECTION_KEYS: Record<string, (keyof SettingsSchema)[]> = {
  general: ["appearance.theme", "sound.uiSounds", "appearance.reduceMotion"],
  appearance: ["appearance.accentColor", "appearance.reduceTransparency", "appearance.wallpaper"],
  display: ["display.brightness", "display.nightShift", "display.resolution", "display.scaling", "display.nightShiftIntensity"],
  sound: ["sound.volume", "sound.mute", "sound.alertVolume", "sound.alertSound", "sound.uiSounds"],
  network: ["network.wifi.autoJoin", "network.dns", "network.proxy"],
  bluetooth: ["bluetooth.enabled"],
  notifications: ["notifications.doNotDisturb", "notifications.showPreviews", "notifications.badges"],
  privacy: ["privacy.analytics", "privacy.crashReports", "privacy.locationServices"],
  keyboard: ["input.keyRepeatRate", "input.keyRepeatDelay", "input.autocorrect"],
  cloudsync: ["cloud.syncEnabled", "cloud.lastSyncAt"],
};

function ResetSectionButton({ sectionId }: { sectionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const keys = SECTION_KEYS[sectionId];
  if (!keys) return null;

  const handleReset = useCallback(() => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    for (const key of keys) {
      SettingsService.delete(key, "user");
    }
    toast.success("Settings reset to defaults");
    setConfirming(false);
    // Force re-render by dispatching settings event
    window.dispatchEvent(new CustomEvent("nova-settings-reset", { detail: { section: sectionId } }));
  }, [confirming, keys, sectionId]);

  return (
    <NovaCard>
      <HStack spacing="tight" justify="between" align="center">
        <VStack spacing="micro">
          <NovaText variant="body">Reset to Defaults</NovaText>
          <NovaText variant="label" muted className="!text-[10px]">Clear all custom overrides in this section</NovaText>
        </VStack>
        <NovaButton
          variant={confirming ? "primary" : "secondary"}
          onClick={handleReset}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          className={cn(
            "!text-[10px] !py-1 !px-3 transition-colors",
            confirming && "!bg-[hsl(0_65%_50%)] hover:!bg-[hsl(0_65%_45%)]"
          )}
        >
          {confirming ? "Confirm Reset" : "Reset"}
        </NovaButton>
      </HStack>
    </NovaCard>
  );
}

// ── Profile Content ────────────────────────────────────────

function ProfileContent() {
  const { user, isDemo } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || isDemo) {
      setDisplayName("Demo User");
      setAvatarUrl(null);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
      }
      setLoading(false);
    })();
  }, [user, isDemo]);

  const handleSaveName = useCallback(async () => {
    if (!user || isDemo) { toast.info("Sign in to save changes"); return; }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to update name");
    else toast.success("Name updated");
  }, [user, isDemo, displayName]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isDemo) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl + "?t=" + Date.now();

    await (supabase as any)
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    setAvatarUrl(publicUrl);
    setUploading(false);
    toast.success("Avatar updated");
  }, [user, isDemo]);

  if (loading) {
    return (
      <VStack spacing="tight" align="center" className="py-8">
        <NovaText variant="label" muted>Loading profile…</NovaText>
      </VStack>
    );
  }

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="normal" align="center" className="py-4">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[hsl(0_0%_0%/0.06)] dark:ring-[hsl(0_0%_100%/0.06)]"
              />
            ) : (
              <NovaAvatar
                icon={displayName?.charAt(0)?.toUpperCase() || "?"}
                size={64}
                gradient="from-[hsl(265_55%_58%)] to-[hsl(210_80%_55%)]"
              />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isDemo}
              className={cn(
                "absolute inset-0 rounded-full flex items-center justify-center",
                "bg-[hsl(0_0%_0%/0.5)] opacity-0 group-hover:opacity-100 transition-opacity",
                uploading && "opacity-100"
              )}
            >
              <Camera className="h-5 w-5 text-[hsl(0_0%_100%)]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <NovaText variant="title">{displayName || "User"}</NovaText>
          <NovaText variant="label" muted>{user?.email || "demo@sita.os"}</NovaText>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Display Name</NovaSectionLabel>
          <HStack spacing="tight">
            <NovaInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="flex-1"
            />
            <NovaButton
              variant="primary"
              onClick={handleSaveName}
              disabled={saving || isDemo}
              className="!text-[10px] !py-1 !px-3"
            >
              {saving ? "Saving…" : "Save"}
            </NovaButton>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Email" description="Cannot be changed" icon={<Globe className="h-3.5 w-3.5" />}>
            <NovaText variant="label" muted>{user?.email || "demo@sita.os"}</NovaText>
          </SettingRow>
          <Divider />
          <SettingRow label="Member Since" icon={<Info className="h-3.5 w-3.5" />}>
            <NovaText variant="label" muted>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </NovaText>
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

// ── Security Content ───────────────────────────────────────

function SecurityContent() {
  const { user, isDemo, signOut, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChangePassword = useCallback(async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setChangingPw(true);
    const { error } = await updatePassword(newPassword);
    setChangingPw(false);
    if (error) toast.error(error.message || "Failed to update password");
    else {
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [newPassword, confirmPassword, updatePassword]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast.success("Signed out");
  }, [signOut]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Change Password</NovaSectionLabel>
          <NovaInput
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <NovaInput
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <NovaButton
            variant="primary"
            onClick={handleChangePassword}
            disabled={changingPw || isDemo || !newPassword}
            icon={<KeyRound className="h-3.5 w-3.5" />}
            className="!text-[11px]"
          >
            {changingPw ? "Updating…" : "Update Password"}
          </NovaButton>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Two-Factor Auth" description="Not yet available" icon={<Lock className="h-3.5 w-3.5" />}>
            <NovaBadge>Coming Soon</NovaBadge>
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaButton
            variant="secondary"
            onClick={handleSignOut}
            icon={<LogOut className="h-3.5 w-3.5" />}
            className="w-full !text-[11px]"
          >
            Sign Out
          </NovaButton>
          <Divider />
          <NovaButton
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDemo}
            icon={<Trash2 className="h-3.5 w-3.5" />}
            className="w-full !text-[11px] !text-[hsl(0_65%_50%)] hover:!bg-[hsl(0_65%_50%/0.08)]"
          >
            Delete Account
          </NovaButton>
        </VStack>
      </NovaCard>

      {showDeleteModal && (
        <NovaModal
          open={showDeleteModal}
          title="Delete Account"
          onClose={() => setShowDeleteModal(false)}
        >
          <VStack spacing="normal">
            <NovaText variant="body">
              This action is irreversible. All your data will be permanently deleted.
            </NovaText>
            <HStack spacing="tight" justify="end">
              <NovaButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </NovaButton>
              <NovaButton
                variant="primary"
                className="!bg-[hsl(0_65%_50%)] hover:!bg-[hsl(0_65%_45%)]"
                onClick={() => { toast.info("Contact support to delete your account"); setShowDeleteModal(false); }}
              >
                Delete Account
              </NovaButton>
            </HStack>
          </VStack>
        </NovaModal>
      )}
    </VStack>
  );
}

// ── Section content components (wired to SettingsService) ──

function GeneralContent() {
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
    </VStack>
  );
}

// ── Wallpaper imports ────────────────────────────────────────
import wallpaperNebula from "@/assets/wallpapers/nebula.jpg";
import wallpaperAmber from "@/assets/wallpapers/amber.jpg";
import wallpaperOcean from "@/assets/wallpapers/ocean.jpg";
import wallpaperAurora from "@/assets/wallpapers/aurora.jpg";
import wallpaperRose from "@/assets/wallpapers/rose.jpg";

const WALLPAPERS = [
  { id: "dynamic", label: "Dynamic", src: "", description: "Ambient gradients" },
  { id: "nebula", label: "Nebula", src: wallpaperNebula, description: "Deep purple & blue" },
  { id: "amber", label: "Amber", src: wallpaperAmber, description: "Warm golden tones" },
  { id: "ocean", label: "Ocean", src: wallpaperOcean, description: "Deep blue waves" },
  { id: "aurora", label: "Aurora", src: wallpaperAurora, description: "Northern lights" },
  { id: "rose", label: "Rose", src: wallpaperRose, description: "Pink bokeh glow" },
] as const;

function AppearanceContent() {
  const [accentColor, setAccentColor] = useSettingsValue("appearance.accentColor", "hsl(265, 55%, 58%)");
  const accents = [
    { id: "hsl(265, 55%, 58%)", label: "purple", color: "hsl(265 55% 58%)", hsl: "265 55% 58%" },
    { id: "hsl(210, 80%, 55%)", label: "blue",   color: "hsl(210 80% 55%)", hsl: "210 80% 55%" },
    { id: "hsl(152, 55%, 48%)", label: "green",  color: "hsl(152 55% 48%)", hsl: "152 55% 48%" },
    { id: "hsl(38, 85%, 58%)",  label: "orange", color: "hsl(38 85% 58%)",  hsl: "38 85% 58%" },
    { id: "hsl(0, 65%, 50%)",   label: "red",    color: "hsl(0 65% 50%)",   hsl: "0 65% 50%" },
    { id: "hsl(330, 65%, 55%)", label: "pink",   color: "hsl(330 65% 55%)", hsl: "330 65% 55%" },
  ];
  const [reduceTransparency, setReduceTransparency] = useSettingsValue("appearance.reduceTransparency", false);
  const [wallpaperId, setWallpaperId] = useSettingsValue("appearance.wallpaper", "dynamic");

  // Live-update CSS custom properties when accent changes
  useEffect(() => {
    const match = accents.find(a => a.id === accentColor);
    if (!match) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", match.hsl);
    // Derive a complementary accent (shift hue +133°)
    const hueMatch = match.hsl.match(/^(\d+)\s/);
    if (hueMatch) {
      const shifted = (parseInt(hueMatch[1]) + 133) % 360;
      root.style.setProperty("--accent", `${shifted} 85% 58%`);
    }
  }, [accentColor]);

  // Live-update wallpaper when selection changes
  useEffect(() => {
    const wp = WALLPAPERS.find(w => w.id === wallpaperId);
    if (!wp) return;
    // Dispatch a custom event that ShellAmbientBackground listens to
    window.dispatchEvent(new CustomEvent("nova-wallpaper-change", { detail: { id: wp.id, src: wp.src } }));
  }, [wallpaperId]);

  return (
    <VStack spacing="tight">
      {/* Wallpaper Selection */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Wallpaper</NovaSectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {WALLPAPERS.map(wp => (
              <button
                key={wp.id}
                onClick={() => setWallpaperId(wp.id)}
                className={cn(
                  "relative rounded-xl overflow-hidden aspect-video transition-all duration-150 group",
                  "border-2",
                  wallpaperId === wp.id
                    ? "border-[hsl(210_80%_55%)] shadow-[0_0_12px_hsl(210_80%_55%/0.3)]"
                    : "border-[hsl(0_0%_100%/0.08)] hover:border-[hsl(0_0%_100%/0.2)]"
                )}
              >
                {wp.src ? (
                  <img src={wp.src} alt={wp.label} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(265_55%_20%)] via-[hsl(220_40%_15%)] to-[hsl(190_50%_12%)]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[hsl(265_55%_58%/0.3)] blur-md animate-pulse" />
                    </div>
                  </div>
                )}
                {/* Selection check */}
                {wallpaperId === wp.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[hsl(210_80%_55%)] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[hsl(0_0%_100%)]" />
                  </div>
                )}
                {/* Label overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(0_0%_0%/0.7)] to-transparent px-1.5 py-1">
                  <div className="text-[9px] font-medium text-[hsl(0_0%_90%)]">{wp.label}</div>
                </div>
              </button>
            ))}
          </div>
        </VStack>
      </NovaCard>

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
          <SettingRow label="Reduce Transparency" description="Solid backgrounds" icon={<Palette className="h-3.5 w-3.5" />}>
            <NovaToggle checked={reduceTransparency} onChange={setReduceTransparency} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

function DisplayContent() {
  const [brightness, setBrightness] = useSettingsValue("display.brightness", 0.8);
  const brightnessPercent = Math.round(brightness * 100);
  const [nightShift, setNightShift] = useSettingsValue("display.nightShift", false);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider
            value={brightnessPercent}
            onChange={(v) => setBrightness(v / 100 as any)}
            label="Brightness"
          />
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
    </VStack>
  );
}

function SoundContent() {
  const [volume, setVolume] = useSettingsValue("sound.volume", 0.7);
  const volumePercent = Math.round(volume * 100);
  const [uiSounds, setUiSounds] = useSettingsValue("sound.uiSounds", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider
            value={volumePercent}
            onChange={(v) => setVolume(v / 100 as any)}
            label="Output Volume"
          />
          <Divider />
          <SettingRow label="UI Sounds" description="Play sounds for interactions" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={uiSounds} onChange={setUiSounds} />
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
  const [wifiOn, setWifiOn] = useSettingsValue("network.wifi.autoJoin", true);

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
  const [btOn, setBtOn] = useSettingsValue("bluetooth.enabled", true);

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
              <VStack spacing="micro" className="flex-1">
                <NovaText variant="body">AirPods Pro</NovaText>
                <NovaText variant="label" muted className="!text-[10px]">Available</NovaText>
              </VStack>
              <NovaButton variant="secondary" className="!text-[10px] !py-0.5 !px-2">Connect</NovaButton>
            </HStack>
            <Divider />
            <HStack spacing="tight" align="center">
              <NovaAvatar icon="⌨️" size={24} gradient="from-[hsl(0_0%_40%)] to-[hsl(0_0%_25%)]" />
              <VStack spacing="micro" className="flex-1">
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
  const [doNotDisturb, setDoNotDisturb] = useSettingsValue("notifications.doNotDisturb", false);
  const [showPreviews, setShowPreviews] = useSettingsValue("notifications.showPreviews", true);
  const [sounds, setSounds] = useSettingsValue("sound.uiSounds", true);
  const [badges, setBadges] = useSettingsValue("notifications.badges", true);

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
  const [locationServices, setLocationServices] = useSettingsValue("privacy.locationServices", false);
  const [analytics, setAnalytics] = useSettingsValue("privacy.analytics", false);
  const [crashReports, setCrashReports] = useSettingsValue("privacy.crashReports", true);

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
  const [keyRepeatRate, setKeyRepeatRate] = useSettingsValue("input.keyRepeatRate", 30);
  const [autocorrect, setAutocorrect] = useSettingsValue("input.autocorrect", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider
            value={keyRepeatRate}
            onChange={(v) => setKeyRepeatRate(v as any)}
            label="Key Repeat Speed"
          />
          <Divider />
          <SettingRow label="Autocorrect" icon={<Keyboard className="h-3.5 w-3.5" />}>
            <NovaToggle checked={autocorrect} onChange={setAutocorrect} />
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
          <VStack spacing="micro">
            <NovaText variant="body">Software Update</NovaText>
            <NovaText variant="label" muted className="!text-[10px]">SITA OS is up to date</NovaText>
          </VStack>
          <NovaBadge variant="success">Up to Date</NovaBadge>
        </HStack>
      </NovaCard>
    </VStack>
  );
}

function CloudSyncContent() {
  const [syncEnabled, setSyncEnabled] = useSettingsValue("cloud.syncEnabled", false);
  const [lastSync] = useState(() => new Date().toLocaleTimeString());

  const handleSyncNow = useCallback(() => {
    toast.success("Sync started");
  }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Cloud Sync" description="Sync data across devices" icon={<Cloud className="h-3.5 w-3.5" />}>
            <NovaToggle checked={!!syncEnabled} onChange={setSyncEnabled} />
          </SettingRow>
          <Divider />
          <SettingRow label="Last Sync" icon={<RefreshCw className="h-3.5 w-3.5" />}>
            <NovaText variant="label" muted>{syncEnabled ? lastSync : "Disabled"}</NovaText>
          </SettingRow>
        </VStack>
      </NovaCard>

      {syncEnabled && (
        <NovaCard>
          <VStack spacing="tight">
            <NovaSectionLabel className="!px-0">Sync Targets</NovaSectionLabel>
            <SettingRow label="Settings" description="Preferences and config">
              <NovaBadge variant="success">Active</NovaBadge>
            </SettingRow>
            <Divider />
            <SettingRow label="Files" description="Documents and media">
              <NovaBadge variant="success">Active</NovaBadge>
            </SettingRow>
            <Divider />
            <NovaButton
              variant="secondary"
              onClick={handleSyncNow}
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              className="w-full !text-[11px]"
            >
              Sync Now
            </NovaButton>
          </VStack>
        </NovaCard>
      )}
    </VStack>
  );
}

// ── Content map ────────────────────────────────────────────

const CONTENT: Record<string, () => JSX.Element> = {
  profile: ProfileContent,
  security: SecurityContent,
  general: GeneralContent,
  appearance: AppearanceContent,
  display: DisplayContent,
  sound: SoundContent,
  network: NetworkContent,
  bluetooth: BluetoothContent,
  notifications: NotificationsContent,
  privacy: PrivacyContent,
  keyboard: KeyboardContent,
  cloudsync: CloudSyncContent,
  about: AboutContent,
};

// ── Main component ─────────────────────────────────────────

export function SettingsWindow() {
  const [active, setActive] = useState("profile");
  const Content = CONTENT[active] || ProfileContent;
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
