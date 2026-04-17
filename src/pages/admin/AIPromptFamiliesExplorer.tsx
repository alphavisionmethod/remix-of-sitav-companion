// ═══════════════════════════════════════════════════════════════
// Admin — AI Prompt Families Explorer (Phase 21.C)
// List families, versions, activate/rollback
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { History, Play, RotateCcw, Plus } from "lucide-react";

interface Family {
  family_id: string;
  display_name: string;
  owner_domain: string;
  current_version_id: string | null;
  description: string | null;
  capability_keys: string[];
}

interface Version {
  id: string;
  family_id: string;
  version: string;
  system_prompt: string;
  template: string;
  status: "draft" | "active" | "deprecated";
  hash: string;
  activated_at: string | null;
  created_at: string;
}

export default function AIPromptFamiliesExplorer() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState({ version: "", systemPrompt: "", template: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadFamilies(); }, []);
  useEffect(() => { if (selectedFamily) loadVersions(selectedFamily); }, [selectedFamily]);

  async function loadFamilies() {
    const { data, error } = await fromDynamicTable("ai_prompt_families")
      .select("*").order("family_id");
    if (error) { toast.error(error.message); return; }
    setFamilies((data ?? []) as unknown as Family[]);
    if (data && data.length > 0 && !selectedFamily) setSelectedFamily((data[0] as { family_id: string }).family_id);
  }

  async function loadVersions(familyId: string) {
    const { data, error } = await fromDynamicTable("ai_prompt_versions")
      .select("*").eq("family_id", familyId).order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setVersions((data ?? []) as unknown as Version[]);
  }

  async function createVersion() {
    if (!selectedFamily || !newVersion.version) { toast.error("Family and version required"); return; }
    setLoading(true);
    const { error } = await supabase.functions.invoke("prompt-versioning", {
      body: { action: "create-version", familyId: selectedFamily, ...newVersion },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Version created (draft)");
    setNewVersion({ version: "", systemPrompt: "", template: "" });
    await loadVersions(selectedFamily);
  }

  async function activate(versionId: string) {
    if (!selectedFamily) return;
    setLoading(true);
    const { error } = await supabase.functions.invoke("prompt-versioning", {
      body: { action: "activate-version", familyId: selectedFamily, versionId },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Version activated");
    await Promise.all([loadVersions(selectedFamily), loadFamilies()]);
  }

  async function rollback(versionId: string) {
    if (!selectedFamily) return;
    setLoading(true);
    const { error } = await supabase.functions.invoke("prompt-versioning", {
      body: { action: "rollback", familyId: selectedFamily, versionId },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Rolled back");
    await Promise.all([loadVersions(selectedFamily), loadFamilies()]);
  }

  const family = families.find(f => f.family_id === selectedFamily);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Prompt Families</h1>
        <p className="text-muted-foreground">Versioned prompts powering the Sovereign AI Gateway.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Families ({families.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {families.map(f => (
              <button
                key={f.family_id}
                onClick={() => setSelectedFamily(f.family_id)}
                className={`w-full text-left p-3 rounded border transition ${selectedFamily === f.family_id ? "bg-accent border-primary" : "bg-card hover:bg-accent/40 border-border"}`}
              >
                <div className="font-semibold">{f.display_name}</div>
                <div className="text-xs text-muted-foreground">{f.family_id}</div>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">{f.owner_domain}</Badge>
                  {f.current_version_id && <Badge variant="secondary" className="text-[10px]">active</Badge>}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-8">
          <CardHeader>
            <CardTitle>{family?.display_name ?? "Select a family"}</CardTitle>
            {family?.description && <p className="text-sm text-muted-foreground">{family.description}</p>}
          </CardHeader>
          <CardContent>
            {family && (
              <Tabs defaultValue="versions">
                <TabsList>
                  <TabsTrigger value="versions"><History className="h-4 w-4 mr-1" /> Versions</TabsTrigger>
                  <TabsTrigger value="new"><Plus className="h-4 w-4 mr-1" /> New Version</TabsTrigger>
                </TabsList>

                <TabsContent value="versions" className="space-y-3 mt-4">
                  {versions.map(v => (
                    <div key={v.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">v{v.version}</span>
                          <Badge variant={v.status === "active" ? "default" : v.status === "deprecated" ? "secondary" : "outline"}>
                            {v.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">{v.hash.slice(0, 12)}…</span>
                        </div>
                        <div className="flex gap-2">
                          {v.status !== "active" && (
                            <Button size="sm" variant="outline" disabled={loading} onClick={() => activate(v.id)}>
                              <Play className="h-3 w-3 mr-1" /> Activate
                            </Button>
                          )}
                          {v.status === "deprecated" && (
                            <Button size="sm" variant="ghost" disabled={loading} onClick={() => rollback(v.id)}>
                              <RotateCcw className="h-3 w-3 mr-1" /> Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                      <details>
                        <summary className="text-xs text-muted-foreground cursor-pointer">View prompt</summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-2 whitespace-pre-wrap">{v.system_prompt}</pre>
                      </details>
                    </div>
                  ))}
                  {versions.length === 0 && <p className="text-sm text-muted-foreground">No versions yet.</p>}
                </TabsContent>

                <TabsContent value="new" className="space-y-3 mt-4">
                  <Input placeholder="Version (e.g. 1.1.0)" value={newVersion.version} onChange={e => setNewVersion(v => ({ ...v, version: e.target.value }))} />
                  <Textarea placeholder="System prompt" rows={6} value={newVersion.systemPrompt} onChange={e => setNewVersion(v => ({ ...v, systemPrompt: e.target.value }))} />
                  <Textarea placeholder="Template (uses {{var}})" rows={3} value={newVersion.template} onChange={e => setNewVersion(v => ({ ...v, template: e.target.value }))} />
                  <Button onClick={createVersion} disabled={loading}>Create draft version</Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
