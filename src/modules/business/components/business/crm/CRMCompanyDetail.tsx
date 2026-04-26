// SITA OS — CRM Company Detail Panel (Full)
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  X, Building2, Globe, MapPin, Phone, Heart, DollarSign, Users,
  TrendingUp, FileText, Plus, ChevronRight, Sparkles, Tag, Mail,
  Shield, Receipt, Handshake, HeadphonesIcon, Link2, Unlink,
  Banknote, FolderOpen, CalendarClock
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useCRMContacts, useCRMOpportunities, useCRMCommunications, useCRMNotes, useCRMContactCompanyLinks, useCreateContactCompanyLink, useDeleteContactCompanyLink } from "@/hooks/use-crm-data";
import type { CRMCompany } from "@/data/repositories/crm-data-service";
import { CRMEscalateToBoardroom } from "./CRMEscalateToBoardroom";
import { InlineAdvisorInsights, generateCompanyInsights } from "./CRMAdvisorInsight";
import { CRMFinanceLinkage } from "./CRMFinanceLinkage";
import { CRMFilesLinkage } from "./CRMFilesLinkage";
import { CRMConciergeLinkage } from "./CRMConciergeLinkage";
import { AppointmentLineagePanel } from "../shared/AppointmentLineagePanel";
import { CRMProofTrail } from "./CRMProofTrail";
import { CRMOwnership } from "./CRMOwnership";

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";
const healthLabel = (s: number) => s >= 80 ? "Healthy" : s >= 60 ? "Warming" : s >= 40 ? "Drifting" : "At Risk";

interface CRMCompanyDetailProps {
  company: CRMCompany;
  onClose: () => void;
  onSelectContact?: (contactId: string) => void;
}

export function CRMCompanyDetail({ company, onClose, onSelectContact }: CRMCompanyDetailProps) {
  const { data: allContacts = [] } = useCRMContacts();
  const { data: allOpps = [] } = useCRMOpportunities();
  const { data: allComms = [] } = useCRMCommunications();
  const { data: allNotes = [] } = useCRMNotes();
  const { data: allLinks = [] } = useCRMContactCompanyLinks();
  const createLink = useCreateContactCompanyLink();
  const deleteLink = useDeleteContactCompanyLink();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEscalation, setShowEscalation] = useState(false);
  const [showLinkContact, setShowLinkContact] = useState(false);

  // Use junction table for contacts
  const linkedContactIds = useMemo(() => new Set(
    (allLinks as any[]).filter((l: any) => l.company_id === company.id).map((l: any) => l.contact_id as string)
  ), [allLinks, company.id]);
  const contacts = useMemo(() => allContacts.filter(c => linkedContactIds.has(c.id)), [allContacts, linkedContactIds]);
  const unlinkedContacts = useMemo(() => allContacts.filter(c => !linkedContactIds.has(c.id)), [allContacts, linkedContactIds]);

  const opps = useMemo(() => allOpps.filter(o => o.company_id === company.id), [allOpps, company.id]);
  const comms = useMemo(() => allComms.filter(c => c.company_id === company.id), [allComms, company.id]);
  const notes = useMemo(() => allNotes.filter(n => n.company_id === company.id), [allNotes, company.id]);

  const health = company.health_score ?? 50;
  const totalPipelineValue = opps.filter(o => o.status === "open").reduce((s, o) => s + (o.value || 0), 0);

  const handleLinkContact = async (contactId: string) => {
    try {
      await createLink.mutateAsync({ contact_id: contactId, company_id: company.id } as any);
      toast.success("Contact linked");
      setShowLinkContact(false);
    } catch { toast.error("Failed to link contact"); }
  };

  const handleUnlinkContact = async (contactId: string) => {
    const link = (allLinks as any[]).find((l: any) => l.company_id === company.id && l.contact_id === contactId);
    if (!link) return;
    try {
      await deleteLink.mutateAsync(link.id);
      toast.success("Contact unlinked");
    } catch { toast.error("Failed to unlink"); }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 p-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">{company.name}</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {company.industry && (
              <p className="text-sm text-muted-foreground">{company.industry} {company.size ? `· ${company.size} employees` : ""}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${healthColor(health)} bg-muted/30`}>
                <Heart className="h-3 w-3 inline mr-1" />{health} — {healthLabel(health)}
              </span>
              {company.annual_revenue && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted/30 text-muted-foreground">
                  <DollarSign className="h-3 w-3 inline mr-0.5" />${(company.annual_revenue / 1e6).toFixed(1)}M revenue
                </span>
              )}
              {company.tags?.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  <Tag className="h-2.5 w-2.5 inline mr-0.5" />{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowEscalation(true)}>
            <Shield className="h-3 w-3" /> Escalate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex-shrink-0 mx-4 mt-3 bg-muted/30 flex-wrap h-auto gap-0.5 py-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs">People ({contacts.length})</TabsTrigger>
          <TabsTrigger value="deals" className="text-xs">Deals ({opps.length})</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity ({comms.length})</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs flex items-center gap-1"><Banknote className="h-3 w-3" />Finance</TabsTrigger>
          <TabsTrigger value="files" className="text-xs flex items-center gap-1"><FolderOpen className="h-3 w-3" />Files</TabsTrigger>
          <TabsTrigger value="concierge" className="text-xs flex items-center gap-1"><CalendarClock className="h-3 w-3" />Concierge</TabsTrigger>
          <TabsTrigger value="proof" className="text-xs flex items-center gap-1"><Shield className="h-3 w-3" />Proof</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {company.domain && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="h-3.5 w-3.5 shrink-0" />{company.domain}</div>}
                  {company.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" />{company.phone}</div>}
                  {(company.city || company.state || company.country) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {company.owner && <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-3.5 w-3.5 shrink-0" />Owner: {company.owner}</div>}
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xl font-bold text-foreground">{contacts.length}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xl font-bold text-foreground">{opps.filter(o => o.status === "open").length}</p>
                  <p className="text-xs text-muted-foreground">Open Deals</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xl font-bold text-foreground">${(totalPipelineValue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Pipeline</p>
                </div>
              </div>

              <InlineAdvisorInsights
                insights={generateCompanyInsights(company, contacts.length, totalPipelineValue, comms.length)}
                maxInsights={3}
              />
            </TabsContent>

            <TabsContent value="contacts" className="mt-0 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">People at {company.name}</h3>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowLinkContact(!showLinkContact)}>
                  <Plus className="h-3 w-3" /> Link
                </Button>
              </div>

              {showLinkContact && unlinkedContacts.length > 0 && (
                <Card className="border-primary/20 bg-primary/5 mb-3">
                  <CardContent className="p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground mb-2">Link a contact to {company.name}</p>
                    {unlinkedContacts.slice(0, 5).map(c => (
                      <button key={c.id} onClick={() => handleLinkContact(c.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors text-left">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {c.first_name?.[0]}{c.last_name?.[0]}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-foreground">{c.first_name} {c.last_name}</span>
                          {c.email && <span className="text-muted-foreground ml-1.5">{c.email}</span>}
                        </div>
                        <Link2 className="h-3 w-3 text-primary ml-auto" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No contacts linked to this company</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Use the Link button above to connect contacts</p>
                </div>
              ) : contacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectContact?.(c.id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-muted-foreground">{c.title || c.email || ""}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleUnlinkContact(c.id)}>
                    <Unlink className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="deals" className="mt-0 space-y-2">
              {opps.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No deals linked</p>
                </div>
              ) : opps.map(o => (
                <Card key={o.id} className="border-border/50 bg-card/50">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-foreground">{o.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">${o.value?.toLocaleString()}</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{o.stage}</span>
                      <span>{o.probability}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-2">
              {comms.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity recorded</p>
                </div>
              ) : comms.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    {c.comm_type === "email" ? <Mail className="h-3.5 w-3.5" /> : c.comm_type === "call" ? <Phone className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.subject || c.comm_type}</p>
                    {c.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.content}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(c.occurred_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Finance Linkage */}
            <TabsContent value="finance" className="mt-0">
              <div className="space-y-4">
                <CRMFinanceLinkage
                  entityType="company"
                  entityId={company.id}
                  entityName={company.name}
                  healthScore={health}
                />
                <AppointmentLineagePanel
                  scope="company"
                  entityId={company.id}
                  entityLabel={company.name}
                />
              </div>
            </TabsContent>

            {/* Files Linkage */}
            <TabsContent value="files" className="mt-0">
              <CRMFilesLinkage
                entityType="company"
                entityId={company.id}
                entityName={company.name}
              />
            </TabsContent>

            {/* Concierge Linkage */}
            <TabsContent value="concierge" className="mt-0">
              <CRMConciergeLinkage
                entityType="company"
                entityId={company.id}
                entityName={company.name}
              />
            </TabsContent>

            {/* Proof Trail + Ownership */}
            <TabsContent value="proof" className="mt-0 space-y-4">
              <CRMOwnership
                entityType="company"
                entityId={company.id}
                entityName={company.name}
                currentOwner={company.owner || undefined}
              />
              <CRMProofTrail
                entityType="company"
                entityId={company.id}
                entityName={company.name}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Boardroom Escalation Dialog */}
      <CRMEscalateToBoardroom
        open={showEscalation}
        onOpenChange={setShowEscalation}
        context={{
          entityType: "company",
          entityId: company.id,
          entityName: company.name,
          healthScore: health,
          pipelineValue: totalPipelineValue,
          advisorSummary: health < 50 ? `${company.name} health declining — review engagement and open issues.` : undefined,
        }}
      />
    </div>
  );
}
