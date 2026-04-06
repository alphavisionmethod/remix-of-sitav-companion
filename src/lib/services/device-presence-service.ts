import { supabase } from "@/integrations/supabase/client";

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
