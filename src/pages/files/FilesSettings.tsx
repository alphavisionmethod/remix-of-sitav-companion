import { SitaPageHeader, SitaCard, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { ConnectorStatusCard, SensitivityBadge } from "@/components/sita/FilesComponents";
import { Settings, Upload, Brain, Shield, Clock, Zap, Eye, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";

const FilesSettings = () => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
    <SitaPageHeader title="Knowledge Settings" subtitle="Configure file processing, privacy defaults, retention, and integrations" />

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <SitaSectionHeader title="Processing Defaults" />
        <SitaCard className="p-4">
          <div className="space-y-4">
            {[
              { label: "Auto-classify uploads", desc: "Automatically infer domain, type, and sensitivity", enabled: true },
              { label: "Auto-extract facts", desc: "Run OCR and entity extraction on all files", enabled: true },
              { label: "Generate workflow suggestions", desc: "Suggest actions based on extracted content", enabled: true },
              { label: "Auto-link to entities", desc: "Connect files to customers, bills, and records", enabled: false },
              { label: "Boardroom auto-attach", desc: "Flag relevant files for boardroom packets", enabled: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
                <div className={`h-5 w-9 rounded-full ${s.enabled ? "bg-primary" : "bg-muted"} relative cursor-pointer transition-colors`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </SitaCard>

        <SitaSectionHeader title="Privacy Defaults" />
        <SitaCard className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Default sensitivity level</p>
              <SensitivityBadge level="internal" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Default retention</p>
              <span className="text-xs text-muted-foreground">7 years</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Memory write permission</p>
              <span className="text-xs text-trust-safe">Allowed (with review)</span>
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

export default FilesSettings;
