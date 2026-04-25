import { MarketingShell } from "@/platform/marketing/components/marketing/MarketingShell";
import { MarketingSeo } from "@/platform/marketing/components/marketing/MarketingSeo";

export default function MarketingManifesto() {
  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Manifesto" description="Why SITA exists. The case for sovereign, receipt-first, owner-grade software." />
      <article className="px-4 md:px-8 py-16 max-w-2xl mx-auto prose prose-invert">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Software gave up on owners.</h1>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          The last twenty years of SaaS were optimised for procurement, not for the people who actually run the business. Every tool became a silo. Every silo charged rent. Every "AI feature" was a bolt-on that couldn't see across the wall.
        </p>
        <h2 className="text-2xl font-bold mt-12">Three things SITA refuses to compromise on.</h2>
        <h3 className="font-bold text-lg mt-8">1. Sovereignty</h3>
        <p className="text-muted-foreground">Your data lives on your hardware. Your keys are yours. The OS runs without us. If we vanish tomorrow, your stack keeps working.</p>
        <h3 className="font-bold text-lg mt-6">2. Proof</h3>
        <p className="text-muted-foreground">Every action — human or AI — emits a signed receipt. You can replay, audit, and roll back. We don't ask you to trust us. We give you the evidence.</p>
        <h3 className="font-bold text-lg mt-6">3. Owner-first</h3>
        <p className="text-muted-foreground">SITA isn't a productivity app. It's an operating system for the person who has to make the decision. Advisors propose. You approve. The OS executes.</p>
        <h2 className="text-2xl font-bold mt-12">The bet.</h2>
        <p className="text-muted-foreground">On-device inference is cheap. Trust in centralised SaaS is collapsing. AI without proof is a liability. SITA is the OS for the next 20 years of owners.</p>
        <p className="text-muted-foreground mt-6 italic">— The SITA team</p>
      </article>
    </MarketingShell>
  );
}
