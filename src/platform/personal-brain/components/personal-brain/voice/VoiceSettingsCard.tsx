// ═══════════════════════════════════════════════════════════════
// Personal Brain — Voice settings card (Phase 4)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePbVoicePrefs } from "./usePbVoicePrefs";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { probeVoiceCapabilities } from "./voice-capabilities";

export function VoiceSettingsCard() {
  const { prefs, loading, saving, update } = usePbVoicePrefs();
  const synth = useSpeechSynthesis();
  const caps = useMemo(probeVoiceCapabilities, []);

  if (loading || !prefs) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          Voice & Speech
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Capability badges */}
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <Badge variant={caps.speechRecognition ? "default" : "outline"}>STT {caps.speechRecognition ? "available" : "unavailable"}</Badge>
          <Badge variant={caps.speechSynthesis ? "default" : "outline"}>TTS {caps.speechSynthesis ? "available" : "unavailable"}</Badge>
          <Badge variant={caps.microphone ? "default" : "outline"}>Mic {caps.microphone ? "ok" : "blocked"}</Badge>
          <Badge variant={caps.secureContext ? "default" : "destructive"}>{caps.secureContext ? "Secure" : "Insecure context"}</Badge>
        </div>

        {/* Input mode */}
        <div className="space-y-2">
          <Label className="text-xs">Default input mode</Label>
          <ToggleGroup
            type="single"
            value={prefs.input_mode}
            onValueChange={(v) => v && update({ input_mode: v })}
            className="rounded-lg border border-border bg-card p-0.5"
          >
            <ToggleGroupItem value="ptt" className="h-8 px-3 text-xs">Push-to-talk</ToggleGroupItem>
            <ToggleGroupItem value="handsfree" className="h-8 px-3 text-xs">Hands-free</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Auto-read */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Read replies aloud</Label>
            <p className="text-[11px] text-muted-foreground">Speak each assistant reply when chatting.</p>
          </div>
          <Switch checked={prefs.autoread} onCheckedChange={(v) => update({ autoread: v })} />
        </div>

        {/* Cloud STT/TTS */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Use cloud voice (higher quality)</Label>
            <p className="text-[11px] text-muted-foreground">Routes audio through secure server. Falls back to browser if unavailable.</p>
          </div>
          <Switch checked={prefs.use_cloud_stt} onCheckedChange={(v) => update({ use_cloud_stt: v })} />
        </div>

        {/* Voice picker */}
        {synth.supported && synth.voices.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Browser voice</Label>
            <Select
              value={prefs.voice_id}
              onValueChange={(v) => update({ voice_id: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="browser-default">System default</SelectItem>
                {synth.voices.slice(0, 30).map((v) => (
                  <SelectItem key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Speaking rate</Label>
            <span className="text-[11px] text-muted-foreground">{prefs.rate.toFixed(2)}×</span>
          </div>
          <Slider
            min={0.6}
            max={1.6}
            step={0.05}
            value={[prefs.rate]}
            onValueChange={(v) => update({ rate: v[0] })}
          />
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Pitch</Label>
            <span className="text-[11px] text-muted-foreground">{prefs.pitch.toFixed(2)}</span>
          </div>
          <Slider
            min={0.5}
            max={1.5}
            step={0.05}
            value={[prefs.pitch]}
            onValueChange={(v) => update({ pitch: v[0] })}
          />
        </div>

        {/* Retention */}
        <div className="space-y-2">
          <Label className="text-xs">Voice transcript retention</Label>
          <Select
            value={prefs.transcript_retention}
            onValueChange={(v) => update({ transcript_retention: v })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Don't keep transcripts</SelectItem>
              <SelectItem value="session">Session only</SelectItem>
              <SelectItem value="forever">Keep with chats</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test button */}
        <button
          type="button"
          className="text-xs text-primary underline-offset-4 hover:underline"
          onClick={() => synth.speak("Hello — this is your Brain speaking. How does this voice sound?", { rate: prefs.rate, pitch: prefs.pitch, voiceURI: prefs.voice_id })}
        >
          Test voice
        </button>
      </CardContent>
    </Card>
  );
}