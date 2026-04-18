// ═══════════════════════════════════════════════════════════════
// App SDK — concrete host API bound to a Sandbox
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { makeSandbox, PermissionDeniedError, type SandboxContext } from "./sandbox";
import type { AppHostApi, HostCapabilities, HostUser, NotificationArgs, OpenWindowArgs } from "./host-api";
import type { PackagePermission } from "./package-schema";

// Globals (Window.sitaApps / Window.electron) are declared in src/vite-env.d.ts

function detectPlatform(): HostCapabilities["platform"] {
  if (typeof window === "undefined") return "web";
  const p = window.electron?.platform as HostCapabilities["platform"] | undefined;
  if (p) return p;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "web";
}

export function makeAppSdk(ctx: SandboxContext): AppHostApi {
  const sandbox = makeSandbox(ctx);

  const safeRequire = (p: PackagePermission, fallback: () => unknown) => {
    try { sandbox.require(p); return null; }
    catch (e) {
      if (e instanceof PermissionDeniedError) return { ok: false, reason: e.message };
      throw e;
    }
    finally { void fallback; }
  };

  const stateKey = (k: string) => `sita-app-state:${ctx.appId}:${k}`;

  return {
    async openWindow(args: OpenWindowArgs) {
      const denied = safeRequire("shell.window", () => null);
      if (denied) return denied as { ok: boolean; reason: string };
      window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: args.appId, route: args.route } }));
      return { ok: true, windowId: `win:${args.appId}:${Date.now()}` };
    },
    async openRoute(route: string) {
      window.dispatchEvent(new CustomEvent("sita-navigate", { detail: { route } }));
    },
    async requestPermission(p: PackagePermission): Promise<boolean> {
      try { sandbox.require(p); return true; } catch { return false; }
    },
    async readFile(_path: string) {
      const denied = safeRequire("files.read", () => null);
      if (denied) return denied as { ok: boolean; reason: string };
      return { ok: false, reason: "File API not yet wired in this build (browser sandbox)." };
    },
    async writeFile(_path, _content) {
      const denied = safeRequire("files.write", () => null);
      if (denied) return denied as { ok: boolean; reason: string };
      return { ok: false, reason: "File write API not yet wired in this build (browser sandbox)." };
    },
    async emitNotification(n: NotificationArgs) {
      const denied = safeRequire("notifications", () => null);
      if (denied) return denied as { ok: boolean; reason: string };
      try {
        if ("Notification" in window) {
          if (Notification.permission === "default") await Notification.requestPermission();
          if (Notification.permission === "granted") {
            new Notification(n.title, { body: n.body, icon: n.icon });
          }
        }
        window.dispatchEvent(new CustomEvent("sita-toast", { detail: { title: n.title, body: n.body } }));
        return { ok: true };
      } catch (e) {
        return { ok: false, reason: (e as Error).message };
      }
    },
    async getCurrentUser(): Promise<HostUser | null> {
      try { sandbox.require("user.profile"); } catch { return null; }
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return null;
      return {
        id: u.id,
        email: u.email ?? undefined,
        display_name: (u.user_metadata?.display_name as string) ?? (u.user_metadata?.full_name as string) ?? undefined,
      };
    },
    getHostCapabilities(): HostCapabilities {
      const platform = detectPlatform();
      const isElectron = !!(typeof window !== "undefined" && window.electron);
      return {
        isElectron,
        platform,
        canLaunchNative: isElectron && !!window.sitaApps?.launchNativeApp,
        canPersistFiles: isElectron,
        canEmitNotifications: typeof Notification !== "undefined",
      };
    },
    async registerDeepLink(scheme: string) {
      const denied = safeRequire("deep-links", () => null);
      if (denied) return denied as { ok: boolean; reason: string };
      window.dispatchEvent(new CustomEvent("sita-register-deep-link", { detail: { scheme, appId: ctx.appId } }));
      return { ok: true };
    },
    async persistAppState<T>(key: string, value: T) {
      const denied = safeRequire("storage.persist", () => null);
      if (denied) return { ok: false } as const;
      try {
        localStorage.setItem(stateKey(key), JSON.stringify(value));
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    async loadAppState<T>(key: string) {
      try {
        const raw = localStorage.getItem(stateKey(key));
        return raw ? (JSON.parse(raw) as T) : null;
      } catch { return null; }
    },
  };
}
