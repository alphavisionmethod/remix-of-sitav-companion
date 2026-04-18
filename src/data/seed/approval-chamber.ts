// SITA OS — Demo Data: Approval Chamber
import type { AutonomyRung } from "@/components/sita/primitives/AutonomyLadder";
import type { ChainStepId } from "@/components/sita/primitives/ExecutionChainTimeline";

export interface DemoApprovalItem {
  id: string;
  title: string;
  description: string;
  domain: "business" | "finance" | "concierge";
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "pending" | "simulating" | "awaiting-sign" | "approved" | "rejected";
  requestedBy: string;
  requestedAt: string;
  expiresAt: string;
  policyName: string;
  policyReason: string;
  autonomyLevel: AutonomyRung;
  simulationAvailable: boolean;
  requiresDeviceSign: boolean;
  amount?: number;
  currency?: string;
  currentStep: ChainStepId;
  skipSimulation?: boolean;
  impactSummary: string[];
  confidence: number;
}

export const DEMO_APPROVAL_ITEMS: DemoApprovalItem[] = [
  {
    id: "apr-001", title: "Transfer $4,200 to Operating Reserve",
    description: "Monthly reserve top-up triggered by cash-flow policy. Moves funds from checking to high-yield savings.",
    domain: "finance", riskLevel: "medium", status: "pending",
    requestedBy: "Finance Advisor", requestedAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    policyName: "Reserve Maintenance Policy",
    policyReason: "Operating reserve is 12% below target ($35,000). Policy requires top-up when gap exceeds 10%.",
    autonomyLevel: "approve-execute", simulationAvailable: true, requiresDeviceSign: true,
    amount: 4200, currency: "USD", currentStep: "simulation",
    impactSummary: ["Checking balance: $18,400 → $14,200", "Reserve balance: $30,800 → $35,000 (target met)", "Cash runway: 45 days → 38 days (still above 30-day minimum)"],
    confidence: 0.92,
  },
  {
    id: "apr-002", title: "Send Reactivation Campaign to 23 Dormant Leads",
    description: "Revenue Autopilot identified 23 leads inactive >60 days. Proposes personalized email sequence.",
    domain: "business", riskLevel: "low", status: "pending",
    requestedBy: "Business Advisor", requestedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    policyName: "Outbound Communication Policy",
    policyReason: "Automated outreach to >10 contacts requires owner approval per communication policy.",
    autonomyLevel: "suggest", simulationAvailable: true, requiresDeviceSign: false,
    currentStep: "approval",
    impactSummary: ["Expected reactivation rate: 8-12% (2-3 leads)", "Estimated pipeline value: $6,200-$9,400", "Email send cost: $0.46"],
    confidence: 0.78,
  },
  {
    id: "apr-003", title: "Escalate Overdue Invoice #1087 to Collections",
    description: "Invoice from Meridian Corp ($3,800) is 47 days overdue. Policy triggers escalation at 45 days.",
    domain: "business", riskLevel: "high", status: "pending",
    requestedBy: "Collections Advisor", requestedAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 43200000).toISOString(),
    policyName: "Collections Escalation Policy",
    policyReason: "High-value invoices (>$2,000) overdue >45 days must be escalated. Client relationship risk flagged.",
    autonomyLevel: "approve-execute", simulationAvailable: false, requiresDeviceSign: true,
    amount: 3800, currency: "USD", currentStep: "approval", skipSimulation: true,
    impactSummary: ["Client: Meridian Corp (health: at-risk)", "Outstanding: $3,800 (47 days overdue)", "Relationship impact: Potential churn if tone is aggressive", "Recovery probability: 72% within 14 days"],
    confidence: 0.65,
  },
];
