import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Shield, Zap, Globe, ExternalLink, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function ProviderDetail() {
  
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [wizardStep, setWizardStep] = useState(0);
  const [connecting, setConnecting] = useState(false);

  const provider = getProviderById(providerId || "");
  if (!provider) return <div className="p-6 text-muted-foreground">Provider not found</div>;

  const existingConnection = null;
  const readCaps = provider.capabilities.filter(c => c.type === "read");
  const writeCaps = provider.capabilities.filter(c => c.type === "write");

  const startConnect = () => {
    setConnecting(true);
    setWizardStep(0);
  };

  const wizardSteps = [
    { title: "Understand Permissions", description: "Review what SITA will access" },
    { title: "Authenticate", description: `Sign in with ${provider.displayName}` },
    { title: "Select Account", description: "Choose which account to connect" },
    { title: "Confirm Setup", description: "Review and confirm connection" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate("/integrations")}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: provider.color + "15" }}>
            {provider.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{provider.displayName}</h1>
            <p className="text-sm text-muted-foreground">{provider.description}</p>
            <div className="flex gap-1.5 mt-1">
              <Badge variant="outline" className="text-[10px] capitalize">{provider.category}</Badge>
              <Badge variant="outline" className="text-[10px]">{provider.authType === "oauth2" ? "OAuth 2.0" : "API Key"}</Badge>
              {provider.supportsWebhooks && <Badge variant="outline" className="text-[10px]">Webhooks</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {provider.docsUrl && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(provider.docsUrl, "_blank")}>
              <BookOpen className="w-3.5 h-3.5" /> Docs <ExternalLink className="w-3 h-3" />
            </Button>
          )}
          {existingConnection ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/integrations/connections/${existingConnection.id}`)}>
              Manage Connection <ArrowRight className="w-3 h-3" />
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5" onClick={startConnect}>
              <Zap className="w-3.5 h-3.5" /> Connect
            </Button>
          )}
        </div>
      </div>

      {/* Connection Wizard */}
      {connecting && (
        <Card className="bg-card/50 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Connection Wizard</CardTitle>
            <Progress value={(wizardStep + 1) / wizardSteps.length * 100} className="h-1.5" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              {wizardSteps.map((s, i) => (
                <div key={i} className={`flex-1 p-2 rounded text-center text-[10px] ${i === wizardStep ? "bg-primary/10 text-primary border border-primary/30" : i < wizardStep ? "bg-green-500/10 text-green-400" : "bg-muted/20 text-muted-foreground"}`}>
                  {i < wizardStep ? <CheckCircle className="w-3 h-3 mx-auto mb-0.5" /> : null}
                  {s.title}
                </div>
              ))}
            </div>

            {wizardStep === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-foreground font-medium">What SITA will be able to do:</p>
                <div className="space-y-2">
                  {readCaps.length > 0 && (
                    <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <p className="text-[10px] font-semibold text-green-400 uppercase mb-1">Read Access</p>
                      {readCaps.map(c => <p key={c.id} className="text-xs text-foreground">• {c.name} — {c.description}</p>)}
                    </div>
                  )}
                  {writeCaps.length > 0 && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <p className="text-[10px] font-semibold text-amber-400 uppercase mb-1">Write Access (with approval controls)</p>
                      {writeCaps.map(c => (
                        <div key={c.id} className="flex items-center gap-2 text-xs text-foreground">
                          <span>• {c.name} — {c.description}</span>
                          {c.requiresApproval && <Badge variant="outline" className="text-[8px]">Requires Approval</Badge>}
                          <Badge variant="outline" className="text-[8px] capitalize">{c.riskLevel} risk</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">You can change permissions anytime after connecting.</p>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto" style={{ backgroundColor: provider.color + "15" }}>
                  {provider.icon}
                </div>
                <p className="text-sm text-foreground">Click below to sign in with {provider.displayName}</p>
                <p className="text-[10px] text-muted-foreground">You'll be redirected to {provider.displayName}'s authorization page</p>
                <Button className="gap-1.5" onClick={() => setWizardStep(2)}>
                  <Globe className="w-3.5 h-3.5" /> Sign in with {provider.displayName}
                </Button>
                <p className="text-[10px] text-muted-foreground italic">Demo mode — OAuth simulation</p>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-foreground font-medium">Select an account:</p>
                {[{ name: "Acme Corp — Primary", id: "acct-1" }, { name: "Acme Corp — Sandbox", id: "acct-2" }].map(a => (
                  <Card key={a.id} className="bg-muted/20 border-border/50 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setWizardStep(3)}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground">ID: {a.id}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Ready to Connect</p>
                  <p className="text-xs text-muted-foreground mt-1">Account: Acme Corp — Primary</p>
                  <p className="text-xs text-muted-foreground">Permissions: {readCaps.length} read, {writeCaps.length} write</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Recommended Setup</p>
                  <p className="text-xs text-foreground">• Auto-sync every 30 minutes</p>
                  <p className="text-xs text-foreground">• Write actions require approval</p>
                  <p className="text-xs text-foreground">• Health checks every 15 minutes</p>
                </div>
                <Button className="w-full gap-1.5" onClick={() => { setConnecting(false); }}>
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm & Connect
                </Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => wizardStep > 0 ? setWizardStep(wizardStep - 1) : setConnecting(false)}>
                {wizardStep === 0 ? "Cancel" : "Back"}
              </Button>
              {wizardStep < 3 && wizardStep !== 1 && (
                <Button variant="outline" size="sm" onClick={() => setWizardStep(wizardStep + 1)}>
                  Next <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capabilities */}
      {!connecting && (
        <Tabs defaultValue="capabilities">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="objects">Data Objects</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="capabilities" className="mt-4 space-y-2">
            {provider.capabilities.map(cap => (
              <Card key={cap.id} className="bg-card/50 border-border/50">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{cap.type === "read" ? "📖" : "✏️"}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{cap.name}</p>
                      <p className="text-[10px] text-muted-foreground">{cap.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant={cap.riskLevel === "high" ? "destructive" : cap.riskLevel === "medium" ? "default" : "secondary"} className="text-[9px] capitalize">{cap.riskLevel}</Badge>
                    {cap.requiresApproval && <Badge variant="outline" className="text-[9px]">🔒 Approval</Badge>}
                    {cap.supportsDryRun && <Badge variant="outline" className="text-[9px]">🧪 Dry Run</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="objects" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {provider.objects.map(obj => (
                <Badge key={obj} variant="outline" className="text-xs capitalize">{obj.replace(/_/g, " ")}</Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-4">
            <div className="space-y-2">
              {provider.setupSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <span className="text-xs text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
