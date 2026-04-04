// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Dashboard View
// ═══════════════════════════════════════════════════════════════

import type { CustomerLifecycleStage } from "../customer-lifecycle";

export interface CustomerDashboardView {
  customerId: string;
  customerName: string;
  lifecycleStage: CustomerLifecycleStage;
  healthGrade: "A" | "B" | "C" | "D" | "F";
  healthScore: number;
  lifetimeValueCents: number;
  openTickets: number;
  lastContactDate: string;
  nextActionDue?: string;
  accountManagerName?: string;
}
