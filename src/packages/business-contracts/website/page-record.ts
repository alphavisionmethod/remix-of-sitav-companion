// SITA OS — Website: Page Record
export type PageType = "landing" | "about" | "services" | "contact" | "blog" | "portfolio" | "pricing" | "custom";
export interface PageRecord {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  type: PageType;
  sections: Array<{ id: string; type: string; content: Record<string, unknown>; order: number }>;
  seo: { title: string; description: string; canonical?: string; noIndex?: boolean };
  status: "draft" | "published" | "archived";
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
}
