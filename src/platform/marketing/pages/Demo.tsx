import { useSearchParams, Link } from "react-router-dom";
import { MarketingShell } from "@/platform/marketing/components/marketing/MarketingShell";
import { MarketingSeo } from "@/platform/marketing/components/marketing/MarketingSeo";
import { DemoEmbed } from "@/platform/marketing/components/marketing/DemoEmbed";
import { Button } from "@/components/ui/button";

export default function MarketingDemo() {
  const [params] = useSearchParams();
  const mode = params.get("mode") ?? "inline";

  return (
    <MarketingShell>
      <MarketingSeo
        title="SITA OS — Interactive demo"
        description="Three ways to experience SITA OS: inline preview, guided tour, and full sandbox shell."
      />
      <section className="px-4 md:px-8 pt-12 pb-8 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">See it. Touch it. Trust it.</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Three modes — pick how deep you want to go.
        </p>
        <div className="mt-6 inline-flex rounded-xl border border-border/40 bg-card/40 p-1 text-sm">
          <ModeTab to="/demo" active={mode === "inline"}>Inline</ModeTab>
          <ModeTab to="/demo?mode=tour" active={mode === "tour"}>Guided tour</ModeTab>
          <ModeTab to="/demo?mode=sandbox" active={mode === "sandbox"}>Sandbox</ModeTab>
        </div>
      </section>

      <section className="px-4 md:px-8 pb-24 max-w-6xl mx-auto">
        {mode === "inline" && <DemoEmbed />}
        {mode === "tour" && <GuidedTour />}
        {mode === "sandbox" && <Sandbox />}
      </section>

      <section className="px-4 md:px-8 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3">Liked what you saw?</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/waitlist"><Button size="lg">Join the waitlist</Button></Link>
          <Link to="/beta"><Button size="lg" variant="outline">Apply for beta</Button></Link>
        </div>
      </section>
    </MarketingShell>
  );
}

function ModeTab({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`px-4 py-1.5 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
      {children}
    </Link>
  );
}

function GuidedTour() {
  const steps = [
    { t: "08:02", title: "Acme pays the invoice", body: "Stripe webhook fires. SITA opens a receipt." },
    { t: "08:02", title: "Reserves widget recalculates", body: "+$4,200 → 8.4 months runway." },
    { t: "08:03", title: "Concierge clears the chase reminder", body: "The invoice no longer needs follow-up." },
    { t: "08:03", title: "Boardroom logs the event", body: "Cash velocity score ticks up. Advisor commentary attached." },
    { t: "08:03", title: "Receipt published", body: "Signed hash appears on /proof. You can replay or roll back." },
  ];
  return (
    <ol className="space-y-3 max-w-2xl mx-auto">
      {steps.map((s, i) => (
        <li key={i} className="rounded-xl border border-border/40 bg-card/40 p-4 flex gap-4">
          <div className="text-xs font-mono text-muted-foreground w-12 pt-0.5">{s.t}</div>
          <div>
            <div className="font-semibold">{i + 1}. {s.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Sandbox() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-12 text-center space-y-4">
      <h3 className="text-xl font-bold">Full sandbox launching soon</h3>
      <p className="text-muted-foreground max-w-lg mx-auto">
        We're polishing the read-only OS shell. In the meantime, sign in as a demo user to explore the full app.
      </p>
      <Link to="/login"><Button>Open demo session</Button></Link>
    </div>
  );
}
