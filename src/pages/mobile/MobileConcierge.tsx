import { MobileShell } from "@/components/mobile/MobileShell";
import { Calendar, ShoppingCart, RotateCcw, FileText, ArrowRight, CheckCircle2, Clock } from "lucide-react";

const sections = [
  {
    title: "Today's Schedule",
    icon: Calendar,
    items: [
      { label: "Dentist — Dr. Park", detail: "10:30 AM · Downtown", status: "upcoming" },
      { label: "Grocery pickup", detail: "2:00 PM · Whole Foods", status: "upcoming" },
      { label: "Soccer practice (kids)", detail: "4:30 PM · Field B", status: "upcoming" },
    ],
  },
  {
    title: "Errands",
    icon: ShoppingCart,
    items: [
      { label: "Dry cleaning pickup", detail: "Ready since yesterday", status: "pending" },
      { label: "Pharmacy refill", detail: "Auto-ordered, pickup today", status: "done" },
      { label: "Return Amazon package", detail: "UPS drop-off by Friday", status: "pending" },
    ],
  },
  {
    title: "Recurring Obligations",
    icon: RotateCcw,
    items: [
      { label: "Car insurance renewal", detail: "Due in 5 days", status: "pending" },
      { label: "Quarterly tax filing", detail: "Due Apr 15", status: "pending" },
      { label: "Annual physical exam", detail: "Scheduled May 2", status: "done" },
    ],
  },
];

const MobileConcierge = () => {
  return (
    <MobileShell title="Concierge">
      {sections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.title} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <SectionIcon className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h2>
            </div>
            <div className="space-y-1.5">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border/20 bg-card/50">
                  {item.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </MobileShell>
  );
};

export default MobileConcierge;
