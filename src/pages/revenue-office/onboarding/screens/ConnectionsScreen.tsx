import { Globe, Mail, Calendar, DollarSign, ShoppingCart, GraduationCap, FileText, MessageSquare, Star, BarChart3, Megaphone, Phone } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const systems = [
  { id: "hubspot", label: "HubSpot", icon: Globe, cat: "CRM" },
  { id: "activecampaign", label: "ActiveCampaign", icon: Mail, cat: "Email" },
  { id: "keap", label: "Keap", icon: Globe, cat: "CRM" },
  { id: "mailchimp", label: "Mailchimp", icon: Mail, cat: "Email" },
  { id: "gmail", label: "Gmail / Outlook", icon: Mail, cat: "Email" },
  { id: "google_calendar", label: "Google Calendar", icon: Calendar, cat: "Calendar" },
  { id: "calendly", label: "Calendly / booking", icon: Calendar, cat: "Booking" },
  { id: "stripe", label: "Stripe / payments", icon: DollarSign, cat: "Payments" },
  { id: "shopify", label: "Shopify / store", icon: ShoppingCart, cat: "Ecommerce" },
  { id: "wordpress", label: "WordPress / website", icon: Globe, cat: "Website" },
  { id: "notion", label: "Notion / docs", icon: FileText, cat: "Docs" },
  { id: "sheets", label: "Google Sheets / Excel", icon: BarChart3, cat: "Data" },
  { id: "slack", label: "Slack / Teams", icon: MessageSquare, cat: "Comms" },
  { id: "social", label: "Social media", icon: Megaphone, cat: "Social" },
  { id: "review_platform", label: "Review platform", icon: Star, cat: "Reputation" },
  { id: "course_platform", label: "Course / LMS", icon: GraduationCap, cat: "Education" },
  { id: "twilio", label: "Twilio / SMS", icon: Phone, cat: "Comms" },
];

export default function ConnectionsScreen({ state, setState }: ScreenProps) {
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, connectedSystems: p.connectedSystems.includes(v) ? p.connectedSystems.filter(x => x !== v) : [...p.connectedSystems, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      <DemoModeBadge />
      <ScreenHeader icon={Globe} title="Connect live systems" subtitle="Select the tools you use — connection setup happens after formation" color="text-blue-400" />
      <div className="grid md:grid-cols-2 gap-2">
        {systems.map(s => <Toggle key={s.id} label={s.label} desc={s.cat} icon={s.icon} selected={state.connectedSystems.includes(s.id)} onToggle={() => toggle(s.id)} />)}
      </div>
    </div>
  );
}
