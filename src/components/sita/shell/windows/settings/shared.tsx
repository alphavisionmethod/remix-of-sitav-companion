// ═══════════════════════════════════════════════════════════════
// Settings — Shared Components
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { VStack, HStack } from "@/lib/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaCard } from "@/lib/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SettingsService } from "@/lib/nova-sdk/services/settings-service";
import type { SettingsSchema } from "@/lib/nova-sdk/services/settings-service";

export function SettingRow({ label, description, icon, children }: {
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

export function ResetSectionButton({ sectionId }: { sectionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const keys = SECTION_KEYS[sectionId];

  const handleReset = useCallback(() => {
    if (!keys) return;
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
    window.dispatchEvent(new CustomEvent("nova-settings-reset", { detail: { section: sectionId } }));
  }, [confirming, keys, sectionId]);

  if (!keys) return null;

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
