// SITA OS — Website: Quote Request Submission
export interface QuoteRequestSubmission {
  id: string;
  formId: string;
  siteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  company?: string;
  serviceCategory: string;
  description: string;
  budget?: string;
  timeline?: string;
  attachments: string[];
  convertedToQuoteId?: string;
  status: "new" | "reviewing" | "quoted" | "closed";
  createdAt: string;
}
