// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Tenant Service
// Tenant CRUD, membership, quotas, policies — real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface CloudTenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  region: string;
  residency: string;
  status: string;
  owner_user_id: string;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface TenantQuota {
  tenant_id: string;
  used_bytes: number;
  quota_bytes: number;
  file_count: number;
}

export interface TenantPolicy {
  id: string;
  tenant_id: string;
  policy_key: string;
  display_name: string;
  value_json: Record<string, unknown>;
  enforced: boolean;
  category: string;
}

export interface SharedWorkspace {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  owner_user_id: string;
  visibility: string;
}

class CloudTenantService {
  private static instance: CloudTenantService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudTenantService();
    return this.instance;
  }

  async getTenants(): Promise<CloudTenant[]> {
    try {
      const { data } = await fromTable("cloud_tenants").select("*").order("created_at", { ascending: false }).limit(100);
      if (data?.length) return data;
    } catch {}
    return this.getDemoTenants();
  }

  async getMemberships(tenantId: string): Promise<TenantMembership[]> {
    try {
      const { data } = await fromTable("cloud_tenant_memberships").select("*").eq("tenant_id", tenantId);
      if (data?.length) return data;
    } catch {}
    return [];
  }

  async getQuota(tenantId: string): Promise<TenantQuota> {
    try {
      const { data } = await fromTable("cloud_tenant_quotas").select("*").eq("tenant_id", tenantId).maybeSingle();
      if (data) return data;
    } catch {}
    return { tenant_id: tenantId, used_bytes: 0, quota_bytes: 10737418240, file_count: 0 };
  }

  async getPolicies(tenantId: string): Promise<TenantPolicy[]> {
    try {
      const { data } = await fromTable("cloud_tenant_policies").select("*").eq("tenant_id", tenantId);
      if (data?.length) return data;
    } catch {}
    return [];
  }

  async getWorkspaces(tenantId: string): Promise<SharedWorkspace[]> {
    try {
      const { data } = await fromTable("cloud_shared_workspaces").select("*").eq("tenant_id", tenantId);
      if (data?.length) return data;
    } catch {}
    return [];
  }

  getDemoTenants(): CloudTenant[] {
    return [
      { id: "demo-t1", name: "SITA Team", slug: "sita-team", type: "team", region: "us-east-1", residency: "standard", status: "active", owner_user_id: "demo", settings: {}, created_at: new Date().toISOString() },
      { id: "demo-t2", name: "Acme Corp", slug: "acme-corp", type: "company", region: "eu-west-1", residency: "eu-only", status: "active", owner_user_id: "demo", settings: {}, created_at: new Date().toISOString() },
    ];
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

export const cloudTenantService = CloudTenantService.getInstance();
