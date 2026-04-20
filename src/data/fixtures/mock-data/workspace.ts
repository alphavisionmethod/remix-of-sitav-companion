// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Workspace (Docs, Sheets, Slides)
// ═══════════════════════════════════════════════════════════════

export interface MockDoc {
  id: string;
  title: string;
  type: "document" | "proposal" | "report" | "boardroom-packet" | "note";
  status: "draft" | "review" | "approved" | "published" | "archived";
  lastModified: string;
  author: string;
  linkedEntity?: string;
  linkedWorkflow?: string;
  version: number;
  privacy: "personal" | "team" | "client" | "public" | "restricted";
  content: string;
  governed: boolean;
  tags: string[];
}

export interface MockSlide {
  id: string;
  content: string;
  notes: string;
  layout: "title" | "content" | "metrics" | "two-column" | "quote" | "image" | "comparison";
}

export interface MockDeck {
  id: string;
  title: string;
  type: "boardroom" | "proposal" | "investor" | "internal" | "custom";
  slides: MockSlide[];
  status: "draft" | "ready" | "presented";
  lastModified: string;
  linkedBoardroom?: string;
  privacy: "personal" | "team" | "client";
}

export interface MockSheet {
  id: string;
  name: string;
  type: "financial" | "planning" | "crm" | "metrics" | "custom";
  lastModified: string;
  linkedDomain: string;
  columns: string[];
  data: string[][];
  formulas: Record<string, string>;
}

export const MOCK_DOCS: MockDoc[] = [
  { id: "1", title: "Q1 Business Review Packet", type: "boardroom-packet", status: "approved", lastModified: "2h ago", author: "SITA", linkedEntity: "Weekly Review", linkedWorkflow: "boardroom-gen-042", version: 3, privacy: "team", content: "# Q1 Business Review\n\n## Revenue Summary\n\nTotal revenue for Q1 2026: **$189,400**\n\n### Key Highlights\n\n- Revenue grew 18% QoQ\n- Customer retention at 94%\n- 3 new enterprise clients onboarded\n- Pipeline value: $420,000\n\n## Recommendations\n\n1. Expand outreach to mid-market segment\n2. Invest in automation for onboarding\n3. Review pricing strategy for Q2", governed: false, tags: ["quarterly", "review"] },
  { id: "2", title: "Proposal — Sarah Chen Expansion", type: "proposal", status: "draft", lastModified: "4h ago", author: "You", linkedEntity: "Sarah Chen", linkedWorkflow: "quote-to-proposal-018", version: 1, privacy: "client", content: "# Proposal: Sarah Chen — Service Expansion\n\n## Executive Summary\n\nFollowing the successful initial engagement, we propose expanding our services to include strategic advisory and operational optimization.\n\n## Scope of Work\n\n- Monthly strategy sessions\n- Process automation audit\n- Financial modeling and forecasting\n- Quarterly business reviews\n\n## Pricing\n\n| Service | Monthly | Annual |\n|---------|---------|--------|\n| Strategic Advisory | $3,500 | $42,000 |\n| Process Audit | $2,000 | $24,000 |\n| Financial Modeling | $1,500 | $18,000 |\n\n**Total Annual Value: $84,000**\n\n## Timeline\n\nEngagement begins upon signature. Initial assessment within 2 weeks.", governed: false, tags: ["proposal", "expansion"] },
  { id: "3", title: "Service Agreement Template", type: "document", status: "published", lastModified: "3d ago", author: "You", version: 5, privacy: "team", content: "# Service Agreement\n\nThis agreement is between {{company_name}} and {{client_name}}.\n\n## Terms\n\n1. Services to be provided as described in attached SOW\n2. Payment terms: Net 30\n3. Confidentiality: All information shared is confidential\n4. Term: 12 months from execution date", governed: false, tags: ["template", "legal"] },
  { id: "4", title: "Monthly Financial Summary", type: "report", status: "review", lastModified: "1d ago", author: "SITA", linkedEntity: "Finance Boardroom", linkedWorkflow: "finance-report-012", version: 2, privacy: "personal", content: "# Monthly Financial Summary — March 2026\n\n## Overview\n\n- Total Income: $52,300\n- Total Expenses: $38,100\n- Net: $14,200\n- Savings Rate: 27.2%\n\n## Category Breakdown\n\n| Category | Amount | Budget | Status |\n|----------|--------|--------|--------|\n| Housing | $2,400 | $2,500 | ✅ Under |\n| Food | $1,280 | $1,200 | ⚠️ Over |\n| Transport | $640 | $800 | ✅ Under |\n| Subscriptions | $380 | $300 | ⚠️ Over |\n\n## Alerts\n\n- 2 subscriptions flagged as potential waste\n- Emergency fund at 78% of 6-month target", governed: false, tags: ["financial", "monthly"] },
  { id: "5", title: "Meeting Notes — Marcus Johnson", type: "note", status: "draft", lastModified: "6h ago", author: "You", linkedEntity: "Marcus Johnson", version: 1, privacy: "personal", content: "# Meeting Notes: Marcus Johnson\n\n**Date:** April 2, 2026\n**Type:** Discovery Call\n\n## Discussion\n\n- Marcus is interested in full-service package\n- Current pain points: manual invoicing, no CRM\n- Budget: $3,000-5,000/month\n- Decision timeline: 2 weeks\n\n## Action Items\n\n- [ ] Send proposal by April 5\n- [ ] Schedule follow-up for April 9\n- [ ] Share case studies from similar clients", governed: false, tags: ["meeting", "prospect"] },
  { id: "6", title: "Confidential — Tax Documents 2025", type: "document", status: "draft", lastModified: "1d ago", author: "You", version: 1, privacy: "restricted", content: "# Tax Filing Summary 2025\n\n**SSN:** 123-45-6789\n**EIN:** 12-3456789\n\n## Income Summary\n\n- W2 Income: $180,000\n- 1099 Income: $42,000\n- Investment Income: $8,500\n\n## Deductions\n\n- Home Office: $4,800\n- Business Expenses: $12,300\n- Health Insurance: $9,600", governed: true, tags: ["tax", "sensitive", "2025"] },
];

export const MOCK_SHEETS: MockSheet[] = [
  {
    id: "1", name: "Revenue Tracker Q1", type: "financial", lastModified: "1h ago", linkedDomain: "Business",
    columns: ["Month", "Revenue", "Expenses", "Net", "Growth %", "Margin %"],
    data: [
      ["Jan 2026", "$42,300", "$28,100", "$14,200", "+8%", "33.6%"],
      ["Feb 2026", "$45,800", "$29,400", "$16,400", "+15%", "35.8%"],
      ["Mar 2026", "$51,200", "$31,800", "$19,400", "+18%", "37.9%"],
      ["Apr 2026", "$48,600", "$30,200", "$18,400", "-5%", "37.9%"],
    ],
    formulas: { "D1": "=B1-C1", "E1": "=(B1-B0)/B0*100", "F1": "=D1/B1*100" },
  },
  {
    id: "2", name: "Customer Pipeline", type: "crm", lastModified: "3h ago", linkedDomain: "Business",
    columns: ["Customer", "Stage", "Value", "Probability", "Expected Close", "Days in Stage"],
    data: [
      ["Sarah Chen", "Negotiation", "$84,000", "70%", "Apr 15", "8"],
      ["Marcus Johnson", "Discovery", "$36,000", "30%", "May 10", "5"],
      ["Dr. Patel", "Proposal", "$24,000", "55%", "Apr 20", "12"],
      ["TechFlow", "Qualified", "$60,000", "40%", "Jun 01", "3"],
    ],
    formulas: {},
  },
  {
    id: "3", name: "Monthly Budget vs Actual", type: "planning", lastModified: "1d ago", linkedDomain: "Finance",
    columns: ["Category", "Budget", "Actual", "Variance", "Status"],
    data: [
      ["Housing", "$2,500", "$2,400", "+$100", "Under"],
      ["Food", "$1,200", "$1,280", "-$80", "Over"],
      ["Transport", "$800", "$640", "+$160", "Under"],
      ["Subscriptions", "$300", "$380", "-$80", "Over"],
      ["Savings", "$2,000", "$2,000", "$0", "On Track"],
    ],
    formulas: { "D1": "=B1-C1" },
  },
];

export const MOCK_DECKS: MockDeck[] = [
  {
    id: "1", title: "Weekly Business Review", type: "boardroom", status: "ready", lastModified: "1h ago", linkedBoardroom: "weekly-review", privacy: "team",
    slides: [
      { id: "s1", content: "# Weekly Business Review\n\n**Q1 2026 — Week 14**\n\nPrepared by SITA", notes: "Opening slide — set the tone", layout: "title" },
      { id: "s2", content: "## Revenue Summary\n\n| Metric | Value | Trend |\n|--------|-------|-------|\n| Revenue | $51,200 | ↑ 18% |\n| Expenses | $31,800 | ↑ 5% |\n| Net | $19,400 | ↑ 28% |\n| Pipeline | $420K | ↑ 12% |", notes: "Highlight the net growth", layout: "metrics" },
      { id: "s3", content: "## Key Wins\n\n- **Sarah Chen** expansion proposal sent ($84K)\n- **Dr. Patel** moved to negotiation stage\n- 3 new inbound leads this week\n- Customer retention holding at 94%", notes: "Celebrate wins before challenges", layout: "content" },
      { id: "s4", content: "## Challenges & Actions\n\n### Challenges\n- Food budget slightly over\n- 2 subscriptions flagged as waste\n\n### Actions\n1. Follow up on Sarah Chen by Friday\n2. Review subscription usage data\n3. Schedule Marcus Johnson discovery call", notes: "Be specific on action items", layout: "two-column" },
      { id: "s5", content: "## Next Week Focus\n\n> \"Close Sarah Chen, qualify Marcus Johnson, review Q2 pricing strategy.\"\n\n— SITA Recommendation", notes: "End with clear direction", layout: "quote" },
    ],
  },
  {
    id: "2", title: "Sarah Chen — Expansion Proposal", type: "proposal", status: "draft", lastModified: "4h ago", privacy: "client",
    slides: [
      { id: "s1", content: "# Service Expansion Proposal\n\n**Prepared for: Sarah Chen**\n\nApril 2026", notes: "", layout: "title" },
      { id: "s2", content: "## Our Partnership\n\n- 6 months of successful collaboration\n- 23% revenue growth achieved\n- 4.9/5 satisfaction rating", notes: "", layout: "content" },
      { id: "s3", content: "## Proposed Services\n\n| Service | Monthly |\n|---------|--------|\n| Strategic Advisory | $3,500 |\n| Process Audit | $2,000 |\n| Financial Modeling | $1,500 |\n\n**Total: $7,000/month**", notes: "", layout: "metrics" },
    ],
  },
  {
    id: "3", title: "Q1 Investor Update", type: "investor", status: "presented", lastModified: "5d ago", privacy: "personal",
    slides: [
      { id: "s1", content: "# Q1 2026 Investor Update\n\n**Confidential**", notes: "", layout: "title" },
      { id: "s2", content: "## Highlights\n\n- Revenue up 18% QoQ\n- 3 new enterprise clients\n- Pipeline at $420K\n- Runway: 18 months", notes: "", layout: "content" },
    ],
  },
];
