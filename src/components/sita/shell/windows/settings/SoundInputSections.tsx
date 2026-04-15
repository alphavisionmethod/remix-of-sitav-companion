// ═══════════════════════════════════════════════════════════════
// Settings — Sound & Input Group
// ═══════════════════════════════════════════════════════════════

import { Volume2, Bell, Keyboard, ChevronRight } from "lucide-react";
import { VStack, HStack, Divider } from "@/lib/nova-sdk/ui/layout";
import { NovaCard, NovaToggle, NovaSlider, NovaBadge } from "@/lib/nova-sdk/ui/components";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { SettingRow, ResetSectionButton } from "./shared";

export function SoundContent() {
  const [volume, setVolume] = useSettingsValue("sound.volume", 0.7);
  const volumePercent = Math.round(volume * 100);
  const [uiSounds, setUiSounds] = useSettingsValue("sound.uiSounds", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={volumePercent} onChange={(v) => setVolume(v / 100 as any)} label="Output Volume" />
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
      <ResetSectionButton sectionId="sound" />
    </VStack>
  );
}

export function KeyboardContent() {
  const [keyRepeatRate, setKeyRepeatRate] = useSettingsValue("input.keyRepeatRate", 30);
  const [autocorrect, setAutocorrect] = useSettingsValue("input.autocorrect", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSlider value={keyRepeatRate} onChange={(v) => setKeyRepeatRate(v as any)} label="Key Repeat Speed" />
          <Divider />
          <SettingRow label="Autocorrect" icon={<Keyboard className="h-3.5 w-3.5" />}>
            <NovaToggle checked={autocorrect} onChange={setAutocorrect} />
          </SettingRow>
        </VStack>
      </NovaCard>
      <ResetSectionButton sectionId="keyboard" />
    </VStack>
  );
}
