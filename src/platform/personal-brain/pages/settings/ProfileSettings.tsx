import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePbProfile } from "@/platform/personal-brain/components/personal-brain/hooks/usePbProfile";

export default function ProfileSettings() {
  const { profile, update, saving } = usePbProfile();
  const [form, setForm] = useState({ display_name: "", role: "", life_context: "", location: "", timezone: "", language: "" });

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      role: profile.role ?? "",
      life_context: profile.life_context ?? "",
      location: profile.location ?? "",
      timezone: profile.timezone ?? "",
      language: profile.language ?? "",
    });
  }, [profile]);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Profile & Personalization</h2>
          <p className="text-xs text-muted-foreground">How the Brain addresses you and your context.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Preferred name</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Timezone</Label><Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Language</Label><Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Life context</Label><Textarea value={form.life_context} onChange={(e) => setForm({ ...form, life_context: e.target.value })} className="min-h-[80px]" /></div>
        </div>
        <Button onClick={() => void update(form)} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </CardContent>
    </Card>
  );
}
