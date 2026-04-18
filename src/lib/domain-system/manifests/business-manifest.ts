// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Domain Manifest
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "../domain-manifest";

export const businessManifest: DomainManifest = {
  id: "business",
  name: "Business OS",
  description: "Revenue engine: CRM, invoicing, proposals, communications, and client lifecycle management",
  owner: "business-os-service",
  version: "1.0.0",

  entities: [
    { id: "lead", name: "Lead", description: "Inbound prospect before qualification", dbTable: "leads", statusStates: ["new", "contacted", "qualified", "disqualified", "converted"], permissions: { create: "business.lead.create", read: "business.lead.read", update: "business.lead.update", delete: "business.lead.delete" }, searchable: true, fileAttachable: true },
    { id: "customer", name: "Customer", description: "Qualified client with active relationship", dbTable: "customers", statusStates: ["active", "at-risk", "churned", "reactivated", "dormant"], permissions: { create: "business.customer.create", read: "business.customer.read", update: "business.customer.update", delete: "business.customer.delete" }, searchable: true, fileAttachable: true },
    { id: "deal", name: "Deal", description: "Revenue opportunity in pipeline", dbTable: "deals", statusStates: ["discovery", "proposal", "negotiation", "won", "lost", "stalled"], permissions: { create: "business.deal.create", read: "business.deal.read", update: "business.deal.update", delete: "business.deal.delete", approve: "business.deal.approve" }, searchable: true, fileAttachable: true },
    { id: "invoice", name: "Invoice", description: "Billing document for services rendered", dbTable: "invoices", statusStates: ["draft", "sent", "viewed", "partial", "paid", "overdue", "void"], permissions: { create: "business.invoice.create", read: "business.invoice.read", update: "business.invoice.update", delete: "business.invoice.delete" }, searchable: true, fileAttachable: true },
    { id: "quote", name: "Quote", description: "Pricing proposal for prospective work", dbTable: "quotes", statusStates: ["draft", "sent", "accepted", "rejected", "expired"], permissions: { create: "business.quote.create", read: "business.quote.read", update: "business.quote.update", delete: "business.quote.delete" }, searchable: true, fileAttachable: true },
    { id: "proposal", name: "Proposal", description: "Detailed service proposal with scope", dbTable: "proposals", statusStates: ["draft", "review", "sent", "accepted", "rejected"], permissions: { create: "business.proposal.create", read: "business.proposal.read", update: "business.proposal.update", delete: "business.proposal.delete" }, searchable: true, fileAttachable: true },
    { id: "contact", name: "Contact", description: "Individual person linked to customer or lead", dbTable: "contacts", statusStates: ["active", "inactive"], permissions: { create: "business.contact.create", read: "business.contact.read", update: "business.contact.update", delete: "business.contact.delete" }, searchable: true, fileAttachable: false },
    { id: "account", name: "Account", description: "Business entity grouping contacts and deals", dbTable: "accounts", statusStates: ["active", "inactive", "prospect"], permissions: { create: "business.account.create", read: "business.account.read", update: "business.account.update", delete: "business.account.delete" }, searchable: true, fileAttachable: true },
    { id: "booking", name: "Booking", description: "Scheduled service appointment or engagement", dbTable: "bookings", statusStates: ["scheduled", "confirmed", "completed", "cancelled", "no-show"], permissions: { create: "business.booking.create", read: "business.booking.read", update: "business.booking.update", delete: "business.booking.delete" }, searchable: true, fileAttachable: false },
    { id: "service-order", name: "Service Order", description: "Execution record of agreed work", dbTable: "service_orders", statusStates: ["created", "in-progress", "completed", "cancelled"], permissions: { create: "business.service-order.create", read: "business.service-order.read", update: "business.service-order.update", delete: "business.service-order.delete" }, searchable: true, fileAttachable: true },
    { id: "communication", name: "Communication", description: "Outbound message (email, SMS, letter)", dbTable: "communications", statusStates: ["draft", "scheduled", "sent", "delivered", "failed", "bounced"], permissions: { create: "business.communication.create", read: "business.communication.read", update: "business.communication.update", delete: "business.communication.delete", approve: "business.communication.approve" }, searchable: true, fileAttachable: true },
    { id: "website", name: "Website", description: "Business website managed by the platform", dbTable: null, statusStates: ["draft", "published", "unpublished"], permissions: { create: "business.website.create", read: "business.website.read", update: "business.website.update", delete: "business.website.delete" }, searchable: false, fileAttachable: true },
  ],

  workflows: [
    {
      id: "lead-to-customer", name: "Lead to Customer", description: "Full pipeline from lead capture through qualification to customer conversion",
      trigger: "lead.captured", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["lead.qualified", "lead.converted"],
      steps: [
        { id: "score", name: "Score Lead", type: "ai-assisted", description: "AI scores lead based on profile and engagement", canFail: false, rollbackCapable: false },
        { id: "classify", name: "Classify", type: "automated", description: "Route to correct pipeline segment", canFail: false, rollbackCapable: false },
        { id: "enrich", name: "Enrich Data", type: "ai-assisted", description: "Pull additional context from connected sources", canFail: true, rollbackCapable: false },
        { id: "qualify", name: "Qualify", type: "human", description: "Owner reviews and qualifies lead", canFail: false, rollbackCapable: true },
        { id: "convert", name: "Convert to Customer", type: "automated", description: "Create customer record from qualified lead", canFail: false, rollbackCapable: true },
      ],
    },
    {
      id: "quote-to-invoice", name: "Quote to Invoice", description: "Convert accepted quote into billable invoice",
      trigger: "quote.accepted", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["invoice.created", "invoice.sent"],
      steps: [
        { id: "generate", name: "Generate Invoice", type: "automated", description: "Create invoice from accepted quote line items", canFail: false, rollbackCapable: true },
        { id: "review", name: "Review", type: "human", description: "Owner reviews invoice before sending", canFail: false, rollbackCapable: true },
        { id: "approve", name: "Approve", type: "approval", description: "Approve invoice for sending", canFail: false, rollbackCapable: true },
        { id: "send", name: "Send", type: "automated", description: "Deliver invoice to customer", canFail: true, rollbackCapable: false },
      ],
    },
    {
      id: "deal-pipeline", name: "Deal Pipeline", description: "Manage deal through stages to close",
      trigger: "opportunity.created", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["opportunity.stage-changed", "opportunity.won", "opportunity.lost"],
      steps: [
        { id: "qualify", name: "Qualify Opportunity", type: "human", description: "Assess deal viability", canFail: false, rollbackCapable: true },
        { id: "propose", name: "Create Proposal", type: "ai-assisted", description: "Draft proposal with AI assistance", canFail: true, rollbackCapable: true },
        { id: "negotiate", name: "Negotiate", type: "human", description: "Handle objections and terms", canFail: false, rollbackCapable: true },
        { id: "close", name: "Close Deal", type: "human", description: "Mark won/lost with outcome data", canFail: false, rollbackCapable: true },
      ],
    },
    {
      id: "collection-sequence", name: "Collection Sequence", description: "Automated follow-up for overdue invoices",
      trigger: "invoice.overdue", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["invoice.overdue", "communication.sent"],
      steps: [
        { id: "classify", name: "Classify Severity", type: "automated", description: "Determine overdue severity tier", canFail: false, rollbackCapable: false },
        { id: "draft", name: "Draft Reminder", type: "ai-assisted", description: "AI drafts appropriate reminder", canFail: true, rollbackCapable: true },
        { id: "approve", name: "Approve Message", type: "approval", description: "Owner reviews before sending", canFail: false, rollbackCapable: true },
        { id: "send", name: "Send Reminder", type: "automated", description: "Deliver reminder to customer", canFail: true, rollbackCapable: false },
        { id: "escalate", name: "Escalate if Needed", type: "automated", description: "Escalate to boardroom if unresolved", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "callback-queue", name: "Callback Queue", description: "Manage scheduled callbacks and follow-ups",
      trigger: "customer.health-changed", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["reminder.triggered"],
      steps: [
        { id: "detect", name: "Detect Follow-up Need", type: "ai-assisted", description: "AI identifies engagement gaps", canFail: false, rollbackCapable: false },
        { id: "schedule", name: "Schedule Callback", type: "automated", description: "Add to callback queue", canFail: false, rollbackCapable: true },
        { id: "remind", name: "Send Reminder", type: "automated", description: "Notify owner of upcoming callback", canFail: true, rollbackCapable: false },
        { id: "complete", name: "Mark Complete", type: "human", description: "Owner logs outcome", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "revenue-recovery", name: "Revenue Recovery", description: "Identify and recover stalled revenue opportunities",
      trigger: "opportunity.stalled", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["advisor.recommendation-generated"],
      steps: [
        { id: "detect", name: "Detect Stall", type: "automated", description: "Identify stalled opportunities", canFail: false, rollbackCapable: false },
        { id: "analyze", name: "Analyze", type: "ai-assisted", description: "AI analyzes stall reason and recovery options", canFail: true, rollbackCapable: false },
        { id: "recommend", name: "Recommend Action", type: "ai-assisted", description: "Generate recovery recommendation", canFail: true, rollbackCapable: false },
        { id: "approve", name: "Approve", type: "approval", description: "Owner approves recovery action", canFail: false, rollbackCapable: true },
        { id: "execute", name: "Execute", type: "automated", description: "Execute approved recovery action", canFail: true, rollbackCapable: true },
      ],
    },
    {
      id: "website-publish", name: "Website Publish", description: "Build, review, and publish business website",
      trigger: "website.publish-requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["website.published"],
      steps: [
        { id: "build", name: "Build Site", type: "automated", description: "Generate static site from template", canFail: true, rollbackCapable: true },
        { id: "preview", name: "Preview", type: "human", description: "Owner previews before publish", canFail: false, rollbackCapable: true },
        { id: "approve", name: "Approve", type: "approval", description: "Approve for publication", canFail: false, rollbackCapable: true },
        { id: "deploy", name: "Deploy", type: "automated", description: "Deploy to hosting", canFail: true, rollbackCapable: true },
      ],
    },
    {
      id: "outreach-campaign", name: "Outreach Campaign", description: "Multi-step outreach to customer segments",
      trigger: "campaign.created", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["communication.sent", "campaign.completed"],
      steps: [
        { id: "segment", name: "Define Audience", type: "ai-assisted", description: "AI suggests audience segments", canFail: false, rollbackCapable: true },
        { id: "draft", name: "Draft Messages", type: "ai-assisted", description: "AI drafts personalized messages", canFail: true, rollbackCapable: true },
        { id: "approve", name: "Approve Campaign", type: "approval", description: "Owner reviews all messages", canFail: false, rollbackCapable: true },
        { id: "send", name: "Execute Send", type: "automated", description: "Send messages per schedule", canFail: true, rollbackCapable: false },
        { id: "track", name: "Track Results", type: "automated", description: "Monitor open/reply rates", canFail: false, rollbackCapable: false },
      ],
    },
  ],

  shellIntegration: {
    launcher: {
      appId: "business-os", displayName: "Business", icon: "Briefcase", category: "Core",
      badgeSource: "business.pipeline.active-count", description: "Revenue, CRM, invoicing & communications",
      keywords: ["crm", "sales", "invoice", "revenue", "client", "deal", "lead"],
    },
    commandPalette: [
      { id: "biz-new-lead", label: "New Lead", keywords: ["lead", "prospect", "new"], action: "/business/leads/new", icon: "UserPlus" },
      { id: "biz-new-invoice", label: "Create Invoice", keywords: ["invoice", "bill", "billing"], action: "/business/invoices/new", icon: "FileText" },
      { id: "biz-new-quote", label: "New Quote", keywords: ["quote", "estimate", "pricing"], action: "/business/quotes/new", icon: "Calculator" },
      { id: "biz-pipeline", label: "View Pipeline", keywords: ["pipeline", "deals", "opportunities"], action: "/business/pipeline", icon: "TrendingUp" },
      { id: "biz-callbacks", label: "Callback Queue", keywords: ["callback", "follow-up", "schedule"], action: "/business/callbacks", icon: "Phone" },
      { id: "biz-revenue", label: "Revenue Dashboard", keywords: ["revenue", "income", "money"], action: "/business/revenue", icon: "DollarSign" },
    ],
    searchProviders: [
      { id: "search-customers", name: "Customers", entityType: "customer", searchFields: ["name", "email", "company"], resultRoute: "/business/customers/:id", icon: "Users" },
      { id: "search-invoices", name: "Invoices", entityType: "invoice", searchFields: ["number", "customer_name", "amount"], resultRoute: "/business/invoices/:id", icon: "FileText" },
      { id: "search-deals", name: "Deals", entityType: "deal", searchFields: ["name", "customer", "amount"], resultRoute: "/business/deals/:id", icon: "TrendingUp" },
      { id: "search-leads", name: "Leads", entityType: "lead", searchFields: ["name", "email", "source"], resultRoute: "/business/leads/:id", icon: "UserPlus" },
    ],
    notificationTriggers: [
      { eventSubject: "invoice.overdue", title: "Invoice overdue", priority: "high", actionRoute: "/business/invoices/:id", groupKey: "business-invoices" },
      { eventSubject: "lead.qualified", title: "New qualified lead", priority: "medium", actionRoute: "/business/leads/:id", groupKey: "business-leads" },
      { eventSubject: "opportunity.won", title: "Deal won!", priority: "high", actionRoute: "/business/deals/:id", groupKey: "business-deals" },
      { eventSubject: "customer.churned", title: "Customer churned", priority: "critical", actionRoute: "/business/customers/:id", groupKey: "business-customers" },
    ],
  },

  crossDomainEvents: [
    { id: "biz-fin-invoice-paid", sourceEvent: "invoice.paid", sourceDomain: "business", targetDomain: "finance", targetAction: "receivable.update", description: "Reconcile finance receivable when invoice is paid", direction: "emit" },
    { id: "biz-con-booking", sourceEvent: "booking.created", sourceDomain: "business", targetDomain: "concierge", targetAction: "calendar.block", description: "Block concierge calendar when business booking created", direction: "emit" },
    { id: "biz-board-deal-large", sourceEvent: "deal.stage-changed", sourceDomain: "business", targetDomain: "cross-domain", targetAction: "boardroom.escalate", description: "Escalate large deals to boardroom", direction: "emit" },
    { id: "biz-fin-revenue", sourceEvent: "opportunity.won", sourceDomain: "business", targetDomain: "finance", targetAction: "projection.update", description: "Update finance projections on deal close", direction: "emit" },
  ],

  truthModel: {
    freshnessThresholds: { customer: 7200, invoice: 3600, deal: 3600, lead: 1800, communication: 900 },
    simulatedSurfaces: ["website-builder", "campaign-analytics"],
    dataSourceClassification: { customer: "live", invoice: "live", deal: "live", lead: "live", communication: "live", website: "simulated", booking: "live" },
    deterministic: ["invoice-amounts", "quote-totals", "revenue-calculations"],
  },

  aiIntegration: {
    advisorIds: ["revenue-advisor", "operations-advisor", "growth-advisor"],
    capabilityKeys: ["lead-scoring", "follow-up-drafting", "revenue-recovery", "proposal-generation"],
    allowedModels: ["google/gemini-2.5-flash", "openai/gpt-5-mini"],
    budgetClass: "standard",
  },

  fileIntegration: {
    acceptedTypes: ["application/pdf", "image/*", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    storageBucket: "business-files",
    maxFileSizeMB: 25,
    autoClassify: true,
  },

  boardroomEscalation: {
    manualEscalationEnabled: true,
    autoEscalateRules: [
      { id: "large-deal", condition: "deal.amount > 50000", description: "Auto-escalate deals over $50k", severity: "warning", minConfidence: 0.7 },
      { id: "revenue-anomaly", condition: "revenue.variance > 20%", description: "Revenue anomaly detected", severity: "critical", minConfidence: 0.8 },
      { id: "collection-failure", condition: "invoice.overdue_days > 90", description: "Invoice overdue 90+ days", severity: "critical", minConfidence: 0.9 },
    ],
  },
};
