import { SitaPageHeader, SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { ConnectorStatusCard, SensitivityBadge } from "@/components/sita/FilesComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { Settings, Upload, Brain, Shield, Clock, Zap, Eye, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useFileSettings } from "@/hooks/use-domain-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertFileSettings } from "@/lib/data-services/files-data-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

interface SettingsState {
  auto_classify: boolean;
  auto_extract: boolean;
  generate_suggestions: boolean;
  auto_link: boolean;
  boardroom_attach: boolean;
  default_sensitivity: string;
  default_retention: string;
  memory_write_permission: string;
}

const defaultSettings: SettingsState = {
  auto_classify: true,
  auto_extract: true,
  generate_suggestions: true,
  auto_link: false,
  boardroom_attach: true,
  default_sensitivity: "internal",
  default_retention: "7 years",
  memory_write_permission: "allowed_with_review",
};

const FilesSettings = () => {
  const { isDemoMode } = useDataMode();
  const { data: savedSettings, isLoading } = useFileSettings();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    if (savedSettings) {
      setSettings({
        auto_classify: (savedSettings as Record<string, unknown>).auto_classify ?? true,
        auto_extract: (savedSettings as Record<string, unknown>).auto_extract ?? true,
        generate_suggestions: (savedSettings as Record<string, unknown>).generate_suggestions ?? true,
        auto_link: (savedSettings as Record<string, unknown>).auto_link ?? false,
        boardroom_attach: (savedSettings as Record<string, unknown>).boardroom_attach ?? true,
        default_sensitivity: (savedSettings as Record<string, unknown>).default_sensitivity ?? "internal",
        default_retention: (savedSettings as Record<string, unknown>).default_retention ?? "7 years",
        memory_write_permission: (savedSettings as Record<string, unknown>).memory_write_permission ?? "allowed_with_review",
      });
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: (newSettings: Partial<SettingsState>) => upsertFileSettings(newSettings),
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["file-settings"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const toggle = (key: keyof SettingsState) => {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    saveMutation.mutate({ [key]: newVal });
  };

  const toggleItems = [
    { key: "auto_classify" as const, label: "Auto-classify uploads", desc: "Automatically infer domain, type, and sensitivity" },
    { key: "auto_extract" as const, label: "Auto-extract facts", desc: "Run OCR and entity extraction on all files" },
    { key: "generate_suggestions" as const, label: "Generate workflow suggestions", desc: "Suggest actions based on extracted content" },
    { key: "auto_link" as const, label: "Auto-link to entities", desc: "Connect files to customers, bills, and records" },
    { key: "boardroom_attach" as const, label: "Boardroom auto-attach", desc: "Flag relevant files for boardroom packets" },
  ];

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Knowledge Settings" subtitle="Configure file processing, privacy defaults, retention, and integrations" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SitaSectionHeader title="Processing Defaults" />
          <SitaCard className="p-4">
            <div className="space-y-4">
              {toggleItems.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(s.key)}
                    className={`h-5 w-9 rounded-full ${settings[s.key] ? "bg-primary" : "bg-muted"} relative cursor-pointer transition-colors`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings[s.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaSectionHeader title="Privacy Defaults" />
          <SitaCard className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Default sensitivity level</p>
                <SensitivityBadge level={settings.default_sensitivity as never} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Default retention</p>
                <span className="text-xs text-muted-foreground">{settings.default_retention}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Memory write permission</p>
                <span className="text-xs text-trust-safe">
                  {settings.memory_write_permission === "allowed_with_review" ? "Allowed (with review)" : settings.memory_write_permission}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Governed mode threshold</p>
                <span className="text-xs text-muted-foreground">Medical, Legal, Identity</span>
              </div>
            </div>
          </SitaCard>
        </div>

        <div className="space-y-4">
          <SitaSectionHeader title="Retention Rules" />
          <SitaCard className="p-4">
            <div className="space-y-3">
              {[
                { type: "Invoices & Receipts", retention: "7 years", icon: Clock },
                { type: "Contracts", retention: "Term + 3 years", icon: Clock },
                { type: "Tax Documents", retention: "10 years", icon: Clock },
                { type: "Governed Documents", retention: "Permanent", icon: Shield },
                { type: "Temporary Uploads", retention: "90 days", icon: Clock },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <r.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm text-foreground">{r.type}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{r.retention}</span>
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaSectionHeader title="Sources & Connectors" />
          <div className="space-y-2">
            <ConnectorStatusCard name="Direct Upload" status="connected" lastSync="Always on" />
            <ConnectorStatusCard name="Email Intake" status="disconnected" />
            <ConnectorStatusCard name="Google Drive" status="disconnected" />
            <ConnectorStatusCard name="Dropbox" status="disconnected" />
            <ConnectorStatusCard name="Bank Statements" status="disconnected" />
            <ConnectorStatusCard name="CRM Export" status="disconnected" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilesSettings;
