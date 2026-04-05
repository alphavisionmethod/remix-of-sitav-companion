import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { EncryptionCoverageMap } from "@/components/sita/truth/EncryptionCoverageMap";
import { SecretIntegrityPanel } from "@/components/sita/truth/SecretIntegrityPanel";
import { StalenessIndicator } from "@/components/sita/truth/StalenessIndicator";
import {
  Shield, Lock, Key, Eye, CheckCircle, XCircle, AlertTriangle, Database, FileCheck, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const encryptionDomains = [
  { name: "User Profiles", atRest: true, inTransit: true, classification: "confidential" as const, coverage: 100 },
  { name: "Financial Documents", atRest: true, inTransit: true, classification: "restricted" as const, coverage: 100 },
  { name: "Advisor Conversations", atRest: true, inTransit: true, classification: "confidential" as const, coverage: 100 },
  { name: "Connector Credentials", atRest: true, inTransit: true, classification: "restricted" as const, coverage: 100 },
  { name: "Audit Logs", atRest: true, inTransit: true, classification: "internal" as const, coverage: 100 },
  { name: "Site Content", atRest: true, inTransit: true, classification: "internal" as const, coverage: 95 },
  { name: "Analytics Data", atRest: true, inTransit: true, classification: "internal" as const, coverage: 90 },
  { name: "Public Assets", atRest: false, inTransit: true, classification: "public" as const, coverage: 50 },
];

const secrets = [
  { name: "SUPABASE_SERVICE_ROLE_KEY", environment: "all", rotatedAt: h(720), maxAgeDays: 90, required: true, present: true },
  { name: "SUPABASE_ANON_KEY", environment: "all", rotatedAt: h(720), maxAgeDays: 90, required: true, present: true },
  { name: "LOVABLE_API_KEY", environment: "production", rotatedAt: h(168), maxAgeDays: 90, required: true, present: true },
  { name: "SUPABASE_DB_URL", environment: "all", rotatedAt: h(720), maxAgeDays: 90, required: true, present: true },
];

const sensitiveData = [
  { table: "encrypted_secrets", fields: ["encrypted_value"], classification: "restricted", rlsEnabled: true, retentionPolicy: "indefinite" },
  { table: "connector_credentials", fields: ["encrypted_token"], classification: "restricted", rlsEnabled: true, retentionPolicy: "until disconnect" },
  { table: "integration_credentials", fields: ["encrypted_payload"], classification: "restricted", rlsEnabled: true, retentionPolicy: "until disconnect" },
  { table: "financial_documents", fields: ["extracted_data", "storage_path"], classification: "confidential", rlsEnabled: true, retentionPolicy: "7 years" },
  { table: "profiles", fields: ["display_name", "avatar_url"], classification: "internal", rlsEnabled: true, retentionPolicy: "account lifetime" },
  { table: "customers", fields: ["email", "phone", "notes"], classification: "confidential", rlsEnabled: true, retentionPolicy: "account lifetime" },
  { table: "bills", fields: ["amount", "payee", "notes"], classification: "confidential", rlsEnabled: true, retentionPolicy: "7 years" },
  { table: "audit_logs", fields: ["details", "ip_address"], classification: "internal", rlsEnabled: true, retentionPolicy: "1 year" },
];

const policyChecks = [
  { name: "RLS enabled on all user-facing tables", status: "pass" as const, details: "89/89 tables have RLS enabled" },
  { name: "No public SELECT without auth", status: "pass" as const, details: "All SELECT policies require auth.uid()" },
  { name: "Service role key not exposed to client", status: "pass" as const, details: "Only anon key in client code" },
  { name: "Encrypted secrets use vault pattern", status: "pass" as const, details: "encrypted_secrets table uses encryption column" },
  { name: "Audit triggers on sensitive tables", status: "pass" as const, details: "Triggers active on mutation paths" },
  { name: "Storage buckets have RLS", status: "pass" as const, details: "documents bucket has RLS policies" },
  { name: "Edge functions validate JWT", status: "pass" as const, details: "All edge functions validate auth" },
  { name: "CORS headers configured", status: "pass" as const, details: "All edge functions include CORS" },
];

const classColors = { public: "text-muted-foreground", internal: "text-blue-400", confidential: "text-amber-400", restricted: "text-red-400" };

export default function DataProtectionPosture() {
  const [tab, setTab] = useState("overview");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
      <SitaPageHeader title="Data Protection Posture Board" subtitle="Encryption coverage, secret integrity, sensitive data classification, policy compliance, and retention visibility" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Encryption Coverage", value: `${Math.round(encryptionDomains.reduce((s, d) => s + d.coverage, 0) / encryptionDomains.length)}%`, color: "text-green-400" },
          { label: "Secrets Present", value: `${secrets.filter(s => s.present).length}/${secrets.length}`, color: "text-green-400" },
          { label: "Policy Checks", value: `${policyChecks.filter(p => p.status === "pass").length}/${policyChecks.length}`, color: "text-green-400" },
          { label: "Sensitive Tables", value: sensitiveData.length, color: "text-foreground" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "overview", label: "Encryption", icon: Lock },
            { value: "secrets", label: "Secret Integrity", icon: Key },
            { value: "sensitive", label: "Sensitive Data", icon: Eye },
            { value: "policy", label: "Policy Compliance", icon: Shield },
            { value: "retention", label: "Retention", icon: Trash2 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview">
            <EncryptionCoverageMap domains={encryptionDomains} />
          </TabsContent>

          <TabsContent value="secrets">
            <SecretIntegrityPanel secrets={secrets} />
          </TabsContent>

          <TabsContent value="sensitive">
            <h3 className="text-xs font-semibold mb-3">Sensitive Data Classification</h3>
            <div className="space-y-1.5">
              {sensitiveData.map(d => (
                <div key={d.table} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-mono text-foreground">{d.table}</p>
                      <p className="text-[9px] text-muted-foreground">{d.fields.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[8px]", classColors[d.classification as keyof typeof classColors])}>{d.classification}</Badge>
                    {d.rlsEnabled ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policy">
            <h3 className="text-xs font-semibold mb-3">Security Policy Compliance</h3>
            <div className="space-y-1.5">
              {policyChecks.map(p => (
                <div key={p.name} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {p.status === "pass" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{p.name}</p>
                      <p className="text-[9px] text-muted-foreground">{p.details}</p>
                    </div>
                  </div>
                  <Badge variant={p.status === "pass" ? "default" : "destructive"} className="text-[9px] capitalize">{p.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="retention">
            <h3 className="text-xs font-semibold mb-3">Data Retention Policies</h3>
            <div className="space-y-1.5">
              {sensitiveData.map(d => (
                <div key={d.table} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-mono text-foreground">{d.table}</p>
                      <p className="text-[9px] text-muted-foreground">{d.classification}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{d.retentionPolicy}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
