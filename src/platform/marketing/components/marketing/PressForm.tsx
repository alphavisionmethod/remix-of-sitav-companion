import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Check } from "lucide-react";

export function PressForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ outlet: "", contact_name: "", email: "", beat: "", message: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("press-inquiry", { body: form });
      if (error || !data?.ok) throw error ?? new Error(data?.error ?? "Failed");
      setDone(true);
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
        <h3 className="text-xl font-bold">Thanks — we'll be in touch</h3>
        <p className="text-sm text-muted-foreground">Press inquiries get a same-week reply.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border/40 bg-card/60 p-6 md:p-8 space-y-4">
      <Input required placeholder="Outlet" maxLength={200} value={form.outlet}
        onChange={(e) => setForm({ ...form, outlet: e.target.value })} />
      <Input required placeholder="Your name" maxLength={120} value={form.contact_name}
        onChange={(e) => setForm({ ...form, contact_name: e.target.value })} autoComplete="name" />
      <Input required type="email" placeholder="Email" maxLength={255} value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
      <Input placeholder="Beat (e.g. AI, sovereignty, productivity)" maxLength={120} value={form.beat}
        onChange={(e) => setForm({ ...form, beat: e.target.value })} />
      <textarea placeholder="What's the story angle?" rows={4} maxLength={2000} value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" />
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Sending…" : "Send press inquiry"}
      </Button>
    </form>
  );
}
