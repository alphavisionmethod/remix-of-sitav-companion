import { useEffect, useState } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSeo } from "@/components/marketing/MarketingSeo";
import { supabase } from "@/integrations/supabase/client";

interface DonationRow { id: string; tier: string; donor_name: string | null; message: string | null; receipt_hash: string | null; paid_at: string | null }

export default function MarketingProof() {
  const [rows, setRows] = useState<DonationRow[]>([]);

  useEffect(() => {
    supabase.from("public_donations_wall")
      .select("id, tier, donor_name, message, receipt_hash, paid_at")
      .order("paid_at", { ascending: false })
      .limit(50)
      .then(({ data }: { data: DonationRow[] | null }) => setRows(data ?? []));
  }, []);

  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Proof wall" description="Public receipts for every supported donation. Proof over promise." />
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Proof over promise.</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Every supported donation publishes a verifiable receipt. The same primitive powers every action across the OS.
          </p>
        </header>
        {rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 border border-dashed border-border/40 rounded-2xl">
            No public receipts yet. Be the first to support — visit <a href="/donate" className="underline">/donate</a>.
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-wrap gap-3 justify-between items-center">
                <div>
                  <div className="font-semibold">{r.donor_name ?? "Anonymous supporter"}</div>
                  {r.message && <div className="text-sm text-muted-foreground mt-0.5 max-w-md">"{r.message}"</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">{r.tier}</div>
                  {r.receipt_hash && <code className="text-[10px] text-muted-foreground">{r.receipt_hash.slice(0, 16)}…</code>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MarketingShell>
  );
}
