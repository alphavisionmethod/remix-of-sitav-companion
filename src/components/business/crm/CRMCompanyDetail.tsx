// SITA OS — CRM Company Detail Panel
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  X, Building2, Globe, MapPin, Phone, Heart, DollarSign, Users,
  TrendingUp, FileText, Plus, ChevronRight, Sparkles, Tag, Mail
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useCRMContacts, useCRMOpportunities, useCRMCommunications, useCRMNotes } from "@/hooks/use-crm-data";
import type { CRMCompany } from "@/lib/data-services/crm-data-service";

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
  const [activeTab, setActiveTab] = useState("overview");

  const contacts = useMemo(() => allContacts.filter(c => c.company_id === company.id || c.tags?.includes(company.name)), [allContacts, company]);
  const opps = useMemo(() => allOpps.filter(o => o.company_id === company.id), [allOpps, company.id]);
  const comms = useMemo(() => allComms.filter(c => c.company_id === company.id), [allComms, company.id]);
  const notes = useMemo(() => allNotes.filter(n => n.company_id === company.id), [allNotes, company.id]);

  const health = company.health_score ?? 50;
  const totalPipelineValue = opps.filter(o => o.status === "open").reduce((s, o) => s + (o.value || 0), 0);

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex-shrink-0 mx-4 mt-3 bg-muted/30">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs">People ({contacts.length})</TabsTrigger>
          <TabsTrigger value="deals" className="text-xs">Deals ({opps.length})</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity ({comms.length})</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Company Info */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {company.domain && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 shrink-0" />{company.domain}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />{company.phone}
                    </div>
                  )}
                  {(company.city || company.state || company.country) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {company.owner && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />Owner: {company.owner}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* KPIs */}
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

              {/* Advisor */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Account Intelligence</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {health < 50 ? `${company.name} health is declining. Review recent interactions and address open issues.`
                        : totalPipelineValue > 0 ? `$${(totalPipelineValue / 1000).toFixed(0)}K in active pipeline — monitor close dates and advance deals.`
                        : contacts.length === 0 ? `No contacts linked. Add team members to build a full account picture.`
                        : `Account is in good standing. Consider cross-sell or upsell opportunities.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="mt-0 space-y-2">
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No contacts linked to this company</p>
                </div>
              ) : contacts.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
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
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
