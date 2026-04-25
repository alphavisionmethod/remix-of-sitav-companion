// ═══════════════════════════════════════════════════════════════
// Personal Brain — Retention card (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePbSecurityPrefs } from "../hooks/usePbSecurityPrefs";

export function RetentionSettingsCard() {
  const { prefs, loading, update } = usePbSecurityPrefs();
  if (loading || !prefs) {
    return (
      <Card>
        <CardContent className="h-32 animate-pulse rounded-lg bg-muted/30" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Data Retention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Keep messages & memories</Label>
            <span className="text-xs font-mono text-muted-foreground">
              {prefs.retention_days} days
            </span>
          </div>
          <Slider
            min={30}
            max={1825}
            step={30}
            value={[prefs.retention_days]}
            onValueChange={(v) => void update({ retention_days: v[0] })}
          />
          <p className="text-xs text-muted-foreground">
            Older content beyond this window is purged automatically by the nightly retention job.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
          <Label className="text-sm font-medium">Voice transcript retention</Label>
          <Select
            value={prefs.voice_transcript_retention}
            onValueChange={(v) =>
              void update({ voice_transcript_retention: v as "none" | "session" | "persist" })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Never store transcripts</SelectItem>
              <SelectItem value="session">Store for this session only</SelectItem>
              <SelectItem value="persist">Persist with chat history</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}