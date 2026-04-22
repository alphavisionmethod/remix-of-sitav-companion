// ═══════════════════════════════════════════════════════════════
// SITA OS — Portrait Load Failure Logger
// Debounced, batched logging of avatar load failures to the
// portrait_load_failures table. Fire-and-forget — never blocks UI.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

interface FailureEntry {
  domain: string;
  advisor_id?: string;
  url: string;
  error_type: string;
  retry_count: number;
  status_code?: number;
}

// Dedupe: don't log the same URL twice per session
const logged = new Set<string>();
let batch: FailureEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const FLUSH_DELAY = 3000; // ms
const MAX_BATCH = 20;

async function flush() {
  flushTimer = null;
  if (batch.length === 0) return;
  const items = batch.splice(0, MAX_BATCH);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // not authenticated — skip silently

    const rows = items.map((e) => ({
      user_id: user.id,
      domain: e.domain,
      advisor_id: e.advisor_id || null,
      url: e.url.slice(0, 2048), // cap URL length
      error_type: e.error_type,
      retry_count: e.retry_count,
      status_code: e.status_code ?? null,
      user_agent: navigator.userAgent.slice(0, 512),
    }));

    await supabase.from("portrait_load_failures").insert(rows);
  } catch {
    // Swallow — analytics should never break the app
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_DELAY);
}

/**
 * Log a portrait load failure. Fire-and-forget, debounced, deduplicated.
 */
export function logPortraitFailure(entry: FailureEntry) {
  const key = `${entry.domain}:${entry.url}`;
  if (logged.has(key)) return;
  logged.add(key);

  batch.push(entry);
  if (batch.length >= MAX_BATCH) {
    flush();
  } else {
    scheduleFlush();
  }
}