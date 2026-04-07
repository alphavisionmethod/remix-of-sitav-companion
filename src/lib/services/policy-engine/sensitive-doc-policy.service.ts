// ═══════════════════════════════════════════════════════════════
// SITA OS — Sensitive Document Policy Service
// Classifies documents against SENSITIVE_DOCUMENT_POLICIES
// ═══════════════════════════════════════════════════════════════

import { SENSITIVE_DOCUMENT_POLICIES, type SensitiveDocumentPolicy } from "@/packages/policy-contracts";
import type { PrivacyTier } from "@/packages/contracts";
import type { RedactionPolicy } from "@/packages/policy-contracts/sensitive-docs/types";

export interface DocumentClassification {
  isSensitive: boolean;
  matchedPolicy: SensitiveDocumentPolicy | null;
  privacyTier: PrivacyTier;
  triggeredPatterns: string[];
  redactionRequired: boolean;
  auditRequired: boolean;
  memoryRetention: "session" | "24h" | "permanent-redacted";
  recommendations: string[];
}

export function classifyDocument(content: string, filename?: string): DocumentClassification {
  const searchText = `${content} ${filename || ""}`.toLowerCase();

  for (const policy of SENSITIVE_DOCUMENT_POLICIES) {
    const matched = policy.triggers.filter((t) =>
      searchText.includes(t.toLowerCase())
    );

    if (matched.length > 0) {
      return {
        isSensitive: true,
        matchedPolicy: policy,
        privacyTier: policy.privacyTier,
        triggeredPatterns: matched,
        redactionRequired: policy.supportSafeRedaction,
        auditRequired: policy.auditRequired,
        memoryRetention: policy.memoryRetention,
        recommendations: buildRecommendations(policy),
      };
    }
  }

  return {
    isSensitive: false,
    matchedPolicy: null,
    privacyTier: "internal",
    triggeredPatterns: [],
    redactionRequired: false,
    auditRequired: false,
    memoryRetention: "permanent-redacted",
    recommendations: [],
  };
}

function buildRecommendations(policy: SensitiveDocumentPolicy): string[] {
  const recs: string[] = [];
  if (policy.privacyTier === "restricted") recs.push("Store in encrypted vault only");
  if (policy.auditRequired) recs.push("All access must be logged with audit trail");
  if (policy.supportSafeRedaction) recs.push("Apply field-level redaction before display");
  if (policy.memoryRetention === "session") recs.push("Do not persist in long-term memory");
  if (policy.memoryRetention === "24h") recs.push("Auto-purge from memory after 24 hours");
  return recs;
}

export function getRedactionRules(documentType: string): RedactionPolicy | null {
  const defaults: RedactionPolicy[] = [
    { documentType: "tax-return", sensitivityTier: "restricted", fieldsToRedact: ["SSN", "income", "employer-ein"], redactionMethod: "mask", visibleToRoles: ["owner"], auditOnAccess: true, supportExport: false, description: "Tax return redaction" },
    { documentType: "bank-statement", sensitivityTier: "confidential", fieldsToRedact: ["account-number", "routing-number", "balance"], redactionMethod: "mask", visibleToRoles: ["owner", "admin"], auditOnAccess: true, supportExport: true, description: "Bank statement redaction" },
    { documentType: "medical-record", sensitivityTier: "restricted", fieldsToRedact: ["diagnosis", "medication", "provider-notes"], redactionMethod: "remove", visibleToRoles: ["owner"], auditOnAccess: true, supportExport: false, description: "Medical record redaction" },
    { documentType: "legal-document", sensitivityTier: "confidential", fieldsToRedact: ["party-names", "financial-terms", "signatures"], redactionMethod: "tokenize", visibleToRoles: ["owner", "admin"], auditOnAccess: true, supportExport: true, description: "Legal document redaction" },
  ];
  return defaults.find((r) => r.documentType === documentType) || null;
}

export function bulkClassify(documents: { content: string; filename?: string }[]): DocumentClassification[] {
  return documents.map((d) => classifyDocument(d.content, d.filename));
}

