// SITA OS — Website: Page Version
export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  content: Record<string, unknown>;
  publishedAt?: string;
  publishedBy?: string;
  changelog?: string;
  snapshotHash: string;
  createdAt: string;
}
