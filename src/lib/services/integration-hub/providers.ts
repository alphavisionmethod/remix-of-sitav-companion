// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Hub: All Provider Definitions
// ═══════════════════════════════════════════════════════════════

import type { ProviderDefinition } from "./connector-sdk";

export const INTEGRATION_PROVIDERS: ProviderDefinition[] = [
  {
    id: "google-ads", displayName: "Google Ads", description: "Manage campaigns, conversions, and audiences across Google's ad network",
    category: "ads", authType: "oauth2", icon: "📊", color: "#4285F4",
    scopes: { read: ["ads.readonly"], write: ["ads", "ads.upload"] },
    objects: ["campaigns", "ad_groups", "ads", "conversions", "audiences", "keywords"],
    capabilities: [
      { id: "list-campaigns", name: "List Campaigns", type: "read", riskLevel: "low", description: "View all campaigns and performance", requiresApproval: false, supportsDryRun: false },
      { id: "create-campaign", name: "Create Campaign Draft", type: "write", riskLevel: "high", description: "Create a new campaign draft", requiresApproval: true, supportsDryRun: true },
      { id: "upload-conversions", name: "Upload Conversions", type: "write", riskLevel: "medium", description: "Upload offline conversion data", requiresApproval: true, supportsDryRun: true },
      { id: "update-budget", name: "Update Campaign Budget", type: "write", riskLevel: "high", description: "Change daily/total budget for a campaign", requiresApproval: true, supportsDryRun: true },
      { id: "pause-campaign", name: "Pause Campaign", type: "write", riskLevel: "medium", description: "Pause an active campaign", requiresApproval: true, supportsDryRun: false },
    ],
    supportsWebhooks: false, docsUrl: "https://developers.google.com/google-ads/api",
    setupSteps: ["Sign in with Google", "Select your Google Ads account", "Choose permissions", "Confirm connection"],
  },
  {
    id: "meta-ads", displayName: "Meta Ads", description: "Manage Facebook & Instagram ad campaigns, audiences, and conversions",
    category: "ads", authType: "oauth2", icon: "📱", color: "#1877F2",
    scopes: { read: ["ads_read"], write: ["ads_management", "business_management"] },
    objects: ["campaigns", "ad_sets", "ads", "audiences", "conversions", "pixels"],
    capabilities: [
      { id: "list-campaigns", name: "List Campaigns", type: "read", riskLevel: "low", description: "View all ad campaigns", requiresApproval: false, supportsDryRun: false },
      { id: "create-campaign", name: "Create Campaign", type: "write", riskLevel: "high", description: "Create a new ad campaign", requiresApproval: true, supportsDryRun: true },
      { id: "upload-conversions", name: "Upload Conversions", type: "write", riskLevel: "medium", description: "Upload offline conversions via API", requiresApproval: true, supportsDryRun: true },
      { id: "update-budget", name: "Update Budget", type: "write", riskLevel: "high", description: "Change campaign budget", requiresApproval: true, supportsDryRun: true },
      { id: "create-audience", name: "Create Custom Audience", type: "write", riskLevel: "medium", description: "Create a custom audience", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://developers.facebook.com/docs/marketing-apis",
    setupSteps: ["Sign in with Facebook", "Select your Business Manager", "Choose ad accounts", "Grant permissions"],
  },
  {
    id: "hubspot", displayName: "HubSpot", description: "Full CRM with contacts, deals, companies, tickets, and marketing automation",
    category: "crm", authType: "oauth2", icon: "🟠", color: "#FF7A59",
    scopes: { read: ["crm.objects.contacts.read", "crm.objects.deals.read"], write: ["crm.objects.contacts.write", "crm.objects.deals.write"] },
    objects: ["contacts", "companies", "deals", "tickets", "engagements", "pipelines"],
    capabilities: [
      { id: "list-contacts", name: "List Contacts", type: "read", riskLevel: "low", description: "View all contacts", requiresApproval: false, supportsDryRun: false },
      { id: "create-contact", name: "Create Contact", type: "write", riskLevel: "low", description: "Create a new contact", requiresApproval: false, supportsDryRun: true },
      { id: "update-contact", name: "Update Contact", type: "write", riskLevel: "low", description: "Update contact properties", requiresApproval: false, supportsDryRun: true },
      { id: "create-deal", name: "Create Deal", type: "write", riskLevel: "medium", description: "Create a new deal in pipeline", requiresApproval: true, supportsDryRun: true },
      { id: "update-deal-stage", name: "Update Deal Stage", type: "write", riskLevel: "medium", description: "Move deal to different stage", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://developers.hubspot.com/docs/api",
    setupSteps: ["Sign in with HubSpot", "Select your portal", "Choose permissions", "Confirm connection"],
  },
  {
    id: "salesforce", displayName: "Salesforce", description: "Enterprise CRM with leads, opportunities, accounts, and custom objects",
    category: "crm", authType: "oauth2", icon: "☁️", color: "#00A1E0",
    scopes: { read: ["api", "refresh_token"], write: ["api", "refresh_token"] },
    objects: ["leads", "contacts", "accounts", "opportunities", "cases", "tasks"],
    capabilities: [
      { id: "list-leads", name: "List Leads", type: "read", riskLevel: "low", description: "View all leads", requiresApproval: false, supportsDryRun: false },
      { id: "create-lead", name: "Create Lead", type: "write", riskLevel: "low", description: "Create a new lead", requiresApproval: false, supportsDryRun: true },
      { id: "update-opportunity", name: "Update Opportunity", type: "write", riskLevel: "medium", description: "Update opportunity details", requiresApproval: true, supportsDryRun: true },
      { id: "create-task", name: "Create Task", type: "write", riskLevel: "low", description: "Create a task for a record", requiresApproval: false, supportsDryRun: false },
    ],
    supportsWebhooks: true, docsUrl: "https://developer.salesforce.com/docs",
    setupSteps: ["Sign in with Salesforce", "Select your org", "Authorize API access", "Confirm connection"],
  },
  {
    id: "quickbooks", displayName: "QuickBooks Online", description: "Accounting, invoicing, expenses, and financial reporting",
    category: "accounting", authType: "oauth2", icon: "💰", color: "#2CA01C",
    scopes: { read: ["com.intuit.quickbooks.accounting"], write: ["com.intuit.quickbooks.accounting"] },
    objects: ["invoices", "customers", "payments", "expenses", "accounts", "reports"],
    capabilities: [
      { id: "list-invoices", name: "List Invoices", type: "read", riskLevel: "low", description: "View all invoices", requiresApproval: false, supportsDryRun: false },
      { id: "create-invoice", name: "Create Invoice", type: "write", riskLevel: "high", description: "Create and send an invoice", requiresApproval: true, supportsDryRun: true },
      { id: "record-payment", name: "Record Payment", type: "write", riskLevel: "high", description: "Record a payment received", requiresApproval: true, supportsDryRun: true },
      { id: "create-expense", name: "Record Expense", type: "write", riskLevel: "medium", description: "Record a business expense", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://developer.intuit.com/app/developer/qbo/docs",
    setupSteps: ["Sign in with Intuit", "Select your company", "Authorize access", "Confirm connection"],
  },
  {
    id: "xero", displayName: "Xero", description: "Cloud accounting for invoicing, bank reconciliation, and reporting",
    category: "accounting", authType: "oauth2", icon: "📘", color: "#13B5EA",
    scopes: { read: ["accounting.transactions.read"], write: ["accounting.transactions"] },
    objects: ["invoices", "contacts", "payments", "bank_transactions", "accounts"],
    capabilities: [
      { id: "list-invoices", name: "List Invoices", type: "read", riskLevel: "low", description: "View invoices", requiresApproval: false, supportsDryRun: false },
      { id: "create-invoice", name: "Create Invoice", type: "write", riskLevel: "high", description: "Create an invoice", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://developer.xero.com",
    setupSteps: ["Sign in with Xero", "Select organization", "Authorize", "Confirm"],
  },
  {
    id: "stripe", displayName: "Stripe", description: "Payment processing, subscriptions, invoicing, and financial infrastructure",
    category: "payments", authType: "oauth2", icon: "💳", color: "#635BFF",
    scopes: { read: ["read_only"], write: ["read_write"] },
    objects: ["payments", "customers", "subscriptions", "invoices", "products", "prices"],
    capabilities: [
      { id: "list-payments", name: "List Payments", type: "read", riskLevel: "low", description: "View recent payments", requiresApproval: false, supportsDryRun: false },
      { id: "create-invoice", name: "Create Invoice", type: "write", riskLevel: "high", description: "Create and send invoice", requiresApproval: true, supportsDryRun: true },
      { id: "refund-payment", name: "Refund Payment", type: "write", riskLevel: "high", description: "Issue a refund", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://stripe.com/docs/api",
    setupSteps: ["Connect Stripe account", "Choose permissions", "Confirm"],
  },
  {
    id: "google-calendar", displayName: "Google Calendar", description: "Calendar events, scheduling, and availability management",
    category: "calendar", authType: "oauth2", icon: "📅", color: "#4285F4",
    scopes: { read: ["calendar.readonly"], write: ["calendar.events"] },
    objects: ["events", "calendars", "attendees"],
    capabilities: [
      { id: "list-events", name: "List Events", type: "read", riskLevel: "low", description: "View calendar events", requiresApproval: false, supportsDryRun: false },
      { id: "create-event", name: "Create Event", type: "write", riskLevel: "low", description: "Create a calendar event", requiresApproval: false, supportsDryRun: true },
      { id: "update-event", name: "Update Event", type: "write", riskLevel: "low", description: "Update an event", requiresApproval: false, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://developers.google.com/calendar",
    setupSteps: ["Sign in with Google", "Choose calendars", "Grant access", "Confirm"],
  },
  {
    id: "gmail", displayName: "Gmail", description: "Email sending, reading, and management via Google",
    category: "email", authType: "oauth2", icon: "✉️", color: "#EA4335",
    scopes: { read: ["gmail.readonly"], write: ["gmail.send", "gmail.compose"] },
    objects: ["messages", "threads", "labels", "drafts"],
    capabilities: [
      { id: "list-messages", name: "List Messages", type: "read", riskLevel: "low", description: "Read inbox messages", requiresApproval: false, supportsDryRun: false },
      { id: "send-email", name: "Send Email", type: "write", riskLevel: "medium", description: "Send an email", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://developers.google.com/gmail",
    setupSteps: ["Sign in with Google", "Grant email access", "Confirm"],
  },
  {
    id: "mailchimp", displayName: "Mailchimp", description: "Email marketing, audiences, campaigns, and automations",
    category: "email", authType: "oauth2", icon: "🐵", color: "#FFE01B",
    scopes: { read: ["read"], write: ["write"] },
    objects: ["audiences", "campaigns", "templates", "subscribers", "automations"],
    capabilities: [
      { id: "list-audiences", name: "List Audiences", type: "read", riskLevel: "low", description: "View all audiences", requiresApproval: false, supportsDryRun: false },
      { id: "add-subscriber", name: "Add Subscriber", type: "write", riskLevel: "low", description: "Add a subscriber to an audience", requiresApproval: false, supportsDryRun: true },
      { id: "send-campaign", name: "Send Campaign", type: "write", riskLevel: "high", description: "Send an email campaign", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://mailchimp.com/developer",
    setupSteps: ["Sign in with Mailchimp", "Select account", "Authorize", "Confirm"],
  },
  {
    id: "shopify", displayName: "Shopify", description: "Ecommerce platform — products, orders, customers, and inventory",
    category: "ecommerce", authType: "oauth2", icon: "🛍️", color: "#96BF48",
    scopes: { read: ["read_products", "read_orders"], write: ["write_products", "write_orders"] },
    objects: ["products", "orders", "customers", "inventory", "collections", "discounts"],
    capabilities: [
      { id: "list-products", name: "List Products", type: "read", riskLevel: "low", description: "View all products", requiresApproval: false, supportsDryRun: false },
      { id: "list-orders", name: "List Orders", type: "read", riskLevel: "low", description: "View recent orders", requiresApproval: false, supportsDryRun: false },
      { id: "update-product", name: "Update Product", type: "write", riskLevel: "medium", description: "Update product details", requiresApproval: true, supportsDryRun: true },
      { id: "create-discount", name: "Create Discount", type: "write", riskLevel: "medium", description: "Create a discount code", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://shopify.dev/docs/api",
    setupSteps: ["Enter Shopify store URL", "Install SITA app", "Authorize", "Confirm"],
  },
  {
    id: "google-analytics", displayName: "Google Analytics", description: "Website analytics, traffic, conversions, and audience insights",
    category: "analytics", authType: "oauth2", icon: "📈", color: "#E37400",
    scopes: { read: ["analytics.readonly"], write: [] },
    objects: ["reports", "audiences", "conversions", "real_time"],
    capabilities: [
      { id: "get-report", name: "Get Report", type: "read", riskLevel: "low", description: "Fetch analytics reports", requiresApproval: false, supportsDryRun: false },
    ],
    supportsWebhooks: false, docsUrl: "https://developers.google.com/analytics",
    setupSteps: ["Sign in with Google", "Select property", "Confirm"],
  },
  {
    id: "slack", displayName: "Slack", description: "Team messaging, channels, notifications, and workflow automation",
    category: "other", authType: "oauth2", icon: "💬", color: "#4A154B",
    scopes: { read: ["channels:read", "users:read"], write: ["chat:write", "channels:manage"] },
    objects: ["messages", "channels", "users", "files"],
    capabilities: [
      { id: "list-channels", name: "List Channels", type: "read", riskLevel: "low", description: "View workspace channels", requiresApproval: false, supportsDryRun: false },
      { id: "send-message", name: "Send Message", type: "write", riskLevel: "low", description: "Post a message to a channel", requiresApproval: false, supportsDryRun: true },
    ],
    supportsWebhooks: true, docsUrl: "https://api.slack.com",
    setupSteps: ["Add to Slack", "Choose workspace", "Select channels", "Confirm"],
  },
  {
    id: "tiktok-ads", displayName: "TikTok Ads", description: "TikTok advertising — campaigns, audiences, and reporting",
    category: "ads", authType: "oauth2", icon: "🎵", color: "#000000",
    scopes: { read: ["ad.read"], write: ["ad.write"] },
    objects: ["campaigns", "ad_groups", "ads", "audiences"],
    capabilities: [
      { id: "list-campaigns", name: "List Campaigns", type: "read", riskLevel: "low", description: "View campaigns", requiresApproval: false, supportsDryRun: false },
      { id: "create-campaign", name: "Create Campaign", type: "write", riskLevel: "high", description: "Create ad campaign", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: false, docsUrl: "https://business-api.tiktok.com",
    setupSteps: ["Sign in with TikTok", "Select advertiser", "Authorize", "Confirm"],
  },
  {
    id: "linkedin-ads", displayName: "LinkedIn Ads", description: "LinkedIn advertising — sponsored content, audiences, conversions",
    category: "ads", authType: "oauth2", icon: "💼", color: "#0A66C2",
    scopes: { read: ["r_ads_reporting"], write: ["rw_ads"] },
    objects: ["campaigns", "creatives", "audiences", "conversions"],
    capabilities: [
      { id: "list-campaigns", name: "List Campaigns", type: "read", riskLevel: "low", description: "View ad campaigns", requiresApproval: false, supportsDryRun: false },
      { id: "create-campaign", name: "Create Campaign", type: "write", riskLevel: "high", description: "Create sponsored content", requiresApproval: true, supportsDryRun: true },
    ],
    supportsWebhooks: false, docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing",
    setupSteps: ["Sign in with LinkedIn", "Select ad account", "Authorize", "Confirm"],
  },
  {
    id: "zapier", displayName: "Zapier", description: "Workflow automation — connect SITA actions to 5000+ apps via Zapier",
    category: "other", authType: "api_key", icon: "⚡", color: "#FF4A00",
    scopes: { read: [], write: [] },
    objects: ["zaps", "triggers", "actions"],
    capabilities: [
      { id: "trigger-zap", name: "Trigger Zap", type: "write", riskLevel: "low", description: "Trigger a Zapier workflow", requiresApproval: false, supportsDryRun: false },
    ],
    supportsWebhooks: true, docsUrl: "https://zapier.com/developer",
    setupSteps: ["Enter Zapier webhook URL", "Test connection", "Confirm"],
  },
  {
    id: "google-sheets", displayName: "Google Sheets", description: "Spreadsheet sync — import/export data to Google Sheets",
    category: "other", authType: "oauth2", icon: "📋", color: "#0F9D58",
    scopes: { read: ["spreadsheets.readonly"], write: ["spreadsheets"] },
    objects: ["spreadsheets", "sheets", "ranges"],
    capabilities: [
      { id: "read-sheet", name: "Read Sheet", type: "read", riskLevel: "low", description: "Read spreadsheet data", requiresApproval: false, supportsDryRun: false },
      { id: "write-sheet", name: "Write to Sheet", type: "write", riskLevel: "low", description: "Write data to a sheet", requiresApproval: false, supportsDryRun: true },
    ],
    supportsWebhooks: false, docsUrl: "https://developers.google.com/sheets",
    setupSteps: ["Sign in with Google", "Select spreadsheet", "Confirm"],
  },
];

export function getProviderById(id: string): ProviderDefinition | undefined {
  return INTEGRATION_PROVIDERS.find(p => p.id === id);
}

export function getProvidersByCategory(category: string): ProviderDefinition[] {
  return INTEGRATION_PROVIDERS.filter(p => p.category === category);
}

export const PROVIDER_CATEGORIES = [
  { id: "all", label: "All", icon: "🔗" },
  { id: "crm", label: "CRM", icon: "👤" },
  { id: "ads", label: "Advertising", icon: "📊" },
  { id: "accounting", label: "Accounting", icon: "💰" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "ecommerce", label: "Ecommerce", icon: "🛍️" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "social", label: "Social", icon: "📱" },
  { id: "other", label: "Other", icon: "⚡" },
] as const;
