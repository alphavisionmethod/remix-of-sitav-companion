// SITA OS — Website: Publish Request / Result
export interface PublishRequest {
  pageId: string;
  versionId: string;
  requestedBy: string;
  reason?: string;
  scheduledAt?: string;
  requiresApproval: boolean;
  status: "pending" | "approved" | "rejected" | "published";
  createdAt: string;
}
