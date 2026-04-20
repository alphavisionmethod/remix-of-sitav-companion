import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Check } from "lucide-react";

const TICKETS = [
  { id: "lt_50k", label: "< $50k" },
  { id: "50_250k", label: "$50–250k" },
  { id: "250k_1m", label: "$250k – $1M" },
  { id: "1m_plus", label: "$1M+" },
];
const STAGES = [
  { id: "preseed", label: "Pre-seed" },
  { id: "seed", label: "Seed" },
  { id: "later", label: "Later stage" },
];

export function InvestorForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fund_name: "", contact_name: "", contact_role: "", email: "",
    ticket_band: "50_250k", jurisdiction: "", stage_interest: "seed", notes: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("investor-request", { body: form });
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
        <h3 className="text-xl font-bold">Request received</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We review every request within 5 business days. If approved, you'll receive a signed link to the deal room.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Fund / family office name</span>
          <Input required maxLength={200} value={form.fund_name}
            onChange={(e) => setForm({ ...form, fund_name: e.target.value })} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Contact name</span>
          <Input required maxLength={120} value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="mt-1" autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Role</span>
          <Input maxLength={120} value={form.contact_role}
            onChange={(e) => setForm({ ...form, contact_role: e.target.value })} className="mt-1" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Email</span>
          <Input required type="email" maxLength={255} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Ticket size</span>
          <select value={form.ticket_band}
            onChange={(e) => setForm({ ...form, ticket_band: e.target.value })}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            {TICKETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Stage interest</span>
          <select value={form.stage_interest}
            onChange={(e) => setForm({ ...form, stage_interest: e.target.value })}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Jurisdiction</span>
          <Input maxLength={80} value={form.jurisdiction}
            onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} className="mt-1" placeholder="e.g. United States, EU, Singapore" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Notes (optional)</span>
          <textarea value={form.notes} rows={4} maxLength={1500}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm" />
        </label>
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : "Request deal-room access"}
      </Button>
    </form>
  );
}
