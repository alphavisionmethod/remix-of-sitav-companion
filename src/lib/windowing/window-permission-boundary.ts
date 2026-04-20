// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Permission Boundary
// Enforces permission scopes for windows.
// ═══════════════════════════════════════════════════════════════

import type { PermissionScope } from "@/packages/window-contracts";
import { getWindowEntry } from "./window-registry";
import { checkIPCPermission } from "./window-capability-policy";

const SCOPE_LEVELS: Record<PermissionScope, number> = {
  full: 3, standard: 2, restricted: 1, sandboxed: 0,
};

interface PermissionResult { allowed: boolean; reason: string; }

const scopeMap = new Map<string, PermissionScope>();

export function setWindowScope(windowId: string, scope: PermissionScope): void {
  scopeMap.set(windowId, scope);
}

function getScope(windowId: string): PermissionScope {
  return scopeMap.get(windowId) ?? "standard";
}

export function canAccessNativeBridge(windowId: string): PermissionResult {
  const scope = getScope(windowId);
  const ok = SCOPE_LEVELS[scope] >= SCOPE_LEVELS["full"];
  return { allowed: ok, reason: ok ? "full scope" : `scope '${scope}' insufficient for native bridge` };
}

export function canRequestFileSystem(windowId: string): PermissionResult {
  const scope = getScope(windowId);
  const ok = SCOPE_LEVELS[scope] >= SCOPE_LEVELS["standard"];
  return { allowed: ok, reason: ok ? "standard+ scope" : `scope '${scope}' insufficient for filesystem` };
}

export function canLaunchExternal(windowId: string): PermissionResult {
  const scope = getScope(windowId);
  const ok = SCOPE_LEVELS[scope] >= SCOPE_LEVELS["standard"];
  return { allowed: ok, reason: ok ? "standard+ scope" : `scope '${scope}' insufficient for external launch` };
}

export function canCommunicateWith(sourceId: string, targetId: string): PermissionResult {
  const sourceScope = getScope(sourceId);
  if (sourceScope === "sandboxed") return { allowed: false, reason: "sandboxed windows cannot communicate" };
  const ipc = checkIPCPermission(sourceId, targetId);
  return { allowed: ipc === "allowed", reason: ipc === "allowed" ? "IPC allowed" : "IPC denied by capability policy" };
}

export function canOpenPrivilegedModal(windowId: string): PermissionResult {
  const scope = getScope(windowId);
  const ok = SCOPE_LEVELS[scope] >= SCOPE_LEVELS["standard"];
  return { allowed: ok, reason: ok ? "standard+ scope" : `scope '${scope}' insufficient for privileged modal` };
}

export function canExportSupportData(windowId: string): PermissionResult {
  const scope = getScope(windowId);
  const ok = SCOPE_LEVELS[scope] >= SCOPE_LEVELS["restricted"];
  return { allowed: ok, reason: ok ? "restricted+ scope" : `scope '${scope}' insufficient` };
}

export interface EffectivePermissions {
  nativeBridge: boolean;
  fileSystem: boolean;
  externalLaunch: boolean;
  privilegedModal: boolean;
  supportExport: boolean;
  scope: PermissionScope;
}

export function resolveEffectivePermissions(windowId: string): EffectivePermissions {
  return {
    nativeBridge: canAccessNativeBridge(windowId).allowed,
    fileSystem: canRequestFileSystem(windowId).allowed,
    externalLaunch: canLaunchExternal(windowId).allowed,
    privilegedModal: canOpenPrivilegedModal(windowId).allowed,
    supportExport: canExportSupportData(windowId).allowed,
    scope: getScope(windowId),
  };
}