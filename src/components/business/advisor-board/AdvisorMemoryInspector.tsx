// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Memory Inspector
// Browse, correct, and archive memory by advisor/layer
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Archive, Edit3, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { MemoryItem, MemoryLayer, MemorySnapshot } from "@/domains/engines/advisor-memory-engine";
import { MEMORY_AGING_RULES, getAgingRule, type MemoryLayer as AgingLayer } from "@/lib/advisors/advisor-memory-aging-policy";

interface Props {
  snapshot: MemorySnapshot;
  onCorrect?: (id: string, field: "content" | "confidence", newValue: unknown, reason: string) => void;
  onArchive?: (id: string) => void;
}

const LAYER_META: Record<MemoryLayer, { label: string; color: string; description: string }> = {
  "short-term": { label: "Short-Term", color: "200 60% 55%", description: "Active tasks, current state, open decisions" },
  "mid-term": { label: "Mid-Term", color: "38 85% 58%", description: "Client histories, patterns, recurring issues" },
  "long-term": { label: "Long-Term", color: "265 55% 58%", description: "Business goals, strategic priorities, risk patterns" },
  "preference": { label: "Preference", color: "152 55% 48%", description: "Communication style, approval tolerance" },
  "procedural": { label: "Procedural", color: "330 65% 55%", description: "Workflows, automations, standard procedures" },
};

function MemoryItemCard({ item, onCorrect, onArchive }: {
  item: MemoryItem;
  onCorrect?: Props["onCorrect"];
  onArchive?: Props["onArchive"];
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);
  const meta = LAYER_META[item.layer];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="p-2.5 rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[7px] px-1 py-0" style={{ borderColor: `hsl(${meta.color})`, color: `hsl(${meta.color})` }}>
            {item.category}
          </Badge>
          {item.advisorId && (
            <Badge variant="secondary" className="text-[7px] px-1 py-0">{item.advisorId}</Badge>
          )}
          <span className="text-[8px] text-muted-foreground">{Math.round(item.confidence * 100)}% conf</span>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditing(!editing)}>
            <Edit3 className="h-2.5 w-2.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onArchive?.(item.id)}>
            <Archive className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-1.5">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="text-[10px] h-7"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              className="text-[9px] h-5 px-2 bg-[hsl(152_55%_48%)] text-white"
              onClick={() => {
                onCorrect?.(item.id, "content", editValue, "Manual correction");
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" className="text-[9px] h-5 px-2" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-foreground/80">{item.content}</p>
      )}

      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[8px] text-muted-foreground">
          Source: {item.source}
        </span>
        {item.expiresAt && (
          <span className="text-[8px] text-muted-foreground">
            Expires: {new Date(item.expiresAt).toLocaleDateString()}
          </span>
        )}
        <span className="text-[8px] text-muted-foreground">
          Accessed {item.accessCount}x
        </span>
      </div>
    </motion.div>
  );
}

export function AdvisorMemoryInspector({ snapshot, onCorrect, onArchive }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLayer, setActiveLayer] = useState<MemoryLayer>("short-term");

  const layerItems: Record<MemoryLayer, MemoryItem[]> = {
    "short-term": snapshot.shortTerm,
    "mid-term": snapshot.midTerm,
    "long-term": snapshot.longTerm,
    "preference": snapshot.preference,
    "procedural": snapshot.procedural,
  };

  const filtered = layerItems[activeLayer].filter(item =>
    !searchQuery || item.content.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some(t => t.includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[hsl(265_55%_58%)]" />
              <CardTitle className="text-sm font-display">Memory Inspector</CardTitle>
            </div>
            <span className="text-[10px] text-muted-foreground">{snapshot.totalItems} total items</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-[10px] h-7 pl-7"
            />
          </div>

          <Tabs value={activeLayer} onValueChange={(v) => setActiveLayer(v as MemoryLayer)}>
            <TabsList className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] w-full">
              {(Object.keys(LAYER_META) as MemoryLayer[]).map(layer => (
                <TabsTrigger key={layer} value={layer} className="text-[8px] flex-1">
                  {LAYER_META[layer].label} ({layerItems[layer].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(LAYER_META) as MemoryLayer[]).map(layer => (
              <TabsContent key={layer} value={layer} className="mt-3 space-y-2">
                <p className="text-[9px] text-muted-foreground mb-2">{LAYER_META[layer].description}</p>
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-6">No memories in this layer</p>
                  ) : (
                    filtered.map(item => (
                      <MemoryItemCard key={item.id} item={item} onCorrect={onCorrect} onArchive={onArchive} />
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
