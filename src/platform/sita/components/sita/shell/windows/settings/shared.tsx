// ═══════════════════════════════════════════════════════════════
// Settings — Shared Components
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { RotateCcw, Search } from "lucide-react";
import { VStack, HStack } from "@/platform/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaCard } from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SettingsService } from "@/platform/nova-sdk/services/settings-service";
import type { SettingsSchema } from "@/platform/nova-sdk/services/settings-service";

export function SettingRow({ label, description, icon, children }: {
  label: string; description?: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode;
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

export function SettingsSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mb-2">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(0_0%_50%)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search settings…"
        className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[10px] bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_90%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:border-[hsl(265_55%_58%/0.4)] transition-colors"
      />
    </div>
  );
}

const SECTION_KEYS: Record<string, (keyof SettingsSchema)[]> = {
  general: [
    "appearance.theme", "sound.uiSounds", "appearance.reduceMotion",
    "general.language", "general.region", "general.currency", "general.measurementUnits", "general.numberFormat", "general.weekStartsOn",
    "general.dateFormat", "general.timeFormat", "general.timezone", "general.defaultCalendarView",
    "general.startupBehavior", "general.restoreLastSession", "general.reopenPanels", "general.resumePendingTasks",
    "general.navigationPreference", "general.rememberLastOpenPanels", "general.confirmBeforeLeaving", "general.openLinksIn",
    "general.displayName", "general.defaultFocusDomain",
    "general.quickAccessFavorites",
    "general.guidanceLevel", "general.showNewFeatureTips", "general.showUpdateHighlights", "general.showSetupRecommendations",
    "general.approvalStyle",
  ],
  appearance: ["appearance.accentColor", "appearance.reduceTransparency", "appearance.wallpaper"],
  display: ["display.brightness", "display.nightShift", "display.resolution", "display.scaling", "display.nightShiftIntensity", "display.autoBrightness", "display.trueTone", "display.refreshRate"],
  sound: ["sound.volume", "sound.mute", "sound.alertVolume", "sound.alertSound", "sound.uiSounds"],
  network: ["network.wifi.autoJoin", "network.dns", "network.proxy"],
  bluetooth: ["bluetooth.enabled"],
  notifications: ["notifications.doNotDisturb", "notifications.showPreviews", "notifications.badges"],
  privacy: ["privacy.analytics", "privacy.crashReports", "privacy.locationServices", "privacy.piiRedaction", "privacy.docRetention", "privacy.trackingPrevention", "privacy.adPersonalization"],
  keyboard: ["input.keyRepeatRate", "input.keyRepeatDelay", "input.autocorrect", "input.trackpadSpeed", "input.naturalScrolling", "input.tapToClick"],
  cloudsync: ["cloud.syncEnabled", "cloud.lastSyncAt", "cloud.syncSettings", "cloud.syncFiles", "cloud.syncContacts", "cloud.encryption"],
  advisors: ["ai.autonomyLevel", "ai.confidenceThreshold", "ai.budgetMode", "ai.contradictionDisplay", "ai.promptHistory"],
  trustsec: ["trust.mode", "trust.simulationPref", "trust.sessionTimeout"],
  household: ["household.sharedCalendar", "household.sharedGrocery", "household.expenseSharing"],
  business: ["business.followUpPolicy", "business.leadScoring", "business.autoArchiveStale", "business.revenueForecast", "business.pipelineAlerts"],
  workflows: ["workflows.trustGate", "workflows.morningRoutine", "workflows.endOfDay", "workflows.smartBatching"],
  accessibility: [
    "accessibility.highContrast", "accessibility.boldText", "accessibility.textSize",
    "accessibility.voiceOver", "accessibility.zoom", "accessibility.zoomLevel",
    "accessibility.stickyKeys", "accessibility.fullKeyboardNav", "accessibility.focusIndicators",
    "accessibility.cursorSize", "accessibility.screenReaderOptimized", "accessibility.announcementVerbosity",
    "accessibility.reduceAutoPlayEffects",
  ],
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
