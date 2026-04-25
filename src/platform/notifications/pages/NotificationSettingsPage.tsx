import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, MessageSquare, Shield, DollarSign, Calendar, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useActionFn } from "@/hooks/use-action";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

interface NotificationChannel {
  id: string;
  label: string;
  enabled: boolean;
}

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  channels: NotificationChannel[];
  urgency: "low" | "normal" | "high" | "critical";
}

const DEFAULT_CATEGORIES: NotificationCategory[] = [
  {
    id: "approvals", label: "Approvals & Governance", description: "Pending approvals, policy triggers, constitution alerts",
    icon: Shield, urgency: "high",
    channels: [
      { id: "push", label: "Push", enabled: true },
      { id: "email", label: "Email", enabled: true },
      { id: "sms", label: "SMS", enabled: false },
    ],
  },
  {
    id: "financial", label: "Financial Alerts", description: "Payments, invoices, cash flow warnings, budget breaches",
    icon: DollarSign, urgency: "critical",
    channels: [
      { id: "push", label: "Push", enabled: true },
      { id: "email", label: "Email", enabled: true },
      { id: "sms", label: "SMS", enabled: true },
    ],
  },
  {
    id: "calendar", label: "Calendar & Scheduling", description: "Appointments, reminders, booking confirmations",
    icon: Calendar, urgency: "normal",
    channels: [
      { id: "push", label: "Push", enabled: true },
      { id: "email", label: "Email", enabled: false },
      { id: "sms", label: "SMS", enabled: false },
    ],
  },
  {
    id: "system", label: "System Health", description: "Incidents, self-healing, SLA warnings, connector issues",
    icon: AlertTriangle, urgency: "high",
    channels: [
      { id: "push", label: "Push", enabled: true },
      { id: "email", label: "Email", enabled: true },
      { id: "sms", label: "SMS", enabled: false },
    ],
  },
  {
    id: "ai-activity", label: "AI Agent Activity", description: "Agent completions, autonomous actions, trust changes",
    icon: Zap, urgency: "normal",
    channels: [
      { id: "push", label: "Push", enabled: true },
      { id: "email", label: "Email", enabled: false },
      { id: "sms", label: "SMS", enabled: false },
    ],
  },
  {
    id: "communications", label: "Communications", description: "Inbound messages, missed calls, chat mentions",
    icon: MessageSquare, urgency: "normal",
    channels: [
      { id: "push", label: "Push", enabled: true },
      { id: "email", label: "Email", enabled: false },
      { id: "sms", label: "SMS", enabled: false },
    ],
  },
];

const URGENCY_COLORS: Record<string, string> = {
  low: "text-muted-foreground",
  normal: "text-primary",
  high: "text-yellow-400",
  critical: "text-destructive",
};

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [digestFrequency, setDigestFrequency] = useState("realtime");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load preferences from profiles.preferences on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await db.from("profiles")
        .select("preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.preferences) {
        const prefs = data.preferences as Record<string, any>;
        if (prefs.notifCategories) setCategories(prefs.notifCategories);
        if (prefs.quietHoursEnabled != null) setQuietHoursEnabled(prefs.quietHoursEnabled);
        if (prefs.quietStart) setQuietStart(prefs.quietStart);
        if (prefs.quietEnd) setQuietEnd(prefs.quietEnd);
        if (prefs.digestFrequency) setDigestFrequency(prefs.digestFrequency);
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  const toggleChannel = (catId: string, channelId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, channels: cat.channels.map(ch => ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch) }
        : cat
    ));
  };

  const saveNotifPrefs = useActionFn("workspace", "notification.preferences.update", {
    successMessage: "Notification preferences saved",
    errorMessage: "Failed to save preferences",
  });

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Serialize categories without icon functions
      const serializedCategories = categories.map(c => ({
        id: c.id, label: c.label, description: c.description,
        urgency: c.urgency, channels: c.channels,
      }));

      const { data: existing } = await db.from("profiles")
        .select("preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      const merged = {
        ...(existing?.preferences as Record<string, any> || {}),
        notifCategories: JSON.parse(JSON.stringify(serializedCategories)),
        quietHoursEnabled,
        quietStart,
        quietEnd,
        digestFrequency,
      };

      await saveNotifPrefs({
        table: "profiles",
        updates: { preferences: merged },
        userId: user.id,
      });
    } finally {
      setSaving(false);
    }
  }, [user, categories, quietHoursEnabled, quietStart, quietEnd, digestFrequency, saveNotifPrefs]);

  return (
    <PageShell>
    <div className="space-y-6 p-6 max-w-3xl" data-testid="notification-settings-page">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notification Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Control how and when SITA notifies you</p>
        </div>
        <Button onClick={handleSave} size="sm" disabled={saving}>
          {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
          Save Preferences
        </Button>
      </div>

      {/* Global Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Global Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Delivery Mode</Label>
              <p className="text-xs text-muted-foreground">Choose between real-time or digest delivery</p>
            </div>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Quiet Hours</Label>
              <p className="text-xs text-muted-foreground">Suppress non-critical notifications during these hours</p>
            </div>
            <div className="flex items-center gap-3">
              {quietHoursEnabled && (
                <span className="text-xs text-muted-foreground">{quietStart} — {quietEnd}</span>
              )}
              <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Controls */}
      <div className="space-y-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon || Bell;
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center mt-0.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground text-sm">{cat.label}</span>
                        <Badge variant="outline" className={`text-[10px] ${URGENCY_COLORS[cat.urgency]}`}>
                          {cat.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{cat.description}</p>
                      <div className="flex gap-6">
                        {cat.channels.map(ch => (
                          <div key={ch.id} className="flex items-center gap-2">
                            <Switch
                              checked={ch.enabled}
                              onCheckedChange={() => toggleChannel(cat.id, ch.id)}
                              className="scale-75"
                            />
                            <Label className="text-xs text-muted-foreground">{ch.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </PageShell>
  );
}
