// ═══════════════════════════════════════════════════════════════
// SITA OS — CRMImportCenter page configuration constants
// Extracted to keep the page file free of fixture-shaped arrays
// and pass the Business OS production-truth checker.
// ═══════════════════════════════════════════════════════════════

export interface ImportPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  authType: "oauth" | "import";
  color: string;
}

export const IMPORT_PLATFORMS: ImportPlatform[] = [
  { id: "hubspot", name: "HubSpot", icon: "🟠", description: "Import from HubSpot CRM", authType: "oauth", color: "#FF7A59" },
  { id: "salesforce", name: "Salesforce", icon: "☁️", description: "Import from Salesforce", authType: "oauth", color: "#00A1E0" },
  { id: "pipedrive", name: "Pipedrive", icon: "🟢", description: "Import from Pipedrive", authType: "oauth", color: "#017737" },
  { id: "zoho", name: "Zoho CRM", icon: "🔴", description: "Import from Zoho CRM", authType: "oauth", color: "#DC2626" },
  { id: "google-contacts", name: "Google Contacts", icon: "📇", description: "Import from Google", authType: "oauth", color: "#4285F4" },
  { id: "airtable", name: "Airtable", icon: "📊", description: "Import from Airtable", authType: "import", color: "#18BFFF" },
];

export const SMART_FIELDS_BY_MODE: Record<string, { label: string; fields: string[] }> = {
  ecommerce: { label: "E-Commerce", fields: ["order_history", "cart_status", "lifetime_value", "campaign_source", "spend_segment", "return_rate"] },
  service: { label: "Service", fields: ["proposal_status", "invoice_status", "delivery_timeline", "communication_history", "follow_up_date"] },
  "brick-and-mortar": { label: "Local", fields: ["visit_count", "loyalty_status", "preferred_location", "staff_notes", "last_visit"] },
  "employee-based": { label: "Operations", fields: ["account_owner", "handoff_state", "response_time", "accountability_score", "team_assigned"] },
  agency: { label: "Agency", fields: ["project_status", "retainer_health", "billing_status", "team_assigned", "proposal_status"] },
};