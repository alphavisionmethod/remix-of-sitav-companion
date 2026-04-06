// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Settings
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { Shield, Fingerprint, Bell, Moon, LogOut, ChevronRight, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const ToggleRow = ({ icon: Icon, label, description, defaultOn = false }: {
  icon: any; label: string; description: string; defaultOn?: boolean;
}) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() =>
      <DemoModeBadge /> setOn(!on)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card"
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <div className={cn(
        "h-6 w-10 rounded-full transition-colors flex items-center px-0.5",
        on ? "bg-primary" : "bg-muted"
      )}>
        <div className={cn(
          "h-5 w-5 rounded-full bg-white transition-transform",
          on ? "translate-x-4" : "translate-x-0"
        )} />
      </div>
    </button>
  );
};

const NavRow = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors"
  >
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </button>
);

const MobileSettings = () => (
  <MobileShell title="Settings">
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trust & Security</h2>
    <div className="space-y-1.5 mb-6">
      <ToggleRow icon={Fingerprint} label="Biometric Lock" description="Require Face ID / fingerprint to open" defaultOn />
      <ToggleRow icon={Shield} label="Trusted Device" description="This device can approve high-impact actions" defaultOn />
    </div>

    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notifications</h2>
    <div className="space-y-1.5 mb-6">
      <ToggleRow icon={Bell} label="Push Notifications" description="Receive alerts for approvals and critical events" defaultOn />
      <ToggleRow icon={Bell} label="Quiet Hours" description="Mute non-critical alerts 10 PM — 7 AM" />
    </div>

    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Appearance</h2>
    <div className="space-y-1.5 mb-6">
      <ToggleRow icon={Moon} label="Dark Mode" description="Always use dark theme" defaultOn />
    </div>

    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Device</h2>
    <div className="space-y-1.5 mb-6">
      <NavRow icon={Smartphone} label="Device Info" />
      <NavRow icon={LogOut} label="Sign Out" />
    </div>

    <p className="text-center text-[10px] text-muted-foreground mt-8">SITA OS — Trusted Device v1.0</p>
  </MobileShell>
);

export default MobileSettings;
