// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Task / Action Model
// Cross-domain work object and action grammar.
// ═══════════════════════════════════════════════════════════════

// ── Work Object ─────────────────────────────────────────────────

export type TaskDomain =
  | "business" | "finance" | "concierge" | "files" | "trust"
  | "admin" | "integrations" | "ai" | "workflows" | "support"
  | "settings" | "system";

export type TaskStatus =
  | "pending" | "in-progress" | "blocked" | "waiting-approval"
  | "completed" | "cancelled" | "failed";

export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface WorkObject {
  readonly taskId: string;
  readonly domain: TaskDomain;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly createdBy: string;       // auth user id
  readonly assignedTo?: string;
  readonly deepLinkId?: string;
  readonly parentTaskId?: string;
  readonly tags?: readonly string[];
}

// ── Action Grammar ──────────────────────────────────────────────

export type ActionVerb =
  | "create" | "update" | "delete" | "archive"
  | "approve" | "reject" | "escalate"
  | "execute" | "rollback" | "retry"
  | "review" | "assign" | "comment"
  | "export" | "import" | "sync";

export type ActionRiskTier = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export interface ActionDescriptor {
  readonly actionId: string;
  readonly verb: ActionVerb;
  readonly domain: TaskDomain;
  readonly targetType: string;       // e.g. "invoice", "client", "connector"
  readonly displayLabel: string;
  readonly riskTier: ActionRiskTier;
  readonly requiresApproval: boolean;
  readonly requiresConfirmation: boolean;
  readonly reversible: boolean;
  readonly notificationOnComplete: boolean;
  readonly searchable: boolean;
  readonly evidenceRequired: boolean;
}

// ── Action Receipt (cross-domain) ───────────────────────────────

export interface ActionReceipt {
  readonly receiptId: string;
  readonly actionId: string;
  readonly taskId?: string;
  readonly executedBy: string;
  readonly executedAt: number;
  readonly outcome: "success" | "failure" | "partial" | "rolled-back";
  readonly evidenceRef?: string;
  readonly rollbackToken?: string;
}