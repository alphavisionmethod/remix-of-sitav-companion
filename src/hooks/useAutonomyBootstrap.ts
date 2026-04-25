// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Bootstrap (Phase 1+)
// Boots the OS-state sensor bus on app start:
//  - seeds default subscriptions for the user
//  - runs the emitters once on boot, then every 10 minutes
// Lazily mounted from RuntimeProvider so it only runs in the SPA
// session (not during SSR / tests).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { ensureDefaultSubscriptions } from "@/lib/autonomy/signal-bus";
import { runAllEmitters } from "@/lib/autonomy/emitters";
import { supabase } from "@/integrations/supabase/client";

const EMITTER_INTERVAL_MS = 10 * 60 * 1000; // 10 min

export function useAutonomyBootstrap() {
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const boot = async () => {
      // Only run for authenticated users.
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      if (cancelled) return;
      try {
        await ensureDefaultSubscriptions();
        await runAllEmitters();
      } catch (err) {
        console.debug("[autonomy-boot] initial scan skipped:", err);
      }
      timer = setInterval(() => {
        runAllEmitters().catch(() => undefined);
      }, EMITTER_INTERVAL_MS);
    };

    void boot();

    // Re-boot on auth change (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !timer) void boot();
      if (event === "SIGNED_OUT" && timer) {
        clearInterval(timer);
        timer = null;
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      sub.subscription.unsubscribe();
      bootedRef.current = false;
    };
  }, []);
}