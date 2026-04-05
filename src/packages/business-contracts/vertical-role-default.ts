// SITA OS — Business Contracts: Vertical Role Defaults
export interface VerticalRoleDefault {
  verticalId: string;
  roleName: string;
  permissions: string[];
  dashboardSections: string[];
  notificationPreferences: Record<string, boolean>;
  approvalAuthority: { maxAmountCents: number; allowedActions: string[] };
  dataVisibility: "full" | "team" | "own" | "restricted";
  description: string;
}
