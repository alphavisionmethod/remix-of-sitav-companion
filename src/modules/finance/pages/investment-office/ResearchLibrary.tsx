// truth-allow: ia-config
import { useState } from "react";
import { BookOpen, Search, Calendar, Tag, Brain, Zap } from "lucide-react";
import { INSTRUMENTS, SAMPLE_RESEARCH } from "@/hooks/useInvestmentOfficeData";
import { ADVISOR_MEMOS, CATALYST_CALENDAR } from "@/domains/investment";
import { useInvestmentThesisEntries } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function ResearchLibrary() {
  const { data: liveData, isLoading } = useInvestmentThesisEntries();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const types = ["all", "macro", "company", "sector", "thesis", "catalyst", "memo"];

  const filtered = SAMPLE_RESEARCH.filter(r =>
    (filter === "all" || r.type === filter) &&
    (!query || r.title.toLowerCase().includes(query.toLowerCase()) || r.tags.some(t => t.includes(query.toLowerCase())))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      {/* Advisor Memos */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Advisor Memos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADVISOR_MEMOS.map(memo => (
            <div key={memo.id} className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/15 transition-all cursor-pointer">
              <div className="flex items-start gap-2.5">
                <span className="text-lg">{memo.advisorIcon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{memo.title}</p>
                  <p className="text-[10px] text-muted-foreground">{memo.advisorName} · {memo.date}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{memo.summary}</p>
              <div className="flex gap-1 flex-wrap">
                {memo.tags.map(t => (
                  <span key={t} className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Tag className="h-2 w-2" /> {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalyst Calendar */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> Catalyst Calendar</h3>
        <div className="space-y-2">
          {CATALYST_CALENDAR.sort((a, b) => a.date.localeCompare(b.date)).map(cat => {
            const isPast = new Date(cat.date) < new Date();
            return (
              <div key={cat.id} className={`rounded-xl border border-border bg-card p-4 flex items-start gap-3 ${isPast ? "opacity-60" : ""}`}>
                <div className="rounded-lg bg-primary/10 p-2 text-center min-w-[48px]">
                  <p className="text-[10px] text-primary font-bold">{new Date(cat.date).toLocaleDateString("en-US", { month: "short" })}</p>
                  <p className="text-sm font-bold text-foreground">{new Date(cat.date).getDate()}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{cat.title}</p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                      cat.impact === "high" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
                    }`}>{cat.impact}</span>
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground capitalize">{cat.type}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{cat.description}</p>
                </div>
                <div className="flex gap-1">
                  {cat.instruments.map(id => {
                    const inst = INSTRUMENTS.find(i => i.id === id);
                    return inst ? <span key={id} className="text-sm">{inst.logoIcon}</span> : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Research Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Research Notes</h3>
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