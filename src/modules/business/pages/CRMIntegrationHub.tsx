import { useState } from "react";
import { motion } from "framer-motion";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { DomainHeader } from "@/platform/sita/components/sita/primitives/DomainHeader";
import {
  Search, Plug, CheckCircle, Clock, ArrowRight, Upload, Star,
  Zap, Globe, MessageSquare, BarChart3, FileSpreadsheet, Share2,
  Github, Linkedin, Instagram, Facebook, Mail
} from "lucide-react";
import CRMConnectModal from "@/modules/business/components/business/CRMConnectModal";
import CRMImportWizard from "@/modules/business/components/business/CRMImportWizard";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";

type Category = "all" | "crm" | "marketing" | "dev" | "communication" | "spreadsheets" | "social";

interface Platform {
  id: string;
  name: string;
  category: Category;
  icon: string;
  description: string;
  authType: "oauth" | "import" | "csv";
  popular?: boolean;
  connected?: boolean;
  lastSynced?: string;
  recordCount?: number;
  color: string;
}

const PLATFORMS: Platform[] = [
  // CRM
  { id: "hubspot", name: "HubSpot", category: "crm", icon: "🟠", description: "Contacts, deals, and pipeline", authType: "oauth", popular: true, color: "hsl(25, 85%, 55%)" },
  { id: "salesforce", name: "Salesforce", category: "crm", icon: "☁️", description: "Enterprise CRM sync", authType: "oauth", popular: true, color: "hsl(210, 90%, 55%)" },
  { id: "zoho", name: "Zoho CRM", category: "crm", icon: "🔴", description: "Leads and accounts", authType: "oauth", color: "hsl(0, 70%, 50%)" },
  { id: "pipedrive", name: "Pipedrive", category: "crm", icon: "🟢", description: "Sales pipeline sync", authType: "oauth", color: "hsl(152, 60%, 45%)" },
  { id: "monday", name: "Monday CRM", category: "crm", icon: "🟡", description: "Boards and contacts", authType: "oauth", color: "hsl(45, 90%, 55%)" },
  { id: "close", name: "Close", category: "crm", icon: "🔵", description: "Leads, calls, and emails", authType: "oauth", color: "hsl(220, 70%, 55%)" },
  // Marketing
  { id: "ghl", name: "GoHighLevel", category: "marketing", icon: "🚀", description: "Funnels, contacts, campaigns", authType: "oauth", popular: true, color: "hsl(265, 55%, 58%)" },
  { id: "mailchimp", name: "Mailchimp", category: "marketing", icon: "🐵", description: "Email lists and subscribers", authType: "oauth", popular: true, color: "hsl(50, 90%, 50%)" },
  { id: "activecampaign", name: "ActiveCampaign", category: "marketing", icon: "⚡", description: "Automations and contacts", authType: "oauth", color: "hsl(210, 85%, 50%)" },
  { id: "convertkit", name: "ConvertKit", category: "marketing", icon: "✉️", description: "Creator email list sync", authType: "oauth", color: "hsl(0, 70%, 55%)" },
  // Dev & Project
  { id: "github", name: "GitHub", category: "dev", icon: "🐙", description: "Issues as leads, repos", authType: "oauth", popular: true, color: "hsl(0, 0%, 20%)" },
  { id: "linear", name: "Linear", category: "dev", icon: "🔷", description: "Project tracking sync", authType: "oauth", color: "hsl(265, 70%, 55%)" },
  { id: "notion", name: "Notion", category: "dev", icon: "📝", description: "Database sync", authType: "oauth", color: "hsl(0, 0%, 15%)" },
  { id: "jira", name: "Jira", category: "dev", icon: "🔹", description: "Issues and sprints", authType: "oauth", color: "hsl(215, 85%, 50%)" },
  // Communication
  { id: "gmail", name: "Gmail", category: "communication", icon: "📧", description: "Email conversations", authType: "oauth", popular: true, color: "hsl(0, 70%, 52%)" },
  { id: "outlook", name: "Outlook", category: "communication", icon: "📬", description: "Emails and calendar", authType: "oauth", color: "hsl(210, 90%, 50%)" },
  { id: "slack", name: "Slack", category: "communication", icon: "💬", description: "Channel messages", authType: "oauth", color: "hsl(330, 60%, 45%)" },
  { id: "whatsapp", name: "WhatsApp Business", category: "communication", icon: "💚", description: "Business messages", authType: "oauth", color: "hsl(140, 65%, 42%)" },
  // Spreadsheets
  { id: "google-sheets", name: "Google Sheets", category: "spreadsheets", icon: "📊", description: "Live sync from sheets", authType: "oauth", popular: true, color: "hsl(140, 60%, 45%)" },
  { id: "excel-online", name: "Excel Online", category: "spreadsheets", icon: "📗", description: "Microsoft Excel sync", authType: "oauth", color: "hsl(140, 55%, 38%)" },
  { id: "csv-upload", name: "CSV / Excel File", category: "spreadsheets", icon: "📄", description: "Import from file", authType: "csv", popular: true, color: "hsl(265, 55%, 58%)" },
  // Social
  { id: "instagram", name: "Instagram", category: "social", icon: "📸", description: "DM leads and followers", authType: "oauth", color: "hsl(330, 70%, 50%)" },
  { id: "facebook", name: "Facebook Leads", category: "social", icon: "👤", description: "Lead form submissions", authType: "oauth", popular: true, color: "hsl(220, 70%, 50%)" },
  { id: "linkedin", name: "LinkedIn", category: "social", icon: "🔗", description: "Connections and leads", authType: "oauth", color: "hsl(210, 80%, 42%)" },
];

// Simulated connected platforms
const CONNECTED: Record<string, { lastSynced: string; recordCount: number }> = {
  "hubspot": { lastSynced: "2 min ago", recordCount: 1243 },
  "gmail": { lastSynced: "15 min ago", recordCount: 89 },
};

const CATEGORY_LABELS: Record<Category, { label: string; icon: React.ReactNode }> = {
  all: { label: "All Platforms", icon: <Globe className="h-3.5 w-3.5" /> },
  crm: { label: "CRM", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  marketing: { label: "Marketing", icon: <Zap className="h-3.5 w-3.5" /> },
  dev: { label: "Dev & Project", icon: <Github className="h-3.5 w-3.5" /> },
  communication: { label: "Communication", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  spreadsheets: { label: "Spreadsheets", icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
  social: { label: "Social", icon: <Share2 className="h-3.5 w-3.5" /> },
};

const CRMIntegrationHub = () => {
  const { primaryMode, adaptations } = useBusinessProfile();
  const contactLabel = adaptations.crm?.language?.contactLabel || "Contact";
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null);
  const [showImport, setShowImport] = useState(false);

  const filtered = PLATFORMS
    .filter(p => category === "all" || p.category === category)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  const connected = PLATFORMS.filter(p => CONNECTED[p.id]);
  const connectedCount = connected.length;

  const handleConnect = (platform: Platform) => {
    if (platform.authType === "csv") {
      setShowImport(true);
    } else {
      setConnectPlatform(platform);
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
              <Plug className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Connect Your World</h1>
              <p className="text-sm text-muted-foreground">One click. Zero API keys. Instant sync.</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 rounded-lg bg-card/60 border border-border px-3 py-2">
              <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
              <span className="text-sm font-medium text-foreground">{connectedCount} Connected</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/60 border border-border px-3 py-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{PLATFORMS.length} Available</span>
            </div>
            <SitaButton variant="primary" size="sm" onClick={() => setShowImport(true)}>
              <Upload className="h-3.5 w-3.5" /> Import CSV/Excel
            </SitaButton>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      {connectedCount > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> Connected Platforms
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map(p => {
              const info = CONNECTED[p.id];
              return (
                <SitaCard key={p.id} className="p-4" hover>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] px-2 py-0.5 text-[10px] font-medium border border-[hsl(var(--trust-safe))]/20">
                          <CheckCircle className="h-2.5 w-2.5" /> Live
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {info.lastSynced} · {info.recordCount.toLocaleString()} records
                      </p>
                    </div>
                  </div>
                </SitaCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                category === cat
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat].icon}
              {CATEGORY_LABELS[cat].label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search platforms..."
            className="w-full rounded-xl border border-border bg-secondary/40 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => {
          const isConnected = !!CONNECTED[p.id];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
            >
              <SitaCard
                className="p-4 group cursor-pointer"
                hover
                onClick={() => !isConnected && handleConnect(p)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl shrink-0"
                    style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      {p.popular && (
                        <Star className="h-3 w-3 text-[hsl(var(--sita-gold))] fill-[hsl(var(--sita-gold))]" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                  </div>
                  <div className="shrink-0">
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--trust-safe))]">
                        <CheckCircle className="h-3.5 w-3.5" /> Connected
                      </span>
                    ) : (
                      <SitaButton
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); handleConnect(p); }}
                      >
                        Connect
                      </SitaButton>
                    )}
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={Search} title="No platforms found" description="Try a different search term or category" />
      )}

      {/* Modals */}
      {connectPlatform && (
        <CRMConnectModal
          platform={connectPlatform}
          onClose={() => setConnectPlatform(null)}
        />
      )}

      {showImport && (
        <CRMImportWizard onClose={() => setShowImport(false)} />
      )}
    </motion.div>
  );
};

export default CRMIntegrationHub;
