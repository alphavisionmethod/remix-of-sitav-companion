// ═══════════════════════════════════════════════════════════════
// Settings — Notifications Group (enhanced with push controls)
// ═══════════════════════════════════════════════════════════════

import { Bell, BellOff, Smartphone, Volume2 } from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge,
} from "@/platform/nova-sdk/ui/components";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { SettingRow, ResetSectionButton } from "./shared";

export function NotificationsContent() {
  const [doNotDisturb, setDoNotDisturb] = useSettingsValue("notifications.doNotDisturb", false);
  const [showPreviews, setShowPreviews] = useSettingsValue("notifications.showPreviews", true);
  const [sounds, setSounds] = useSettingsValue("sound.uiSounds", true);
  const [badges, setBadges] = useSettingsValue("notifications.badges", true);
  const push = usePushNotifications();

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Do Not Disturb" description="Silence all notifications" icon={<BellOff className="h-3.5 w-3.5" />}>
            <NovaToggle checked={doNotDisturb} onChange={setDoNotDisturb} />
          </SettingRow>
          <Divider />
          <SettingRow label="Show Previews" description="Display content in banners" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={showPreviews} onChange={setShowPreviews} />
          </SettingRow>
          <Divider />
          <SettingRow label="Notification Sounds" description="Play sounds for alerts" icon={<Volume2 className="h-3.5 w-3.5" />}>
            <NovaToggle checked={sounds} onChange={setSounds} />
          </SettingRow>
          <Divider />
          <SettingRow label="Badge Count" description="Show unread count on icons" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={badges} onChange={setBadges} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {/* Push Notifications */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Push Notifications</NovaSectionLabel>
          {!push.isSupported ? (
            <NovaText variant="label" muted className="!text-[10px]">Push notifications not supported in this browser</NovaText>
          ) : (
            <>
              <HStack spacing="tight" align="center" justify="between">
                <VStack spacing="micro">
                  <NovaText variant="body">Browser Push</NovaText>
                  <NovaText variant="label" muted className="!text-[10px]">
                    Permission: {push.permissionState}
                  </NovaText>
                </VStack>
                {push.isRegistered ? (
                  <NovaBadge variant="success">Enabled</NovaBadge>
                ) : (
                  <NovaButton
                    variant="primary"
                    onClick={push.requestPermission}
                    disabled={push.isLoading}
                    className="!text-[10px] !py-1 !px-3"
                  >
                    Enable
                  </NovaButton>
                )}
              </HStack>
              {push.devices.length > 0 && (
                <>
                  <Divider />
                  <NovaSectionLabel className="!px-0">Registered Devices ({push.devices.length})</NovaSectionLabel>
                  {push.devices.map(d => (
                    <HStack key={d.id} spacing="tight" align="center">
                      <Smartphone className="h-3 w-3 text-[hsl(0_0%_50%)]" />
                      <NovaText variant="label" muted className="!text-[9px] truncate flex-1">{d.id.slice(0, 20)}…</NovaText>
                    </HStack>
                  ))}
                </>
              )}
            </>
          )}
        </VStack>
      </NovaCard>

      {/* Alert Types */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Alert Types</NovaSectionLabel>
          {["Threshold breaches", "Contradictions", "New opportunities", "Automations completed", "Approval requests", "Follow-up risks", "System issues"].map(a => (
            <label key={a} className="flex items-center gap-2 text-[11px] text-[hsl(0_0%_80%)] cursor-pointer py-0.5">
              <input type="checkbox" defaultChecked className="rounded border-border accent-[hsl(var(--primary))] h-3 w-3" /> {a}
            </label>
          ))}
        </VStack>
      </NovaCard>

      <ResetSectionButton sectionId="notifications" />
    </VStack>
  );
}
