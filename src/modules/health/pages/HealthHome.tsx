import { Link } from "react-router-dom";
import { HeartPulse, Apple, Watch, Stethoscope, Dumbbell, BedDouble, Bell } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const tiles = [
  { to: "/health/nutrition", icon: Apple, label: "Nutrition", desc: "Logs · meals · macros" },
  { to: "/health/wearables", icon: Watch, label: "Wearables", desc: "Sync devices, view trends" },
  { to: "/health/medical", icon: Stethoscope, label: "Medical", desc: "Records · appointments" },
  { to: "/health/fitness", icon: Dumbbell, label: "Fitness", desc: "Routines · sessions" },
  { to: "/health/recovery", icon: BedDouble, label: "Recovery", desc: "Sleep · readiness" },
  { to: "/health/reminders", icon: Bell, label: "Reminders", desc: "Medications · check-ins" },
];

export default function HealthHome() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold">Health OS</h1>
            <p className="text-muted-foreground">
              Greenfield pillar — scaffold only. Sub-apps below will ship in phases.
            </p>
          </div>
        </div>
        <PageTruthBanner truthState="partial" />
      </header>
      <div className="my-4 rounded-md border-l-4 border-primary bg-primary/5 p-3 text-sm">
        Trust note: every wearable sync, medical read, and nutrition log will emit a receipt and honor
        per-domain consent before any data leaves the device.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="group rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium group-hover:text-primary">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}