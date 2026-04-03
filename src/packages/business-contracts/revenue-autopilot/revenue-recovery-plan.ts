export interface RevenueRecoveryStep {
  order: number;
  action: string;
  channel: "email" | "phone" | "sms" | "in-app";
  delayDays: number;
  template?: string;
  requiresApproval: boolean;
}

export interface RevenueRecoveryPlan {
  id: string;
  leakId: string;
  entityId: string;
  targetAmountCents: number;
  steps: RevenueRecoveryStep[];
  status: "planned" | "executing" | "completed" | "abandoned";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  currentStep: number;
  recoveredCents: number;
}
