import { useState } from "react";
import { Stethoscope, CalendarPlus, X } from "lucide-react";
import { useAppointments, useCancelAppointment, useCreateAppointment, useHealthProfile, useUpsertHealthProfile } from "@/modules/health/data/use-health-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HealthMedical() {
  const { data: profile } = useHealthProfile();
  const upsert = useUpsertHealthProfile();
  const { data: appointments = [] } = useAppointments();
  const create = useCreateAppointment();
  const cancel = useCancelAppointment();

  const [provider, setProvider] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [when, setWhen] = useState("");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Stethoscope className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Medical</h1>
          <p className="text-sm text-muted-foreground">Records and clinician appointments. Critical-tier data — owner only.</p>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Profile basics</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Display name</Label>
            <Input
              defaultValue={profile?.display_name ?? ""}
              onBlur={(e) => e.target.value !== (profile?.display_name ?? "") && upsert.mutate({ display_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Blood type</Label>
            <Input
              defaultValue={profile?.blood_type ?? ""}
              onBlur={(e) => e.target.value !== (profile?.blood_type ?? "") && upsert.mutate({ blood_type: e.target.value })}
              placeholder="e.g. O+"
            />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input
              type="number" defaultValue={profile?.height_cm ?? ""}
              onBlur={(e) => upsert.mutate({ height_cm: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input
              type="number" defaultValue={profile?.weight_kg ?? ""}
              onBlur={(e) => upsert.mutate({ weight_kg: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarPlus className="h-4 w-4" />Book appointment</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder="Provider name" value={provider} onChange={(e) => setProvider(e.target.value)} />
            <Input placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            <Button
              disabled={!provider || !when || create.isPending}
              onClick={() => {
                create.mutate({ provider_name: provider, specialty: specialty || null, appointment_at: new Date(when).toISOString() });
                setProvider(""); setSpecialty(""); setWhen("");
              }}
            >Book</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Upcoming &amp; past</CardTitle></CardHeader>
        <CardContent>
          {appointments.length === 0 ? <p className="text-sm text-muted-foreground">No appointments yet.</p> : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div key={a.id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <div className="font-medium">{a.provider_name}{a.specialty && <span className="text-muted-foreground"> · {a.specialty}</span>}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.appointment_at).toLocaleString()} · {a.status}</div>
                  </div>
                  {a.status !== "cancelled" && (
                    <Button size="sm" variant="ghost" onClick={() => cancel.mutate(a.id)} disabled={cancel.isPending}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}