import { Globe, Mail, Calendar, DollarSign, ShoppingCart, GraduationCap, FileText, MessageSquare, Star, BarChart3, Megaphone, Phone, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";

const systems = [
  { id: "hubspot", label: "HubSpot", icon: Globe, cat: "CRM", unlocks: "Pipeline sync, contact import, deal stages" },
  { id: "activecampaign", label: "ActiveCampaign", icon: Mail, cat: "Email", unlocks: "Email sequences, automations, lead scoring" },
  { id: "keap", label: "Keap", icon: Globe, cat: "CRM", unlocks: "Contact management, pipeline, appointment scheduling" },
  { id: "mailchimp", label: "Mailchimp", icon: Mail, cat: "Email", unlocks: "List sync, campaign analytics, audience segments" },
  { id: "gmail", label: "Gmail / Outlook", icon: Mail, cat: "Email", unlocks: "Email tracking, thread context, response drafting" },
  { id: "google_calendar", label: "Google Calendar", icon: Calendar, cat: "Calendar", unlocks: "Availability sync, booking confirmation, prep briefs" },
  { id: "calendly", label: "Calendly / booking", icon: Calendar, cat: "Booking", unlocks: "Booking flow, no-show tracking, pre-call automation" },
  { id: "stripe", label: "Stripe / payments", icon: DollarSign, cat: "Payments", unlocks: "Revenue tracking, payment reminders, MRR analytics" },
  { id: "shopify", label: "Shopify / store", icon: ShoppingCart, cat: "Ecommerce", unlocks: "Order sync, cart recovery, product performance" },
  { id: "wordpress", label: "WordPress / website", icon: Globe, cat: "Website", unlocks: "Form capture, traffic analytics, page performance" },
  { id: "notion", label: "Notion / docs", icon: FileText, cat: "Docs", unlocks: "SOP sync, knowledge base, project tracking" },
  { id: "sheets", label: "Google Sheets / Excel", icon: BarChart3, cat: "Data", unlocks: "Data import, report sync, custom dashboards" },
  { id: "slack", label: "Slack / Teams", icon: MessageSquare, cat: "Comms", unlocks: "Notifications, deal alerts, team escalations" },
  { id: "social", label: "Social media", icon: Megaphone, cat: "Social", unlocks: "Post scheduling, engagement tracking, lead capture" },
  { id: "review_platform", label: "Review platform", icon: Star, cat: "Reputation", unlocks: "Review monitoring, response drafts, reputation score" },
  { id: "course_platform", label: "Course / LMS", icon: GraduationCap, cat: "Education", unlocks: "Enrollment sync, completion tracking, engagement" },
  { id: "twilio", label: "Twilio / SMS", icon: Phone, cat: "Comms", unlocks: "SMS automation, appointment reminders, rescue messages" },
];

export default function ConnectionsScreen({ state, setState }: ScreenProps) {
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, connectedSystems: p.connectedSystems.includes(v) ? p.connectedSystems.filter(x => x !== v) : [...p.connectedSystems, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      <ScreenHeader icon={Globe} title="Connect live systems" subtitle="Select the tools you use — connection setup happens after formation" color="text-blue-400" />
      <div className="grid md:grid-cols-2 gap-2">
        {systems.map(s => (
          <Toggle
            key={s.id}
            label={s.label}
            desc={state.connectedSystems.includes(s.id) ? s.unlocks : s.cat}
            icon={s.icon}
            selected={state.connectedSystems.includes(s.id)}
            onToggle={() => toggle(s.id)}
            badge={state.connectedSystems.includes(s.id) ? "Unlocks" : undefined}
          />
        ))}
      </div>
      {state.connectedSystems.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">{state.connectedSystems.length} system{state.connectedSystems.length !== 1 ? "s" : ""} selected</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Connection setup will happen after formation. SITA will request only the permissions needed and show exactly what each connection unlocks.</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {state.connectedSystems.map(id => {
              const sys = systems.find(s => s.id === id);
              return sys ? <Badge key={id} className="bg-primary/10 text-primary text-[8px]">{sys.label}</Badge> : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
