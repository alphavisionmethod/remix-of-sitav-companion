// ═══════════════════════════════════════════════════════════════
// SITA OS — Document System Service
// Document management, versioning, templates, governed mode, and
// premium editor capabilities
// ═══════════════════════════════════════════════════════════════

export type DocType = "document" | "proposal" | "report" | "boardroom-packet" | "note" | "spreadsheet" | "presentation" | "template";
export type DocStatus = "draft" | "review" | "approved" | "published" | "archived" | "restricted";
export type DocPrivacy = "personal" | "household" | "team" | "client" | "public" | "restricted";
export type SensitiveDataType = "ssn" | "tax-id" | "ein" | "medical" | "bank-account" | "legal" | "insurance" | "pii";

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocType;
  status: DocStatus;
  privacy: DocPrivacy;
  content: string;
  author: string;
  linkedEntity?: string;
  linkedWorkflow?: string;
  linkedDomain?: string;
  version: number;
  versions: DocumentVersion[];
  tags: string[];
  templateId?: string;
  sensitiveData: SensitiveDataType[];
  governedMode: boolean;
  accessLog: AccessLogEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface DocumentVersion {
  version: number;
  content: string;
  author: string;
  changeDescription: string;
  timestamp: number;
}

export interface AccessLogEntry {
  userId: string;
  action: "view" | "edit" | "download" | "share" | "redact" | "classify";
  timestamp: number;
  redacted: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocType;
  domain: string;
  content: string;
  variables: { key: string; label: string; defaultValue: string }[];
  tags: string[];
}

export interface RedactionRule {
  pattern: RegExp;
  type: SensitiveDataType;
  replacement: string;
}

// ── Document System Service ─────────────────────────────────────

export class DocumentSystemService {
  private documents = new Map<string, DocumentRecord>();
  private templates = new Map<string, DocumentTemplate>();
  private redactionRules: RedactionRule[] = [];

  constructor() {
    this.initializeRedactionRules();
    this.initializeTemplates();
  }

  // ── Document CRUD ──────────────────────────────────────────────

  createDocument(title: string, type: DocType, author: string, options?: {
    content?: string; privacy?: DocPrivacy; templateId?: string; linkedEntity?: string; linkedDomain?: string;
  }): DocumentRecord {
    const templateContent = options?.templateId ? this.templates.get(options.templateId)?.content : undefined;

    const doc: DocumentRecord = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title, type, author,
      status: "draft",
      privacy: options?.privacy ?? "personal",
      content: options?.content ?? templateContent ?? "",
      linkedEntity: options?.linkedEntity,
      linkedDomain: options?.linkedDomain,
      version: 1,
      versions: [],
      tags: [],
      templateId: options?.templateId,
      sensitiveData: [],
      governedMode: false,
      accessLog: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Auto-classify for sensitive data
    this.classifySensitiveContent(doc);

    this.documents.set(doc.id, doc);
    return doc;
  }

  getDocument(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  updateDocument(id: string, content: string, author: string, changeDescription = "Updated"): DocumentRecord | null {
    const doc = this.documents.get(id);
    if (!doc) return null;

    // Save version
    doc.versions.push({
      version: doc.version,
      content: doc.content,
      author: doc.author,
      changeDescription,
      timestamp: doc.updatedAt,
    });

    doc.content = content;
    doc.version++;
    doc.updatedAt = Date.now();

    // Re-classify
    this.classifySensitiveContent(doc);

    return doc;
  }

  setStatus(id: string, status: DocStatus): DocumentRecord | null {
    const doc = this.documents.get(id);
    if (!doc) return null;
    doc.status = status;
    doc.updatedAt = Date.now();
    return doc;
  }

  // ── Search & Filter ────────────────────────────────────────────

  searchDocuments(query: string, filters?: { type?: DocType; status?: DocStatus; domain?: string; privacy?: DocPrivacy }): DocumentRecord[] {
    return Array.from(this.documents.values()).filter(doc => {
      const matchesQuery = !query || doc.title.toLowerCase().includes(query.toLowerCase()) || doc.content.toLowerCase().includes(query.toLowerCase());
      const matchesType = !filters?.type || doc.type === filters.type;
      const matchesStatus = !filters?.status || doc.status === filters.status;
      const matchesDomain = !filters?.domain || doc.linkedDomain === filters.domain;
      const matchesPrivacy = !filters?.privacy || doc.privacy === filters.privacy;
      return matchesQuery && matchesType && matchesStatus && matchesDomain && matchesPrivacy;
    });
  }

  getDocumentsByDomain(domain: string): DocumentRecord[] {
    return Array.from(this.documents.values()).filter(d => d.linkedDomain === domain);
  }

  getRecentDocuments(limit = 10): DocumentRecord[] {
    return Array.from(this.documents.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  // ── Sensitive Document Governed Mode ───────────────────────────

  private classifySensitiveContent(doc: DocumentRecord): void {
    const detectedTypes: SensitiveDataType[] = [];
    for (const rule of this.redactionRules) {
      if (rule.pattern.test(doc.content)) {
        detectedTypes.push(rule.type);
      }
    }
    doc.sensitiveData = [...new Set(detectedTypes)];
    doc.governedMode = detectedTypes.length > 0;
    if (doc.governedMode && doc.privacy !== "restricted") {
      doc.privacy = "restricted";
    }
  }

  redactContent(docId: string, viewerRole: "owner" | "member" | "advisor" | "support"): string {
    const doc = this.documents.get(docId);
    if (!doc) return "";

    if (viewerRole === "owner") return doc.content;

    let redacted = doc.content;
    for (const rule of this.redactionRules) {
      redacted = redacted.replace(rule.pattern, rule.replacement);
    }

    if (viewerRole === "support") return `[REDACTED SUMMARY] Document contains ${doc.sensitiveData.join(", ")} data.`;
    return redacted;
  }

  logAccess(docId: string, userId: string, action: AccessLogEntry["action"], redacted = false): void {
    const doc = this.documents.get(docId);
    if (!doc) return;
    doc.accessLog.push({ userId, action, timestamp: Date.now(), redacted });
  }

  // ── Templates ──────────────────────────────────────────────────

  getTemplates(domain?: string): DocumentTemplate[] {
    const all = Array.from(this.templates.values());
    return domain ? all.filter(t => t.domain === domain) : all;
  }

  createFromTemplate(templateId: string, title: string, author: string, variables?: Record<string, string>): DocumentRecord | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    let content = template.content;
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      }
    }

    return this.createDocument(title, template.type, author, {
      content,
      templateId,
      linkedDomain: template.domain,
    });
  }

  // ── Stats ──────────────────────────────────────────────────────

  getStats(): {
    totalDocuments: number; byType: Record<string, number>; byStatus: Record<string, number>;
    governedDocuments: number; recentlyModified: number;
  } {
    const docs = Array.from(this.documents.values());
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let governed = 0;
    const recentThreshold = Date.now() - 86_400_000;
    let recent = 0;

    for (const doc of docs) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
      if (doc.governedMode) governed++;
      if (doc.updatedAt > recentThreshold) recent++;
    }

    return { totalDocuments: docs.length, byType, byStatus, governedDocuments: governed, recentlyModified: recent };
  }

  getHealth(): { status: "healthy"; documents: number; governed: number; templates: number } {
    return {
      status: "healthy",
      documents: this.documents.size,
      governed: Array.from(this.documents.values()).filter(d => d.governedMode).length,
      templates: this.templates.size,
    };
  }

  // ── Private Init ───────────────────────────────────────────────

  private initializeRedactionRules(): void {
    this.redactionRules = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: "ssn", replacement: "***-**-****" },
      { pattern: /\b\d{2}-\d{7}\b/g, type: "ein", replacement: "**-*******" },
      { pattern: /\b\d{9,18}\b/g, type: "bank-account", replacement: "****" },
      { pattern: /\bSSN\b.*?\d+/gi, type: "ssn", replacement: "[REDACTED SSN]" },
      { pattern: /\bTax\s*ID\b.*?\d+/gi, type: "tax-id", replacement: "[REDACTED TAX ID]" },
    ];
  }

  private initializeTemplates(): void {
    const templates: DocumentTemplate[] = [
      {
        id: "tpl-proposal", name: "Business Proposal", type: "proposal", domain: "business",
        content: "# Proposal: {{client_name}}\n\n## Executive Summary\n\n{{summary}}\n\n## Scope of Work\n\n{{scope}}\n\n## Pricing\n\n| Item | Amount |\n|------|--------|\n| {{item_1}} | {{price_1}} |\n\n## Timeline\n\n{{timeline}}\n\n## Terms\n\nNet 30 payment terms. This proposal is valid for 30 days.",
        variables: [
          { key: "client_name", label: "Client Name", defaultValue: "" },
          { key: "summary", label: "Executive Summary", defaultValue: "" },
          { key: "scope", label: "Scope of Work", defaultValue: "" },
          { key: "item_1", label: "Line Item", defaultValue: "Consulting Services" },
          { key: "price_1", label: "Price", defaultValue: "$0.00" },
          { key: "timeline", label: "Timeline", defaultValue: "TBD" },
        ],
        tags: ["sales", "client"],
      },
      {
        id: "tpl-invoice", name: "Invoice", type: "document", domain: "business",
        content: "# INVOICE\n\n**Invoice #:** {{invoice_number}}\n**Date:** {{date}}\n**Due:** {{due_date}}\n\n**Bill To:**\n{{client_name}}\n{{client_address}}\n\n| Description | Qty | Rate | Amount |\n|-------------|-----|------|--------|\n| {{description}} | {{qty}} | {{rate}} | {{amount}} |\n\n**Total: {{total}}**\n\nPayment Terms: Net 30",
        variables: [
          { key: "invoice_number", label: "Invoice Number", defaultValue: "" },
          { key: "date", label: "Invoice Date", defaultValue: "" },
          { key: "due_date", label: "Due Date", defaultValue: "" },
          { key: "client_name", label: "Client Name", defaultValue: "" },
          { key: "client_address", label: "Client Address", defaultValue: "" },
          { key: "description", label: "Description", defaultValue: "" },
          { key: "qty", label: "Quantity", defaultValue: "1" },
          { key: "rate", label: "Rate", defaultValue: "$0.00" },
          { key: "amount", label: "Amount", defaultValue: "$0.00" },
          { key: "total", label: "Total", defaultValue: "$0.00" },
        ],
        tags: ["billing", "client"],
      },
      {
        id: "tpl-budget", name: "Family Budget", type: "spreadsheet", domain: "finance",
        content: "# Monthly Budget — {{month}} {{year}}\n\n## Income\n| Source | Planned | Actual |\n|--------|---------|--------|\n| Salary | {{salary}} | |\n| Other | {{other_income}} | |\n\n## Expenses\n| Category | Budget | Actual | Remaining |\n|----------|--------|--------|----------|\n| Housing | {{housing}} | | |\n| Food | {{food}} | | |\n| Transport | {{transport}} | | |\n| Utilities | {{utilities}} | | |\n| Savings | {{savings}} | | |",
        variables: [
          { key: "month", label: "Month", defaultValue: "April" },
          { key: "year", label: "Year", defaultValue: "2026" },
          { key: "salary", label: "Salary", defaultValue: "$0" },
          { key: "other_income", label: "Other Income", defaultValue: "$0" },
          { key: "housing", label: "Housing Budget", defaultValue: "$0" },
          { key: "food", label: "Food Budget", defaultValue: "$0" },
          { key: "transport", label: "Transport Budget", defaultValue: "$0" },
          { key: "utilities", label: "Utilities Budget", defaultValue: "$0" },
          { key: "savings", label: "Savings Goal", defaultValue: "$0" },
        ],
        tags: ["budget", "family"],
      },
      {
        id: "tpl-travel", name: "Travel Itinerary", type: "document", domain: "concierge",
        content: "# Travel Itinerary — {{destination}}\n\n**Traveler:** {{traveler}}\n**Dates:** {{start_date}} – {{end_date}}\n\n## Flights\n| Direction | Flight | Time | Terminal |\n|-----------|--------|------|----------|\n| Outbound | {{outbound_flight}} | {{outbound_time}} | |\n| Return | {{return_flight}} | {{return_time}} | |\n\n## Accommodation\n**Hotel:** {{hotel}}\n**Address:** {{hotel_address}}\n**Confirmation:** {{confirmation}}\n\n## Daily Schedule\n\n### Day 1\n{{day_1_plan}}\n\n### Day 2\n{{day_2_plan}}\n\n## Emergency Contacts\n- Embassy: {{embassy_phone}}\n- Insurance: {{insurance_phone}}",
        variables: [
          { key: "destination", label: "Destination", defaultValue: "" },
          { key: "traveler", label: "Traveler Name", defaultValue: "" },
          { key: "start_date", label: "Start Date", defaultValue: "" },
          { key: "end_date", label: "End Date", defaultValue: "" },
          { key: "outbound_flight", label: "Outbound Flight", defaultValue: "" },
          { key: "outbound_time", label: "Outbound Time", defaultValue: "" },
          { key: "return_flight", label: "Return Flight", defaultValue: "" },
          { key: "return_time", label: "Return Time", defaultValue: "" },
          { key: "hotel", label: "Hotel", defaultValue: "" },
          { key: "hotel_address", label: "Hotel Address", defaultValue: "" },
          { key: "confirmation", label: "Confirmation #", defaultValue: "" },
          { key: "day_1_plan", label: "Day 1 Plan", defaultValue: "" },
          { key: "day_2_plan", label: "Day 2 Plan", defaultValue: "" },
          { key: "embassy_phone", label: "Embassy Phone", defaultValue: "" },
          { key: "insurance_phone", label: "Insurance Phone", defaultValue: "" },
        ],
        tags: ["travel", "itinerary"],
      },
      {
        id: "tpl-boardroom-deck", name: "Boardroom Deck", type: "boardroom-packet", domain: "boardroom",
        content: "# {{session_title}}\n\n## Session Overview\n**Date:** {{date}}\n**Advisors:** {{advisors}}\n**Focus:** {{focus_area}}\n\n## Key Metrics\n{{metrics}}\n\n## Recommendations\n{{recommendations}}\n\n## Action Items\n{{action_items}}\n\n## Next Session\n{{next_session}}",
        variables: [
          { key: "session_title", label: "Session Title", defaultValue: "Weekly Review" },
          { key: "date", label: "Date", defaultValue: "" },
          { key: "advisors", label: "Advisors", defaultValue: "" },
          { key: "focus_area", label: "Focus Area", defaultValue: "" },
          { key: "metrics", label: "Key Metrics", defaultValue: "" },
          { key: "recommendations", label: "Recommendations", defaultValue: "" },
          { key: "action_items", label: "Action Items", defaultValue: "" },
          { key: "next_session", label: "Next Session", defaultValue: "" },
        ],
        tags: ["boardroom", "review"],
      },
      {
        id: "tpl-meeting-notes", name: "Meeting Notes", type: "note", domain: "business",
        content: "# Meeting Notes — {{meeting_title}}\n\n**Date:** {{date}}\n**Attendees:** {{attendees}}\n**Location:** {{location}}\n\n## Agenda\n{{agenda}}\n\n## Discussion\n{{discussion}}\n\n## Decisions\n{{decisions}}\n\n## Action Items\n| Owner | Task | Deadline |\n|-------|------|----------|\n| {{owner_1}} | {{task_1}} | {{deadline_1}} |\n\n## Next Meeting\n{{next_meeting}}",
        variables: [
          { key: "meeting_title", label: "Meeting Title", defaultValue: "" },
          { key: "date", label: "Date", defaultValue: "" },
          { key: "attendees", label: "Attendees", defaultValue: "" },
          { key: "location", label: "Location", defaultValue: "" },
          { key: "agenda", label: "Agenda", defaultValue: "" },
          { key: "discussion", label: "Discussion Points", defaultValue: "" },
          { key: "decisions", label: "Decisions Made", defaultValue: "" },
          { key: "owner_1", label: "Action Owner", defaultValue: "" },
          { key: "task_1", label: "Action Task", defaultValue: "" },
          { key: "deadline_1", label: "Deadline", defaultValue: "" },
          { key: "next_meeting", label: "Next Meeting", defaultValue: "" },
        ],
        tags: ["meeting", "notes"],
      },
    ];

    templates.forEach(t => this.templates.set(t.id, t));
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createDocumentSystem(): DocumentSystemService {
  return new DocumentSystemService();
}
