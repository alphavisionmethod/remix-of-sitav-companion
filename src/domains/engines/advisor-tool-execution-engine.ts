// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Tool Execution Engine
// Tool registry, execution pipeline, approval gates, rollback
// ═══════════════════════════════════════════════════════════════

import { isActionAllowed, type AdvisorRole, type ActionCategory } from "@/lib/ai-platform/runtime/advisor-permission-matrix";
import { getReversibility, isReversible } from "@/lib/ai-platform/runtime/advisor-reversibility-map";

export type ToolCategory = "communication" | "crm" | "scheduling" | "invoicing" | "tasks" | "files" | "analytics";

export type ToolRiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export type ToolExecutionStatus =
  | "pending_approval"
  | "approved"
  | "executing"
  | "completed"
  | "failed"
  | "rolled_back"
  | "cancelled";

export interface ToolDefinition {
  toolId: string;
  name: string;
  description: string;
  category: ToolCategory;
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
  rollbackCapable: boolean;
  icon: string;
  parametersSchema: Record<string, ToolParameterDef>;
  estimatedDurationMs: number;
  cooldownMs: number;
  maxDailyExecutions: number;
}

export interface ToolParameterDef {
  type: "string" | "number" | "boolean" | "date" | "email" | "select";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
}

export interface ToolExecution {
  id: string;
  toolId: string;
  advisorId: string;
  advisorName: string;
  status: ToolExecutionStatus;
  parameters: Record<string, unknown>;
  result?: ToolExecutionResult;
  rollbackData?: Record<string, unknown>;
  requestedAt: number;
  approvedAt?: number;
  executedAt?: number;
  completedAt?: number;
  rolledBackAt?: number;
  error?: string;
  approvedBy?: string;
  confidenceAtRequest: number;
  impactSummary: string;
}

export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  sideEffects: string[];
  receipts: string[];
}

// ── Tool Registry ───────────────────────────────────────────────

export const ADVISOR_TOOLS: ToolDefinition[] = [
  {
    toolId: "send-email",
    name: "Send Email",
    description: "Compose and send an email to a client or lead",
    category: "communication",
    riskLevel: "medium",
    requiresApproval: true,
    rollbackCapable: false,
    icon: "Mail",
    parametersSchema: {
      to: { type: "email", label: "Recipient", required: true, placeholder: "client@example.com" },
      subject: { type: "string", label: "Subject", required: true, placeholder: "Follow-up on our discussion" },
      body: { type: "string", label: "Body", required: true, placeholder: "Email content..." },
      cc: { type: "email", label: "CC", required: false },
    },
    estimatedDurationMs: 2000,
    cooldownMs: 60000,
    maxDailyExecutions: 50,
  },
  {
    toolId: "create-task",
    name: "Create Task",
    description: "Create a new task in the task queue",
    category: "tasks",
    riskLevel: "safe",
    requiresApproval: false,
    rollbackCapable: true,
    icon: "CheckSquare",
    parametersSchema: {
      title: { type: "string", label: "Task Title", required: true },
      assignee: { type: "string", label: "Assignee", required: false },
      dueDate: { type: "date", label: "Due Date", required: false },
      priority: { type: "select", label: "Priority", required: true, options: ["low", "medium", "high", "urgent"] },
    },
    estimatedDurationMs: 500,
    cooldownMs: 0,
    maxDailyExecutions: 200,
  },
  {
    toolId: "update-crm-status",
    name: "Update CRM Status",
    description: "Change the status of a lead or client in CRM",
    category: "crm",
    riskLevel: "low",
    requiresApproval: false,
    rollbackCapable: true,
    icon: "UserCog",
    parametersSchema: {
      contactId: { type: "string", label: "Contact", required: true },
      newStatus: { type: "select", label: "New Status", required: true, options: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] },
      reason: { type: "string", label: "Reason", required: false },
    },
    estimatedDurationMs: 800,
    cooldownMs: 5000,
    maxDailyExecutions: 100,
  },
  {
    toolId: "schedule-appointment",
    name: "Schedule Appointment",
    description: "Book an appointment on the calendar",
    category: "scheduling",
    riskLevel: "low",
    requiresApproval: true,
    rollbackCapable: true,
    icon: "Calendar",
    parametersSchema: {
      title: { type: "string", label: "Title", required: true },
      with: { type: "string", label: "With", required: true },
      dateTime: { type: "date", label: "Date & Time", required: true },
      duration: { type: "select", label: "Duration", required: true, options: ["15min", "30min", "45min", "1hr", "1.5hr", "2hr"] },
      location: { type: "string", label: "Location", required: false, placeholder: "Office / Zoom / Phone" },
    },
    estimatedDurationMs: 1000,
    cooldownMs: 10000,
    maxDailyExecutions: 20,
  },
  {
    toolId: "generate-invoice",
    name: "Generate Invoice",
    description: "Create and prepare an invoice for a client",
    category: "invoicing",
    riskLevel: "high",
    requiresApproval: true,
    rollbackCapable: true,
    icon: "Receipt",
    parametersSchema: {
      clientName: { type: "string", label: "Client", required: true },
      amount: { type: "number", label: "Amount ($)", required: true },
      description: { type: "string", label: "Description", required: true },
      dueDate: { type: "date", label: "Due Date", required: true },
      sendImmediately: { type: "boolean", label: "Send Immediately", required: false },
    },
    estimatedDurationMs: 3000,
    cooldownMs: 30000,
    maxDailyExecutions: 30,
  },
  {
    toolId: "send-follow-up",
    name: "Send Follow-Up",
    description: "Send a follow-up message to a lead who hasn't responded",
    category: "communication",
    riskLevel: "medium",
    requiresApproval: true,
    rollbackCapable: false,
    icon: "MessageSquare",
    parametersSchema: {
      contactName: { type: "string", label: "Contact", required: true },
      channel: { type: "select", label: "Channel", required: true, options: ["email", "sms", "in-app"] },
      tone: { type: "select", label: "Tone", required: true, options: ["friendly", "professional", "urgent", "casual"] },
      context: { type: "string", label: "Context", required: false, placeholder: "What was the last interaction about?" },
    },
    estimatedDurationMs: 2000,
    cooldownMs: 300000,
    maxDailyExecutions: 20,
  },
  {
    toolId: "create-quote",
    name: "Create Quote",
    description: "Generate a price quote for a prospect",
    category: "invoicing",
    riskLevel: "high",
    requiresApproval: true,
    rollbackCapable: true,
    icon: "FileText",
    parametersSchema: {
      clientName: { type: "string", label: "Client", required: true },
      items: { type: "string", label: "Line Items (comma-separated)", required: true },
      totalAmount: { type: "number", label: "Total ($)", required: true },
      validDays: { type: "number", label: "Valid For (days)", required: true },
      notes: { type: "string", label: "Notes", required: false },
    },
    estimatedDurationMs: 4000,
    cooldownMs: 60000,
    maxDailyExecutions: 15,
  },
  {
    toolId: "log-interaction",
    name: "Log Interaction",
    description: "Record a client interaction in CRM history",
    category: "crm",
    riskLevel: "safe",
    requiresApproval: false,
    rollbackCapable: true,
    icon: "ClipboardList",
    parametersSchema: {
      contactName: { type: "string", label: "Contact", required: true },
      type: { type: "select", label: "Type", required: true, options: ["call", "email", "meeting", "note", "sms"] },
      summary: { type: "string", label: "Summary", required: true },
      outcome: { type: "select", label: "Outcome", required: false, options: ["positive", "neutral", "negative", "no-response"] },
    },
    estimatedDurationMs: 500,
    cooldownMs: 0,
    maxDailyExecutions: 200,
  },
];

// ── Execution Engine ────────────────────────────────────────────

let executionIdCounter = 0;

export class AdvisorToolExecutionEngine {
  private executions: ToolExecution[] = [];
  private dailyCounts: Map<string, number> = new Map();
  private lastExecutionTime: Map<string, number> = new Map();

  getTool(toolId: string): ToolDefinition | undefined {
    return ADVISOR_TOOLS.find(t => t.toolId === toolId);
  }

  getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return ADVISOR_TOOLS.filter(t => t.category === category);
  }

  getAllExecutions(): ToolExecution[] {
    return [...this.executions];
  }

  getExecutionsByStatus(status: ToolExecutionStatus): ToolExecution[] {
    return this.executions.filter(e => e.status === status);
  }

  /** Request tool execution — auto-approves safe tools, queues others */
  requestExecution(params: {
    toolId: string;
    advisorId: string;
    advisorName: string;
    parameters: Record<string, unknown>;
    confidence: number;
    impactSummary: string;
  }): ToolExecution {
    const tool = this.getTool(params.toolId);
    if (!tool) throw new Error(`Unknown tool: ${params.toolId}`);

    // Check canonical permission matrix if role mapping exists
    const roleMap: Record<string, AdvisorRole> = {
      "business-advisor": "business", "money-advisor": "finance",
      "concierge-advisor": "concierge", "security-advisor": "security",
      "ops-advisor": "operations", "execution-advisor": "operations",
    };
    const role = roleMap[params.advisorId];
    if (role) {
      const actionCategory: ActionCategory = tool.riskLevel === "high" || tool.riskLevel === "critical"
        ? "execute" : tool.category === "communication" ? "communicate-external" : "draft";
      const permission = isActionAllowed(role, actionCategory);
      if (permission === "blocked") {
        throw new Error(`Permission denied: ${params.advisorId} cannot perform ${actionCategory} actions`);
      }
    }

    // Check daily limit
    const dailyKey = `${params.toolId}-${new Date().toDateString()}`;
    const count = this.dailyCounts.get(dailyKey) ?? 0;
    if (count >= tool.maxDailyExecutions) {
      throw new Error(`Daily limit (${tool.maxDailyExecutions}) reached for ${tool.name}`);
    }

    // Check cooldown
    const lastTime = this.lastExecutionTime.get(params.toolId) ?? 0;
    if (Date.now() - lastTime < tool.cooldownMs) {
      const remaining = Math.ceil((tool.cooldownMs - (Date.now() - lastTime)) / 1000);
      throw new Error(`Cooldown active: ${remaining}s remaining for ${tool.name}`);
    }

    const execution: ToolExecution = {
      id: `exec-${++executionIdCounter}-${Date.now()}`,
      toolId: params.toolId,
      advisorId: params.advisorId,
      advisorName: params.advisorName,
      status: tool.requiresApproval ? "pending_approval" : "approved",
      parameters: params.parameters,
      requestedAt: Date.now(),
      confidenceAtRequest: params.confidence,
      impactSummary: params.impactSummary,
      approvedAt: tool.requiresApproval ? undefined : Date.now(),
    };

    this.executions.unshift(execution);

    // Auto-execute if no approval needed
    if (!tool.requiresApproval) {
      this.executeInternal(execution.id);
    }

    return execution;
  }

  /** Approve a pending execution */
  approve(executionId: string, approver: string = "owner"): ToolExecution {
    const exec = this.executions.find(e => e.id === executionId);
    if (!exec) throw new Error("Execution not found");
    if (exec.status !== "pending_approval") throw new Error("Cannot approve: not pending");
    exec.status = "approved";
    exec.approvedAt = Date.now();
    exec.approvedBy = approver;
    return exec;
  }

  /** Execute an approved tool */
  execute(executionId: string): ToolExecution {
    const exec = this.executions.find(e => e.id === executionId);
    if (!exec) throw new Error("Execution not found");
    if (exec.status !== "approved") throw new Error("Cannot execute: not approved");
    return this.executeInternal(executionId);
  }

  private executeInternal(executionId: string): ToolExecution {
    const exec = this.executions.find(e => e.id === executionId)!;
    const tool = this.getTool(exec.toolId)!;

    exec.status = "executing";
    exec.executedAt = Date.now();

    // Simulate execution
    const success = Math.random() > 0.05; // 95% success rate
    if (success) {
      exec.status = "completed";
      exec.completedAt = Date.now();
      exec.result = {
        success: true,
        message: `${tool.name} completed successfully`,
        data: { ...exec.parameters },
        sideEffects: this.generateSideEffects(tool),
        receipts: [`receipt-${exec.id}`],
      };

      // Store rollback data if capable
      if (tool.rollbackCapable) {
        exec.rollbackData = { previousState: "captured", ...exec.parameters };
      }
    } else {
      exec.status = "failed";
      exec.completedAt = Date.now();
      exec.error = `${tool.name} failed: simulated transient error`;
      exec.result = {
        success: false,
        message: exec.error,
        sideEffects: [],
        receipts: [`receipt-${exec.id}-failed`],
      };
    }

    // Update daily counts and cooldown
    const dailyKey = `${exec.toolId}-${new Date().toDateString()}`;
    this.dailyCounts.set(dailyKey, (this.dailyCounts.get(dailyKey) ?? 0) + 1);
    this.lastExecutionTime.set(exec.toolId, Date.now());

    return exec;
  }

  /** Rollback a completed execution */
  rollback(executionId: string): ToolExecution {
    const exec = this.executions.find(e => e.id === executionId);
    if (!exec) throw new Error("Execution not found");
    if (exec.status !== "completed") throw new Error("Cannot rollback: not completed");

    const tool = this.getTool(exec.toolId);
    if (!tool?.rollbackCapable) throw new Error("Tool does not support rollback");
    if (!exec.rollbackData) throw new Error("No rollback data available");

    exec.status = "rolled_back";
    exec.rolledBackAt = Date.now();
    return exec;
  }

  /** Cancel a pending execution */
  cancel(executionId: string): ToolExecution {
    const exec = this.executions.find(e => e.id === executionId);
    if (!exec) throw new Error("Execution not found");
    if (exec.status !== "pending_approval") throw new Error("Cannot cancel: not pending");
    exec.status = "cancelled";
    return exec;
  }

  /** Get execution stats */
  getStats() {
    const total = this.executions.length;
    const pending = this.executions.filter(e => e.status === "pending_approval").length;
    const completed = this.executions.filter(e => e.status === "completed").length;
    const failed = this.executions.filter(e => e.status === "failed").length;
    const rolledBack = this.executions.filter(e => e.status === "rolled_back").length;
    const successRate = total > 0 ? completed / Math.max(1, completed + failed) : 1;

    return { total, pending, completed, failed, rolledBack, successRate };
  }

  private generateSideEffects(tool: ToolDefinition): string[] {
    const effects: string[] = [];
    switch (tool.category) {
      case "communication":
        effects.push("Email sent", "CRM interaction logged", "Follow-up timer started");
        break;
      case "crm":
        effects.push("Contact record updated", "Activity timeline updated");
        break;
      case "scheduling":
        effects.push("Calendar event created", "Reminder set", "Notification sent to attendees");
        break;
      case "invoicing":
        effects.push("Invoice generated", "Financial record updated", "Client notified");
        break;
      case "tasks":
        effects.push("Task created", "Assignee notified");
        break;
      default:
        effects.push("Operation completed");
    }
    return effects;
  }
}

// ── Singleton ───────────────────────────────────────────────────

let instance: AdvisorToolExecutionEngine | null = null;

export function getAdvisorToolExecutionEngine(): AdvisorToolExecutionEngine {
  if (!instance) instance = new AdvisorToolExecutionEngine();
  return instance;
}
