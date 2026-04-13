import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SitaButton } from "@/components/sita/SitaCard";
import { CheckCircle, Shield, Loader2, ArrowRight, Database, Mail, FileText, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  authType: "oauth" | "import" | "csv";
  color: string;
}

interface Props {
  platform: Platform;
  onClose: () => void;
}

const DATA_TYPES = [
  { icon: Users, label: "Contacts & Leads", desc: "Names, emails, phones, companies" },
  { icon: FileText, label: "Deals & Pipeline", desc: "Opportunities, stages, values" },
  { icon: Mail, label: "Email History", desc: "Conversations and threads" },
  { icon: Database, label: "Notes & Activities", desc: "Call logs, meeting notes" },
];

type Step = "overview" | "authorizing" | "syncing" | "done";

const CRMConnectModal = ({ platform, onClose }: Props) => {
  const [step, setStep] = useState<Step>("overview");

  const handleAuthorize = async () => {
    setStep("authorizing");
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 2000));
    setStep("syncing");
    await new Promise(r => setTimeout(r, 3000));
    setStep("done");
    toast.success(`${platform.name} connected successfully!`);
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{platform.icon}</span>
            Connect {platform.name}
          </DialogTitle>
          <DialogDescription>{platform.description}</DialogDescription>
        </DialogHeader>

        {step === "overview" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary/40 border border-border p-4">
              <p className="text-xs font-semibold text-foreground mb-3">What we'll sync</p>
              <div className="space-y-2.5">
                {DATA_TYPES.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/15 px-3 py-2">
              <Shield className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Secure connection</span> — We never store your password. Uses OAuth authorization.
              </p>
            </div>

            <SitaButton variant="primary" className="w-full" onClick={handleAuthorize}>
              <ArrowRight className="h-4 w-4" /> Authorize {platform.name}
            </SitaButton>
          </div>
        )}

        {step === "authorizing" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Connecting to {platform.name}...</p>
              <p className="text-xs text-muted-foreground mt-1">Please complete authorization in the popup window</p>
            </div>
          </div>
        )}

        {step === "syncing" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Database className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Syncing your data...</p>
              <p className="text-xs text-muted-foreground mt-1">Importing contacts, deals, and activities</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--trust-safe))]/10 border border-[hsl(var(--trust-safe))]/20">
                <CheckCircle className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
              </div>
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{platform.name} Connected!</p>
              <p className="text-xs text-muted-foreground mt-1">Your data is now syncing automatically</p>
            </div>
            <SitaButton variant="primary" onClick={onClose}>Done</SitaButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CRMConnectModal;
