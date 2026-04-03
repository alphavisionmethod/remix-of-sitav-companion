export type SensitivityTier = "public" | "internal" | "confidential" | "restricted" | "top-secret";

export interface RetentionPolicy {
  documentType: string;
  sensitivityTier: SensitivityTier;
  retentionPeriodDays: number | "indefinite";
  autoDeleteAfterRetention: boolean;
  archiveAfterDays?: number;
  legalHoldOverride: boolean;
  complianceStandard?: string;
  description: string;
}

export interface RedactionPolicy {
  documentType: string;
  sensitivityTier: SensitivityTier;
  fieldsToRedact: string[];
  redactionMethod: "mask" | "hash" | "remove" | "tokenize";
  visibleToRoles: string[];
  auditOnAccess: boolean;
  supportExport: boolean;
  description: string;
}
