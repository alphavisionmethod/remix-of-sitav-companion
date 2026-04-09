// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Token Registration Service
// Manages Web Push, Capacitor (iOS/Android), and Electron tokens
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type PushPlatform = "web" | "ios" | "android" | "electron";

export interface PushTokenRecord {
  id: string;
  platform: PushPlatform;
  token: string;
  endpoint: string | null;
  device_name: string | null;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
}

// ── Platform Detection ───────────────────────────────────────

function detectPlatform(): PushPlatform {
  if (typeof window === "undefined") return "web";
  if (('electron' in window)) return "electron";
  // Capacitor detection
  if (window.Capacitor?.isNativePlatform?.()) {
    return window.Capacitor?.getPlatform?.() === "ios" ? "ios" : "android";
  }
  return "web";
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android Device";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown Device";
}

// ── Web Push Registration ────────────────────────────────────

async function registerWebPush(vapidPublicKey: string): Promise<{
  token: string;
  endpoint: string;
  auth_key: string;
  p256dh: string;
} | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const reg = await navigator.serviceWorker.ready;

  // Convert VAPID key
  const padding = "=".repeat((4 - (vapidPublicKey.length % 4)) % 4);
  const base64 = (vapidPublicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const applicationServerKey = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    applicationServerKey[i] = rawData.charCodeAt(i);
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  const json = subscription.toJSON();
  return {
    token: JSON.stringify(json),
    endpoint: subscription.endpoint,
    auth_key: json.keys?.auth || "",
    p256dh: json.keys?.p256dh || "",
  };
}

// ── Capacitor Push Registration ──────────────────────────────

async function registerCapacitorPush(): Promise<string | null> {
  try {
    // Dynamic import — only available when @capacitor/push-notifications is installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await (Function('return import("@capacitor/push-notifications")')());
    const PushNotifications = mod.PushNotifications;
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") return null;

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener("registration", (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener("registrationError", () => {
        resolve(null);
      });
      // Timeout after 10s
      setTimeout(() => resolve(null), 10000);
    });
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────

export async function registerPushToken(vapidPublicKey?: string): Promise<PushTokenRecord | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const platform = detectPlatform();
  let token: string;
  let endpoint: string | null = null;
  let authKey: string | null = null;
  let p256dh: string | null = null;

  switch (platform) {
    case "web": {
      if (!vapidPublicKey) {
        vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      }
      if (!vapidPublicKey) return null;
      const webResult = await registerWebPush(vapidPublicKey);
      if (!webResult) return null;
      token = webResult.token;
      endpoint = webResult.endpoint;
      authKey = webResult.auth_key;
      p256dh = webResult.p256dh;
      break;
    }
    case "ios":
    case "android": {
      const nativeToken = await registerCapacitorPush();
      if (!nativeToken) return null;
      token = nativeToken;
      break;
    }
    case "electron": {
      // Electron uses realtime for notifications, but we register a placeholder
      token = `electron-${user.id}-${Date.now()}`;
      break;
    }
    default:
      return null;
  }

  // Upsert token
  const { data, error } = await supabase
    .from("device_push_tokens")
    .upsert(
      {
        user_id: user.id,
        platform,
        token,
        endpoint,
        auth_key: authKey,
        p256dh,
        device_name: getDeviceName(),
        active: true,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" },
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to register push token:", error);
    return null;
  }

  return data as unknown as PushTokenRecord;
}

export async function unregisterPushToken(tokenId: string): Promise<boolean> {
  const { error } = await supabase
    .from("device_push_tokens")
    .update({ active: false })
    .eq("id", tokenId);

  return !error;
}

export async function unregisterAllTokens(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("device_push_tokens")
    .update({ active: false })
    .eq("user_id", user.id);

  return !error;
}

export async function getRegisteredTokens(): Promise<PushTokenRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("device_push_tokens")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as never as PushTokenRecord[];
}

export async function refreshToken(): Promise<PushTokenRecord | null> {
  // Unregister current platform token, then re-register
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const platform = detectPlatform();

  // Deactivate existing tokens for this platform
  await supabase
    .from("device_push_tokens")
    .update({ active: false })
    .eq("user_id", user.id)
    .eq("platform", platform);

  return registerPushToken();
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  if ((window as any)?.Capacitor?.isNativePlatform?.()) return true;
  if (('electron' in window)) return true;
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function getPermissionState(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

