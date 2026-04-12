// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Truth Probe
// Validates OS hydration, AI gateway reachability, CAI table access
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, forwardRef } from "react";
import { useSitaOS } from "@/contexts/SitaOSContext";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface ProbeResult {
  osHydrated: boolean;
  gatewayReachable: boolean | null;
  caiAccessible: boolean | null;
  checkedAt: string;
}

export const RuntimeTruthProbe = forwardRef<HTMLDivElement, { compact?: boolean }>(({ compact = true }, ref) => {
  const kernel = useSitaOS();
  const { isDemoMode } = useDataMode();
  const [probe, setProbe] = useState<ProbeResult>({
    osHydrated: false,
    gatewayReachable: null,
    caiAccessible: null,
    checkedAt: "",
  });

  useEffect(() => {
    const check = async () => {
      const osHydrated = kernel.hydrated;

      // Skip backend checks in demo mode
      if (isDemoMode) {
        setProbe({ osHydrated, gatewayReachable: null, caiAccessible: null, checkedAt: new Date().toISOString() });
        return;
      }

      // Check CAI table access (lightweight query)
      let caiAccessible: boolean | null = null;
      try {
        const { error } = await (supabase as any)
          .from("operating_modes")
          .select("id")
          .limit(1);
        caiAccessible = !error;
      } catch {
        caiAccessible = false;
      }

      // Check AI gateway reachability via edge function ping
      let gatewayReachable: boolean | null = null;
      try {
        const { data, error } = await supabase.functions.invoke("ai-gateway", {
          method: "POST",
          body: { ping: true },
        });
        gatewayReachable = !error;
      } catch {
        gatewayReachable = false;
      }

      const result: ProbeResult = {
        osHydrated,
        gatewayReachable,
        caiAccessible,
        checkedAt: new Date().toISOString(),
      };

      setProbe(result);
      console.info("[RuntimeTruthProbe]", result);
    };

    if (kernel.hydrated) {
      check();
    }
  }, [kernel.hydrated]);

  const allGreen = probe.osHydrated && probe.gatewayReachable && probe.caiAccessible;
  const anyFailed = probe.gatewayReachable === false || probe.caiAccessible === false;

  if (compact) {
    return (
      <div ref={ref}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono",
          allGreen
            ? "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/5"
            : anyFailed
            ? "text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5"
            : "text-muted-foreground bg-secondary/30"
        )}
        title={`OS: ${probe.osHydrated ? "✓" : "…"} | GW: ${probe.gatewayReachable === null ? "…" : probe.gatewayReachable ? "✓" : "✗"} | CAI: ${probe.caiAccessible === null ? "…" : probe.caiAccessible ? "✓" : "✗"}`}
      >
        <Activity className="h-3 w-3" />
        <span>{allGreen ? "Runtime OK" : anyFailed ? "Degraded" : "Checking…"}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="rounded-lg border border-border/50 bg-card p-4 space-y-2">
      <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
        <Activity className="h-3.5 w-3.5" /> Runtime Truth Probe
      </h4>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <ProbeItem label="OS Hydration" ok={probe.osHydrated} />
        <ProbeItem label="AI Gateway" ok={probe.gatewayReachable} />
        <ProbeItem label="CAI Tables" ok={probe.caiAccessible} />
      </div>
      {probe.checkedAt && (
        <p className="text-[9px] text-muted-foreground">
          Last checked: {new Date(probe.checkedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
});
RuntimeTruthProbe.displayName = "RuntimeTruthProbe";

const ProbeItem = ({ label, ok }: { label: string; ok: boolean | null }) => (
  <div className="flex items-center gap-1.5">
    <div
      className={cn(
        "h-2 w-2 rounded-full",
        ok === null ? "bg-muted-foreground/30" : ok ? "bg-[hsl(var(--trust-safe))]" : "bg-[hsl(var(--destructive))]"
      )}
    />
    <span className="text-muted-foreground">{label}</span>
  </div>
);

export default RuntimeTruthProbe;
