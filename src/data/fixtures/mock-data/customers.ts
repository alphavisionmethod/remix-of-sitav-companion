// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Customers Page
// ═══════════════════════════════════════════════════════════════

export interface MockCustomer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  relationship_type: string | null;
  health_score: number | null;
  lifetime_revenue: number | null;
  last_contact_at: string | null;
  created_at: string;
  notes: string | null;
}

export const MOCK_DEMO_CUSTOMERS: MockCustomer[] = [
  { id: "cust-1", name: "Acme Corp", company: "Acme Corp", email: "billing@acme.com", phone: "(555) 100-0001", status: "active", relationship_type: "Client", health_score: 82, lifetime_revenue: 240000, last_contact_at: new Date(Date.now() - 864e5 * 3).toISOString(), created_at: new Date(Date.now() - 864e5 * 365).toISOString(), notes: "Enterprise tier, 12 invoices" },
  { id: "cust-2", name: "TechStart LLC", company: "TechStart LLC", email: "info@techstart.io", phone: "(555) 200-0002", status: "at-risk", relationship_type: "Client", health_score: 58, lifetime_revenue: 45000, last_contact_at: new Date(Date.now() - 864e5 * 14).toISOString(), created_at: new Date(Date.now() - 864e5 * 180).toISOString(), notes: "Churn risk 35%" },
  { id: "cust-3", name: "GlobalRetail Inc", company: "GlobalRetail Inc", email: "accounts@globalretail.com", phone: "(555) 300-0003", status: "active", relationship_type: "Client", health_score: 95, lifetime_revenue: 520000, last_contact_at: new Date(Date.now() - 864e5).toISOString(), created_at: new Date(Date.now() - 864e5 * 730).toISOString(), notes: null },
];
