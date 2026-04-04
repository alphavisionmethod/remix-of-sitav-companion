// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Activity Stream
// ═══════════════════════════════════════════════════════════════

import {
  Sparkles, CheckCircle, Shield, Eye, AlertTriangle, Brain, Zap, Users, DollarSign, RotateCcw,
} from "lucide-react";

export const MOCK_ACTIVITY_TIMELINE = [
  { icon: Sparkles, color: "text-accent", title: "SITA recommended: Follow up with Sarah Chen", subtitle: "Based on lead aging pattern — 48h no contact", time: "15m ago", type: "recommendation", border: "border-l-accent" },
  { icon: CheckCircle, color: "text-trust-verified", title: "Invoice #1038 payment received", subtitle: "Marcus Johnson — $4,200 via Stripe", time: "1h ago", type: "execution", border: "border-l-trust-verified" },
  { icon: Shield, color: "text-primary", title: "Approval granted: Quote #1042", subtitle: "You approved — sent to Sarah Chen", time: "2h ago", type: "approval", border: "border-l-primary" },
  { icon: Eye, color: "text-state-simulated", title: "SITA simulated: Bill payment schedule", subtitle: "Result: All bills covered with $1,200 buffer", time: "3h ago", type: "simulation", border: "border-l-state-simulated" },
  { icon: AlertTriangle, color: "text-urgency-high", title: "Risk detected: Invoice #1035 overdue", subtitle: "7 days past due — $1,800 from David Kim", time: "4h ago", type: "detection", border: "border-l-urgency-high" },
  { icon: Brain, color: "text-primary", title: "SITA learned: You prefer Monday money reviews", subtitle: "Pattern detected from 8 consecutive Mondays", time: "5h ago", type: "learning", border: "border-l-primary" },
  { icon: Zap, color: "text-accent", title: "Automated: Invoice reminder sent", subtitle: "David Kim — payment overdue reminder #2", time: "6h ago", type: "automation", border: "border-l-accent" },
  { icon: Users, color: "text-primary", title: "New lead captured: Michael Park", subtitle: "Website form — web design inquiry", time: "8h ago", type: "capture", border: "border-l-primary" },
  { icon: DollarSign, color: "text-trust-verified", title: "Bill paid: AWS hosting — $340", subtitle: "Auto-approved under $500 threshold", time: "Yesterday", type: "execution", border: "border-l-trust-verified" },
  { icon: RotateCcw, color: "text-trust-recovered", title: "Workflow recovered: Email delivery retry", subtitle: "Initial failure — succeeded on retry #2", time: "Yesterday", type: "recovery", border: "border-l-trust-recovered" },
];
