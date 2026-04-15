// ═══════════════════════════════════════════════════════════════
// SITA OS — Plane Registry & Boundary Enforcement
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export type PlaneKey = "control" | "product" | "shared-core";

export interface PlaneInfo {
  id: string;
  planeKey: PlaneKey;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  serviceCount: number;
  status: string;
}

export interface PlaneServiceAssignment {
  id: string;
  planeId: string;
  serviceKey: string;
  displayName: string;
  description: string;
  serviceType: string;
  status: string;
}

interface CrossPlaneAccess {
  allowed: boolean;
  reason?: string;
}

// In-memory plane assignment cache
const serviceCache = new Map<string, PlaneKey>();

const CROSS_PLANE_RULES: Record<string, Record<string, boolean>> = {
  product:       { "shared-core": true, control: false },
  control:       { "shared-core": true, product: false },
  "shared-core": { product: true, control: true },
};

export const planeRegistry = {
  /** Fetch all planes from DB */
  async getPlanes(): Promise<PlaneInfo[]> {
    const { data } = await fromTable("platform_planes").select("*").order("plane_key");
    return (data || []).map((r: any) => ({
      id: r.id,
      planeKey: r.plane_key as PlaneKey,
      displayName: r.display_name,
      description: r.description,
      color: r.color,
      icon: r.icon,
      serviceCount: r.service_count,
      status: r.status,
    }));
  },

  /** Fetch services assigned to a plane */
  async getPlaneServices(planeKey: PlaneKey): Promise<PlaneServiceAssignment[]> {
    const { data } = await fromTable("plane_service_assignments")
      .select("*, platform_planes!inner(plane_key)")
      .eq("platform_planes.plane_key", planeKey);
    return (data || []).map((r: any) => ({
      id: r.id,
      planeId: r.plane_id,
      serviceKey: r.service_key,
      displayName: r.display_name,
      description: r.description,
      serviceType: r.service_type,
      status: r.status,
    }));
  },

  /** Resolve which plane owns a service */
  async resolvePlane(serviceKey: string): Promise<PlaneKey | null> {
    if (serviceCache.has(serviceKey)) return serviceCache.get(serviceKey)!;
    const { data } = await fromTable("plane_service_assignments")
      .select("platform_planes(plane_key)")
      .eq("service_key", serviceKey)
      .maybeSingle();
    const key = data?.platform_planes?.plane_key as PlaneKey | undefined;
    if (key) serviceCache.set(serviceKey, key);
    return key || null;
  },

  /** Check if cross-plane access is allowed */
  validateCrossPlaneAccess(source: PlaneKey, target: PlaneKey, _action: string): CrossPlaneAccess {
    if (source === target) return { allowed: true };
    const rules = CROSS_PLANE_RULES[source];
    if (!rules || rules[target] === undefined) {
      return { allowed: false, reason: `No rule defined for ${source} → ${target}` };
    }
    if (!rules[target]) {
      return { allowed: false, reason: `${source} plane cannot access ${target} plane directly` };
    }
    return { allowed: true };
  },

  /** Log a boundary violation to admin audit */
  async auditPlaneViolation(source: PlaneKey, target: PlaneKey, action: string, userId?: string) {
    await fromTable("admin_action_audit").insert({
      actor_user_id: userId || "00000000-0000-0000-0000-000000000000",
      action: "plane_boundary_violation",
      target_type: "plane",
      target_id: target,
      plane: source,
      justification: `Attempted ${action} from ${source} to ${target}`,
      severity: "warning",
    });
  },

  clearCache() {
    serviceCache.clear();
  },
};
