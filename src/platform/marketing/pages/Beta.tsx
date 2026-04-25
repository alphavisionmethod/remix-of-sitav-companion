import { MarketingShell } from "@/platform/marketing/components/marketing/MarketingShell";
import { MarketingSeo } from "@/platform/marketing/components/marketing/MarketingSeo";
import { BetaForm } from "@/platform/marketing/components/marketing/BetaForm";

export default function MarketingBeta() {
  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Beta tester program" description="Apply to test SITA OS on your devices and shape what ships." />
      <section className="px-4 md:px-8 py-16 max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Become a beta tester</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We pick testers by fit, not by speed. Tell us about your work, your devices, and what you'd actually use SITA for.
          </p>
        </header>
        <BetaForm />
      </section>
    </MarketingShell>
  );
}
