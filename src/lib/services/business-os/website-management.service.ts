import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
// ═══════════════════════════════════════════════════════════════
// SITA OS — Website Management Service
// Page CRUD, SEO configuration, domain management, analytics hooks
// Merged from services/website-management into Business OS
// ═══════════════════════════════════════════════════════════════

export type PageStatus = "draft" | "published" | "archived" | "scheduled";
export type PageTemplate = "landing" | "about" | "contact" | "blog-post" | "product" | "custom";

export interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  template: PageTemplate;
  status: PageStatus;
  content: PageContentBlock[];
  seo: SEOConfig;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  version: number;
  authorId?: string;
}

export interface PageContentBlock {
  id: string;
  type: "hero" | "text" | "image" | "cta" | "testimonial" | "features" | "pricing" | "faq" | "custom";
  order: number;
  content: Record<string, unknown>;
  visible: boolean;
}

export interface SEOConfig {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
  noFollow?: boolean;
  keywords?: string[];
}

export interface DomainMapping {
  id: string;
  domain: string;
  isPrimary: boolean;
  sslStatus: "pending" | "active" | "expired" | "error";
  verificationStatus: "pending" | "verified" | "failed";
  verificationToken?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface AnalyticsHook {
  id: string;
  pageId: string;
  event: "page-view" | "cta-click" | "form-submit" | "scroll-depth" | "exit-intent";
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface WebsiteStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  domains: number;
  activeDomains: number;
  analyticsEventsToday: number;
}

export class WebsiteManager {
  private pages = new Map<string, WebsitePage>();
  private domains = new Map<string, DomainMapping>();
  private analyticsLog: AnalyticsHook[] = [];

  // ── Page CRUD ─────────────────────────────────────────────

  createPage(params: {
    title: string;
    slug: string;
    template: PageTemplate;
    content?: PageContentBlock[];
    seo?: Partial<SEOConfig>;
    authorId?: string;
  }): WebsitePage {
    const page: WebsitePage = {
      id: crypto.randomUUID(),
      slug: this.normalizeSlug(params.slug),
      title: params.title,
      template: params.template,
      status: "draft",
      content: params.content ?? [],
      seo: {
        metaTitle: params.seo?.metaTitle ?? params.title,
        metaDescription: params.seo?.metaDescription,
        ...params.seo,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      authorId: params.authorId,
    };
    this.pages.set(page.id, page);
    return page;
  }

  updatePage(pageId: string, updates: Partial<Pick<WebsitePage, "title" | "slug" | "content" | "seo" | "template">>): WebsitePage | null {
    const page = this.pages.get(pageId);
    if (!page) return null;

    if (updates.title) page.title = updates.title;
    if (updates.slug) page.slug = this.normalizeSlug(updates.slug);
    if (updates.content) page.content = updates.content;
    if (updates.template) page.template = updates.template;
    if (updates.seo) page.seo = { ...page.seo, ...updates.seo };
    page.updatedAt = new Date().toISOString();
    page.version++;

    return page;
  }

  publishPage(pageId: string): WebsitePage | null {
    const page = this.pages.get(pageId);
    if (!page) return null;
    page.status = "published";
    page.publishedAt = new Date().toISOString();
    page.updatedAt = new Date().toISOString();
    return page;
  }

  archivePage(pageId: string): WebsitePage | null {
    const page = this.pages.get(pageId);
    if (!page) return null;
    page.status = "archived";
    page.updatedAt = new Date().toISOString();
    return page;
  }

  schedulePage(pageId: string, publishAt: string): WebsitePage | null {
    const page = this.pages.get(pageId);
    if (!page) return null;
    page.status = "scheduled";
    page.scheduledAt = publishAt;
    page.updatedAt = new Date().toISOString();
    return page;
  }

  getPage(pageId: string): WebsitePage | undefined {
    return this.pages.get(pageId);
  }

  getPageBySlug(slug: string): WebsitePage | undefined {
    return Array.from(this.pages.values()).find(p => p.slug === this.normalizeSlug(slug));
  }

  listPages(filter?: { status?: PageStatus; template?: PageTemplate }): WebsitePage[] {
    let pages = Array.from(this.pages.values());
    if (filter?.status) pages = pages.filter(p => p.status === filter.status);
    if (filter?.template) pages = pages.filter(p => p.template === filter.template);
    return pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  deletePage(pageId: string): boolean {
    return this.pages.delete(pageId);
  }

  // ── SEO Configuration ─────────────────────────────────────

  updateSEO(pageId: string, seo: Partial<SEOConfig>): SEOConfig | null {
    const page = this.pages.get(pageId);
    if (!page) return null;
    page.seo = { ...page.seo, ...seo };
    page.updatedAt = new Date().toISOString();
    return page.seo;
  }

  generateStructuredData(page: WebsitePage): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.seo.metaTitle ?? page.title,
      description: page.seo.metaDescription ?? "",
      url: page.seo.canonicalUrl ?? `/${page.slug}`,
      datePublished: page.publishedAt,
      dateModified: page.updatedAt,
    };
  }

  auditSEO(pageId: string): { score: number; issues: string[]; recommendations: string[] } {
    const page = this.pages.get(pageId);
    if (!page) return { score: 0, issues: ["Page not found"], recommendations: [] };

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!page.seo.metaTitle || page.seo.metaTitle.length < 10) {
      issues.push("Meta title is too short or missing");
      score -= 20;
    } else if (page.seo.metaTitle.length > 60) {
      issues.push("Meta title exceeds 60 characters");
      score -= 10;
    }
    if (!page.seo.metaDescription) {
      issues.push("Missing meta description");
      score -= 15;
    } else if (page.seo.metaDescription.length > 160) {
      issues.push("Meta description exceeds 160 characters");
      score -= 5;
    }
    if (!page.seo.ogTitle) {
      recommendations.push("Add Open Graph title for social sharing");
      score -= 5;
    }
    if (!page.seo.ogImage) {
      recommendations.push("Add OG image for better social previews");
      score -= 5;
    }
    if (!page.seo.canonicalUrl) {
      recommendations.push("Set canonical URL to prevent duplicate content");
      score -= 5;
    }
    if (!page.seo.structuredData) {
      recommendations.push("Add structured data for rich search results");
      score -= 5;
    }
    if (!page.seo.keywords || page.seo.keywords.length === 0) {
      recommendations.push("Add target keywords");
      score -= 5;
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  // ── Domain Management ─────────────────────────────────────

  addDomain(domain: string, isPrimary = false): DomainMapping {
    const mapping: DomainMapping = {
      id: crypto.randomUUID(),
      domain: domain.toLowerCase().trim(),
      isPrimary,
      sslStatus: "pending",
      verificationStatus: "pending",
      verificationToken: crypto.randomUUID().replace(/-/g, ""),
      createdAt: new Date().toISOString(),
    };

    if (isPrimary) {
      for (const [, d] of this.domains) d.isPrimary = false;
    }

    this.domains.set(mapping.id, mapping);
    return mapping;
  }

  verifyDomain(domainId: string): DomainMapping | null {
    const domain = this.domains.get(domainId);
    if (!domain) return null;
    domain.verificationStatus = "verified";
    domain.verifiedAt = new Date().toISOString();
    domain.sslStatus = "active";
    return domain;
  }

  removeDomain(domainId: string): boolean {
    return this.domains.delete(domainId);
  }

  listDomains(): DomainMapping[] {
    return Array.from(this.domains.values());
  }

  getPrimaryDomain(): DomainMapping | undefined {
    return Array.from(this.domains.values()).find(d => d.isPrimary);
  }

  // ── Analytics Hooks ───────────────────────────────────────

  trackEvent(pageId: string, event: AnalyticsHook["event"], metadata?: Record<string, unknown>): AnalyticsHook {
    const hook: AnalyticsHook = {
      id: crypto.randomUUID(),
      pageId,
      event,
      metadata: metadata ?? {},
      timestamp: new Date().toISOString(),
    };
    this.analyticsLog.push(hook);
    if (this.analyticsLog.length > 10000) {
      this.analyticsLog = this.analyticsLog.slice(-10000);
    }
    return hook;
  }

  getAnalytics(options?: {
    pageId?: string;
    event?: AnalyticsHook["event"];
    since?: string;
    limit?: number;
  }): AnalyticsHook[] {
    let results = [...this.analyticsLog];
    if (options?.pageId) results = results.filter(h => h.pageId === options.pageId);
    if (options?.event) results = results.filter(h => h.event === options.event);
    if (options?.since) {
      const sinceTime = new Date(options.since).getTime();
      results = results.filter(h => new Date(h.timestamp).getTime() >= sinceTime);
    }
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return options?.limit ? results.slice(0, options.limit) : results;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): WebsiteStats {
    const pages = Array.from(this.pages.values());
    const domains = Array.from(this.domains.values());
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalPages: pages.length,
      publishedPages: pages.filter(p => p.status === "published").length,
      draftPages: pages.filter(p => p.status === "draft").length,
      domains: domains.length,
      activeDomains: domains.filter(d => d.sslStatus === "active").length,
      analyticsEventsToday: this.analyticsLog.filter(h => h.timestamp.startsWith(today)).length,
    };
  }

  // ── Private ───────────────────────────────────────────────

  private normalizeSlug(slug: string): string {
    return slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("business-os/website-management", this._serializeState());

  private _serializeState(): Record<string, unknown> {
    return {
      pages: Array.from(this.pages.entries()),
      domains: Array.from(this.domains.entries()),
    };
  }

  hydrateState(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.pages) this.pages = new Map(state.pages as Iterable<[string, never]>) as typeof this.pages;
    if (state.domains) this.domains = new Map(state.domains as Iterable<[string, never]>) as typeof this.domains;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("business-os/website-management");
    if (state) this.hydrateState(state as Record<string, unknown>);
  }
}

export function createWebsiteManager(): WebsiteManager {
  return new WebsiteManager();


}
