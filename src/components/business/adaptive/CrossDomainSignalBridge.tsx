// ═══════════════════════════════════════════════════════════════
// Cross-Domain Signal Bridge
// Dispatches business profile signals to Finance and Concierge
// domains so they can adapt their emphasis accordingly.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

/** Custom event carrying cross-domain signals from Business Profile */
export interface BusinessProfileSignalEvent extends CustomEvent {
  detail: {
    primaryMode: string;
    finance: { emphasis: string; kpis: string[] };
    concierge: { emphasis: string; triggers: string[] };
    operatingFlags: {
      hasEmployees: boolean;
      hasAppointments: boolean;
      hasEcommerce: boolean;
      hasLocations: boolean;
      sendsInvoices: boolean;
      hasRecurringRevenue: boolean;
    };
  };
}

/**
 * Silent component that emits cross-domain signals whenever the
 * business profile changes. Mount once inside BusinessAppShell.
 */
export function CrossDomainSignalBridge() {
  const { primaryMode, operatingFlags, adaptations } = useBusinessProfile();
  const profile = useBusinessProfile().profile;
  const lastEmitted = useRef<string>("");

  useEffect(() => {
    const key = `${primaryMode}-${JSON.stringify(profile.crossDomainSignals)}`;
    if (key === lastEmitted.current) return;
    lastEmitted.current = key;

    const event = new CustomEvent("sita-business-profile-signal", {
      detail: {
        primaryMode,
        finance: profile.crossDomainSignals.finance,
        concierge: profile.crossDomainSignals.concierge,
        operatingFlags: {
          hasEmployees: operatingFlags.hasEmployees,
          hasAppointments: operatingFlags.hasAppointments,
          hasEcommerce: operatingFlags.hasEcommerce,
          hasLocations: operatingFlags.hasLocations,
          sendsInvoices: operatingFlags.sendsInvoices,
          hasRecurringRevenue: operatingFlags.hasRecurringRevenue,
        },
      },
    });

    window.dispatchEvent(event);
  }, [primaryMode, operatingFlags, profile.crossDomainSignals]);

  return null;
}

/**
 * Hook for Finance or Concierge to listen for business profile signals.
 * Returns the latest signal or null if none received.
 */
export function useBusinessProfileSignal() {
  const ref = useRef<BusinessProfileSignalEvent["detail"] | null>(null);
  const [signal, setSignal] = useState<BusinessProfileSignalEvent["detail"] | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as BusinessProfileSignalEvent).detail;
      ref.current = detail;
      setSignal(detail);
    };
    window.addEventListener("sita-business-profile-signal", handler);
    return () => window.removeEventListener("sita-business-profile-signal", handler);
  }, []);

  return signal;
}

// Fix: need to import useState
import { useState } from "react";
