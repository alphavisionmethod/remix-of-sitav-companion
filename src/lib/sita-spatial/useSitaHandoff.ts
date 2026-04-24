// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: useSitaHandoff hook
// Subscribes to incoming handoffs, exposes offer/accept/decline.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptHandoff,
  declineHandoff,
  getDeviceLabel,
  offerHandoff,
  subscribeIncomingHandoffs,
  type HandoffPayload,
  type HandoffSession,
} from "./handoff-bus";
import { logSpatialEvent } from "./spatial-events";

export function useSitaHandoff() {
  const [incoming, setIncoming] = useState<HandoffSession | null>(null);
  const channelRef = useRef<Awaited<ReturnType<typeof subscribeIncomingHandoffs>>>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ch = await subscribeIncomingHandoffs((session) => {
        setIncoming(session);
        void logSpatialEvent("handoff_received", { id: session.id, from: session.source_device });
      });
      if (cancelled && ch) ch.unsubscribe();
      else channelRef.current = ch;
    })();
    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
    };
  }, []);

  const offer = useCallback(async (payload: HandoffPayload) => {
    const session = await offerHandoff(payload);
    if (session) await logSpatialEvent("handoff_offered", { id: session.id, intent: payload.intent });
    return session;
  }, []);

  const accept = useCallback(async () => {
    if (!incoming) return false;
    const ok = await acceptHandoff(incoming.id);
    if (ok) await logSpatialEvent("handoff_accepted", { id: incoming.id });
    setIncoming(null);
    return ok;
  }, [incoming]);

  const decline = useCallback(async () => {
    if (!incoming) return false;
    const ok = await declineHandoff(incoming.id);
    if (ok) await logSpatialEvent("handoff_declined", { id: incoming.id });
    setIncoming(null);
    return ok;
  }, [incoming]);

  return { incoming, offer, accept, decline, deviceLabel: getDeviceLabel() };
}
