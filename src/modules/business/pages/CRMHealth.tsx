import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCRMContacts, useCRMCommunications, useCRMOpportunities, useCRMTasks } from "@/modules/business/hooks/use-crm-data";
import {
  Heart, TrendingUp, TrendingDown, AlertTriangle, Users, ShieldAlert, Eye,
  ArrowUpRight, Clock, Phone, Mail, Calendar, ChevronRight, Sparkles,
  Activity, Target, BarChart3, Zap, Shield, X
} from "lucide-react";
import { HEALTH_BUCKETS, healthBucketFor, type HealthBucket } from "./_config/CRMHealth.config";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CRMRelationshipIntelligence } from "@/modules/business/components/business/crm/CRMRelationshipIntelligence";
import { CRMNextBestAction } from "@/modules/business/components/business/crm/CRMNextBestAction";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer, getStatusWord } from "@/domains/engines/business-identity-layers";

const healthLabel = healthBucketFor;

const CRMHealth = () => {
  const { data: contacts = [] } = useCRMContacts();
  const { data: comms = [] } = useCRMCommunications();
  const { data: opps = [] } = useCRMOpportunities();
  const { data: crmTasks = [] } = useCRMTasks();
  const { primaryMode, adaptations } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const crmLang = adaptations.crm.language;
  const contactLabel = crmLang.contactLabel || "Contacts";
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const bucketData = useMemo(() => {
    return HEALTH_BUCKETS.map(b => ({
      ...b,
      contacts: contacts.filter(c => (c.health_score ?? 50) >= b.min && (c.health_score ?? 50) < b.max)
        .sort((a, z) => (z.health_score ?? 50) - (a.health_score ?? 50)),
    }));
  }, [contacts]);

  const avgHealth = contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + (c.health_score ?? 50), 0) / contacts.length) : 0;

  // Compute health factors for a contact
  const getContactFactors = (c: typeof contacts[0]) => {
    const contactComms = comms.filter(cm => cm.contact_id === c.id);
    const contactOpps = opps.filter(o => o.contact_id === c.id && o.status === "open");
    const daysSinceContact = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : 999;
    const hasOverdueFollowUp = c.next_follow_up_at ? new Date(c.next_follow_up_at) < new Date() : false;

    return {
      engagementRecency: daysSinceContact <= 7 ? 100 : daysSinceContact <= 14 ? 75 : daysSinceContact <= 30 ? 50 : daysSinceContact <= 60 ? 25 : 10,
      communicationFreq: Math.min(100, contactComms.length * 20),
      activePipeline: contactOpps.length > 0 ? 100 : 30,
      followThrough: hasOverdueFollowUp ? 20 : 80,
      daysSinceContact,
      commCount: contactComms.length,
      openDeals: contactOpps.length,
      hasOverdueFollowUp,
    };
  };

  // Distribution chart data
  const distribution = useMemo(() => {
    const total = contacts.length || 1;
    return bucketData.map(b => ({ ...b, pct: Math.round((b.contacts.length / total) * 100) }));
  }, [bucketData, contacts.length]);

  // Contacts needing attention
  const needsAttention = useMemo(() => {
    return contacts
      .filter(c => (c.health_score ?? 50) < 60)
      .sort((a, z) => (a.health_score ?? 50) - (z.health_score ?? 50))
      .slice(0, 8);
  }, [contacts]);

  // Top healthy
  const topHealthy = useMemo(() => {
    return contacts
      .filter(c => (c.health_score ?? 50) >= 80)
      .sort((a, z) => (z.health_score ?? 50) - (a.health_score ?? 50))
      .slice(0, 5);
  }, [contacts]);

  // Recently changed (simulate changes via last_contacted)
  const recentlyActive = useMemo(() => {
    return contacts
      .filter(c => c.last_contacted_at)
      .sort((a, z) => new Date(z.last_contacted_at!).getTime() - new Date(a.last_contacted_at!).getTime())
      .slice(0, 5);
  }, [contacts]);

  const selectedContactData = contacts.find(c => c.id === selectedContact);
  const selectedFactors = selectedContactData ? getContactFactors(selectedContactData) : null;

  // Advisor insights
  const advisorInsights = useMemo(() => {
    const insights: { icon: React.ElementType; color: string; text: string; severity: string }[] = [];
    const atRiskCount = contacts.filter(c => (c.health_score ?? 50) < 40).length;
    const driftingCount = contacts.filter(c => (c.health_score ?? 50) >= 40 && (c.health_score ?? 50) < 60).length;
    const noContactCount = contacts.filter(c => {
      if (!c.last_contacted_at) return true;
      return differenceInDays(new Date(), new Date(c.last_contacted_at)) > 14;
    }).length;
    const overdueFollowUps = contacts.filter(c => c.next_follow_up_at && new Date(c.next_follow_up_at) < new Date()).length;

    if (atRiskCount > 0) insights.push({ icon: ShieldAlert, color: "text-red-400", text: `${atRiskCount} relationship${atRiskCount > 1 ? "s" : ""} at risk or critical — consider immediate outreach`, severity: "high" });
    if (driftingCount > 0) insights.push({ icon: TrendingDown, color: "text-yellow-400", text: `${driftingCount} contact${driftingCount > 1 ? "s" : ""} drifting — engagement is declining`, severity: "medium" });
    if (noContactCount > 0) insights.push({ icon: Clock, color: "text-orange-400", text: `${noContactCount} contact${noContactCount > 1 ? "s" : ""} not reached in over 14 days`, severity: "medium" });
    if (overdueFollowUps > 0) insights.push({ icon: AlertTriangle, color: "text-red-400", text: `${overdueFollowUps} overdue follow-up${overdueFollowUps > 1 ? "s" : ""} need attention`, severity: "high" });
    if (avgHealth >= 70 && insights.length === 0) insights.push({ icon: Sparkles, color: "text-green-400", text: "Relationships are healthy overall — keep up the momentum", severity: "low" });

    return insights;
  }, [contacts, avgHealth]);

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{contactLabel} Health</h2>
          <p className="text-xs text-muted-foreground">{contacts.length} {contactLabel.toLowerCase()} · {getStatusWord(primaryMode, avgHealth >= 70 ? "good" : avgHealth >= 40 ? "warning" : "critical")} overall</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">{avgHealth}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${avgHealth >= 70 ? "bg-green-500/20" : avgHealth >= 40 ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
            <Heart className={`h-7 w-7 ${avgHealth >= 70 ? "text-green-400" : avgHealth >= 40 ? "text-yellow-400" : "text-red-400"}`} />
          </div>
        </div>
      </div>

      {/* Distribution Bar */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Health Distribution</p>
          <div className="flex h-5 rounded-full overflow-hidden bg-muted/30">
            {distribution.map(d => d.contacts.length > 0 && (
              <div
                key={d.label}
                className={`h-full ${d.bg} border-r border-background/50 last:border-r-0 transition-all cursor-pointer hover:opacity-80`}
                style={{ width: `${d.pct}%`, minWidth: d.pct > 0 ? "8px" : "0" }}
                title={`${d.label}: ${d.contacts.length} (${d.pct}%)`}
                onClick={() => setExpandedBucket(expandedBucket === d.label ? null : d.label)}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {distribution.filter(d => d.contacts.length > 0).map(d => (
              <button key={d.label} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => setExpandedBucket(expandedBucket === d.label ? null : d.label)}>
                <div className={`w-2 h-2 rounded-full ${d.bg}`} />
                {d.label}: {d.contacts.length}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advisor Insights */}
      {advisorInsights.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Advisor Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {advisorInsights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <ins.icon className={`h-4 w-4 mt-0.5 shrink-0 ${ins.color}`} />
                <span className="text-muted-foreground">{ins.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Health Buckets Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bucketData.map(b => {
          const isExpanded = expandedBucket === b.label;
          return (
            <Card
              key={b.label}
              className={`border-border/50 bg-card/50 backdrop-blur-sm transition-all cursor-pointer hover:border-primary/20 ${isExpanded ? `${b.border} border` : ""}`}
              onClick={() => setExpandedBucket(isExpanded ? null : b.label)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl ${b.bg} flex items-center justify-center`}>
                    <b.icon className={`h-4 w-4 ${b.color}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground">{b.label}</span>
                    <p className="text-[10px] text-muted-foreground font-normal">{b.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${b.color}`}>{b.contacts.length}</span>
                    <p className="text-[10px] text-muted-foreground">{b.min}–{b.max === 101 ? 100 : b.max}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {b.contacts.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 py-2">No contacts in this range</p>
                ) : (
                  <div className="space-y-1.5">
                    {b.contacts.slice(0, isExpanded ? 10 : 4).map(c => {
                      const daysSince = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : null;
                      return (
                        <div
                          key={c.id}
                          className={`flex items-center gap-2 py-1.5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 transition-colors ${selectedContact === c.id ? "bg-primary/10" : ""}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedContact(selectedContact === c.id ? null : c.id); }}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {c.first_name[0]}{c.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{c.first_name} {c.last_name}</span>
                            {c.title && <span className="text-[10px] text-muted-foreground truncate block">{c.title}</span>}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-semibold ${b.color}`}>{c.health_score}</span>
                            {daysSince !== null && (
                              <p className={`text-[10px] ${daysSince > 14 ? "text-orange-400" : "text-muted-foreground"}`}>
                                {daysSince}d ago
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {!isExpanded && b.contacts.length > 4 && (
                      <p className="text-xs text-primary text-center pt-1 flex items-center justify-center gap-1">
                        +{b.contacts.length - 4} more <ChevronRight className="h-3 w-3" />
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Health Detail Panel */}
      {selectedContactData && selectedFactors && (
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {selectedContactData.first_name[0]}{selectedContactData.last_name[0]}
                </div>
                <div>
                  <CardTitle className="text-base">{selectedContactData.first_name} {selectedContactData.last_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{selectedContactData.title} {selectedContactData.lifecycle_stage && `· ${selectedContactData.lifecycle_stage}`}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedContact(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Engagement Recency */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Engagement Recency</span>
                  <span className="font-medium">{selectedFactors.engagementRecency}%</span>
                </div>
                <Progress value={selectedFactors.engagementRecency} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">
                  {selectedFactors.daysSinceContact === 999 ? "Never contacted" : `Last contact ${selectedFactors.daysSinceContact}d ago`}
                </p>
              </div>

              {/* Communication Frequency */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Comm Frequency</span>
                  <span className="font-medium">{selectedFactors.communicationFreq}%</span>
                </div>
                <Progress value={selectedFactors.communicationFreq} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">{selectedFactors.commCount} total interactions</p>
              </div>

              {/* Active Pipeline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" /> Pipeline Activity</span>
                  <span className="font-medium">{selectedFactors.activePipeline}%</span>
                </div>
                <Progress value={selectedFactors.activePipeline} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">{selectedFactors.openDeals} open deal{selectedFactors.openDeals !== 1 ? "s" : ""}</p>
              </div>

              {/* Follow-Through */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Follow-Through</span>
                  <span className="font-medium">{selectedFactors.followThrough}%</span>
                </div>
                <Progress value={selectedFactors.followThrough} className="h-1.5" />
                <p className={`text-[10px] ${selectedFactors.hasOverdueFollowUp ? "text-red-400" : "text-muted-foreground"}`}>
                  {selectedFactors.hasOverdueFollowUp ? "Overdue follow-up!" : "On track"}
                </p>
              </div>
            </div>

            {/* Composite Score */}
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${healthLabel(selectedContactData.health_score ?? 50).color}`} />
                <span className="text-sm font-medium">Composite Health: <span className={healthLabel(selectedContactData.health_score ?? 50).color}>{selectedContactData.health_score}</span></span>
                <Badge variant="outline" className={`text-[10px] ${healthLabel(selectedContactData.health_score ?? 50).color}`}>
                  {healthLabel(selectedContactData.health_score ?? 50).label}
                </Badge>
              </div>
              {selectedContactData.tags && selectedContactData.tags.length > 0 && (
                <div className="flex gap-1">
                  {selectedContactData.tags.slice(0, 3).map(t => (
                    <Badge key={t} variant="secondary" className="text-[10px] px-1.5">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Needs Attention + Top Healthy */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Needs Attention */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">All relationships healthy!</p>
            ) : (
              <div className="space-y-1.5">
                {needsAttention.map(c => {
                  const bucket = healthLabel(c.health_score ?? 50);
                  const daysSince = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : null;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedContact(c.id)}
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{c.first_name} {c.last_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.title || c.lifecycle_stage}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {daysSince !== null && daysSince > 14 && (
                          <span className="text-[10px] text-orange-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{daysSince}d</span>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${bucket.color} border-current/20`}>{c.health_score}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Healthy */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-400" /> Strongest Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topHealthy.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No healthy relationships yet</p>
            ) : (
              <div className="space-y-1.5">
                {topHealthy.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedContact(c.id)}
                  >
                    <span className="text-xs text-muted-foreground w-4 text-center font-medium">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-400">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{c.first_name} {c.last_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.title || c.lifecycle_stage}</p>
                    </div>
                    <span className="text-sm font-bold text-green-400">{c.health_score}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Active */}
      {recentlyActive.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recently Engaged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentlyActive.map(c => {
                const bucket = healthLabel(c.health_score ?? 50);
                return (
                  <div
                    key={c.id}
                    className="flex-shrink-0 w-40 p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedContact(c.id)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <span className={`text-xs font-bold ${bucket.color}`}>{c.health_score}</span>
                    </div>
                    <p className="text-xs font-medium truncate">{c.first_name} {c.last_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.last_contacted_at && formatDistanceToNow(new Date(c.last_contacted_at), { addSuffix: true })}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationship Intelligence Deep Dive */}
      {contacts.length > 0 && (
        <CRMRelationshipIntelligence
          contacts={contacts}
          communications={comms}
          opportunities={opps}
          tasks={crmTasks}
          onSelectContact={setSelectedContact}
        />
      )}

      {contacts.length === 0 && (
        <div className="py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Relationships Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add contacts to your CRM to see relationship health insights, scoring breakdowns, and advisor recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default CRMHealth;
