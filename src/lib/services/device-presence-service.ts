import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
export interface DevicePresence {
  deviceId: string;
  deviceName: string;
  status: "online" | "offline" | "idle";
  lastSeen: string;
  browser: string;
  os: string;
  screenResolution: string;
}

function generateDeviceId(): string {
  let id = localStorage.getItem("sita-device-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sita-device-id", id);
  }
  return id;
}

function getBrowserInfo(): { browser: string; os: string; screenResolution: string } {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";

  return {
    browser,
    os,
    screenResolution: `${screen.width}x${screen.height}`,
  };
}

export async function sendHeartbeat(): Promise<void> {
  const deviceId = generateDeviceId();
  const { browser, os, screenResolution } = getBrowserInfo();

  try {
    await supabase.functions.invoke("device-telemetry", {
      body: {
        device_id: deviceId,
        hostname: `${browser} on ${os}`,
        version: "web-1.0.0",
        channel: "stable",
        metrics: {
          browser,
          os,
          screenResolution,
          online: navigator.onLine,
          language: navigator.language,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (e) {
    console.warn("Heartbeat failed:", e);
  }
}

/**
 * Register the current device into `connected_devices` + `presence_states` tables.
 * Upserts using the stable device ID from localStorage.
 */
export async function registerCurrentDevice(userId: string): Promise<void> {
  const deviceId = generateDeviceId();
  const { browser, os, screenResolution } = getBrowserInfo();
  const isMobile = os === "iOS" || os === "Android";
  const deviceName = `${browser} on ${os}`;
  const now = new Date().toISOString();

  try {
    // Upsert into connected_devices
    await ( supabase as any).from("connected_devices" as any).upsert(
      {
        id: deviceId,
        user_id: userId,
        device_name: deviceName,
        device_type: isMobile ? "phone" : "desktop",
        platform: os,
        browser,
        os_version: os,
        screen_resolution: screenResolution,
        trust_level: "standard",
        capabilities: ["keyboard", ...(isMobile ? ["touch"] : ["mouse"])],
        is_active: true,
        last_seen_at: now,
        registered_at: now,
      },
      { onConflict: "id" }
    );

    // Upsert into presence_states
    await ( supabase as any).from("presence_states" as any).upsert(
      {
        device_id: deviceId,
        user_id: userId,
        status: navigator.onLine ? "online" : "offline",
        last_seen: now,
        surface_type: isMobile ? "mobile" : "desktop",
      },
      { onConflict: "device_id" }
    );

    console.log("[DevicePresence] Registered device:", deviceId);
  } catch (e) {
    console.warn("[DevicePresence] Registration failed:", e);
  }
}

export function getCurrentDevicePresence(): DevicePresence {
  const deviceId = generateDeviceId();
  const { browser, os, screenResolution } = getBrowserInfo();

  return {
    deviceId,
    deviceName: `${browser} on ${os}`,
    status: navigator.onLine ? "online" : "offline",
    lastSeen: new Date().toISOString(),
    browser,
    os,
    screenResolution,
  };
}

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function startHeartbeat(intervalMs = 60_000): void {
  if (heartbeatInterval) return;
  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, intervalMs);

  window.addEventListener("online", sendHeartbeat);
  window.addEventListener("offline", sendHeartbeat);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sendHeartbeat();
  });
}

export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

