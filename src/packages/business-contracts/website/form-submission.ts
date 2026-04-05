// SITA OS — Website: Form Submission
export interface FormSubmission {
  id: string;
  formId: string;
  siteId: string;
  data: Record<string, unknown>;
  sourceUrl: string;
  ipAddress?: string;
  userAgent?: string;
  utmParams?: Record<string, string>;
  convertedToLeadId?: string;
  processedAt?: string;
  status: "new" | "processed" | "spam" | "archived";
  createdAt: string;
}
