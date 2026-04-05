// SITA OS — Website: Onboarding Site Bootstrap Packet
export interface OnboardingSiteBootstrapPacket {
  siteId: string;
  businessName: string;
  industry: string;
  templateSelected: string;
  initialPages: Array<{ slug: string; type: string; title: string }>;
  branding: { primaryColor: string; logoUrl?: string; fontFamily: string };
  contactInfo: { email: string; phone?: string; address?: string };
  socialLinks: Record<string, string>;
  seoInitialized: boolean;
  analyticsConnected: boolean;
  formIds: string[];
  bootstrappedAt: string;
  bootstrappedBy: string;
}
