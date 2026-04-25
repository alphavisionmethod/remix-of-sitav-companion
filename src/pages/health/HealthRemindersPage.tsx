import { useState } from "react";
import { Bell, Plus, Pause, Play, X } from "lucide-react";
import {
  useCreateReminder, useDeleteReminder, useReminders, useToggleReminderPause,
} from "@/modules/health/data/use-health-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HealthRemindersPage() {
  const { data: reminders = [], isLoading } = useReminders();
  const create = useCreateReminder();
  const toggle = useToggleReminderPause();
  const remove = useDeleteReminder();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("medication");
  const [when, setWhen] = useState("");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Bell className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Health Reminders</h1>
          <p className="text-sm text-muted-foreground">Medications, check-ins, and routines.</p>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" />New reminder</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="check_in">Check-in</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="sm:col-span-2" />
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            <Button
              className="sm:col-span-4"
              disabled={!title || create.isPending}
              onClick={() => {
                create.mutate({
                  title,
                  reminder_kind: kind,
                  next_fire_at: when ? new Date(when).toISOString() : null,
                });
                setTitle(""); setWhen("");
              }}
            >Create reminder</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active &amp; paused</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
           : reminders.length === 0 ? <p className="text-sm text-muted-foreground">No reminders yet.</p>
           : (
            <div className="space-y-2">
              {reminders.map((r) => (
                <div key={r.id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.reminder_kind} · {r.next_fire_at ? `next: ${new Date(r.next_fire_at).toLocaleString()}` : "no schedule"}
                      {r.paused && <span className="ml-2 text-amber-600">paused</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toggle.mutate({ id: r.id, paused: !r.paused })}>
                      {r.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
