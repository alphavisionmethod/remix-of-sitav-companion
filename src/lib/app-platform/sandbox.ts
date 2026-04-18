// ═══════════════════════════════════════════════════════════════
// Sandbox — wraps the SDK with permission/runtime boundary checks
// ═══════════════════════════════════════════════════════════════

import { permissionEngine, type PermissionGrant } from "./permission-engine";
import { isPermitted } from "./runtime-boundaries";
import type { PackagePermission, PackageRuntimeTarget } from "./package-schema";

export class PermissionDeniedError extends Error {
  constructor(public permission: PackagePermission, public reason: string) {
    super(`Permission denied: ${permission} — ${reason}`);
    this.name = "PermissionDeniedError";
  }
}

export interface SandboxContext {
  appId: string;
  runtime: PackageRuntimeTarget;
  manifestPermissions: PackagePermission[];
  userGrants: PermissionGrant[];
}

export function makeSandbox(ctx: SandboxContext) {
  function require(permission: PackagePermission): void {
    if (!isPermitted(ctx.runtime, permission)) {
      throw new PermissionDeniedError(permission, `Runtime ${ctx.runtime} cannot use ${permission}.`);
    }
    const decision = permissionEngine.decide({
      permission,
      manifestRequested: ctx.manifestPermissions,
      userGrants: ctx.userGrants,
    });
    if (!decision.granted) {
      throw new PermissionDeniedError(permission, decision.reason);
    }
  }
  return { require, ctx };
}
