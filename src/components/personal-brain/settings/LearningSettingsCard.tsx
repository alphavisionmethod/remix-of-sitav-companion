// ═══════════════════════════════════════════════════════════════
// Personal Brain — Learning Settings card (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { usePbSecurityPrefs } from "../hooks/usePbSecurityPrefs";

export function LearningSettingsCard() {
  const { prefs, loading, saving, update } = usePbSecurityPrefs();

  if (loading || !prefs) {
    return (
      <Card>
        <CardContent className="h-40 animate-pulse rounded-lg bg-muted/30" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Learning & Memory
          </span>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          label="Auto-learn from conversations"
          desc="Lets your Brain infer preferences and facts from your chats."
          checked={prefs.autolearn_enabled}
          onChange={(v) => void update({ autolearn_enabled: v })}
        />
        <ToggleRow
          label="Learn from chats"
          desc="Use chat content as learning signal."
          checked={prefs.learn_from_chats}
          onChange={(v) => void update({ learn_from_chats: v })}
        />
        <ToggleRow
          label="Learn from files"
          desc="Extract insights from documents you upload."
          checked={prefs.learn_from_files}
          onChange={(v) => void update({ learn_from_files: v })}
        />
        <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Auto-learn confidence threshold</Label>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(prefs.autolearn_threshold * 100)}%
            </span>
          </div>
          <Slider
            min={0.4}
            max={0.95}
            step={0.05}
            value={[prefs.autolearn_threshold]}
            onValueChange={(v) => void update({ autolearn_threshold: v[0] })}
          />
          <p className="text-xs text-muted-foreground">
            Higher = fewer, more confident memories. Lower = more memories, more noise.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="pr-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}