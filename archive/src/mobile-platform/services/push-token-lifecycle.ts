// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Token Lifecycle Service
// Phase 12 — register → persist → refresh → rotate → revoke
//
// Honest contract:
// - No Capacitor present → returns offline registration (web-push only).
// - APNs / FCM credentials missing → records "not-provisioned" state.
// - All token state is mirrored to public.mobile_push_tokens.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type {
  PushRegistration,
  PushTransport,
} from "../contracts/push-contract";
import type { MobileOS } from "../contracts/mobile-platform-contract";
import { nativePush } from "../native/native-push";
import { getCapacitorPlatform, isCapacitorAvailable, invokeCapacitorPlugin } from "../native/capacitor-bridge";

const STORAGE_KEY = "sita.push.token.v1";
const PLUGIN = "PushNotifications";

export type PushTokenEventKind =
  | "register.attempt"
  | "register.success"
  | "register.failure"
  | "refresh"
  | "rotate"
  | "revoke"
  | "expire";

export interface PushTokenEvent {
  kind: PushTokenEventKind;
  os: MobileOS | "web";
  transport: PushTransport;
  tokenPreview?: string;
  reason?: string;
  at: string;
}

interface PersistedTokenSnapshot {
  os: MobileOS | "web";
  transport: PushTransport;
  token: string;
  registeredAt: string;
  refreshedAt: string;
  expiresAt: string | null;
}

const subscribers = new Set<(e: PushTokenEvent) => void>();

function emit(event: PushTokenEvent) {
  for (const cb of subscribers) {
    try { cb(event); } catch { /* noop */ }
  }
}

function preview(token: string): string {
  if (!token) return "";
  return token.length <= 12 ? token : `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function readPersisted(): PersistedTokenSnapshot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedTokenSnapshot;
  } catch {
    return null;
  }
}

function writePersisted(snap: PersistedTokenSnapshot | null) {
  if (typeof localStorage === "undefined") return;
  if (!snap) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
}

async function persistToBackend(snap: PersistedTokenSnapshot, opts: { rotatedFromTokenId?: string | null } = {}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // honest no-op when unauthenticated

    await supabase.from("mobile_push_tokens").upsert(
      {
        user_id: user.id,
        os: snap.os === "web" ? "web" : snap.os,
        transport: snap.transport,
        token: snap.token,
        device_id: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 96) : null,
        app_version: "1.0.0",
        expires_at: snap.expiresAt,
        rotated_from: opts.rotatedFromTokenId ?? null,
        status: "active",
        last_seen_at: new Date().toISOString(),
        metadata: { registeredAt: snap.registeredAt, refreshedAt: snap.refreshedAt },
      },
      { onConflict: "user_id,transport,token" },
    );
  } catch (err) {
    console.warn("[pushTokenLifecycle] persist failed", err);
  }
}

async function markRevokedInBackend(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("mobile_push_tokens")
      .update({ status: "revoked" })
      .eq("user_id", user.id)
      .eq("token", token);
  } catch { /* noop */ }
}

let nativeListenerAttached = false;
let pendingRegistrationResolve: ((reg: PushRegistration | null) => void) | null = null;

function attachNativeListenersOnce(os: MobileOS) {
  if (nativeListenerAttached || !isCapacitorAvailable()) return;
  nativeListenerAttached = true;

  // Token arrives async after register() — wire the listener exactly once.
  void invokeCapacitorPlugin({
    pluginId: PLUGIN,
    method: "addListener",
    options: {
      eventName: "registration",
      callback: (token: { value: string }) => {
        const transport: PushTransport = nativePush.resolveTransport();
        const now = new Date().toISOString();
        const snap: PersistedTokenSnapshot = {
          os,
          transport,
          token: token?.value ?? "",
          registeredAt: now,
          refreshedAt: now,
          expiresAt: null,
        };
        const previous = readPersisted();
        writePersisted(snap);
        emit({
          kind: previous && previous.token !== snap.token ? "rotate" : "register.success",
          os: snap.os,
          transport,
          tokenPreview: preview(snap.token),
          at: now,
        });
        void persistToBackend(snap, { rotatedFromTokenId: null });
        if (pendingRegistrationResolve) {
          pendingRegistrationResolve({
            os,
            transport,
            token: snap.token,
            registeredAt: snap.registeredAt,
            refreshedAt: snap.refreshedAt,
            expiresAt: snap.expiresAt,
          });
          pendingRegistrationResolve = null;
        }
      },
    },
  });

  void invokeCapacitorPlugin({
    pluginId: PLUGIN,
    method: "addListener",
    options: {
      eventName: "registrationError",
      callback: (err: { error: string }) => {
        emit({
          kind: "register.failure",
          os,
          transport: nativePush.resolveTransport(),
          reason: err?.error ?? "unknown",
          at: new Date().toISOString(),
        });
        if (pendingRegistrationResolve) {
          pendingRegistrationResolve(null);
          pendingRegistrationResolve = null;
        }
      },
    },
  });
}

export const pushTokenLifecycle = {
  /** Subscribe to token lifecycle events. */
  on(cb: (e: PushTokenEvent) => void): () => void {
    subscribers.add(cb);
    return () => { subscribers.delete(cb); };
  },

  /** Snapshot of the currently persisted token (cold-start safe). */
  current(): PersistedTokenSnapshot | null {
    return readPersisted();
  },

  /**
   * Register for push. Honest behavior:
   * - If Capacitor + native push is available, attach listeners and
   *   resolve once the OS hands us a token (or fail honestly).
   * - Else, return null (web-push handled by separate web subscription).
   */
  async register(): Promise<PushRegistration | null> {
    const platform = getCapacitorPlatform();
    if (platform === "web") return null;

    const os: MobileOS = platform === "ios" ? "ios" : "android";
    emit({ kind: "register.attempt", os, transport: nativePush.resolveTransport(), at: new Date().toISOString() });
    attachNativeListenersOnce(os);

    // Trigger native register; the listener will deliver the token.
    const result = await new Promise<PushRegistration | null>((resolve) => {
      pendingRegistrationResolve = resolve;
      void nativePush.register();
      // Honesty timeout: 8s — if no token lands, return null.
      setTimeout(() => {
        if (pendingRegistrationResolve) {
          pendingRegistrationResolve(null);
          pendingRegistrationResolve = null;
        }
      }, 8000);
    });

    return result;
  },

  /**
   * Manually mark the persisted token as refreshed (e.g., after a
   * heartbeat). Updates last_seen_at on the backend.
   */
  async refresh(): Promise<void> {
    const snap = readPersisted();
    if (!snap) return;
    const refreshed: PersistedTokenSnapshot = { ...snap, refreshedAt: new Date().toISOString() };
    writePersisted(refreshed);
    emit({ kind: "refresh", os: snap.os, transport: snap.transport, tokenPreview: preview(snap.token), at: refreshed.refreshedAt });
    await persistToBackend(refreshed);
  },

  /** Rotate to a new token (e.g., after OS-driven re-issue). */
  async rotate(newToken: string): Promise<void> {
    const previous = readPersisted();
    if (!previous) return;
    const now = new Date().toISOString();
    const next: PersistedTokenSnapshot = {
      ...previous,
      token: newToken,
      refreshedAt: now,
    };
    writePersisted(next);
    emit({ kind: "rotate", os: previous.os, transport: previous.transport, tokenPreview: preview(newToken), at: now });

    // Mark previous as rotated, insert new with rotated_from link.
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prevRow } = await supabase
          .from("mobile_push_tokens")
          .select("id")
          .eq("user_id", user.id)
          .eq("token", previous.token)
          .maybeSingle();
        await supabase
          .from("mobile_push_tokens")
          .update({ status: "rotated" })
          .eq("user_id", user.id)
          .eq("token", previous.token);
        await persistToBackend(next, { rotatedFromTokenId: prevRow?.id ?? null });
      }
    } catch (err) {
      console.warn("[pushTokenLifecycle] rotate persist failed", err);
    }
  },

  /** Revoke the current token (logout, user-initiated unsubscribe). */
  async revoke(): Promise<void> {
    const snap = readPersisted();
    if (!snap) return;
    writePersisted(null);
    emit({ kind: "revoke", os: snap.os, transport: snap.transport, tokenPreview: preview(snap.token), at: new Date().toISOString() });
    await markRevokedInBackend(snap.token);
    try { await nativePush.unregister(); } catch { /* noop */ }
  },

  /** Expire stale tokens past their expiresAt. */
  async expireIfStale(): Promise<boolean> {
    const snap = readPersisted();
    if (!snap || !snap.expiresAt) return false;
    if (new Date(snap.expiresAt).getTime() > Date.now()) return false;
    writePersisted(null);
    emit({ kind: "expire", os: snap.os, transport: snap.transport, tokenPreview: preview(snap.token), at: new Date().toISOString() });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("mobile_push_tokens")
          .update({ status: "expired" })
          .eq("user_id", user.id)
          .eq("token", snap.token);
      }
    } catch { /* noop */ }
    return true;
  },

  /** Health summary for admin surfaces. */
  health(): { hasToken: boolean; transport: PushTransport | null; os: MobileOS | "web" | null; ageMinutes: number | null } {
    const snap = readPersisted();
    if (!snap) return { hasToken: false, transport: null, os: null, ageMinutes: null };
    const age = (Date.now() - new Date(snap.refreshedAt).getTime()) / 60000;
    return { hasToken: true, transport: snap.transport, os: snap.os, ageMinutes: Math.round(age) };
  },
};
