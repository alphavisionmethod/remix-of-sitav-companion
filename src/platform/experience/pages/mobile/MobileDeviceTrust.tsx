// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Device Trust Surface
// Enrollment, trust health, revoke/re-enroll
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { Shield, ShieldCheck, ShieldAlert, Smartphone, Fingerprint, RefreshCw, XCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { MOCK_MOBILE_DEVICES } from "@/data/fixtures/mock-data/mobile-shells";
type TrustLevel = "hardware-attested" | "verified" | "basic" | "untrusted";

interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  trustLevel: TrustLevel;
  enrolledAt: string;
  lastSeenAt: string;
  isCurrentDevice: boolean;
  capabilities: string[];
  fingerprint: string;
}

// Devices catalog moved to demo fixtures; gated via isDemo at consume time.

const TRUST_META: Record<TrustLevel, { label: string; color: string; icon: typeof ShieldCheck }> = {
  "hardware-attested": { label: "Hardware Attested", color: "text-[hsl(var(--trust-safe))]", icon: ShieldCheck },
  verified: { label: "Verified", color: "text-primary", icon: Shield },
  basic: { label: "Basic", color: "text-[hsl(var(--sita-gold))]", icon: Shield },
  untrusted: { label: "Untrusted", color: "text-destructive", icon: ShieldAlert },
};

const DeviceCard = ({ device, onRevoke, onReEnroll }: { device: DeviceInfo; onRevoke: (id: string) => void; onReEnroll: (id: string) => void }) => {
  const meta = TRUST_META[device.trustLevel];
  const Icon = meta.icon;

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-3",
      device.isCurrentDevice ? "border-primary/40 ring-1 ring-primary/20" : "border-border/40"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{device.name}</p>
              {device.isCurrentDevice && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Current</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{device.platform}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1", meta.color)}>
          <Icon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium">{meta.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Enrolled {new Date(device.enrolledAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          <span>Seen {new Date(device.lastSeenAt).toLocaleDateString()}</span>
        </div>
      </div>

      {device.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {device.capabilities.map(cap => (
            <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cap}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {!device.isCurrentDevice && (
          <button
            onClick={() => onRevoke(device.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            Revoke Trust
          </button>
        )}
        <button
          onClick={() => onReEnroll(device.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-verify
        </button>
      </div>
    </div>
  );
};

export default function MobileDeviceTrust() {
  
  const [devices] = useState<DeviceInfo[]>(DEVICES);

  const handleRevoke = (id: string) => {
    toast.info("Device trust revoked", { description: "This device can no longer approve high-trust actions." });
  };

  const handleReEnroll = (id: string) => {
    toast.success("Re-verification started", { description: "Biometric confirmation required on target device." });
  };

  const trustedCount = devices.filter(d => d.trustLevel !== "untrusted").length;

  return (
    <MobileShell title="Device Trust">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      

      {/* Trust Health Summary */}
      <div className="rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 via-card to-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-[hsl(var(--trust-safe))]" />
          </div>
          <div>
            <p className="text-sm font-semibold">Trust Health</p>
            <p className="text-[11px] text-muted-foreground">{trustedCount} of {devices.length} devices trusted</p>
          </div>
        </div>

        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-[hsl(var(--trust-safe))] transition-all"
            style={{ width: `${(trustedCount / devices.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          {devices.some(d => d.trustLevel === "hardware-attested") && (
            <span className="text-[10px] flex items-center gap-1 text-[hsl(var(--trust-safe))]">
              <Fingerprint className="h-3 w-3" /> Hardware attestation active
            </span>
          )}
        </div>
      </div>

      {/* Enrolled Devices */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enrolled Devices</h2>
        {devices.map(device => (
          <DeviceCard key={device.id} device={device} onRevoke={handleRevoke} onReEnroll={handleReEnroll} />
        ))}
      </div>

      {/* Enroll New Device */}
      <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
        <Smartphone className="h-4 w-4" />
        Enroll New Device
      </button>
    </MobileShell>
  );
}
