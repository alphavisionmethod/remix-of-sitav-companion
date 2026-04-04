// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Verticalization & Template Contracts
// Migrated from root verticalization-contracts.ts
// Canonical owner: specialized/
// ═══════════════════════════════════════════════════════════════

export type VerticalId =
  | "salon"
  | "med-spa"
  | "contractor"
  | "real-estate"
  | "law-firm"
  | "accounting"
  | "dental-clinic"
  | "gym"
  | "agency"
  | "local-shop"
  | "ecommerce"
  | "consulting"
  | "restaurant"
  | "healthcare"
  | "education";

export interface VerticalTemplate {
  id: string;
  verticalId: VerticalId;
  name: string;
  description: string;
  version: string;
  modules: VerticalModule[];
  workflows: VerticalWorkflowTemplate[];
  kpis: VerticalKPI[];
  boardroomTemplates: string[];
  onboardingSteps: VerticalOnboardingStep[];
  roleTemplates: VerticalRole[];
  communicationTemplates: VerticalCommTemplate[];
  approvalDefaults: VerticalApprovalDefault[];
  dashboardConfig: VerticalDashboard;
}

export interface VerticalModule {
  id: string;
  name: string;
  domain: "business" | "finance" | "concierge";
  required: boolean;
  features: string[];
}

export interface VerticalWorkflowTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  steps: Array<{ action: string; type: string }>;
  category: string;
  approvalRequired: boolean;
}

export interface VerticalKPI {
  id: string;
  name: string;
  formula: string;
  target?: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly";
}

export interface VerticalOnboardingStep {
  order: number;
  title: string;
  description: string;
  action: string;
  required: boolean;
}

export interface VerticalRole {
  name: string;
  permissions: string[];
  approvalAuthority: boolean;
  defaultTrustLevel: number;
}

export interface VerticalCommTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "in-app";
  subject?: string;
  bodyTemplate: string;
  triggerEvent: string;
}

export interface VerticalApprovalDefault {
  actionType: string;
  requiresApproval: boolean;
  threshold?: number;
  autoApproveAfterDays?: number;
}

export interface VerticalDashboard {
  sections: Array<{
    id: string;
    title: string;
    widgets: string[];
    position: number;
  }>;
}

export interface VerticalRegistryEntry {
  verticalId: VerticalId;
  name: string;
  description: string;
  icon: string;
  tier: "free" | "starter" | "professional";
  templateCount: number;
  workflowCount: number;
  popularity: number;
  status: "available" | "coming-soon" | "beta";
}

export const VERTICAL_REGISTRY: VerticalRegistryEntry[] = [
  { verticalId: "salon", name: "Salon & Beauty", description: "Booking, no-show detection, client retention", icon: "✂️", tier: "starter", templateCount: 8, workflowCount: 12, popularity: 92, status: "available" },
  { verticalId: "med-spa", name: "Med Spa", description: "Appointment scheduling, treatment tracking, follow-ups", icon: "💆", tier: "professional", templateCount: 10, workflowCount: 15, popularity: 85, status: "available" },
  { verticalId: "contractor", name: "Contractor", description: "Job scheduling, invoicing, materials tracking", icon: "🔧", tier: "starter", templateCount: 7, workflowCount: 10, popularity: 88, status: "available" },
  { verticalId: "real-estate", name: "Real Estate", description: "Lead nurturing, showing coordination, deal tracking", icon: "🏠", tier: "professional", templateCount: 12, workflowCount: 18, popularity: 90, status: "available" },
  { verticalId: "law-firm", name: "Law Firm", description: "Client intake, billing, document management", icon: "⚖️", tier: "professional", templateCount: 9, workflowCount: 14, popularity: 78, status: "available" },
  { verticalId: "accounting", name: "Accounting", description: "Client onboarding, deadline management, document collection", icon: "📊", tier: "professional", templateCount: 11, workflowCount: 16, popularity: 82, status: "available" },
  { verticalId: "dental-clinic", name: "Dental / Clinic", description: "Patient scheduling, reminders, treatment plans", icon: "🦷", tier: "starter", templateCount: 8, workflowCount: 11, popularity: 75, status: "available" },
  { verticalId: "gym", name: "Gym & Fitness", description: "Member management, class scheduling, retention", icon: "💪", tier: "starter", templateCount: 6, workflowCount: 9, popularity: 70, status: "available" },
  { verticalId: "agency", name: "Creative Agency", description: "Project management, client comms, deliverables", icon: "🎨", tier: "professional", templateCount: 10, workflowCount: 14, popularity: 86, status: "available" },
  { verticalId: "restaurant", name: "Restaurant", description: "Reservations, supplier orders, staff scheduling", icon: "🍽️", tier: "starter", templateCount: 7, workflowCount: 10, popularity: 72, status: "beta" },
  { verticalId: "ecommerce", name: "E-Commerce", description: "Order management, inventory, customer support", icon: "🛒", tier: "starter", templateCount: 9, workflowCount: 13, popularity: 80, status: "available" },
  { verticalId: "consulting", name: "Consulting", description: "Engagement tracking, proposal management, billing", icon: "💼", tier: "professional", templateCount: 8, workflowCount: 12, popularity: 84, status: "available" },
];