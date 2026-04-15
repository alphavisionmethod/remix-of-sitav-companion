// ═══════════════════════════════════════════════════════════════
// SITA OS — Service-to-Service Authentication & Authorization
// Zero-trust service identity with scope enforcement and audit
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface ServiceIdentity {
  serviceKey: string;
  displayName: string;
  plane: string;
  scopes: string[];
  trustLevel: string;
  isActive: boolean;
  allowedTargets: string[];
  tokenTtlSeconds: number;
}

export interface ServiceToken {
  token: string;
  serviceKey: string;
  scopes: string[];
  expiresAt: number;
  issuedAt: number;
}

export interface ServiceAccessLog {
  sourceService: string;
  targetService: string;
  action: string;
  scope: string;
  allowed: boolean;
  timestamp: string;
  reason?: string;
}

class ServiceAuthEngine {
  private identityCache = new Map<string, ServiceIdentity>();
  private accessLogs: ServiceAccessLog[] = [];

  async loadIdentities(): Promise<ServiceIdentity[]> {
    const { data } = await supabase
      .from("service_identity_registry")
      .select("*")
      .eq("is_active", true);

    const identities = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      serviceKey: row.service_key as string,
      displayName: row.display_name as string,
      plane: row.plane as string,
      scopes: (row.scopes as string[]) ?? [],
      trustLevel: row.trust_level as string,
      isActive: row.is_active as boolean,
      allowedTargets: (row.allowed_targets as string[]) ?? [],
      tokenTtlSeconds: (row.token_ttl_seconds as number) ?? 3600,
    }));

    this.identityCache.clear();
    identities.forEach((id) => this.identityCache.set(id.serviceKey, id));
    return identities;
  }

  async validateServiceIdentity(serviceKey: string, requiredScope: string): Promise<boolean> {
    if (this.identityCache.size === 0) await this.loadIdentities();
    const identity = this.identityCache.get(serviceKey);
    if (!identity || !identity.isActive) return false;
    return identity.scopes.includes(requiredScope);
  }

  async getServiceScopes(serviceKey: string): Promise<string[]> {
    if (this.identityCache.size === 0) await this.loadIdentities();
    return this.identityCache.get(serviceKey)?.scopes ?? [];
  }

  async canServiceCall(sourceService: string, targetService: string): Promise<boolean> {
    if (this.identityCache.size === 0) await this.loadIdentities();
    const source = this.identityCache.get(sourceService);
    if (!source || !source.isActive) return false;
    return source.allowedTargets.includes(targetService);
  }

  issueServiceToken(serviceKey: string): ServiceToken | null {
    const identity = this.identityCache.get(serviceKey);
    if (!identity || !identity.isActive) return null;

    const now = Date.now();
    return {
      token: `svc_${serviceKey}_${now}_${crypto.randomUUID().slice(0, 8)}`,
      serviceKey,
      scopes: identity.scopes,
      issuedAt: now,
      expiresAt: now + identity.tokenTtlSeconds * 1000,
    };
  }

  async auditServiceAccess(
    sourceService: string,
    targetService: string,
    action: string,
    scope: string,
    allowed: boolean,
    reason?: string
  ): Promise<void> {
    const log: ServiceAccessLog = {
      sourceService,
      targetService,
      action,
      scope,
      allowed,
      timestamp: new Date().toISOString(),
      reason,
    };
    this.accessLogs.push(log);

    // Keep in-memory log bounded
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-500);
    }
  }

  getRecentAccessLogs(limit = 50): ServiceAccessLog[] {
    return this.accessLogs.slice(-limit).reverse();
  }

  getIdentity(serviceKey: string): ServiceIdentity | undefined {
    return this.identityCache.get(serviceKey);
  }

  getAllIdentities(): ServiceIdentity[] {
    return Array.from(this.identityCache.values());
  }
}

export const serviceAuth = new ServiceAuthEngine();
