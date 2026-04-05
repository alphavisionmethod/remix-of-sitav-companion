// SITA OS — Website Management (merge: business-os)
export interface ManagedWebsite { id: string; domain: string; status: 'active' | 'maintenance' | 'offline'; pages: WebPage[]; analytics: { visitors: number; pageViews: number }; updatedAt: string; }
export interface WebPage { path: string; title: string; status: 'published' | 'draft'; lastModified: string; }
export class WebsiteManagementService {
  private sites: Map<string, ManagedWebsite> = new Map();
  register(site: ManagedWebsite): void { this.sites.set(site.id, site); }
  getSite(id: string): ManagedWebsite | undefined { return this.sites.get(id); }
  listSites(): ManagedWebsite[] { return [...this.sites.values()]; }
  addPage(siteId: string, page: WebPage): void { const s = this.sites.get(siteId); if (s) s.pages.push(page); }
  setStatus(siteId: string, status: ManagedWebsite['status']): void { const s = this.sites.get(siteId); if (s) { s.status = status; s.updatedAt = new Date().toISOString(); } }
  getPublishedPages(siteId: string): WebPage[] { return this.sites.get(siteId)?.pages.filter(p => p.status === 'published') ?? []; }
}
export const createWebsiteManagement = () => new WebsiteManagementService();
