// SITA OS — Website: Site Record
export type SiteStatus = "draft" | "published" | "maintenance" | "archived";
export interface SiteRecord {
  id: string;
  domain: string;
  subdomain?: string;
  name: string;
  description?: string;
  status: SiteStatus;
  templateId?: string;
  theme: { primaryColor: string; fontFamily: string; logoUrl?: string };
  seoDefaults: { title: string; description: string; ogImage?: string };
  analyticsId?: string;
  sslEnabled: boolean;
  pages: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
