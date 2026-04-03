// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Concierge Engine
// Use-case-first connector wizard, templates, simulation, health
// ═══════════════════════════════════════════════════════════════

export interface ConnectorUseCase {
  id: string;
  title: string;
  description: string;
  category: "revenue" | "money" | "productivity" | "communication" | "family" | "operations";
  connectors: ConnectorTemplate[];
  estimatedSetupMinutes: number;
  difficulty: "easy" | "moderate" | "advanced";
  valueProposition: string;
  previewWorkflows: string[];
}

export interface ConnectorTemplate {
  connectorId: string;
  name: string;
  icon: string;
  requiredScopes: string[];
  optionalScopes: string[];
  dataPreview: string[];
  permissionExplanation: string;
}

export interface IntegrationReadiness {
  connectorId: string;
  ready: boolean;
  blockers: string[];
  warnings: string[];
  healthScore: number;
  lastChecked: string;
}

export interface PostConnectPreview {
  connectorId: string;
  sampleWorkflows: { name: string; description: string; automatable: boolean }[];
  dataCategories: { name: string; recordCount: number; previewFields: string[] }[];
  estimatedValue: number;
  recommendations: string[];
}

const USE_CASE_LIBRARY: ConnectorUseCase[] = [
  {
    id: "lead-recovery",
    title: "Recover Leads from Ads",
    description: "Connect your ad platforms so SITA can find leads you're missing and follow up automatically",
    category: "revenue",
    connectors: [
      { connectorId: "meta-ads", name: "Meta Ads", icon: "📱", requiredScopes: ["ads_read"], optionalScopes: ["leads_read"], dataPreview: ["Campaign performance", "Lead forms", "Cost per lead"], permissionExplanation: "SITA will read your ad performance and lead data. It will never modify your ads." },
      { connectorId: "google-ads", name: "Google Ads", icon: "🔍", requiredScopes: ["ads.readonly"], optionalScopes: [], dataPreview: ["Campaign metrics", "Keywords", "Conversions"], permissionExplanation: "Read-only access to see how your campaigns are performing." },
    ],
    estimatedSetupMinutes: 5,
    difficulty: "easy",
    valueProposition: "Businesses typically recover 15-30% of lost leads with automated follow-up",
    previewWorkflows: ["Auto-detect stale leads", "Trigger follow-up sequences", "Score lead quality"],
  },
  {
    id: "campaign-to-cash",
    title: "Track Campaign to Cash",
    description: "See exactly which campaigns produce revenue, not just clicks",
    category: "revenue",
    connectors: [
      { connectorId: "stripe", name: "Stripe", icon: "💳", requiredScopes: ["read_only"], optionalScopes: [], dataPreview: ["Payments", "Subscriptions", "Invoices"], permissionExplanation: "SITA reads your payment data. It cannot make charges." },
    ],
    estimatedSetupMinutes: 3,
    difficulty: "easy",
    valueProposition: "Know your true cost-per-acquisition and which campaigns actually make money",
    previewWorkflows: ["Match payments to campaigns", "Calculate true CPA", "Flag unprofitable channels"],
  },
  {
    id: "invoice-cash-timing",
    title: "Coordinate Invoices & Cash Timing",
    description: "Connect accounting so SITA can predict cash flow and flag overdue invoices",
    category: "money",
    connectors: [
      { connectorId: "quickbooks", name: "QuickBooks", icon: "📊", requiredScopes: ["accounting"], optionalScopes: ["reports"], dataPreview: ["Invoices", "Bills", "P&L", "Balance Sheet"], permissionExplanation: "SITA syncs your financial data for analysis. It will not create transactions." },
      { connectorId: "plaid", name: "Bank Accounts", icon: "🏦", requiredScopes: ["transactions"], optionalScopes: ["identity"], dataPreview: ["Transactions", "Balances", "Account info"], permissionExplanation: "Read-only connection to see your bank balances and transactions." },
    ],
    estimatedSetupMinutes: 10,
    difficulty: "moderate",
    valueProposition: "Predict cash crunches 30 days ahead and auto-flag overdue invoices",
    previewWorkflows: ["Cash flow forecasting", "Overdue invoice alerts", "Expense categorization"],
  },
  {
    id: "founder-productivity",
    title: "Gmail + Calendar Founder Setup",
    description: "Let SITA organize your email, calendar, and follow-ups",
    category: "productivity",
    connectors: [
      { connectorId: "gmail", name: "Gmail", icon: "📧", requiredScopes: ["gmail.readonly"], optionalScopes: ["gmail.send"], dataPreview: ["Emails", "Threads", "Labels"], permissionExplanation: "SITA reads your emails to extract action items. Send permission is optional for auto-replies." },
      { connectorId: "google-calendar", name: "Google Calendar", icon: "📅", requiredScopes: ["calendar.readonly"], optionalScopes: ["calendar.events"], dataPreview: ["Events", "Availability", "Reminders"], permissionExplanation: "SITA reads your calendar. Write permission is optional for scheduling." },
    ],
    estimatedSetupMinutes: 3,
    difficulty: "easy",
    valueProposition: "Save 5+ hours per week on email triage and calendar management",
    previewWorkflows: ["Extract action items from email", "Smart scheduling", "Follow-up reminders"],
  },
  {
    id: "family-calendar",
    title: "Family Calendar Coordination",
    description: "Coordinate family schedules, school events, and household logistics",
    category: "family",
    connectors: [
      { connectorId: "google-calendar", name: "Google Calendar", icon: "📅", requiredScopes: ["calendar.readonly"], optionalScopes: ["calendar.events"], dataPreview: ["Family events", "School calendar", "Appointments"], permissionExplanation: "SITA reads shared calendars to coordinate family logistics." },
    ],
    estimatedSetupMinutes: 3,
    difficulty: "easy",
    valueProposition: "Never miss a school event or double-book a family activity",
    previewWorkflows: ["Weekly family schedule digest", "Conflict detection", "Prep reminders"],
  },
  {
    id: "crm-recovery",
    title: "HubSpot Lead Recovery Setup",
    description: "Connect HubSpot so SITA can find cold leads and revive stale deals",
    category: "revenue",
    connectors: [
      { connectorId: "hubspot", name: "HubSpot", icon: "🟠", requiredScopes: ["crm.objects.contacts.read", "crm.objects.deals.read"], optionalScopes: ["crm.objects.contacts.write"], dataPreview: ["Contacts", "Deals", "Pipeline", "Activities"], permissionExplanation: "SITA reads your CRM to find opportunities. Write access is optional for auto-updates." },
    ],
    estimatedSetupMinutes: 5,
    difficulty: "easy",
    valueProposition: "Revive 10-20% of stale pipeline with smart re-engagement",
    previewWorkflows: ["Detect cold leads", "Score deal health", "Trigger re-engagement"],
  },
];

export class IntegrationConciergeEngine {
  getUseCases(category?: string): ConnectorUseCase[] {
    return category ? USE_CASE_LIBRARY.filter(u => u.category === category) : USE_CASE_LIBRARY;
  }

  getUseCase(id: string): ConnectorUseCase | undefined {
    return USE_CASE_LIBRARY.find(u => u.id === id);
  }

  getRecommendedUseCases(userProfile: { hasRevenue: boolean; hasFamily: boolean; hasAccounting: boolean }): ConnectorUseCase[] {
    const recommended: ConnectorUseCase[] = [];
    if (userProfile.hasRevenue) {
      recommended.push(...USE_CASE_LIBRARY.filter(u => u.category === "revenue"));
    }
    if (userProfile.hasFamily) {
      recommended.push(...USE_CASE_LIBRARY.filter(u => u.category === "family"));
    }
    if (!userProfile.hasAccounting) {
      recommended.push(...USE_CASE_LIBRARY.filter(u => u.category === "money"));
    }
    recommended.push(...USE_CASE_LIBRARY.filter(u => u.category === "productivity"));
    return [...new Set(recommended)].slice(0, 6);
  }

  checkReadiness(connectorId: string): IntegrationReadiness {
    return {
      connectorId,
      ready: true,
      blockers: [],
      warnings: [],
      healthScore: 100,
      lastChecked: new Date().toISOString(),
    };
  }

  getPostConnectPreview(connectorId: string): PostConnectPreview {
    return {
      connectorId,
      sampleWorkflows: [
        { name: "Auto-sync data", description: "Keep your data in sync automatically", automatable: true },
        { name: "Alert on anomalies", description: "Get notified when something looks off", automatable: true },
      ],
      dataCategories: [],
      estimatedValue: 500,
      recommendations: ["Set up daily sync", "Enable anomaly alerts"],
    };
  }

  simulateConnection(useCaseId: string): { success: boolean; previewData: Record<string, unknown>; estimatedValue: number } {
    const useCase = this.getUseCase(useCaseId);
    if (!useCase) throw new Error(`Use case ${useCaseId} not found`);

    return {
      success: true,
      previewData: {
        sampleRecords: 25,
        workflows: useCase.previewWorkflows,
        estimatedSetup: `${useCase.estimatedSetupMinutes} minutes`,
      },
      estimatedValue: 500,
    };
  }
}
