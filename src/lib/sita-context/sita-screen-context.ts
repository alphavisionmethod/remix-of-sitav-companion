// ═══════════════════════════════════════════════════════════════
// SITA OS — Screen Context Registry (Phase C)
// ═══════════════════════════════════════════════════════════════
// Lightweight pub/sub that lets focused windows / pages declare
// "what's on screen right now" so Sita's voice intent router and
// Brain prompts can include it without each app having to know
// about the voice pipeline.
//
// No React. No deps. Same shape as the HUD bus so it's familiar.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

export interface SitaScreenContext {
  /** Stable id of the surface (window id, route key, app id). */
  surfaceId: string;
  /** Human label, e.g. "Calendar — Today". */
  title: string;
  /** Route or app key (e.g. "calendar", "/personal-brain"). */
  route?: string;
  /** Free-form structured data the surface chose to expose. */
  payload?: Record<string, unknown>;
  /** Short summary the LLM can read verbatim. */
  summary?: string;
  /** Suggested voice intents the surface offers (e.g. "summarize this"). */
  suggestedIntents?: string[];
  /** When the context was published (ms epoch). */
  publishedAt: number;
}

let current: SitaScreenContext | null = null;
const listeners = new Set<(c: SitaScreenContext | null) => void>();

function emit() {
  for (const l of listeners) l(current);
}

export function publishScreenContext(ctx: Omit<SitaScreenContext, "publishedAt"> | null) {
  current = ctx ? { ...ctx, publishedAt: Date.now() } : null;
  emit();
}

export function readScreenContext(): SitaScreenContext | null {
  return current;
}

export function subscribeScreenContext(fn: (c: SitaScreenContext | null) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** React hook — re-renders when the focused surface publishes new context. */
export function useSitaScreenContext(): SitaScreenContext | null {
  const [ctx, setCtx] = useState<SitaScreenContext | null>(current);
  useEffect(() => subscribeScreenContext(setCtx), []);
  return ctx;
}

/** Build a compact prompt fragment for the Brain. Empty string when no context. */
export function formatScreenContextPrompt(ctx: SitaScreenContext | null): string {
  if (!ctx) return "";
  const lines: string[] = [];
  lines.push(`The user is currently looking at: ${ctx.title}`);
  if (ctx.route) lines.push(`Route: ${ctx.route}`);
  if (ctx.summary) lines.push(`Summary: ${ctx.summary}`);
  if (ctx.suggestedIntents?.length) {
    lines.push(`Likely intents: ${ctx.suggestedIntents.join(", ")}`);
  }
  if (ctx.payload && Object.keys(ctx.payload).length > 0) {
    try {
      const compact = JSON.stringify(ctx.payload).slice(0, 600);
      lines.push(`Visible data: ${compact}`);
    } catch { /* ignore */ }
  }
  return lines.join("\n");
}