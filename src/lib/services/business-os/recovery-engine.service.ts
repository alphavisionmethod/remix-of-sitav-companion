// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Recovery Engine Service
// Orchestrates revenue recovery workflows
// ═══════════════════════════════════════════════════════════════

import type { RevenueLeakRecord } from "@/domains/business";

export interface RecoveryPlan {
  id: string;
  leakId: string;
  steps: RecoveryStep[];
  estimatedRecoveryCents: number;
  estimatedDurationDays: number;
  status: "planned" | "in-progress" | "completed" | "abandoned";
  createdAt: string;
}

export interface RecoveryStep {
  order: number;
  action: string;
  channel: "email" | "sms" | "call" | "in-app" | "legal";
  scheduledAt: string;
  completed: boolean;
}

export function createRecoveryPlan(leak: RevenueLeakRecord): RecoveryPlan {
  const steps: RecoveryStep[] = [
    { order: 1, action: "Send friendly reminder email", channel: "email", scheduledAt: new Date().toISOString(), completed: false },
    { order: 2, action: "Follow-up SMS", channel: "sms", scheduledAt: new Date(Date.now() + 3 * 86400000).toISOString(), completed: false },
    { order: 3, action: "Personal phone call", channel: "call", scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(), completed: false },
    { order: 4, action: "Final notice — payment plan offer", channel: "email", scheduledAt: new Date(Date.now() + 14 * 86400000).toISOString(), completed: false },
  ];

  return {
    id: `recovery-${leak.id}`,
    leakId: leak.id,
    steps,
    estimatedRecoveryCents: Math.round(leak.leakAmountCents * 0.7),
    estimatedDurationDays: 21,
    status: "planned",
    createdAt: new Date().toISOString(),
  };
}

export function advanceRecoveryStep(plan: RecoveryPlan): RecoveryPlan {
  const nextStep = plan.steps.find(s => !s.completed);
  if (nextStep) nextStep.completed = true;
  if (plan.steps.every(s => s.completed)) plan.status = "completed";
  else plan.status = "in-progress";
  return plan;
}

