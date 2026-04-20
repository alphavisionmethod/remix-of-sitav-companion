import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSeo } from "@/components/marketing/MarketingSeo";
import { Button } from "@/components/ui/button";

const TIERS = [
  { name: "Supporter", amount: 10, perks: ["Name on /proof wall (optional)"] },
  { name: "Believer", amount: 50, perks: ["Discord access", "Monthly build digest"] },
  { name: "Patron", amount: 250, perks: ["Name in About", "1-hour founder office hours"] },
  { name: "Builder", amount: 1000, perks: ["Priority beta", "On-record advisor seat (optional)"] },
];

export default function MarketingDonate() {
  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Donate" description="Fund sovereign software. Every donation gets a public receipt." />
      <section className="px-4 md:px-8 py-16 max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Fund sovereignty.</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            SITA is built in the open. Your support funds engineering, infrastructure, and the OS-level work that no one else is doing. Every donation emits a public receipt on <a href="/proof" className="underline">/proof</a>.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border/40 bg-card/40 p-6 flex flex-col">
              <div className="text-sm font-semibold uppercase tracking-wider text-primary">{t.name}</div>
              <div className="mt-2 text-4xl font-bold">${t.amount}</div>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground flex-1">
                {t.perks.map((p) => <li key={p}>• {p}</li>)}
              </ul>
              <Button className="mt-5 w-full" disabled>
                Coming soon
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-center text-muted-foreground">
          Stripe checkout activates as soon as Lovable Payments is enabled on this project. The donation table and webhook plumbing are already live.
        </p>
      </section>
    </MarketingShell>
  );
}
