// SITA OS — Website: Lead Routing Packet
export interface WebsiteLeadRoutingPacket {
  leadId: string;
  source: "form" | "chat" | "booking" | "quote-request" | "phone";
  formId?: string;
  siteId: string;
  routingRules: Array<{ condition: string; assignTo: string; priority: number }>;
  assignedTo: string;
  assignmentReason: string;
  score: number;
  responseTimeTarget: number;
  notificationsSent: string[];
  routedAt: string;
  acknowledgedAt?: string;
}
