import type { InboxFilter } from "@/modules/business/components/business/lead-inbox/useLeadInbox";

export const LEADS_INBOX_FILTER_TABS: { key: InboxFilter; label: string }[] = [
  { key: "all", label: "All Pending" },
  { key: "new", label: "New" },
  { key: "urgent", label: "Urgent" },
  { key: "high-quality", label: "High Quality" },
  { key: "at-risk", label: "At Risk" },
  { key: "recovery", label: "Recovery" },
  { key: "missing-info", label: "Missing Info" },
  { key: "duplicates", label: "Duplicates" },
  { key: "exceptional", label: "★ Exceptional" },
  { key: "snoozed", label: "Snoozed" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];