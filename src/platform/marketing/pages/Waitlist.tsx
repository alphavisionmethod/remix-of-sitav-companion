import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MarketingShell } from "@/platform/marketing/components/marketing/MarketingShell";
import { MarketingSeo } from "@/platform/marketing/components/marketing/MarketingSeo";
import { WaitlistForm } from "@/platform/marketing/components/marketing/WaitlistForm";
import { supabase } from "@/integrations/supabase/client";

export default function MarketingWaitlist() {
  const [params] = useSearchParams();
  const ref = params.get("ref");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.functions.invoke("waitlist-stats").then(({ data }) => {
      if (data?.count != null) setCount(data.count);
    }).catch(() => {});
  }, []);

  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Waitlist" description="Reserve your spot. Refer friends to move up the line." />
      <section className="px-4 md:px-8 py-16 max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get early access.</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            One email. Refer friends to move up <strong>5 positions per confirmed signup</strong> (cap 50). Top 100 lock in lifetime founder pricing.
          </p>
          {count != null && (
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground tabular-nums">{count.toLocaleString()}</strong> already on the list
            </p>
          )}
        </header>
        <WaitlistForm referredBy={ref} />
      </section>
    </MarketingShell>
  );
}
