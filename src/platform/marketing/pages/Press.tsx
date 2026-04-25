import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSeo } from "@/components/marketing/MarketingSeo";
import { PressForm } from "@/components/marketing/PressForm";

export default function MarketingPress() {
  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Press kit" description="Logos, founder bios, screenshots, and press contact." />
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Press kit</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Working on a story? Use the form below — we reply within a week. Logos, screenshots, and founder bios available on request.
          </p>
        </header>
        <PressForm />
      </section>
    </MarketingShell>
  );
}
