// ═══════════════════════════════════════════════════════════════
// SITA OS — Proactive Signal Sources (Phase D)
// ═══════════════════════════════════════════════════════════════
// Lightweight ambient observers that turn passive context into
// proactive Sita whispers. Each source is opt-in and stateless
// from the outside — they all push into the nudge bus.
//
// Sources:
//   • idle-after-context  — user lingers on a surface that exposes
//                            suggested intents → offer one
//   • time-of-day         — morning brief / end-of-day wrap-up
//   • focus-session       — wellness break suggestions during long
//                            focus blocks
//   • voice-followup      — after Sita speaks a reply, offer a
//                            natural follow-up question
// ═══════════════════════════════════════════════════════════════

import { subscribeScreenContext, type SitaScreenContext } from "@/lib/sita-context";
import { subscribeSitaHud, type SitaHudSnapshot } from "@/components/sita/shell/sita-hud/sita-hud-bus";
import { publishNudge } from "./sita-nudge-bus";

let started = false;

export function startSitaSignalSources() {
  if (started || typeof window === "undefined") return () => {};
  started = true;

  const cleanups: Array<() => void> = [];

  // ── 1) Linger-on-surface → suggest intent ────────────────────
  let lingerTimer: number | null = null;
  let lastCtx: SitaScreenContext | null = null;
  const offCtx = subscribeScreenContext((ctx) => {
    lastCtx = ctx;
    if (lingerTimer) { window.clearTimeout(lingerTimer); lingerTimer = null; }
    if (!ctx || !ctx.suggestedIntents || ctx.suggestedIntents.length === 0) return;
    lingerTimer = window.setTimeout(() => {
      if (!lastCtx || lastCtx.surfaceId !== ctx.surfaceId) return;
      const intent = (lastCtx.suggestedIntents ?? [])[0];
      if (!intent) return;
      publishNudge({
        id: `linger:${ctx.surfaceId}:${intent}`,
        kind: "suggestion",
        priority: "low",
        text: `Want me to ${intent.toLowerCase()}?`,
        detail: ctx.title,
        source: "linger-on-surface",
        actions: [
          { id: "yes", label: "Yes", intent },
          { id: "no", label: "Not now" },
        ],
      });
    }, 35_000); // ~35s dwell
  });
  cleanups.push(offCtx, () => { if (lingerTimer) window.clearTimeout(lingerTimer); });

  // ── 2) Time-of-day brief / wrap-up (once per day) ────────────
  const timeKey = (slot: "morning" | "evening") =>
    `tod:${slot}:${new Date().toISOString().slice(0, 10)}`;
  const todTick = window.setInterval(() => {
    const now = new Date();
    const h = now.getHours();
    if (h === 9 && now.getMinutes() < 5) {
      publishNudge({
        id: timeKey("morning"),
        kind: "reminder",
        priority: "low",
        text: "Want a 60-second brief on today?",
        detail: "Calendar, top priorities, blockers.",
        source: "time-of-day",
        actions: [
          { id: "brief", label: "Brief me", intent: "summarize my day" },
          { id: "skip", label: "Skip" },
        ],
      });
    }
    if (h === 18 && now.getMinutes() < 5) {
      publishNudge({
        id: timeKey("evening"),
        kind: "reminder",
        priority: "low",
        text: "Want me to wrap up today and prep tomorrow?",
        source: "time-of-day",
        actions: [
          { id: "wrap", label: "Wrap up", intent: "wrap up my day" },
          { id: "later", label: "Later" },
        ],
      });
    }
  }, 60_000);
  cleanups.push(() => window.clearInterval(todTick));

  // ── 3) Long focus session → wellness break ───────────────────
  let focusStartedAt: number | null = null;
  const onFocusStart = () => { focusStartedAt = Date.now(); };
  const onFocusStop = () => { focusStartedAt = null; };
  window.addEventListener("focus-mode-start", onFocusStart);
  window.addEventListener("focus-mode-stop", onFocusStop);
  cleanups.push(() => window.removeEventListener("focus-mode-start", onFocusStart));
  cleanups.push(() => window.removeEventListener("focus-mode-stop", onFocusStop));
  const wellTick = window.setInterval(() => {
    if (!focusStartedAt) return;
    const mins = Math.floor((Date.now() - focusStartedAt) / 60_000);
    if (mins > 0 && mins % 50 === 0) {
      publishNudge({
        id: `wellness:focus:${Math.floor(focusStartedAt / 60_000)}:${mins}`,
        kind: "wellness",
        priority: "low",
        text: `You've been focused for ${mins} minutes. Quick break?`,
        source: "long-focus",
        actions: [
          { id: "break", label: "Start 5-min break", intent: "start a 5 minute break" },
          { id: "keep", label: "Keep going" },
        ],
      });
    }
  }, 60_000);
  cleanups.push(() => window.clearInterval(wellTick));

  // ── 4) Voice follow-up after a reply ─────────────────────────
  let lastReplyAt = 0;
  const offHud = subscribeSitaHud((s: SitaHudSnapshot) => {
    if (s.presence === "speaking" && s.reply) {
      lastReplyAt = Date.now();
      // Schedule a soft follow-up ~12s later if user stays idle.
      const at = lastReplyAt;
      window.setTimeout(() => {
        if (Date.now() - lastReplyAt < 11_000) return;
        if (at !== lastReplyAt) return;
        publishNudge({
          id: `followup:${at}`,
          kind: "followup",
          priority: "low",
          text: "Want me to go deeper or take an action on that?",
          source: "voice-followup",
          ttlMs: 25_000,
          actions: [
            { id: "deeper", label: "Go deeper", intent: "tell me more" },
            { id: "act", label: "Take action", intent: "do it" },
            { id: "no", label: "I'm good" },
          ],
        });
      }, 12_000);
    }
  });
  cleanups.push(offHud);

  return () => {
    for (const fn of cleanups) {
      try { fn(); } catch { /* ignore */ }
    }
    started = false;
  };
}