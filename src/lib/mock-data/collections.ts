// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Collections Command Center
// ═══════════════════════════════════════════════════════════════

export interface CollectionsAccount {
  id: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  originalDueDate: string;
  agingDays: number;
  agingBucket: "current" | "1-30" | "31-60" | "61-90" | "90+";
  escalationLevel: 0 | 1 | 2 | 3 | 4;
  lastContactAt: string;
  lastContactMethod: "email" | "phone" | "sms" | "letter" | "none";
  chaseSequenceActive: boolean;
  currentStep: number;
  totalSteps: number;
  promisedPayDate?: string;
  notes: string;
  riskScore: number;
  status: "active" | "promised" | "disputed" | "escalated" | "recovered" | "written-off";
}

export const MOCK_COLLECTIONS_ACCOUNTS: CollectionsAccount[] = [
  { id: "col-1", customerName: "TechVentures Inc", invoiceId: "inv-1035", invoiceNumber: "INV-1035", amountCents: 1500000, originalDueDate: "2026-02-15", agingDays: 47, agingBucket: "31-60", escalationLevel: 2, lastContactAt: "2026-03-20", lastContactMethod: "email", chaseSequenceActive: true, currentStep: 5, totalSteps: 9, notes: "Client requested extension. No follow-up.", riskScore: 72, status: "active" },
  { id: "col-2", customerName: "Sarah Chen Design", invoiceId: "inv-1041", invoiceNumber: "INV-1041", amountCents: 850000, originalDueDate: "2026-03-01", agingDays: 33, agingBucket: "31-60", escalationLevel: 1, lastContactAt: "2026-03-25", lastContactMethod: "phone", chaseSequenceActive: true, currentStep: 4, totalSteps: 9, promisedPayDate: "2026-04-10", notes: "Promised payment by April 10", riskScore: 45, status: "promised" },
  { id: "col-3", customerName: "Bloom Studio", invoiceId: "inv-1029", invoiceNumber: "INV-1029", amountCents: 320000, originalDueDate: "2026-01-20", agingDays: 73, agingBucket: "61-90", escalationLevel: 3, lastContactAt: "2026-03-15", lastContactMethod: "letter", chaseSequenceActive: true, currentStep: 7, totalSteps: 9, notes: "Disputed scope. Partial payment offered.", riskScore: 85, status: "disputed" },
  { id: "col-4", customerName: "Premier Digital", invoiceId: "inv-1044", invoiceNumber: "INV-1044", amountCents: 480000, originalDueDate: "2026-03-10", agingDays: 24, agingBucket: "1-30", escalationLevel: 1, lastContactAt: "2026-03-28", lastContactMethod: "email", chaseSequenceActive: true, currentStep: 3, totalSteps: 9, notes: "", riskScore: 35, status: "active" },
  { id: "col-5", customerName: "NovaTech Solutions", invoiceId: "inv-1032", invoiceNumber: "INV-1032", amountCents: 2200000, originalDueDate: "2026-01-10", agingDays: 83, agingBucket: "61-90", escalationLevel: 3, lastContactAt: "2026-03-10", lastContactMethod: "phone", chaseSequenceActive: true, currentStep: 8, totalSteps: 9, notes: "Payment plan rejected. Considering legal action.", riskScore: 92, status: "escalated" },
  { id: "col-6", customerName: "Apex Corp", invoiceId: "inv-1048", invoiceNumber: "INV-1048", amountCents: 180000, originalDueDate: "2026-03-20", agingDays: 14, agingBucket: "1-30", escalationLevel: 0, lastContactAt: "2026-03-30", lastContactMethod: "email", chaseSequenceActive: true, currentStep: 2, totalSteps: 9, notes: "First reminder sent", riskScore: 15, status: "active" },
  { id: "col-7", customerName: "Johnson & Co", invoiceId: "inv-1022", invoiceNumber: "INV-1022", amountCents: 420000, originalDueDate: "2025-12-15", agingDays: 109, agingBucket: "90+", escalationLevel: 4, lastContactAt: "2026-03-01", lastContactMethod: "letter", chaseSequenceActive: false, currentStep: 9, totalSteps: 9, notes: "Referred to collections agency", riskScore: 98, status: "escalated" },
];
