import { useState } from "react";
import { useLogMetric, useMetricLogs, useDeleteMetric } from "@/modules/health/data/use-health-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

/**
 * Generic metric-logging app. Used by Nutrition, Fitness, and Recovery
 * pages by passing different `kind` defaults via the parent route shell.
 */
export default function HealthMetricsApp({
  title,
  icon: Icon,
  defaultKind,
  kindOptions,
  unitOptions,
  description,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultKind: string;
  kindOptions: { value: string; label: string }[];
  unitOptions: string[];
  description: string;
}) {
  const [kind, setKind] = useState(defaultKind);
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState(unitOptions[0]);
  const [notes, setNotes] = useState("");
  const log = useLogMetric();
  const remove = useDeleteMetric();
  const { data: logs = [], isLoading } = useMetricLogs({ limit: 50 });
  const filtered = logs.filter((l) => kindOptions.some((k) => k.value === l.metric_kind));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Log a value</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {kindOptions.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {unitOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="sm:col-span-1" />
            <Button
              disabled={!value || log.isPending}
              onClick={() => {
                log.mutate({ metric_kind: kind, value_numeric: Number(value), unit, notes: notes || undefined });
                setValue(""); setNotes("");
              }}
            >Log</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent entries</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
           : filtered.length === 0 ? <p className="text-sm text-muted-foreground">No entries logged yet.</p>
           : (
            <div className="space-y-1">
              {filtered.slice(0, 25).map((l) => (
                <div key={l.id} className="flex justify-between items-center border-b py-2 last:border-0 text-sm">
                  <div>
                    <span className="font-medium">{kindOptions.find((k) => k.value === l.metric_kind)?.label ?? l.metric_kind}</span>
                    <span className="ml-2">{l.value_numeric ?? l.value_text} {l.unit}</span>
                    {l.notes && <span className="text-muted-foreground ml-2">— {l.notes}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(l.recorded_at).toLocaleString()}</span>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(l.id)}><X className="h-3.5 w-3.5" /></Button>
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