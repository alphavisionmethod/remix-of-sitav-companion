// ═══════════════════════════════════════════════════════════════
// SITA OS — Slides Workspace (Premium)
// Deck builder with slide previews, presenter mode,
// boardroom integration, and export
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useDecks } from "@/hooks/use-domain-data";
import type { MockDeck, MockSlide } from "@/data/fixtures/mock-data/workspace";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  Presentation, Plus, Clock, Users, Play, Download, MoreVertical,
  BarChart3, Shield, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Edit3, Copy, Trash2, Image, Type, LayoutTemplate, Save, X,
  Monitor, ArrowRight
} from "lucide-react";




const typeColors: Record<string, string> = {
  boardroom: "bg-primary/10 text-primary",
  proposal: "bg-accent/10 text-accent",
  investor: "bg-amber-500/10 text-amber-600",
  internal: "bg-secondary text-muted-foreground",
  custom: "bg-secondary text-muted-foreground",
};

const SlidesWorkspace = () => {
  const { data: decksData = [] } = useDecks();

  const [selectedDeck, setSelectedDeck] = useState<MockDeck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showNotes, setShowNotes] = useState(true);

  const openDeck = (deck: MockDeck) => {
    setSelectedDeck(deck);
    setCurrentSlide(0);
  };

  const closeDeck = () => {
    setSelectedDeck(null);
    setCurrentSlide(0);
    setIsPresenting(false);
    setIsEditing(false);
  };

  const nextSlide = () => {
    if (selectedDeck && currentSlide < selectedDeck.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const startEditing = () => {
    if (selectedDeck) {
      setIsEditing(true);
      setEditContent(selectedDeck.slides[currentSlide].content);
    }
  };

  // ── Presenter Mode ─────────────────────────────────────────────

  if (isPresenting && selectedDeck) {
    const slide = selectedDeck.slides[currentSlide];
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col" onClick={nextSlide}>
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="max-w-4xl w-full prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground">
            <ReactMarkdown>{slide.content}</ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-3 bg-card/50 border-t border-border" onClick={e => e.stopPropagation()}>
          <button onClick={prevSlide} disabled={currentSlide === 0} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} / {selectedDeck.slides.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPresenting(false)} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary">
              Exit
            </button>
            <button onClick={nextSlide} disabled={currentSlide >= selectedDeck.slides.length - 1} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Deck Editor View ───────────────────────────────────────────

  if (selectedDeck) {
    const slide = selectedDeck.slides[currentSlide];
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={closeDeck} aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"><X className="h-4 w-4" />
            </button>
            <Presentation className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold text-foreground">{selectedDeck.title}</h2>
              <p className="text-[11px] text-muted-foreground">
                {selectedDeck.slides.length} slides · {selectedDeck.type} · {selectedDeck.lastModified}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsPresenting(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
              <Play className="h-3.5 w-3.5" /> Present
            </button>
            <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg gradient-sita px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Slide Thumbnails */}
          <div className="col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {selectedDeck.slides.map((s, i) => (
              <motion.div
                key={s.id}
                onClick={() => { setCurrentSlide(i); setIsEditing(false); }}
                className={`rounded-lg border-2 p-2 cursor-pointer transition-colors ${
                  i === currentSlide ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-secondary/30"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-[16/9] rounded bg-card border border-border overflow-hidden p-2">
                  <div className="text-[6px] text-muted-foreground line-clamp-4 leading-tight">
                    <ReactMarkdown>{s.content.slice(0, 100)}</ReactMarkdown>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 text-center">{i + 1}</p>
              </motion.div>
            ))}
            <button className="w-full rounded-lg border border-dashed border-border p-2 text-[10px] text-muted-foreground hover:bg-secondary/30 transition-colors flex items-center justify-center gap-1">
              <Plus className="h-3 w-3" /> Add Slide
            </button>
          </div>

          {/* Main Slide View */}
          <div className="col-span-7">
            <SitaCard hover={false} className="overflow-hidden">
              <div className="aspect-[16/9] bg-card p-8 flex items-center justify-center relative">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full bg-transparent font-mono text-sm text-foreground resize-none outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="max-w-2xl w-full prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/80">
                    <ReactMarkdown>{slide.content}</ReactMarkdown>
                  </div>
                )}

                {/* Slide Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button onClick={startEditing} className="rounded-md p-1.5 bg-secondary/80 text-muted-foreground hover:text-foreground">
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button className="rounded-md p-1.5 bg-secondary/80 text-muted-foreground hover:text-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button className="rounded-md p-1.5 bg-secondary/80 text-muted-foreground hover:text-foreground">
                    <Image className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/10">
                <button onClick={prevSlide} disabled={currentSlide === 0} className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  Slide {currentSlide + 1} of {selectedDeck.slides.length}
                </span>
                <button onClick={nextSlide} disabled={currentSlide >= selectedDeck.slides.length - 1} className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </SitaCard>
          </div>

          {/* Right Panel — Notes & Properties */}
          <div className="col-span-3 space-y-3">
            <SitaCard hover={false}>
              <SitaCardTitle sub="Speaker notes for this slide">Notes</SitaCardTitle>
              <textarea
                value={slide.notes}
                readOnly
                className="w-full h-24 bg-secondary/20 rounded-lg p-3 text-xs text-muted-foreground resize-none mt-2 outline-none"
                placeholder="Add speaker notes..."
              />
            </SitaCard>

            <SitaCard hover={false}>
              <SitaCardTitle sub="Slide properties">Properties</SitaCardTitle>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Layout</span>
                  <span className="font-medium text-foreground capitalize">{slide.layout}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${typeColors[selectedDeck.type]}`}>
                    {selectedDeck.type}
                  </span>
                </div>
                {selectedDeck.linkedBoardroom && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Boardroom</span>
                    <span className="text-primary text-[10px] flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> {selectedDeck.linkedBoardroom}
                    </span>
                  </div>
                )}
              </div>
            </SitaCard>

            {selectedDeck.linkedBoardroom && (
              <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-3.5 w-3.5" /> Open in Boardroom
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Deck List View ─────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<SitaPageHeader
        title="Slides"
        subtitle="Boardroom decks, proposals, and presentation packets — generated from your data"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg gradient-sita px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-3.5 w-3.5" /> New Deck
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decksData.map((deck, i) => (
          <motion.div key={deck.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <SitaCard className="p-0 overflow-hidden cursor-pointer" hover onClick={() => openDeck(deck)}>
              {/* Slide preview */}
              <div className="h-36 bg-gradient-to-br from-secondary via-secondary/50 to-background flex items-center justify-center border-b border-border relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="max-w-[200px] text-center">
                    <div className="text-[8px] text-muted-foreground/60 line-clamp-4">
                      <ReactMarkdown>{deck.slides[0].content.slice(0, 80)}</ReactMarkdown>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-[9px] text-muted-foreground font-medium">
                  {deck.slides.length} slides
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{deck.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${typeColors[deck.type]}`}>
                        {deck.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {deck.lastModified}
                      </span>
                      {deck.linkedBoardroom && (
                        <span className="text-[10px] text-primary flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" /> Boardroom
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {deck.status === "ready" || deck.status === "presented" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeck(deck); setTimeout(() => setIsPresenting(true), 0); }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Play className="h-3 w-3" /> Present
                    </button>
                  ) : (
                    <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-secondary py-1.5 text-[10px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
                      <Edit3 className="h-3 w-3" /> Edit Draft
                    </button>
                  )}
                  <button className="rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </SitaCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SlidesWorkspace;
