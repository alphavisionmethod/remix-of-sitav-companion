// ═══════════════════════════════════════════════════════════════
// SITA OS — CollectionsCommandCenter UI configuration
// Static escalation ladder template (chase sequence definition).
// Lives outside the page module so the page contains no fake-live
// arrays per the production-truth audit.
// ═══════════════════════════════════════════════════════════════

import {
  Mail, Phone, AlertTriangle, DollarSign, FileText, Scale,
  type LucideIcon,
} from "lucide-react";

export interface ChaseStep {
  step: number;
  dayAfterDue: number;
  action: string;
  channel: "email" | "phone" | "sms" | "letter" | "legal";
  icon: LucideIcon;
  escalationLevel: 0 | 1 | 2 | 3 | 4;
  autoExecute: boolean;
  requiresApproval: boolean;
}

export const COLLECTIONS_CHASE_SEQUENCE: ChaseStep[] = [
  { step: 1, dayAfterDue: 1, action: "Friendly reminder email", channel: "email", icon: Mail, escalationLevel: 0, autoExecute: true, requiresApproval: false },
  { step: 2, dayAfterDue: 7, action: "Second reminder with invoice", channel: "email", icon: Mail, escalationLevel: 0, autoExecute: true, requiresApproval: false },
  { step: 3, dayAfterDue: 14, action: "Phone call follow-up", channel: "phone", icon: Phone, escalationLevel: 1, autoExecute: false, requiresApproval: false },
  { step: 4, dayAfterDue: 21, action: "Urgent payment request", channel: "email", icon: Mail, escalationLevel: 1, autoExecute: true, requiresApproval: true },
  { step: 5, dayAfterDue: 30, action: "Final notice before escalation", channel: "email", icon: AlertTriangle, escalationLevel: 2, autoExecute: false, requiresApproval: true },
  { step: 6, dayAfterDue: 45, action: "Executive escalation call", channel: "phone", icon: Phone, escalationLevel: 2, autoExecute: false, requiresApproval: true },
  { step: 7, dayAfterDue: 60, action: "Payment plan offer", channel: "email", icon: DollarSign, escalationLevel: 3, autoExecute: false, requiresApproval: true },
  { step: 8, dayAfterDue: 75, action: "Formal demand letter", channel: "letter", icon: FileText, escalationLevel: 3, autoExecute: false, requiresApproval: true },
  { step: 9, dayAfterDue: 90, action: "Collections agency referral", channel: "legal", icon: Scale, escalationLevel: 4, autoExecute: false, requiresApproval: true },
];

export const ESCALATION_LABELS = ["Friendly", "Firm", "Urgent", "Formal", "Legal"] as const;