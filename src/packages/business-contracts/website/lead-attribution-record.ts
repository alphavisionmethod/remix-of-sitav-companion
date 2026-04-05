// SITA OS — Website: Lead Attribution Record
export interface LeadAttributionRecord {
  leadId: string;
  firstTouchChannel: string;
  lastTouchChannel: string;
  touchpoints: Array<{ channel: string; source: string; medium?: string; campaign?: string; timestamp: string; pageUrl: string }>;
  attributionModel: "first-touch" | "last-touch" | "linear" | "time-decay";
  totalTouchpoints: number;
  daysToConversion: number;
  createdAt: string;
}
