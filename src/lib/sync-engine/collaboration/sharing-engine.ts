// ═══════════════════════════════════════════════════════════════
// SITA OS — Sharing & Collaboration Engine
// ACLs, link sharing, invites, presence, locking, shared workspaces
// ═══════════════════════════════════════════════════════════════

import type { SyncObject, SyncObjectPermissions } from "../sync-object-model";

// ─── Types ────────────────────────────────────────────────────

export type SharePermission = "read" | "comment" | "edit" | "admin" | "owner";

export interface ShareACL {
  userId: string;
  permission: SharePermission;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  inherited: boolean;
}

export interface ShareLink {
  id: string;
  objectId: string;
  token: string;
  permission: SharePermission;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  passwordHash?: string;
  maxUses?: number;
  useCount: number;
  isActive: boolean;
  label?: string;
}

export interface ShareInvite {
  id: string;
  objectId: string;
  inviterUserId: string;
  inviteeEmail: string;
  inviteeUserId?: string;
  permission: SharePermission;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  message?: string;
  createdAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export interface PresenceIndicator {
  userId: string;
  objectId: string;
  deviceId: string;
  status: "viewing" | "editing" | "idle" | "away";
  cursorPosition?: { line: number; column: number };
  lastActivityAt: string;
  displayName?: string;
  color: string;
}

export interface ObjectLock {
  objectId: string;
  lockedBy: string;
  deviceId: string;
  lockedAt: string;
  expiresAt: string;
  lockType: "exclusive" | "section";
  sectionId?: string;
}

export interface SharedWorkspace {
  id: string;
  name: string;
  ownerId: string;
  members: Array<{ userId: string; permission: SharePermission; joinedAt: string }>;
  objectIds: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  settings: {
    conflictMode: "last-write-wins" | "manual" | "auto-merge" | "fork";
    allowAnonymous: boolean;
    maxMembers: number;
  };
}

export interface ShareEvent {
  id: string;
  type: "shared" | "unshared" | "permission-changed" | "invite-sent" | "invite-accepted"
    | "link-created" | "link-revoked" | "lock-acquired" | "lock-released"
    | "workspace-created" | "member-joined" | "member-left";
  objectId?: string;
  workspaceId?: string;
  actorUserId: string;
  targetUserId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// ─── Sharing Engine ───────────────────────────────────────────

class SharingEngine {
  private acls = new Map<string, ShareACL[]>(); // objectId -> ACLs
  private links = new Map<string, ShareLink>();
  private invites = new Map<string, ShareInvite>();
  private presence = new Map<string, PresenceIndicator[]>(); // objectId -> indicators
  private locks = new Map<string, ObjectLock>();
  private workspaces = new Map<string, SharedWorkspace>();
  private events: ShareEvent[] = [];
  private presenceColors = [
    "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6",
  ];

  // ─── ACL Management ─────────────────────────────────

  shareObject(objectId: string, targetUserId: string, permission: SharePermission, grantedBy: string): void {
    const list = this.acls.get(objectId) ?? [];
    const existing = list.find(a => a.userId === targetUserId);
    if (existing) {
      existing.permission = permission;
      existing.grantedAt = new Date().toISOString();
    } else {
      list.push({
        userId: targetUserId,
        permission,
        grantedBy,
        grantedAt: new Date().toISOString(),
        inherited: false,
      });
    }
    this.acls.set(objectId, list);
    this.emitEvent("shared", grantedBy, { objectId, targetUserId, permission });
  }

  unshareObject(objectId: string, targetUserId: string, actorUserId: string): void {
    const list = this.acls.get(objectId) ?? [];
    this.acls.set(objectId, list.filter(a => a.userId !== targetUserId));
    this.emitEvent("unshared", actorUserId, { objectId, targetUserId });
  }

  getObjectACLs(objectId: string): ShareACL[] {
    return [...(this.acls.get(objectId) ?? [])];
  }

  checkPermission(objectId: string, userId: string, required: SharePermission): boolean {
    const list = this.acls.get(objectId) ?? [];
    const acl = list.find(a => a.userId === userId);
    if (!acl) return false;
    if (acl.expiresAt && new Date(acl.expiresAt).getTime() < Date.now()) return false;
    const levels: SharePermission[] = ["read", "comment", "edit", "admin", "owner"];
    return levels.indexOf(acl.permission) >= levels.indexOf(required);
  }

  updatePermissions(objectId: string, obj: SyncObject): SyncObjectPermissions {
    const acls = this.acls.get(objectId) ?? [];
    return {
      owner: obj.userId,
      readers: acls.filter(a => a.permission === "read").map(a => a.userId),
      writers: acls.filter(a => ["edit", "admin", "owner"].includes(a.permission)).map(a => a.userId),
      publicRead: false,
      publicWrite: false,
    };
  }

  // ─── Link Sharing ──────────────────────────────────

  createShareLink(objectId: string, createdBy: string, opts: {
    permission?: SharePermission;
    expiresIn?: number; // ms
    password?: string;
    maxUses?: number;
    label?: string;
  } = {}): ShareLink {
    const link: ShareLink = {
      id: `sl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      objectId,
      token: this.generateToken(),
      permission: opts.permission ?? "read",
      createdBy,
      createdAt: new Date().toISOString(),
      expiresAt: opts.expiresIn ? new Date(Date.now() + opts.expiresIn).toISOString() : undefined,
      passwordHash: opts.password ? this.hashPassword(opts.password) : undefined,
      maxUses: opts.maxUses,
      useCount: 0,
      isActive: true,
      label: opts.label,
    };
    this.links.set(link.id, link);
    this.emitEvent("link-created", createdBy, { objectId, linkId: link.id, permission: link.permission });
    return link;
  }

  validateShareLink(linkId: string, password?: string): { valid: boolean; permission?: SharePermission; objectId?: string } {
    const link = this.links.get(linkId);
    if (!link || !link.isActive) return { valid: false };
    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) return { valid: false };
    if (link.maxUses && link.useCount >= link.maxUses) return { valid: false };
    if (link.passwordHash && (!password || this.hashPassword(password) !== link.passwordHash)) return { valid: false };
    link.useCount++;
    return { valid: true, permission: link.permission, objectId: link.objectId };
  }

  revokeShareLink(linkId: string, actorUserId: string): void {
    const link = this.links.get(linkId);
    if (link) {
      link.isActive = false;
      this.emitEvent("link-revoked", actorUserId, { linkId, objectId: link.objectId });
    }
  }

  getShareLinks(objectId: string): ShareLink[] {
    return Array.from(this.links.values()).filter(l => l.objectId === objectId);
  }

  // ─── Invites ────────────────────────────────────────

  createInvite(objectId: string, inviterUserId: string, inviteeEmail: string, permission: SharePermission, message?: string): ShareInvite {
    const invite: ShareInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      objectId,
      inviterUserId,
      inviteeEmail,
      permission,
      status: "pending",
      message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    this.invites.set(invite.id, invite);
    this.emitEvent("invite-sent", inviterUserId, { objectId, inviteeEmail, permission });
    return invite;
  }

  acceptInvite(inviteId: string, userId: string): boolean {
    const invite = this.invites.get(inviteId);
    if (!invite || invite.status !== "pending") return false;
    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      invite.status = "expired";
      return false;
    }
    invite.status = "accepted";
    invite.inviteeUserId = userId;
    invite.respondedAt = new Date().toISOString();
    this.shareObject(invite.objectId, userId, invite.permission, invite.inviterUserId);
    this.emitEvent("invite-accepted", userId, { inviteId, objectId: invite.objectId });
    return true;
  }

  declineInvite(inviteId: string): void {
    const invite = this.invites.get(inviteId);
    if (invite && invite.status === "pending") {
      invite.status = "declined";
      invite.respondedAt = new Date().toISOString();
    }
  }

  getPendingInvites(email?: string): ShareInvite[] {
    return Array.from(this.invites.values()).filter(i =>
      i.status === "pending" && (!email || i.inviteeEmail === email)
    );
  }

  // ─── Presence ───────────────────────────────────────

  setPresence(objectId: string, userId: string, deviceId: string, status: PresenceIndicator["status"], displayName?: string): void {
    const list = this.presence.get(objectId) ?? [];
    const existing = list.find(p => p.userId === userId && p.deviceId === deviceId);
    if (existing) {
      existing.status = status;
      existing.lastActivityAt = new Date().toISOString();
    } else {
      list.push({
        userId,
        objectId,
        deviceId,
        status,
        lastActivityAt: new Date().toISOString(),
        displayName,
        color: this.presenceColors[list.length % this.presenceColors.length],
      });
    }
    this.presence.set(objectId, list);
  }

  removePresence(objectId: string, userId: string, deviceId: string): void {
    const list = this.presence.get(objectId) ?? [];
    this.presence.set(objectId, list.filter(p => !(p.userId === userId && p.deviceId === deviceId)));
  }

  getPresence(objectId: string): PresenceIndicator[] {
    const list = this.presence.get(objectId) ?? [];
    const cutoff = Date.now() - 300000; // 5min
    return list.filter(p => new Date(p.lastActivityAt).getTime() > cutoff);
  }

  // ─── Locking ────────────────────────────────────────

  acquireLock(objectId: string, userId: string, deviceId: string, durationMs = 300000): ObjectLock | null {
    const existing = this.locks.get(objectId);
    if (existing && new Date(existing.expiresAt).getTime() > Date.now() && existing.lockedBy !== userId) {
      return null; // locked by someone else
    }
    const lock: ObjectLock = {
      objectId,
      lockedBy: userId,
      deviceId,
      lockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      lockType: "exclusive",
    };
    this.locks.set(objectId, lock);
    this.emitEvent("lock-acquired", userId, { objectId, lockType: "exclusive" });
    return lock;
  }

  releaseLock(objectId: string, userId: string): boolean {
    const lock = this.locks.get(objectId);
    if (!lock || lock.lockedBy !== userId) return false;
    this.locks.delete(objectId);
    this.emitEvent("lock-released", userId, { objectId });
    return true;
  }

  getLock(objectId: string): ObjectLock | null {
    const lock = this.locks.get(objectId);
    if (lock && new Date(lock.expiresAt).getTime() < Date.now()) {
      this.locks.delete(objectId);
      return null;
    }
    return lock ?? null;
  }

  // ─── Shared Workspaces ─────────────────────────────

  createWorkspace(name: string, ownerId: string, settings?: Partial<SharedWorkspace["settings"]>): SharedWorkspace {
    const ws: SharedWorkspace = {
      id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      ownerId,
      members: [{ userId: ownerId, permission: "owner", joinedAt: new Date().toISOString() }],
      objectIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      settings: {
        conflictMode: settings?.conflictMode ?? "auto-merge",
        allowAnonymous: settings?.allowAnonymous ?? false,
        maxMembers: settings?.maxMembers ?? 50,
      },
    };
    this.workspaces.set(ws.id, ws);
    this.emitEvent("workspace-created", ownerId, { workspaceId: ws.id, name });
    return ws;
  }

  addWorkspaceMember(workspaceId: string, userId: string, permission: SharePermission, actorUserId: string): boolean {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return false;
    if (ws.members.length >= ws.settings.maxMembers) return false;
    if (ws.members.find(m => m.userId === userId)) return false;
    ws.members.push({ userId, permission, joinedAt: new Date().toISOString() });
    ws.updatedAt = new Date().toISOString();
    this.emitEvent("member-joined", actorUserId, { workspaceId, userId, permission });
    return true;
  }

  removeWorkspaceMember(workspaceId: string, userId: string, actorUserId: string): boolean {
    const ws = this.workspaces.get(workspaceId);
    if (!ws || userId === ws.ownerId) return false;
    ws.members = ws.members.filter(m => m.userId !== userId);
    ws.updatedAt = new Date().toISOString();
    this.emitEvent("member-left", actorUserId, { workspaceId, userId });
    return true;
  }

  addObjectToWorkspace(workspaceId: string, objectId: string): void {
    const ws = this.workspaces.get(workspaceId);
    if (ws && !ws.objectIds.includes(objectId)) {
      ws.objectIds.push(objectId);
      ws.updatedAt = new Date().toISOString();
    }
  }

  getWorkspace(workspaceId: string): SharedWorkspace | null {
    return this.workspaces.get(workspaceId) ?? null;
  }

  getUserWorkspaces(userId: string): SharedWorkspace[] {
    return Array.from(this.workspaces.values()).filter(ws =>
      ws.members.some(m => m.userId === userId)
    );
  }

  // ─── Events ─────────────────────────────────────────

  getEvents(limit = 50): ShareEvent[] {
    return this.events.slice(-limit);
  }

  getObjectEvents(objectId: string, limit = 20): ShareEvent[] {
    return this.events.filter(e => e.objectId === objectId).slice(-limit);
  }

  // ─── Stats ──────────────────────────────────────────

  getStats() {
    return {
      totalSharedObjects: this.acls.size,
      totalLinks: Array.from(this.links.values()).filter(l => l.isActive).length,
      totalInvites: this.invites.size,
      pendingInvites: this.getPendingInvites().length,
      activeWorkspaces: this.workspaces.size,
      activeLocks: this.locks.size,
      activePresence: Array.from(this.presence.values()).reduce((a, b) => a + b.length, 0),
      totalEvents: this.events.length,
    };
  }

  // ─── Internal ───────────────────────────────────────

  private emitEvent(type: ShareEvent["type"], actorUserId: string, details: Record<string, unknown>): void {
    this.events.push({
      id: `se_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      objectId: details.objectId as string | undefined,
      workspaceId: details.workspaceId as string | undefined,
      actorUserId,
      targetUserId: details.targetUserId as string | undefined,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.events.length > 5000) this.events = this.events.slice(-4000);
  }

  private generateToken(): string {
    return `slt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return `ph_${Math.abs(hash).toString(16)}`;
  }
}

export const sharingEngine = new SharingEngine();
