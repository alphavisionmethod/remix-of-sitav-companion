// ═══════════════════════════════════════════════════════════════
// Settings — Sound & Input Group
// ═══════════════════════════════════════════════════════════════

import { Volume2, Bell, Keyboard, ChevronRight, Mic, VolumeX, Music, Mouse } from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaCard, NovaToggle, NovaSlider, NovaBadge, NovaSectionLabel, NovaText,
} from "@/platform/nova-sdk/ui/components";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { SettingRow, ResetSectionButton } from "./shared";
import { cn } from "@/lib/utils";

export function SoundContent() {
  const [volume, setVolume] = useSettingsValue("sound.volume", 0.7);
  const volumePercent = Math.round(volume * 100);
  const [mute, setMute] = useSettingsValue("sound.mute", false);
  const [alertVolume, setAlertVolume] = useSettingsValue("sound.alertVolume", 0.8);
  const alertPercent = Math.round(alertVolume * 100);
  const [alertSound, setAlertSound] = useSettingsValue("sound.alertSound", "default");
  const [uiSounds, setUiSounds] = useSettingsValue("sound.uiSounds", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" align="center" justify="between">
            <NovaSectionLabel className="!px-0">Output</NovaSectionLabel>
            <NovaToggle checked={!mute} onChange={(v) => setMute(!v)} />
          </HStack>
          {mute && (
            <HStack spacing="micro" align="center" className="py-1">
              <VolumeX className="h-3.5 w-3.5 text-[hsl(0_65%_50%)]" />
              <NovaText variant="label" className="!text-[10px] text-[hsl(0_65%_50%)]">System is muted</NovaText>
            </HStack>
          )}
          {!mute && <NovaSlider value={volumePercent} onChange={(v) => setVolume(v / 100 as any)} label="Output Volume" />}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Alert Sound</NovaSectionLabel>
          <NovaSlider value={alertPercent} onChange={(v) => setAlertVolume(v / 100 as any)} label="Alert Volume" />
          <Divider />
          <SettingRow label="Sound" icon={<Music className="h-3.5 w-3.5" />}>
            <select
              value={alertSound}
              onChange={(e) => setAlertSound(e.target.value)}
              className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground"
            >
              <option value="default">Default</option>
              <option value="chime">Chime</option>
              <option value="bell">Bell</option>
              <option value="ping">Ping</option>
              <option value="subtle">Subtle</option>
            </select>
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="UI Sounds" description="Play sounds for interactions" icon={<Bell className="h-3.5 w-3.5" />}>
            <NovaToggle checked={uiSounds} onChange={setUiSounds} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Devices</NovaSectionLabel>
          <SettingRow label="Output Device" icon={<Volume2 className="h-3.5 w-3.5" />}>
            <HStack spacing="tight" align="center">
              <NovaBadge>Built-in Speakers</NovaBadge>
              <ChevronRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
            </HStack>
          </SettingRow>
          <Divider />
          <SettingRow label="Input Device" icon={<Mic className="h-3.5 w-3.5" />}>
            <HStack spacing="tight" align="center">
              <NovaBadge>Built-in Microphone</NovaBadge>
              <ChevronRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
            </HStack>
          </SettingRow>
        </VStack>
      </NovaCard>
      <ResetSectionButton sectionId="sound" />
    </VStack>
  );
}

export function KeyboardContent() {
  const [keyRepeatRate, setKeyRepeatRate] = useSettingsValue("input.keyRepeatRate", 30);
  const [keyRepeatDelay, setKeyRepeatDelay] = useSettingsValue("input.keyRepeatDelay", 250);
  const [autocorrect, setAutocorrect] = useSettingsValue("input.autocorrect", true);
  const [trackpadSpeed, setTrackpadSpeed] = useSettingsValue("input.trackpadSpeed", 1);
  const [naturalScrolling, setNaturalScrolling] = useSettingsValue("input.naturalScrolling", true);
  const [tapToClick, setTapToClick] = useSettingsValue("input.tapToClick", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Keyboard</NovaSectionLabel>
          <NovaSlider value={keyRepeatRate} onChange={(v) => setKeyRepeatRate(v as any)} label={`Key Repeat Speed — ${keyRepeatRate}`} />
          <Divider />
          <NovaSlider value={keyRepeatDelay / 10} onChange={(v) => setKeyRepeatDelay(v * 10 as any)} label={`Key Repeat Delay — ${keyRepeatDelay}ms`} />
          <Divider />
          <SettingRow label="Autocorrect" description="Fix typos automatically" icon={<Keyboard className="h-3.5 w-3.5" />}>
            <NovaToggle checked={autocorrect} onChange={setAutocorrect} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Trackpad</NovaSectionLabel>
          <NovaSlider
            value={Math.round(trackpadSpeed * 33)}
            onChange={(v) => setTrackpadSpeed(v / 33 as any)}
            label={`Tracking Speed — ${trackpadSpeed.toFixed(1)}×`}
          />
          <Divider />
          <SettingRow label="Natural Scrolling" description="Content moves with fingers" icon={<Mouse className="h-3.5 w-3.5" />}>
            <NovaToggle checked={naturalScrolling} onChange={setNaturalScrolling} />
          </SettingRow>
          <Divider />
          <SettingRow label="Tap to Click" description="Single tap acts as click" icon={<Mouse className="h-3.5 w-3.5" />}>
            <NovaToggle checked={tapToClick} onChange={setTapToClick} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Shortcuts</NovaSectionLabel>
          {[
            { keys: "⌘ + Space", action: "Spotlight / Command Bar" },
            { keys: "⌘ + Tab", action: "Switch Windows" },
            { keys: "⌘ + ,", action: "Open Settings" },
            { keys: "⌘ + L", action: "Lock Screen" },
            { keys: "⌘ + Shift + 4", action: "Screenshot" },
          ].map(s => (
            <HStack key={s.keys} spacing="tight" justify="between" align="center">
              <NovaText variant="body" className="!text-[11px]">{s.action}</NovaText>
              <code className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_60%)]">{s.keys}</code>
            </HStack>
          ))}
        </VStack>
      </NovaCard>
      <ResetSectionButton sectionId="keyboard" />
    </VStack>
  );
}
