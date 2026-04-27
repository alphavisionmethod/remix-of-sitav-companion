// ═══════════════════════════════════════════════════════════════
// SITA OS — APS24 First Launch Prompt (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Pin, Star, Settings, Layers, ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge } from "@/platform/sita/components/sita/app-platform/AppStoreComponents";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const FirstLaunchPage = () => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const { getApp, pinToDock, setDefaultApp } = useAppPlatform();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState({ pinToDock: true, setDefault: false, addToWorkspace: false });

  const app = getApp(appId || "chrome");

  if (!app) return null;

  const handleFinish = () => {
    if (choices.pinToDock) pinToDock(app.id);
    if (choices.setDefault) {
      const role = app.category === "browsers" ? "browser" : app.category;
      setDefaultApp(role, app.id);
    }
    toast.success(`${app.name} is ready`);
    navigate("/app-store/library");
  };

  const steps = [
    {
      title: `${app.name} is ready`,
      subtitle: "Your app has been installed and integrated into SITA",
      content: (
        <div className="space-y-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 py-6">
            <AppIcon icon={app.icon} iconBg={app.iconBg} size="lg" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{app.name}</h2>
              <p className="text-sm text-muted-foreground">{app.publisher}</p>
              <div className="flex justify-center mt-2"><VerificationBadge level={app.trustLevel} size="md" /></div>
            </div>
          </motion.div>
          <div className="rounded-xl bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/15 p-3 flex items-center gap-2 text-xs text-[hsl(var(--trust-safe))]">
            <Shield className="h-4 w-4" />
            <span>Install receipt created · App is trust-verified</span>
          </div>
        </div>
      ),
    },
    {
      title: "Set up your experience",
      subtitle: "Choose how this app integrates into your SITA environment",
      content: (
        <div className="space-y-3">
          {[
            { key: "pinToDock", label: "Pin to Dock", desc: "Quick launch from the dock bar", icon: Pin },
            { key: "setDefault", label: `Set as default ${app.category === "browsers" ? "browser" : "app"}`, desc: `Use ${app.name} for relevant file types and links`, icon: Star },
            { key: "addToWorkspace", label: "Add to active workspace", desc: "Attach to your current workspace view", icon: Layers },
          ].map(opt => (
            <button key={opt.key} onClick={() => setChoices(p => ({ ...p, [opt.key]: !p[opt.key as keyof typeof p] }))}
              className={cn("w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                choices[opt.key as keyof typeof choices] ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/15")}>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                choices[opt.key as keyof typeof choices] ? "bg-primary/10" : "bg-secondary")}>
                <opt.icon className={cn("h-5 w-5 transition-colors",
                  choices[opt.key as keyof typeof choices] ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </div>
              <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                choices[opt.key as keyof typeof choices] ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                {choices[opt.key as keyof typeof choices] && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "You're all set",
      subtitle: `${app.name} is now part of your SITA environment`,
      content: (
        <div className="text-center py-6 space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
            <CheckCircle2 className="h-16 w-16 text-[hsl(var(--trust-safe))] mx-auto" />
          </motion.div>
          <div>
            <p className="text-lg font-bold text-foreground">{app.name} is ready</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-muted-foreground">
              {choices.pinToDock && <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1"><Pin className="h-3 w-3" /> Pinned to dock</span>}
              {choices.setDefault && <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1"><Star className="h-3 w-3" /> Set as default</span>}
              {choices.addToWorkspace && <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1"><Layers className="h-3 w-3" /> Added to workspace</span>}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
            <Sparkles className="h-3 w-3 text-primary" /> App landed beautifully in your environment
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="mx-auto max-w-lg py-8">
<h1 className="sr-only">First Launch</h1>
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 overflow-hidden">
        {/* Progress */}
        <div className="flex gap-1 p-4 pb-0">
          {steps.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-foreground">{current.title}</h2>
              <p className="text-xs text-muted-foreground mt-1 mb-6">{current.subtitle}</p>
              {current.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0">
          {step === steps.length - 1 ? (
            <>
              <button onClick={() => navigate(`/app-store/app/${app.id}`)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View in Store
              </button>
              <button onClick={handleFinish}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                Open {app.name} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/app-store/library")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Skip
              </button>
              <button onClick={() => setStep(s => s + 1)}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstLaunchPage;
