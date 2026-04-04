// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Language, Region & Identity
// Premium locale configuration with live preview
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Clock, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onNext: (data: { language: string; region: string; timezone: string; dateFormat: string; currency: string }) => void;
  onBack: () => void;
  step: number;
  total: number;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

const REGIONS = [
  { code: "US", label: "United States", tz: "America/New_York", date: "MM/DD/YYYY", currency: "USD" },
  { code: "GB", label: "United Kingdom", tz: "Europe/London", date: "DD/MM/YYYY", currency: "GBP" },
  { code: "EU", label: "European Union", tz: "Europe/Berlin", date: "DD.MM.YYYY", currency: "EUR" },
  { code: "AE", label: "United Arab Emirates", tz: "Asia/Dubai", date: "DD/MM/YYYY", currency: "AED" },
  { code: "SG", label: "Singapore", tz: "Asia/Singapore", date: "DD/MM/YYYY", currency: "SGD" },
  { code: "AU", label: "Australia", tz: "Australia/Sydney", date: "DD/MM/YYYY", currency: "AUD" },
  { code: "JP", label: "Japan", tz: "Asia/Tokyo", date: "YYYY/MM/DD", currency: "JPY" },
  { code: "CA", label: "Canada", tz: "America/Toronto", date: "YYYY-MM-DD", currency: "CAD" },
];

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function SetupLanguageRegion({ onNext, onBack, step, total }: Props) {
  const [language, setLanguage] = useState("en");
  const [regionCode, setRegionCode] = useState("US");

  const region = REGIONS.find(r => r.code === regionCode) || REGIONS[0];

  const livePreview = useMemo(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { timeZone: region.tz, hour: "2-digit", minute: "2-digit" });
    const dateStr = region.date
      .replace("YYYY", String(now.getFullYear()))
      .replace("MM", String(now.getMonth() + 1).padStart(2, "0"))
      .replace("DD", String(now.getDate()).padStart(2, "0"));
    const currSymbol = { USD: "$", GBP: "£", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$", JPY: "¥", CAD: "C$" }[region.currency] || region.currency;
    return { time: timeStr, date: dateStr, currency: `${currSymbol}1,234.56`, tz: region.tz.replace("_", " ") };
  }, [region]);

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Left — Controls */}
      <div className="flex-1 min-w-0">
        <StepBar step={step} total={total} />
        <motion.h2 {...fadeIn} transition={{ delay: 0.1 }} className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
          Let's make this yours
        </motion.h2>
        <motion.p {...fadeIn} transition={{ delay: 0.15 }} className="text-sm text-muted-foreground mb-8">
          Choose the language, region, and system preferences SITA should use from the start.
        </motion.p>

        <div className="space-y-6">
          {/* Language */}
          <FieldGroup icon={Globe} label="Language">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    language === l.code
                      ? "border-primary/50 bg-primary/8 text-foreground"
                      : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground"
                  )}>
                  {l.label}
                </button>
              ))}
            </div>
          </FieldGroup>

          {/* Region */}
          <FieldGroup icon={Globe} label="Region">
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map(r => (
                <button key={r.code} onClick={() => setRegionCode(r.code)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200",
                    regionCode === r.code
                      ? "border-primary/50 bg-primary/8 text-foreground font-medium"
                      : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground"
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        <div className="flex items-center justify-between pt-8">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
          <button
            onClick={() => onNext({ language, region: regionCode, timezone: region.tz, dateFormat: region.date, currency: region.currency })}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right — Live Preview */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="lg:w-72 shrink-0">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 space-y-5" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
          <PreviewRow icon={Clock} label="Time" value={livePreview.time} />
          <PreviewRow icon={Calendar} label="Date" value={livePreview.date} />
          <PreviewRow icon={DollarSign} label="Currency" value={livePreview.currency} />
          <PreviewRow icon={Globe} label="Timezone" value={livePreview.tz} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function FieldGroup({ icon: Icon, label, children }: { icon: typeof Globe; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

function PreviewRow({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
          i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
      ))}
    </div>
  );
}
