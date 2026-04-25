import { MarketingShell } from "@/platform/marketing/components/marketing/MarketingShell";
import { MarketingSeo } from "@/platform/marketing/components/marketing/MarketingSeo";
import { Button } from "@/components/ui/button";
import { Globe, Smartphone, Apple, Monitor, Server, HardDrive } from "lucide-react";

const CHANNELS = [
  { icon: Globe, name: "Web app", format: "Browser", desc: "No install — open and use.", cta: "Open web app", action: "/login" },
  { icon: Smartphone, name: "Install as PWA", format: "One-tap", desc: "Add to home screen, works offline.", cta: "Install PWA", action: "/login" },
  { icon: Apple, name: "macOS desktop", format: ".zip · universal", desc: "Built via @electron/packager.", cta: "Download (soon)", action: "#" },
  { icon: Monitor, name: "Windows desktop", format: ".zip · x64", desc: "Built via @electron/packager.", cta: "Download (soon)", action: "#" },
  { icon: Server, name: "Linux desktop", format: ".tar.gz · x64", desc: "Built via @electron/packager.", cta: "Download (soon)", action: "#" },
  { icon: HardDrive, name: "SITA Ubuntu OS", format: ".iso", desc: "Full sovereign OS image.", cta: "Download (soon)", action: "#" },
];

export default function MarketingDownload() {
  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Download" description="Web · PWA · macOS · Windows · Linux · Ubuntu ISO." />
      <section className="px-4 md:px-8 py-16 max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get SITA on every device you own.</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Built for the browser, packaged for the desktop, and shipping as a full sovereign OS image.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, ...c }) => (
            <div key={c.name} className="rounded-2xl border border-border/40 bg-card/40 p-6 flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary inline-flex items-center justify-center mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-bold text-lg">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.format}</div>
              <p className="text-sm text-muted-foreground mt-3 flex-1">{c.desc}</p>
              <Button asChild className="mt-4 w-full" variant={c.action === "#" ? "outline" : "default"}>
                <a href={c.action}>{c.cta}</a>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
