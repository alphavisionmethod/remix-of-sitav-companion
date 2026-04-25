// Beta tester application form
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Check } from "lucide-react";

const DEVICES = [
  { id: "web", label: "Web app" },
  { id: "pwa", label: "PWA" },
  { id: "macos", label: "macOS desktop" },
  { id: "windows", label: "Windows desktop" },
  { id: "linux", label: "Linux desktop" },
  { id: "ubuntu_iso", label: "SITA Ubuntu ISO" },
];
const USE_CASES = [
  { id: "owner_operator", label: "Owner-operator" },
  { id: "agency", label: "Agency / consultancy" },
  { id: "finance", label: "Finance / CFO" },
  { id: "family_office", label: "Family office" },
  { id: "creator", label: "Creator / solo" },
  { id: "other", label: "Other" },
];
const LEVELS = [
  { id: "non_technical", label: "Non-technical" },
  { id: "power_user", label: "Power user" },
  { id: "engineer", label: "Engineer" },
];

export function BetaForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ score: number; status: string } | null>(null);
  const [form, setForm] = useState({
    email: "", full_name: "", country: "",
    use_case: "owner_operator", technical_level: "power_user",
    why: "", invite_code: "", device_targets: ["web"] as string[],
  });

  const toggleDevice = (id: string) => {
    setForm((f) => ({
      ...f,
      device_targets: f.device_targets.includes(id)
        ? f.device_targets.filter((d) => d !== id)
        : [...f.device_targets, id],
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("beta-apply", { body: form });
      if (error || !data?.ok) throw error ?? new Error(data?.error ?? "Failed");
      setDone({ score: data.score, status: data.status });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/60 p-8 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold">Application received</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your fit score: <strong>{done.score}/100</strong>. Queue: <strong>{done.status}</strong>.
          We'll email you when your spot opens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Full name</span>
          <Input required maxLength={120} value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <Input required type="email" maxLength={255} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" autoComplete="email" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Country</span>
          <Input maxLength={64} value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1" autoComplete="country" />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">Devices you'd test on</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEVICES.map((d) => (
            <label key={d.id} className={`cursor-pointer text-sm px-3 py-2 rounded-md border transition-colors ${
              form.device_targets.includes(d.id)
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}>
              <input type="checkbox" className="sr-only"
                checked={form.device_targets.includes(d.id)}
                onChange={() => toggleDevice(d.id)} />
              {d.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Primary use case</span>
          <select value={form.use_case}
            onChange={(e) => setForm({ ...form, use_case: e.target.value })}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            {USE_CASES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Technical level</span>
          <select value={form.technical_level}
            onChange={(e) => setForm({ ...form, technical_level: e.target.value })}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Why do you want in?</span>
        <textarea value={form.why} maxLength={600} rows={4}
          onChange={(e) => setForm({ ...form, why: e.target.value })}
          placeholder="What problem are you trying to solve? Be specific."
          className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Invite code (optional)</span>
        <Input maxLength={32} value={form.invite_code}
          onChange={(e) => setForm({ ...form, invite_code: e.target.value })} className="mt-1" />
      </label>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : "Apply for beta"}
      </Button>
    </form>
  );
}
