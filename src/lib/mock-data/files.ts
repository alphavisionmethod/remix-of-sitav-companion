// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Files & Search
// ═══════════════════════════════════════════════════════════════

import type { IndexableItem } from "@/lib/core-services/search-fabric";

export const MOCK_FILES_OVERVIEW = [
  { name: "Q1_Financial_Statement.pdf", mime: "application/pdf", text: "Revenue figures, tax obligations, quarterly earnings report" },
  { name: "School_Enrollment_Form.pdf", mime: "application/pdf", text: "Student enrollment form for Spring semester" },
  { name: "Vendor_Contract_Apex.docx", mime: "application/msword", text: "Service agreement NDA with auto-renew clause, Net-30 terms, $24,000/yr" },
  { name: "Invoice_1042_Marcus.pdf", mime: "application/pdf", text: "Invoice for design services, payment due 04/15/2025" },
  { name: "Passport_Scan.jpg", mime: "image/jpeg", text: "Passport identification document scan" },
  { name: "Bank_Statement_Mar.pdf", mime: "application/pdf", text: "Bank statement with account routing and SSN information" },
  { name: "Travel_Itinerary_Hawaii.pdf", mime: "application/pdf", text: "Flight confirmation and hotel reservation for trip" },
  { name: "Medical_Records_2024.pdf", mime: "application/pdf", text: "Annual medical checkup results, prescription details" },
];

export const MOCK_FILES_PROCESSING = [
  { filename: "Receipt_Costco_Mar28.jpg", mimeType: "image/jpeg", sizeBytes: 2400000, textContent: "Costco Wholesale receipt total $342.18 grocery items household supplies", uploadedBy: "owner" },
  { filename: "Vendor_NDA_TechFlow.pdf", mimeType: "application/pdf", sizeBytes: 450000, textContent: "Mutual NDA agreement confidential information 2-year term", uploadedBy: "owner" },
  { filename: "Bank_Statement_Chase_Mar.pdf", mimeType: "application/pdf", sizeBytes: 890000, textContent: "Bank statement account routing number SSN ending 4821 February deposits", uploadedBy: "owner" },
  { filename: "Kid_Activity_Schedule.png", mimeType: "image/png", sizeBytes: 1200000, textContent: "Soccer practice Tuesday Thursday 4pm swimming lessons Wednesday 3pm", uploadedBy: "owner" },
];

export const MOCK_FILES_SEARCH_INDEX: IndexableItem[] = [
  { id: "1", type: "document", domain: "business", title: "Service Agreement — Apex Corp", body: "Service agreement with auto-renew clause, Net-30 terms, $24,000/yr annual contract", tags: ["contract", "apex", "auto-renew"], timestamp: Date.now() - 86400000 * 2, metadata: { value: 24000 }, linkedEntities: ["Apex Corp", "Business"], sensitivity: "confidential", actionUrl: "/files" },
  { id: "2", type: "invoice", domain: "business", title: "Invoice #1038 — Marcus Johnson", body: "Invoice for design services $4,200 payment received via Stripe", tags: ["invoice", "marcus", "design"], timestamp: Date.now() - 86400000, metadata: { value: 4200 }, linkedEntities: ["Marcus Johnson"], sensitivity: "internal", actionUrl: "/money" },
  { id: "3", type: "document", domain: "finance", title: "Bank Statement — Chase Feb", body: "Bank statement with account ending 4821 showing deposits and withdrawals for February", tags: ["bank", "statement", "chase"], timestamp: Date.now() - 86400000 * 5, metadata: {}, linkedEntities: ["Chase Bank", "Money Center"], sensitivity: "restricted", actionUrl: "/money" },
  { id: "4", type: "booking", domain: "concierge", title: "Travel Confirmation — Hawaii", body: "Flight confirmation and hotel reservation Marriott Wailea Apr 12-18 $289/night trip", tags: ["travel", "hawaii", "hotel", "trip"], timestamp: Date.now() - 3600000 * 12, metadata: {}, linkedEntities: ["Hawaii Trip", "Travel"], sensitivity: "internal", actionUrl: "/concierge/travel" },
  { id: "5", type: "customer", domain: "business", title: "Apex Corp — Customer Profile", body: "Enterprise client since 2023, annual contract $24,000, renewal March 2025, primary contact Sarah", tags: ["customer", "apex", "enterprise"], timestamp: Date.now() - 86400000 * 10, metadata: { value: 24000 }, linkedEntities: ["Apex Corp"], sensitivity: "internal", actionUrl: "/business/customers" },
  { id: "6", type: "bill", domain: "finance", title: "AWS Hosting — Monthly Bill", body: "Amazon Web Services hosting bill $340 monthly recurring auto-pay enabled", tags: ["aws", "hosting", "recurring", "bill"], timestamp: Date.now() - 86400000 * 3, metadata: { value: 340 }, linkedEntities: ["AWS"], sensitivity: "internal", actionUrl: "/money/bills" },
  { id: "7", type: "task", domain: "concierge", title: "School Enrollment Deadline", body: "Complete school enrollment form by April 15, 2025 for Spring semester", tags: ["school", "deadline", "enrollment"], timestamp: Date.now() - 3600000 * 24, metadata: {}, linkedEntities: ["Family", "School"], sensitivity: "internal", actionUrl: "/concierge/school" },
  { id: "8", type: "receipt", domain: "finance", title: "Costco Groceries Receipt", body: "Costco wholesale receipt total $342.18 groceries household supplies March 28", tags: ["receipt", "costco", "groceries"], timestamp: Date.now() - 86400000, metadata: { value: 342.18 }, linkedEntities: ["Costco"], sensitivity: "public", actionUrl: "/files" },
  { id: "9", type: "opportunity", domain: "business", title: "Expansion Opportunity — TechFlow", body: "TechFlow expressed interest in expanded design services, potential $15,000 quarterly engagement", tags: ["opportunity", "techflow", "expansion"], timestamp: Date.now() - 86400000 * 7, metadata: { value: 60000 }, linkedEntities: ["TechFlow"], sensitivity: "confidential", actionUrl: "/business/opportunities" },
  { id: "10", type: "document", domain: "finance", title: "Insurance Renewal Notice", body: "Insurance policy renewal notice premium increase $120/mo due date April 30, 2025", tags: ["insurance", "renewal", "deadline"], timestamp: Date.now() - 86400000 * 4, metadata: { value: 1440 }, linkedEntities: ["Insurance"], sensitivity: "internal", actionUrl: "/files" },
];
