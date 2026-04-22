import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Eye, Copy, BarChart3, Settings, Trash2, GripVertical, Type, Mail, Phone, Hash, Calendar, CheckSquare, List, AlignLeft, Upload, Star, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DEMO_FIELD_TYPES, DEMO_FORMS, DEMO_SAMPLE_FIELDS } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_STATS: any[] = [];

export default function FormsBuilder() {
  const [tab, setTab] = useState("forms");
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Forms Builder</h1>
            <p className="text-sm text-muted-foreground">Lead capture forms, surveys, applications with drag-and-drop builder</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />New Form</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([] as typeof DEMO_STATS).map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "forms", label: "All Forms", icon: FileText },
            { value: "builder", label: "Builder", icon: Settings },
            { value: "submissions", label: "Submissions", icon: BarChart3 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="forms">
            <div className="space-y-3">
              {([] as typeof DEMO_FORMS).map(form => (
                <Card key={form.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setSelectedForm(form.id); setTab("builder"); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{form.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={form.status === "live" ? "default" : "secondary"} className="text-[9px]">{form.status}</Badge>
                            <span className="text-[10px] text-muted-foreground">{form.fields} fields</span>
                            {form.linkedFunnel && <span className="text-[10px] text-primary">→ {form.linkedFunnel}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <div className="text-center"><p className="font-bold text-foreground">{form.submissions}</p><p className="text-[9px] text-muted-foreground">Submissions</p></div>
                        <div className="text-center"><p className="font-bold text-emerald-400">{form.convRate}</p><p className="text-[9px] text-muted-foreground">Conv. Rate</p></div>
                        <div className="text-center"><p className="text-muted-foreground">{form.lastSubmission}</p><p className="text-[9px] text-muted-foreground">Last</p></div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Copy className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">{form.tags.map(t => <Badge key={t} variant="outline" className="text-[8px]">{t}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="builder">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Field palette */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Field Types</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  {([] as typeof DEMO_FIELD_TYPES).map(ft => (
                    <div key={ft.type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20 cursor-grab hover:bg-muted/20 transition-colors">
                      <ft.icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-foreground">{ft.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Form preview */}
              <div className="lg:col-span-2">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs">Form Preview — Free Consultation Application</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Eye className="w-3 h-3 mr-1" />Preview</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Globe className="w-3 h-3 mr-1" />Embed</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {([] as typeof DEMO_SAMPLE_FIELDS).map(field => (
                      <div key={field.id} className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/30 group">
                        <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-medium text-foreground">{field.label}</span>
                            {field.required && <span className="text-red-400 text-[10px]">*</span>}
                            <Badge variant="outline" className="text-[8px]">{field.type}</Badge>
                          </div>
                          {field.type === "dropdown" && field.options ? (
                            <div className="flex gap-1 flex-wrap">{field.options.map(o => <Badge key={o} variant="secondary" className="text-[8px]">{o}</Badge>)}</div>
                          ) : (
                            <p className="text-[10px] text-muted-foreground">{field.placeholder}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Settings */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Form Settings</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {[
                    { label: "Thank You Page", value: "Custom URL" },
                    { label: "Notification Email", value: "owner@sita.io" },
                    { label: "Auto-Tag Lead", value: "consultation-inquiry" },
                    { label: "Pipeline Stage", value: "Prospecting" },
                    { label: "Assign To", value: "Owner" },
                    { label: "GDPR Consent", value: "Enabled" },
                    { label: "Double Opt-In", value: "Disabled" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="text-foreground">{s.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Form</th>
                  <th className="text-left py-2">Budget</th>
                  <th className="text-left py-2">Source</th>
                  <th className="text-left py-2">Submitted</th>
                  <th className="text-left py-2">Status</th>
                </tr></thead>
                <tbody>
                  {[
                    { name: "Rachel Green", email: "rachel@greenco.com", form: "Free Consultation", budget: "$15K-$50K", source: "Google", submitted: "2h ago", status: "new" },
                    { name: "Tom Hayes", email: "tom@hayesgroup.com", form: "VIP Day Inquiry", budget: "$50K+", source: "Referral", submitted: "1d ago", status: "contacted" },
                    { name: "Mia Zhang", email: "mia@studio.co", form: "Free Consultation", budget: "$5K-$15K", source: "Social", submitted: "2d ago", status: "qualified" },
                    { name: "Alex Rivera", email: "alex@rivera.io", form: "Webinar Registration", budget: "—", source: "Email", submitted: "3d ago", status: "new" },
                  ].map((s, i) => (
                    <tr key={i} className="border-t border-border/20 hover:bg-muted/10 cursor-pointer">
                      <td className="py-2 px-2 font-medium text-foreground">{s.name}</td>
                      <td className="py-2 text-muted-foreground">{s.email}</td>
                      <td className="py-2"><Badge variant="outline" className="text-[9px]">{s.form}</Badge></td>
                      <td className="py-2 text-foreground">{s.budget}</td>
                      <td className="py-2 text-muted-foreground">{s.source}</td>
                      <td className="py-2 text-muted-foreground">{s.submitted}</td>
                      <td className="py-2"><Badge variant={s.status === "new" ? "default" : "secondary"} className="text-[9px]">{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
