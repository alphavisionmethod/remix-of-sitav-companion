// ═══════════════════════════════════════════════════════════════
// Personal Brain — Sensitive Mode card (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePbSecurityPrefs } from "../hooks/usePbSecurityPrefs";

export function SensitiveModeCard() {
  const { prefs, loading, saving, update } = usePbSecurityPrefs();

  if (loading || !prefs) {
    return (
      <Card>
        <CardContent className="h-32 animate-pulse rounded-lg bg-muted/30" />
      </Card>
    );
  }

  return (
    <Card className={prefs.sensitive_mode ? "border-destructive/40 bg-destructive/5" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Sensitive Mode
          </span>
          {prefs.sensitive_mode && (
            <Badge variant="outline" className="border-destructive/50 text-destructive">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pauses background learning, disables voice transcript persistence, and excludes
          this session from snapshots. Use when discussing private or regulated topics.
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-3">
          <div>
            <div className="text-sm font-medium">Enable sensitive mode</div>
            <div className="text-xs text-muted-foreground">Affects all chats until you turn it off.</div>
          </div>
          <Switch
            checked={prefs.sensitive_mode}
            disabled={saving}
            onCheckedChange={(v) => void update({ sensitive_mode: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}