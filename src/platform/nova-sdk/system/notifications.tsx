// ═══════════════════════════════════════════════════════════════
// Nova SDK — Notification API
// Integrates with existing toast system; permission-gated
// ═══════════════════════════════════════════════════════════════

import { toast } from "sonner";
import type { NovaPermissionId } from "../core/manifest";

export type NotificationUrgency = "low" | "normal" | "high" | "critical";

export interface NovaNotification {
  title: string;
  body?: string;
  icon?: string;
  sound?: boolean;
  urgency?: NotificationUrgency;
  duration?: number;
  action?: { label: string; onClick: () => void };
  groupId?: string;
}

export class NovaNotify {
  private permissions: Set<NovaPermissionId>;

  constructor(permissions: NovaPermissionId[]) {
    this.permissions = new Set(permissions);
  }

  send(notification: NovaNotification): string | number {
    if (!this.permissions.has("system.notifications")) {
      console.warn("[NovaNotify] Missing system.notifications permission");
      return -1;
    }

    const { title, body, icon, urgency = "normal", duration, action } = notification;

    const toastFn = urgency === "critical" || urgency === "high" ? toast.warning : toast;

    return toastFn(title, {
      description: body,
      duration: duration ?? (urgency === "critical" ? 10000 : urgency === "high" ? 6000 : 4000),
      icon: icon ? <span>{icon}</span> : undefined,
      action: action ? { label: action.label, onClick: action.onClick } : undefined,
    });
  }

  dismiss(id: string | number): void {
    toast.dismiss(id);
  }
}
