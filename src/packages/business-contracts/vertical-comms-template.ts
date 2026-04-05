// SITA OS — Business Contracts: Vertical Communication Templates
export interface VerticalCommsTemplate {
  id: string;
  verticalId: string;
  name: string;
  channel: "email" | "sms" | "phone-script" | "in-app" | "letter";
  purpose: string;
  subject?: string;
  bodyTemplate: string;
  variables: string[];
  tone: "formal" | "friendly" | "urgent" | "empathetic";
  language: string;
  version: number;
  active: boolean;
  performanceStats: { sent: number; opened: number; clicked: number; replied: number; converted: number };
  createdAt: string;
  updatedAt: string;
}
