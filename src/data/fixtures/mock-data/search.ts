// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Search Page
// ═══════════════════════════════════════════════════════════════

import type { IndexableItem } from "@/lib/core-services/search-fabric";

export const MOCK_SEARCH_ITEMS: IndexableItem[] = [
  { id: "s1", type: "invoice", domain: "business", title: "Invoice #1042 — Marcus Johnson", body: "Payment received $4,200 via Stripe on Mar 28", tags: ["invoice", "marcus"], timestamp: Date.now() - 864e5, metadata: { value: 4200 }, linkedEntities: ["Marcus Johnson"], sensitivity: "internal" },
  { id: "s2", type: "customer", domain: "business", title: "Sarah Chen — Lead Profile", body: "Engagement score 85, qualified stage, referral source", tags: ["lead", "sarah"], timestamp: Date.now() - 864e5 * 2, metadata: {}, linkedEntities: ["Sarah Chen"], sensitivity: "internal" },
  { id: "s3", type: "bill", domain: "finance", title: "AWS Hosting Bill", body: "$340/mo auto-pay, next due Apr 3", tags: ["aws", "hosting"], timestamp: Date.now() - 864e5 * 3, metadata: { value: 340 }, linkedEntities: ["AWS"], sensitivity: "internal" },
  { id: "s4", type: "document", domain: "concierge", title: "School Enrollment Form", body: "Due by April 15, Spring semester", tags: ["school", "enrollment"], timestamp: Date.now() - 864e5 * 4, metadata: {}, linkedEntities: ["School"], sensitivity: "internal" },
  { id: "s5", type: "document", domain: "finance", title: "Emergency Reserve", body: "$85,000 of $120,000 target (70.8%)", tags: ["reserve", "emergency"], timestamp: Date.now() - 864e5 * 5, metadata: { value: 85000 }, linkedEntities: [], sensitivity: "internal" },
  { id: "s6", type: "document", domain: "business", title: "Weekly Business Review", body: "Generated Mar 31, approved by owner", tags: ["boardroom", "review"], timestamp: Date.now() - 864e5 * 6, metadata: {}, linkedEntities: [], sensitivity: "internal" },
  { id: "s7", type: "task", domain: "concierge", title: "Grocery Restock Workflow", body: "Active — triggers weekly on Sundays", tags: ["workflow", "grocery"], timestamp: Date.now() - 864e5 * 7, metadata: {}, linkedEntities: [], sensitivity: "public" },
];
