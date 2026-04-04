// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Contracts: Admin Contracts
// ⚠️ DEPRECATED FACADE — Preserved only for backward compatibility.
// Canonical governance lives in core/policy-*, approval/*, proof/*.
// Consumers should migrate to canonical family imports.
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

/** @deprecated Use canonical admin/admin-command and core/policy-* contracts */
export interface AdminSession {
  sessionId: string;
  userId: string;
  role: "owner" | "admin";
  permissions: string[];
  startedAt: string;
  lastActiveAt: string;
  deviceId: string;
  isElevated: boolean;
  elevatedUntil?: string;
}

/** @deprecated Use canonical core/event-envelope for audit trails */
export interface AdminAuditEntry {
  id: string;
  sessionId: string;
  userId: string;
  action: string;
  domain: DomainId;
  target: string;
  details: Record<string, unknown>;
  timestamp: string;
  result: "success" | "failure" | "denied";
  ipAddress?: string;
}

/** @deprecated Use canonical core/policy-decision and core/policy-snapshot */
export interface AdminPolicy {
  id: string;
  name: string;
  domain: DomainId;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: Record<string, unknown>;
  actions: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}