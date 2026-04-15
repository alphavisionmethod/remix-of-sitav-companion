// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Workflow Engine
// Structured support case lifecycle with escalation and diagnostics
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SupportCase {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  escalatedToRole: string | null;
  correlationId: string | null;
  selfRepairAttempted: boolean;
  selfRepairResult: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportCaseEvent {
  id: string;
  caseId: string;
  eventType: string;
  actorUserId: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DiagnosticPackage {
  caseId: string;
  correlationId: string;
  generatedAt: string;
  userProfile: Record<string, unknown>;
  deviceSummary: Record<string, unknown>;
  syncHealth: Record<string, unknown>;
  recentErrors: Array<Record<string, unknown>>;
  recommendations: string[];
}

export type CaseCategory = "sync" | "storage" | "device" | "account" | "billing" | "security" | "general";
export type CasePriority = "low" | "normal" | "high" | "urgent";
export type CaseStatus = "open" | "investigating" | "escalated" | "waiting_user" | "resolved" | "closed";

class SupportWorkflowEngine {
  async createCase(
    userId: string,
    title: string,
    description: string,
    category: CaseCategory = "general",
    priority: CasePriority = "normal",
    selfRepairAttempted = false,
    selfRepairResult?: string
  ): Promise<SupportCase> {
    const correlationId = `case-${crypto.randomUUID().slice(0, 12)}`;

    const { data, error } = await supabase
      .from("support_cases")
      .insert({
        user_id: userId,
        title,
        description,
        category,
        priority,
        status: "open",
        correlation_id: correlationId,
        self_repair_attempted: selfRepairAttempted,
        self_repair_result: selfRepairResult ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creation event
    const row = data as Record<string, unknown>;
    await this.addCaseEvent(row.id as string, "created", userId, `Case opened: ${title}`, {
      category,
      priority,
      selfRepairAttempted,
    });

    return this.mapCase(row);
  }

  async escalateCase(caseId: string, actorUserId: string, targetRole: string, reason: string): Promise<void> {
    await supabase
      .from("support_cases")
      .update({
        status: "escalated",
        escalated_to_role: targetRole,
      })
      .eq("id", caseId);

    await this.addCaseEvent(caseId, "escalated", actorUserId, `Escalated to ${targetRole}: ${reason}`, {
      targetRole,
      reason,
    });
  }

  async addCaseEvent(
    caseId: string,
    eventType: string,
    actorUserId: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<SupportCaseEvent> {
    const { data, error } = await supabase
      .from("support_case_events")
      .insert({
        case_id: caseId,
        event_type: eventType,
        actor_user_id: actorUserId,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      caseId: row.case_id as string,
      eventType: row.event_type as string,
      actorUserId: row.actor_user_id as string,
      content: row.content as string,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
    };
  }

  async generateDiagnosticPackage(caseId: string, userId: string): Promise<DiagnosticPackage> {
    const correlationId = `diag-${crypto.randomUUID().slice(0, 12)}`;

    const [profile, devices, syncJobs, errors] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("cloud_devices").select("*").eq("user_id", userId),
      supabase.from("cloud_sync_jobs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("cloud_audit_events").select("*").eq("actor_user_id", userId).eq("severity", "error").order("created_at", { ascending: false }).limit(20),
    ]);

    const deviceList = (devices.data ?? []) as Array<Record<string, unknown>>;
    const recommendations: string[] = [];

    // Auto-recommend based on diagnostics
    if (deviceList.some((d) => d.trust_state === "untrusted")) {
      recommendations.push("Untrusted devices detected — consider re-authentication");
    }
    if ((errors.data ?? []).length > 5) {
      recommendations.push("High error rate — investigate recent failures");
    }
    if (deviceList.length === 0) {
      recommendations.push("No devices registered — user may need to re-enroll");
    }

    const pkg: DiagnosticPackage = {
      caseId,
      correlationId,
      generatedAt: new Date().toISOString(),
      userProfile: (profile.data as Record<string, unknown>) ?? {},
      deviceSummary: {
        total: deviceList.length,
        trusted: deviceList.filter((d) => d.trust_state === "trusted").length,
        untrusted: deviceList.filter((d) => d.trust_state === "untrusted").length,
      },
      syncHealth: {
        recentJobs: (syncJobs.data ?? []).length,
        failedJobs: ((syncJobs.data ?? []) as Array<Record<string, string>>).filter((j) => j.status === "failed").length,
      },
      recentErrors: ((errors.data ?? []) as Array<Record<string, unknown>>).slice(0, 10),
      recommendations,
    };

    // Store diagnostic package on the case
    await supabase
      .from("support_cases")
      .update({ diagnostic_package: pkg as unknown as Record<string, unknown> })
      .eq("id", caseId);

    await this.addCaseEvent(caseId, "diagnostic_generated", userId, "Diagnostic package generated", {
      correlationId,
      recommendationCount: recommendations.length,
    });

    return pkg;
  }

  async resolveCase(caseId: string, actorUserId: string, resolution: string): Promise<void> {
    await supabase
      .from("support_cases")
      .update({
        status: "resolved",
        resolution,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", caseId);

    await this.addCaseEvent(caseId, "resolved", actorUserId, `Resolved: ${resolution}`);
  }

  async getUserCases(userId: string): Promise<SupportCase[]> {
    const { data } = await supabase
      .from("support_cases")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return ((data ?? []) as Array<Record<string, unknown>>).map(this.mapCase);
  }

  async getAllCases(statusFilter?: string[]): Promise<SupportCase[]> {
    let query = supabase.from("support_cases").select("*").order("created_at", { ascending: false });
    if (statusFilter && statusFilter.length > 0) {
      query = query.in("status", statusFilter);
    }
    const { data } = await query.limit(100);
    return ((data ?? []) as Array<Record<string, unknown>>).map(this.mapCase);
  }

  async getCaseEvents(caseId: string): Promise<SupportCaseEvent[]> {
    const { data } = await supabase
      .from("support_case_events")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      caseId: row.case_id as string,
      eventType: row.event_type as string,
      actorUserId: row.actor_user_id as string,
      content: row.content as string,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
    }));
  }

  private mapCase(row: Record<string, unknown>): SupportCase {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      title: row.title as string,
      description: (row.description as string) ?? "",
      category: (row.category as string) ?? "general",
      priority: (row.priority as string) ?? "normal",
      status: (row.status as string) ?? "open",
      assignedTo: row.assigned_to as string | null,
      escalatedToRole: row.escalated_to_role as string | null,
      correlationId: row.correlation_id as string | null,
      selfRepairAttempted: (row.self_repair_attempted as boolean) ?? false,
      selfRepairResult: row.self_repair_result as string | null,
      resolution: row.resolution as string | null,
      resolvedAt: row.resolved_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

export const supportWorkflow = new SupportWorkflowEngine();
