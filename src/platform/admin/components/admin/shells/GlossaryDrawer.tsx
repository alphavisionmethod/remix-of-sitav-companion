import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

const GLOSSARY: { term: string; definition: string }[] = [
  { term: "SLO", definition: "Service Level Objective — the target reliability or performance level for a service (e.g. 99.9% uptime)." },
  { term: "Canary", definition: "A staged rollout where a small percentage of users receive an update first, so issues can be caught before a full release." },
  { term: "Rollback", definition: "Reverting a change to the previous known-good state to restore stability." },
  { term: "Trust Score", definition: "A computed metric measuring how trustworthy a device or session is based on behavior, location, and device health." },
  { term: "Blast Radius", definition: "The scope of users, devices, or services affected if something goes wrong with a change." },
  { term: "Ring", definition: "A deployment stage in a progressive rollout (Ring 0 = internal, Ring 1 = beta, Ring 2 = general)." },
  { term: "Idempotency", definition: "A property ensuring that repeating an operation produces the same result, preventing duplicate side effects." },
  { term: "Edge Function", definition: "A serverless backend function that runs close to users for fast response times." },
  { term: "RLS", definition: "Row Level Security — database rules that restrict which rows a user can see or modify." },
  { term: "Dry Run", definition: "Executing a plan in simulation mode without making real changes, to preview the outcome." },
  { term: "Kill Switch", definition: "An emergency control that instantly disables a feature or service across the platform." },
  { term: "Dead Letter Queue", definition: "A holding area for failed jobs or messages that couldn't be processed, for later inspection." },
  { term: "AI Token", definition: "A unit of text processed by an AI model. More tokens = more cost. Both input and output consume tokens." },
  { term: "Telemetry", definition: "Automatically collected performance and usage data from running services and devices." },
  { term: "Postmortem", definition: "A structured review after an incident to understand what happened and prevent recurrence." },
  { term: "Feature Flag", definition: "A toggle that enables or disables a feature without deploying new code." },
  { term: "Checksum", definition: "A value used to verify file integrity — if two checksums don't match, the file was corrupted." },
  { term: "Cohort", definition: "A group of users or devices that share characteristics, often targeted together for rollouts." },
];

export function GlossaryDrawer() {
  const [search, setSearch] = useState("");
  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors w-full">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Glossary</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle className="text-base">Platform Glossary</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search terms…"
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
        <div className="px-4 pb-6 overflow-y-auto space-y-3 max-h-[50vh]">
          {filtered.map(g => (
            <div key={g.term} className="p-3 rounded-lg border bg-card">
              <p className="text-sm font-semibold text-foreground">{g.term}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.definition}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No matching terms found</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
