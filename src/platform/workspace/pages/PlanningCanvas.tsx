import { useState } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenTool, Plus, Layout, Workflow, Calendar, Users, Target,
  Lightbulb, GripVertical, Palette, Link2,
} from "lucide-react";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

type CanvasZone = "ideas" | "planning" | "in-progress" | "done";

interface CanvasCard {
  id: string;
  title: string;
  zone: CanvasZone;
  color: string;
  linkedWorkspace: string | null;
  tags: string[];
}

const cards: CanvasCard[] = [
  { id: "1", title: "Q3 revenue strategy", zone: "planning", color: "bg-blue-500/20 border-blue-500/40", linkedWorkspace: "business", tags: ["strategy"] },
  { id: "2", title: "Family vacation planning", zone: "ideas", color: "bg-emerald-500/20 border-emerald-500/40", linkedWorkspace: "household", tags: ["travel"] },
  { id: "3", title: "Automate invoice follow-ups", zone: "in-progress", color: "bg-purple-500/20 border-purple-500/40", linkedWorkspace: "workflows", tags: ["automation"] },
  { id: "4", title: "Launch new service tier", zone: "planning", color: "bg-amber-500/20 border-amber-500/40", linkedWorkspace: "business", tags: ["launch"] },
  { id: "5", title: "Weekly meal prep system", zone: "done", color: "bg-rose-500/20 border-rose-500/40", linkedWorkspace: "household", tags: ["routine"] },
  { id: "6", title: "Advisor persona refinement", zone: "ideas", color: "bg-indigo-500/20 border-indigo-500/40", linkedWorkspace: null, tags: ["ai"] },
];

const zones: { key: CanvasZone; label: string; icon: typeof Lightbulb }[] = [
  { key: "ideas", label: "Ideas", icon: Lightbulb },
  { key: "planning", label: "Planning", icon: Target },
  { key: "in-progress", label: "In Progress", icon: Workflow },
  { key: "done", label: "Done", icon: Layout },
];

export default function PlanningCanvas() {
  const [canvasCards] = useState(cards);

  return (
    <PageShell width="wide">
      <SitaPageHeader
        icon={<PenTool className="h-6 w-6" />}
        title="Planning Canvas"
        subtitle="Visual planning board for workflows, life planning, and strategy"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-1.5" /> Themes
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Card
          </Button>
        </div>
      </SitaPageHeader>

      {/* Canvas zones — kanban-style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const Icon = zone.icon;
          const zoneCards = cards.filter((c) => c.zone === zone.key);
          return (
            <div key={zone.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{zone.label}</h3>
                  <Badge variant="outline" className="text-xs">{zoneCards.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {zoneCards.map((card) => (
                  <Card key={card.id} className={`border ${card.color} cursor-move`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{card.title}</p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {card.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {card.linkedWorkspace && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Link2 className="h-2.5 w-2.5" />
                                {card.linkedWorkspace}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {zoneCards.length === 0 && (
                  <div className="flex items-center justify-center h-[120px] rounded-lg border border-dashed border-border/40 text-muted-foreground">
                    <p className="text-xs">Drop cards here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick links to workspaces */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Link to Workspaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Business", icon: Target },
              { name: "Finance", icon: Layout },
              { name: "Household", icon: Users },
              { name: "Calendar", icon: Calendar },
              { name: "Workflows", icon: Workflow },
            ].map(({ name, icon: WIcon }) => (
              <Button key={name} variant="outline" size="sm" className="gap-1.5">
                <WIcon className="h-3.5 w-3.5" />
                {name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
