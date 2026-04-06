import { useState } from "react";
import { BookOpen, Search, Calendar, Tag, ChevronRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useInvestmentOfficeData } from "@/hooks/useInvestmentOfficeData";

export default function ResearchLibrary() {
  const { instruments: INSTRUMENTS, research: SAMPLE_RESEARCH } = useInvestmentOfficeData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const types = ["all", "macro", "company", "sector", "thesis", "catalyst", "memo"];

  const filtered = SAMPLE_RESEARCH.filter(r =>
    (filter === "all" || r.type === filter) &&
    (!query || r.title.toLowerCase().includes(query.toLowerCase()) || r.tags.some(t => t.includes(query.toLowerCase())))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Research Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Public information synthesis, macro updates, and saved memos</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search research…" value={query} onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition-all" />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(note => (
          <div key={note.id} className="rounded-2xl border border-border bg-card p-5 space-y-2 hover:border-primary/15 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">{note.type}</span>
                <h3 className="text-sm font-semibold text-foreground mt-1.5">{note.title}</h3>
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {note.createdAt}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-wrap">
                {note.tags.map(t => (
                  <span key={t} className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Tag className="h-2 w-2" /> {t}
                  </span>
                ))}
              </div>
              {note.instrumentIds.length > 0 && (
                <div className="flex gap-1 ml-auto">
                  {note.instrumentIds.map(id => {
                    const inst = INSTRUMENTS.find(i => i.id === id);
                    return inst ? <span key={id} className="text-sm">{inst.logoIcon}</span> : null;
                  })}
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Source: {note.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
