import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Package, ArrowRight, Sparkles, FileText, Layers, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { classifyFeatureDomain } from "@/lib/delivery-methodology/feature-factory";

const ARCHETYPES = [
  "boardroom","office","simulator","workflow","onboarding","crud",
  "action-center","dashboard","detail-view","connector-flow",
  "intelligence","proof-evidence","admin-control","timeline","settings",
];

const FeatureIntakeDesk = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", userIntent: "", domain: "", archetypeKey: "dashboard",
    persistenceClass: "operational", trustNeeds: "standard", aiComputeClass: "none",
    interactionCriticality: "medium", journeyCriticality: "medium",
    launchCriticality: "standard",
  });

  const { data: blueprints } = useQuery({
    queryKey: ["feature-blueprints"],
    queryFn: async () => {
      const { data } = await supabase.from("feature_blueprints").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const createBlueprint = useMutation({
    mutationFn: async () => {
      const domain = form.domain || classifyFeatureDomain(form.title, form.description);
      const featureId = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("feature_blueprints").insert({
        user_id: user.id, feature_id: featureId, title: form.title, domain,
        archetype_key: form.archetypeKey, description: form.description,
        user_intent: form.userIntent, persistence_class: form.persistenceClass,
        trust_needs: form.trustNeeds, ai_compute_class: form.aiComputeClass,
        interaction_criticality: form.interactionCriticality,
        journey_criticality: form.journeyCriticality,
        launch_criticality: form.launchCriticality,
        status: "draft",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Blueprint created");
      queryClient.invalidateQueries({ queryKey: ["feature-blueprints"] });
      setForm({ ...form, title: "", description: "", userIntent: "" });
    },
  });

  const autoDomain = form.title || form.description ? classifyFeatureDomain(form.title, form.description) : "";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Feature Intake Desk</h1>
        </div>
        <p className="text-muted-foreground">Structured intake for new features — normalize every request into a canonical blueprint</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> New Feature Blueprint</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Revenue Pipeline Dashboard" />
              </div>
              <div>
                <label className="text-sm font-medium">Domain {autoDomain && <Badge variant="outline" className="ml-2">{autoDomain}</Badge>}</label>
                <Input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder={autoDomain || "Auto-detected"} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">User Intent</label>
              <Textarea value={form.userIntent} onChange={e => setForm({ ...form, userIntent: e.target.value })} placeholder="What does the user want to accomplish?" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Archetype</label>
                <Select value={form.archetypeKey} onValueChange={v => setForm({ ...form, archetypeKey: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ARCHETYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Persistence</label>
                <Select value={form.persistenceClass} onValueChange={v => setForm({ ...form, persistenceClass: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["ephemeral","operational","durable","compliance-sensitive"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Trust Needs</label>
                <Select value={form.trustNeeds} onValueChange={v => setForm({ ...form, trustNeeds: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["none","standard","high","critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Interaction Criticality</label>
                <Select value={form.interactionCriticality} onValueChange={v => setForm({ ...form, interactionCriticality: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high","critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Launch Criticality</label>
                <Select value={form.launchCriticality} onValueChange={v => setForm({ ...form, launchCriticality: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["nice-to-have","standard","important","critical"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">AI Compute</label>
                <Select value={form.aiComputeClass} onValueChange={v => setForm({ ...form, aiComputeClass: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["none","light","standard","deep"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => createBlueprint.mutate()} disabled={!form.title || createBlueprint.isPending} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" /> Create Blueprint & Enter Pipeline
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Recent Blueprints</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {(blueprints ?? []).map((bp: any) => (
              <motion.div key={bp.id} className="p-3 rounded-lg border bg-card/50 space-y-1" whileHover={{ scale: 1.01 }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{bp.title}</span>
                  <Badge variant={bp.status === "draft" ? "secondary" : "default"} className="text-xs">{bp.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{bp.domain}</Badge>
                  <Badge variant="outline" className="text-xs">{bp.archetype_key}</Badge>
                </div>
              </motion.div>
            ))}
            {(!blueprints || blueprints.length === 0) && <p className="text-sm text-muted-foreground">No blueprints yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureIntakeDesk;
