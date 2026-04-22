// ═══════════════════════════════════════════════════════════════
// Nova OS — Photo Viewer Window App
// Gallery grid, lightbox, EXIF, filters
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  Grid3X3, Maximize2, X, ChevronLeft, ChevronRight, SlidersHorizontal,
  Info, Image, Sun, Contrast, Droplets, Play
} from "lucide-react";

interface Photo {
  id: string;
  gradient: string;
  title: string;
  date: string;
  size: string;
  dimensions: string;
}

const MOCK_PHOTOS: Photo[] = [
  { id: "1", gradient: "from-[hsl(265_55%_40%)] to-[hsl(280_50%_55%)]", title: "Mountain Sunset", date: "2026-03-15", size: "4.2 MB", dimensions: "4032 × 3024" },
  { id: "2", gradient: "from-[hsl(190_60%_35%)] to-[hsl(200_55%_50%)]", title: "Ocean Waves", date: "2026-03-12", size: "3.8 MB", dimensions: "3840 × 2160" },
  { id: "3", gradient: "from-[hsl(35_80%_40%)] to-[hsl(25_70%_55%)]", title: "Desert Dunes", date: "2026-03-10", size: "5.1 MB", dimensions: "4032 × 3024" },
  { id: "4", gradient: "from-[hsl(140_50%_30%)] to-[hsl(160_45%_45%)]", title: "Forest Path", date: "2026-03-08", size: "3.2 MB", dimensions: "3024 × 4032" },
  { id: "5", gradient: "from-[hsl(340_65%_40%)] to-[hsl(320_55%_55%)]", title: "Cherry Blossoms", date: "2026-03-05", size: "2.9 MB", dimensions: "4032 × 3024" },
  { id: "6", gradient: "from-[hsl(220_55%_35%)] to-[hsl(240_50%_50%)]", title: "Night City", date: "2026-03-01", size: "4.8 MB", dimensions: "5120 × 2880" },
  { id: "7", gradient: "from-[hsl(45_75%_40%)] to-[hsl(30_65%_50%)]", title: "Golden Hour", date: "2026-02-28", size: "3.5 MB", dimensions: "4032 × 3024" },
  { id: "8", gradient: "from-[hsl(170_50%_30%)] to-[hsl(180_45%_45%)]", title: "Waterfall", date: "2026-02-25", size: "6.1 MB", dimensions: "4032 × 3024" },
  { id: "9", gradient: "from-[hsl(0_0%_20%)] to-[hsl(0_0%_40%)]", title: "Monochrome", date: "2026-02-20", size: "2.4 MB", dimensions: "3840 × 2160" },
  { id: "10", gradient: "from-[hsl(280_50%_35%)] to-[hsl(300_45%_50%)]", title: "Aurora", date: "2026-02-18", size: "5.6 MB", dimensions: "5120 × 2880" },
  { id: "11", gradient: "from-[hsl(15_70%_35%)] to-[hsl(5_60%_50%)]", title: "Autumn Leaves", date: "2026-02-15", size: "3.1 MB", dimensions: "4032 × 3024" },
  { id: "12", gradient: "from-[hsl(200_40%_25%)] to-[hsl(210_35%_40%)]", title: "Foggy Morning", date: "2026-02-10", size: "2.8 MB", dimensions: "3024 × 4032" },
];

export function PhotoViewerWindow() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [showFilters, setShowFilters] = useState(false);

  const photo = selectedIdx !== null ? MOCK_PHOTOS[selectedIdx] : null;

  return (
    <div className="h-[420px] bg-[hsl(0_0%_6%)] text-[hsl(0_0%_90%)] rounded-b-xl overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[hsl(0_0%_12%)]">
        <Grid3X3 className="h-3.5 w-3.5 text-[hsl(0_0%_40%)]" />
        <span className="text-[11px] text-[hsl(0_0%_50%)]">{(isDemoMode ? MOCK_PHOTOS : [] as typeof MOCK_PHOTOS).length} photos</span>
        <div className="flex-1" />
        <button onClick={() => setShowFilters(!showFilters)} className={cn("p-1 rounded transition-colors", showFilters ? "text-[hsl(265_55%_65%)]" : "text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_60%)]")}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Gallery Grid */}
        {selectedIdx === null ? (
          <div className="grid grid-cols-4 gap-1 p-1 overflow-y-auto h-full scrollbar-thin">
            {(isDemoMode ? MOCK_PHOTOS : [] as typeof MOCK_PHOTOS).map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedIdx(i)}
                className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-[hsl(265_55%_55%/0.5)] transition-all"
              >
                <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", p.gradient)}>
                  <Image className="h-6 w-6 text-[hsl(0_0%_100%/0.2)]" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Lightbox */
          <div className="h-full flex">
            <div className="flex-1 relative flex items-center justify-center p-4">
              {/* Navigation */}
              <button
                onClick={() => setSelectedIdx(i => i !== null ? (i > 0 ? i - 1 : (isDemoMode ? MOCK_PHOTOS : [] as typeof MOCK_PHOTOS).length - 1) : null)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[hsl(0_0%_0%/0.5)] hover:bg-[hsl(0_0%_0%/0.7)] transition-colors z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedIdx(i => i !== null ? (i + 1) % (isDemoMode ? MOCK_PHOTOS : [] as typeof MOCK_PHOTOS).length : null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[hsl(0_0%_0%/0.5)] hover:bg-[hsl(0_0%_0%/0.7)] transition-colors z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Photo */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={photo!.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={cn("w-full h-full max-w-[400px] max-h-[300px] rounded-xl bg-gradient-to-br flex items-center justify-center", photo!.gradient)}
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
                >
                  <Image className="h-16 w-16 text-[hsl(0_0%_100%/0.15)]" />
                </motion.div>
              </AnimatePresence>

              {/* Close */}
              <button onClick={() => { setSelectedIdx(null); setShowInfo(false); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-[hsl(0_0%_0%/0.5)] hover:bg-[hsl(0_0%_0%/0.7)]">
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Info toggle */}
              <button onClick={() => setShowInfo(!showInfo)} className="absolute top-2 left-2 p-1.5 rounded-full bg-[hsl(0_0%_0%/0.5)] hover:bg-[hsl(0_0%_0%/0.7)]">
                <Info className="h-3.5 w-3.5" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[hsl(0_0%_0%/0.5)] text-[10px] tabular-nums">
                {selectedIdx + 1} / {(isDemoMode ? MOCK_PHOTOS : [] as typeof MOCK_PHOTOS).length}
              </div>
            </div>

            {/* Info Panel */}
            {showInfo && photo && (
              <div className="w-44 border-l border-[hsl(0_0%_12%)] p-3 space-y-3">
                <p className="text-[12px] font-semibold">{photo.title}</p>
                <div className="space-y-2">
                  {[
                    ["Date", photo.date],
                    ["Size", photo.size],
                    ["Dimensions", photo.dimensions],
                    ["Format", "JPEG"],
                    ["Camera", "iPhone 16 Pro"],
                    ["ISO", "200"],
                    ["Aperture", "f/1.8"],
                    ["Shutter", "1/125s"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[9px] text-[hsl(0_0%_40%)] uppercase tracking-wider">{k}</p>
                      <p className="text-[11px] text-[hsl(0_0%_65%)]">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="absolute bottom-0 left-0 right-0 bg-[hsl(0_0%_8%/0.95)] backdrop-blur-lg border-t border-[hsl(0_0%_15%)] p-3">
            <div className="flex gap-6">
              {[
                { label: "Brightness", icon: Sun, value: brightness, set: setBrightness },
                { label: "Contrast", icon: Contrast, value: contrast, set: setContrast },
                { label: "Saturation", icon: Droplets, value: saturation, set: setSaturation },
              ].map(f => (
                <div key={f.label} className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <f.icon className="h-3 w-3 text-[hsl(0_0%_40%)]" />
                    <span className="text-[10px] text-[hsl(0_0%_50%)]">{f.label}</span>
                    <span className="text-[10px] text-[hsl(0_0%_35%)] ml-auto tabular-nums">{f.value}%</span>
                  </div>
                  <input
                    type="range" min="50" max="150" value={f.value}
                    onChange={e => f.set(Number(e.target.value))}
                    className="w-full h-1 bg-[hsl(0_0%_20%)] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(265_55%_60%)]"
                  />
                </div>
              ))}
              <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }} className="text-[10px] text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_60%)] self-end pb-0.5">Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
