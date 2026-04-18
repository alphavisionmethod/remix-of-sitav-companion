// ═══════════════════════════════════════════════════════════════
// Nova SDK — System Bridge / IPC
// Permission-gated communication between apps and OS services
// ═══════════════════════════════════════════════════════════════

import type { NovaPermissionId } from "../core/manifest";

export type BridgeChannel =
  | "file:open" | "file:save" | "file:list"
  | "notification:send"
  | "clipboard:read" | "clipboard:write"
  | "permission:request"
  | "theme:get"
  | "app:launch"
  | "window:create" | "window:close"
  | "sound:play";

const CHANNEL_PERMISSIONS: Partial<Record<BridgeChannel, NovaPermissionId>> = {
  "file:open": "files.read",
  "file:save": "files.write",
  "file:list": "files.read",
  "notification:send": "system.notifications",
  "clipboard:read": "clipboard.read",
  "clipboard:write": "clipboard.write",
};

export class PermissionDeniedError extends Error {
  constructor(channel: BridgeChannel, requiredPerm: NovaPermissionId) {
    super(`Permission denied: "${channel}" requires "${requiredPerm}"`);
    this.name = "PermissionDeniedError";
  }
}

type BridgeHandler = (payload: any) => any;

class NovaBridgeClass {
  private handlers = new Map<string, Set<BridgeHandler>>();
  private grantedPermissions = new Set<NovaPermissionId>();

  setPermissions(perms: NovaPermissionId[]): void {
    this.grantedPermissions = new Set(perms);
  }

  private checkPermission(channel: BridgeChannel): void {
    const required = CHANNEL_PERMISSIONS[channel];
    if (required && !this.grantedPermissions.has(required)) {
      throw new PermissionDeniedError(channel, required);
    }
  }

  send(channel: BridgeChannel, payload?: any): any {
    const required = CHANNEL_PERMISSIONS[channel];
    const granted = !required || this.grantedPermissions.has(required);

    // Log to PermissionMonitor if available
    try {
      const { PermissionMonitor } = require("../services/permission-monitor");
      if (PermissionMonitor && payload?.appId) {
        PermissionMonitor.recordAccess(payload.appId, required || channel, channel, granted);
      }
    } catch {}

    this.checkPermission(channel);
    const handlers = this.handlers.get(channel);
    if (!handlers || handlers.size === 0) {
      console.warn(`[NovaBridge] No handler for channel "${channel}"`);
      return undefined;
    }
    let result: any;
    handlers.forEach(h => { result = h(payload); });
    return result;
  }

  on(channel: string, handler: BridgeHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);
    return () => this.handlers.get(channel)?.delete(handler);
  }

  off(channel: string, handler: BridgeHandler): void {
    this.handlers.get(channel)?.delete(handler);
  }

  clear(): void {
    this.handlers.clear();
    this.grantedPermissions.clear();
  }
}

export const NovaBridge = new NovaBridgeClass();
