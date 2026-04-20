import { Link } from "react-router-dom";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSeo } from "@/components/marketing/MarketingSeo";
import { DemoEmbed } from "@/components/marketing/DemoEmbed";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Receipt, Lock, Brain, Wallet } from "lucide-react";

export default function MarketingHome() {
  return (
    <MarketingShell>
      <MarketingSeo
        title="SITA OS — The sovereign owner OS with proof receipts"
        description="One operating system for your business, money, calendar and home. On-device. Receipt-first. Join the waitlist."
        canonical={typeof window !== "undefined" ? window.location.origin + "/" : undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SITA OS",
          url: typeof window !== "undefined" ? window.location.origin : "",
        }}
      />

      {/* Hero */}
      <section className="relative px-4 md:px-8 pt-16 pb-20 md:pt-28 md:pb-28 max-w-6xl mx-auto text-center">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.20), transparent 70%)", filter: "blur(80px)" }} />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-card/40 backdrop-blur text-xs text-muted-foreground mb-6">
          <Shield className="h-3 w-3 text-primary" />
          Receipt-first · Policy-governed · On-device
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]">
          The sovereign operating system <span className="text-primary">for owners</span>.
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          One surface for your business, money, calendar and home — driven by an advisor board you can trust, with a verifiable receipt for every action.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/waitlist"><Button size="lg" className="rounded-xl px-6">Join the waitlist <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          <Link to="/demo"><Button size="lg" variant="outline" className="rounded-xl px-6">Try the live demo</Button></Link>
        </div>
        <div className="mt-16">
          <DemoEmbed />
        </div>
      </section>

      {/* 3 acts */}
      <section className="px-4 md:px-8 py-20 max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
        <Act n="01" title="The problem" body="Software multiplied. Decisions didn't get better. Your ops live in 17 tabs and nothing remembers context." />
        <Act n="02" title="SITA" body="One OS. One advisor board. One inbox of decisions. Cross-domain intelligence: invoice paid → reserves rise → reminder clears." />
        <Act n="03" title="Proof" body="Every action emits a signed receipt. Replay any decision. Roll back. See it live on /proof." />
      </section>

      {/* Pillars */}
      <section className="px-4 md:px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center max-w-3xl mx-auto mb-12">Built on three things SaaS gave up on.</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Pillar icon={<Lock />} title="Sovereignty" body="On-device by default. Your data, your hardware, your keys. No telemetry." />
          <Pillar icon={<Receipt />} title="Proof" body="Every action emits a signed receipt. Auditable. Replayable. Rollback-ready." />
          <Pillar icon={<Brain />} title="Advisors" body="A council of specialised AI advisors that propose, you approve, the OS executes." />
        </div>
      </section>

      {/* CTAs */}
      <section className="px-4 md:px-8 py-20 max-w-5xl mx-auto grid gap-4 md:grid-cols-2">
        <CtaCard to="/beta" title="Become a beta tester" body="Get the OS on your devices first. Shape what ships." cta="Apply" />
        <CtaCard to="/investors" title="Investors" body="Read the thesis. Request access to the deal room." cta="Investor brief" />
        <CtaCard to="/donate" title="Support the build" body="Fund sovereignty. Every donation gets a public receipt." cta="Donate" />
        <CtaCard to="/download" title="Download" body="Web · PWA · macOS · Windows · Linux · Ubuntu ISO." cta="Get builds" />
      </section>
    </MarketingShell>
  );
}

function Act({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur">
      <div className="text-xs font-semibold text-primary tracking-widest mb-2">ACT {n}</div>
      <div className="text-lg font-bold mb-2">{title}</div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur">
      <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary inline-flex items-center justify-center mb-3">{icon}</div>
      <div className="font-bold text-lg mb-1">{title}</div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
function CtaCard({ to, title, body, cta }: { to: string; title: string; body: string; cta: string }) {
  return (
    <Link to={to} className="block rounded-2xl border border-border/40 bg-card/40 p-6 hover:border-primary/40 hover:bg-card/60 transition-all">
      <div className="font-bold text-lg mb-1">{title}</div>
      <p className="text-sm text-muted-foreground mb-3">{body}</p>
      <span className="text-sm text-primary inline-flex items-center gap-1">{cta} <ArrowRight className="h-4 w-4" /></span>
    </Link>
  );
}
