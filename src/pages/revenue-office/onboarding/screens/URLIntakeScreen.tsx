import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Brain, ShoppingCart, Calendar, Target, Users, Megaphone } from "lucide-react";
import { ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";

const urlSlots = [
  { key: "website", label: "Website URL", placeholder: "https://yourbusiness.com", icon: Globe, infers: "Service vs product model, offer structure, CTA strategy" },
  { key: "booking", label: "Booking link", placeholder: "https://calendly.com/you", icon: Calendar, infers: "Booking dependence, appointment flow, scheduling friction" },
  { key: "sales", label: "Sales or landing page", placeholder: "https://yourbusiness.com/offer", icon: Target, infers: "Funnel complexity, trust emphasis, conversion motion" },
  { key: "product", label: "Product / checkout page", placeholder: "https://yourbusiness.com/product", icon: ShoppingCart, infers: "Checkout vs booking motion, pricing patterns, cart structure" },
  { key: "membership", label: "Membership page", placeholder: "https://yourbusiness.com/membership", icon: Users, infers: "Membership tiers, retention model, renewal structure" },
  { key: "social", label: "Social profile", placeholder: "https://instagram.com/you", icon: Megaphone, infers: "Audience engagement, content strategy, lead capture paths" },
];

export default function URLIntakeScreen({ state, setState }: ScreenProps) {
  
  const [urls, setUrls] = useState<Record<string, string>>({});

  const handleChange = (key: string, val: string) => {
    setUrls(p => ({ ...p, [key]: val }));
    const filled = Object.entries({ ...urls, [key]: val }).filter(([, v]) => v.trim()).map(([, v]) => v);
    setState(p => ({ ...p, pastedUrls: filled }));
  };

  const filledCount = Object.values(urls).filter(v => v.trim()).length;

  return (
    <div className="space-y-6">
      
      <ScreenHeader icon={Globe} title="Share your web presence" subtitle="SITA can inspect these to understand your business structure, offers, and funnels" color="text-blue-400" />
      <div className="space-y-3">
        {urlSlots.map(s => (
          <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
            <div className="p-2 rounded-lg bg-muted"><s.icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-0.5">{s.label}</label>
              <input type="url" value={urls[s.key] || ""} onChange={e => handleChange(s.key, e.target.value)}
                placeholder={s.placeholder} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none" />
              {urls[s.key]?.trim() && <p className="text-[9px] text-primary/70 mt-0.5">↳ {s.infers}</p>}
            </div>
          </div>
        ))}
      </div>
      {filledCount > 0 && (
        <Card className="bg-primary/5 border-primary/15">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">SITA will infer from {filledCount} URL{filledCount !== 1 ? "s" : ""}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Service vs product model, booking dependence, funnel structure, lead capture strategy, offer hierarchy, and calls to action.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
