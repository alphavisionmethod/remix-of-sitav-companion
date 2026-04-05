// SITA OS — Website: Publish Result
export interface PublishResult {
  requestId: string;
  pageId: string;
  versionId: string;
  publishedUrl: string;
  publishedAt: string;
  publishedBy: string;
  cdnPurged: boolean;
  sitemapUpdated: boolean;
  success: boolean;
  error?: string;
}
