// ═══════════════════════════════════════════════════════════════
// SITA OS — Uptime Heartbeat (Phase 20.C)
// Client-side heartbeat: pings health-beat every 60s while the
// tab is visible so we get synthetic uptime evidence per session.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

const HEARTBEAT_MS = 60_000;
let timer: ReturnType<typeof setInterval> | null = null;
let started = false;

async function sendHeartbeat() {
  try {
    await supabase.functions.invoke("health-beat", {
      body: {
        subsystem: "frontend",
        status: "healthy",
        latency_ms: 0,
        metadata: {
          path: typeof window !== "undefined" ? window.location.pathname : "",
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
      },
    });
  } catch {
    // Silent — uptime drop should never crash the app.
  }
}

export function startUptimeHeartbeat() {
  if (started || typeof window === "undefined") return;
  started = true;

  // First heartbeat once auth has settled.
  setTimeout(() => {
    if (document.visibilityState === "visible") sendHeartbeat();
  }, 8000);

  timer = setInterval(() => {
    if (document.visibilityState === "visible") sendHeartbeat();
  }, HEARTBEAT_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") sendHeartbeat();
  });
}

export function stopUptimeHeartbeat() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  started = false;
}
