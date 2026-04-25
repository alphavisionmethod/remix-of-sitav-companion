import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePbNotificationPrefs } from "@/platform/personal-brain/components/personal-brain/hooks/usePbNotificationPrefs";

export default function NotificationsSettings() {
  const { prefs, update, loading } = usePbNotificationPrefs();
  if (loading || !prefs) return <Card><CardContent className="p-5 text-xs text-muted-foreground">Loading…</CardContent></Card>;

  const rows: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: "continue_where_left_off", label: "Continue where I left off", desc: "Suggest your last open chat on return." },
    { key: "weekly_recap", label: "Weekly recap", desc: "A short digest each week." },
    { key: "inferred_pattern_review", label: "Inferred pattern review", desc: "Approve patterns the Brain notices." },
    { key: "daily_planning_prompt", label: "Daily planning prompt", desc: "A morning nudge to plan." },
    { key: "voice_reflection_reminder", label: "Voice reflection reminder", desc: "Evening voice journal prompt." },
    { key: "channel_in_app", label: "In-app notifications", desc: "" },
    { key: "channel_email", label: "Email notifications", desc: "" },
  ];

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="text-xs text-muted-foreground">Choose what reaches you and where.</p>
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
              <div className="min-w-0">
                <Label className="text-sm">{r.label}</Label>
                {r.desc && <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>}
              </div>
              <Switch checked={Boolean(prefs[r.key])} onCheckedChange={(v) => void update({ [r.key]: v } as Partial<typeof prefs>)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
