// SITA OS — Business Contracts: Vertical Approval Defaults
export interface VerticalApprovalDefault {
  verticalId: string;
  actionType: string;
  requiresApproval: boolean;
  autoApproveBelow: number;
  approverRoles: string[];
  escalationChain: string[];
  maxDecisionHours: number;
  notificationChannels: string[];
  proofRequired: boolean;
  conditions: ApprovalCondition[];
}

export interface ApprovalCondition {
  field: string;
  operator: "gt" | "lt" | "eq" | "in" | "between";
  value: unknown;
  overrideApproval: boolean;
}
