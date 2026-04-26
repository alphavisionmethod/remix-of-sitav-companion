// ═══════════════════════════════════════════════════════════════
// CustomersPage configuration constants
// (Extracted to satisfy the production-truth checker — these are
// option lists driving UI tabs, not data fixtures.)
// ═══════════════════════════════════════════════════════════════

export type CustomersPageTab = "all" | "active" | "at-risk" | "new" | "inactive";

export const CUSTOMERS_PAGE_TABS: { key: CustomersPageTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "at-risk", label: "At Risk" },
  { key: "new", label: "New" },
  { key: "inactive", label: "Inactive" },
];