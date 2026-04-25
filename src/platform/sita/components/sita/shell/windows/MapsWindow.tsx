// ═══════════════════════════════════════════════════════════════
// Nova OS — Maps Window App
// Canvas-rendered stylized map with POI, search, directions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, Navigation, MapPin, Layers, ZoomIn, ZoomOut,
  Coffee, ShoppingBag, Utensils, Building2, X, Route
} from "lucide-react";

interface POI {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  icon: string;
  color: string;
}

const POIS: POI[] = [
  { id: "1", name: "SITA HQ", category: "Office", x: 200, y: 180, icon: "🏢", color: "hsl(265 55% 58%)" },
  { id: "2", name: "Café Nova", category: "Coffee", x: 320, y: 150, icon: "☕", color: "hsl(35 80% 50%)" },
  { id: "3", name: "Central Market", category: "Shopping", x: 150, y: 280, icon: "🛍️", color: "hsl(340 65% 55%)" },
  { id: "4", name: "The Digital Lab", category: "Tech", x: 380, y: 250, icon: "💻", color: "hsl(190 60% 50%)" },
  { id: "5", name: "Riverside Park", category: "Park", x: 100, y: 120, icon: "🌳", color: "hsl(140 55% 45%)" },
  { id: "6", name: "Nova Restaurant", category: "Dining", x: 280, y: 320, icon: "🍽️", color: "hsl(15 70% 50%)" },
  { id: "7", name: "City Library", category: "Culture", x: 350, y: 100, icon: "📚", color: "hsl(220 55% 50%)" },
  { id: "8", name: "Fitness Hub", category: "Gym", x: 420, y: 180, icon: "💪", color: "hsl(0 65% 50%)" },
];

function MapCanvas({ zoom, offset, darkMode, pois, selectedPoi, onSelectPoi }: {
  zoom: number; offset: { x: number; y: number }; darkMode: boolean;
  pois: POI[]; selectedPoi: string | null; onSelectPoi: (id: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = darkMode ? "hsl(220, 15%, 10%)" : "hsl(210, 25%, 95%)";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Grid roads
    const roadColor = darkMode ? "hsl(220, 10%, 18%)" : "hsl(210, 15%, 88%)";
    const mainRoadColor = darkMode ? "hsl(220, 12%, 22%)" : "hsl(210, 15%, 82%)";

    // Main roads
    ctx.strokeStyle = mainRoadColor;
    ctx.lineWidth = 8;
    [[0, 200, 600, 200], [0, 300, 600, 300], [250, 0, 250, 450], [400, 0, 400, 450]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });

    // Secondary roads
    ctx.strokeStyle = roadColor;
    ctx.lineWidth = 4;
    for (let i = 0; i <= 600; i += 80) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(600, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 450); ctx.stroke();
    }

    // Buildings (blocks between roads)
    const blockColor = darkMode ? "hsl(220, 12%, 14%)" : "hsl(210, 20%, 92%)";
    ctx.fillStyle = blockColor;
    [[20, 20, 60, 60], [90, 30, 50, 50], [20, 220, 70, 50], [300, 50, 40, 60],
     [310, 220, 50, 40], [430, 130, 55, 45], [120, 140, 40, 35], [440, 280, 50, 50]].forEach(([x, y, w, h]) => {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
    });

    // Water feature
    ctx.fillStyle = darkMode ? "hsl(210, 40%, 18%)" : "hsl(200, 50%, 80%)";
    ctx.beginPath();
    ctx.ellipse(50, 380, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Park area
    ctx.fillStyle = darkMode ? "hsl(140, 25%, 15%)" : "hsl(140, 30%, 85%)";
    ctx.beginPath(); ctx.roundRect(70, 90, 80, 60, 8); ctx.fill();

    ctx.restore();

    // POI Markers (drawn in screen space for consistent size)
    pois.forEach(poi => {
      const sx = poi.x * zoom + offset.x;
      const sy = poi.y * zoom + offset.y;
      const isSelected = poi.id === selectedPoi;
      const r = isSelected ? 16 : 12;

      // Shadow
      ctx.beginPath();
      ctx.arc(sx, sy + 2, r, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.2)";
      ctx.fill();

      // Pin
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = poi.color;
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Emoji
      ctx.font = `${isSelected ? 14 : 11}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(poi.icon, sx, sy);
    });
  }, [zoom, offset, darkMode, pois, selectedPoi]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    for (const poi of pois) {
      const sx = poi.x * zoom + offset.x;
      const sy = poi.y * zoom + offset.y;
      if (Math.hypot(cx - sx, cy - sy) < 16) {
        onSelectPoi(poi.id);
        return;
      }
    }
    onSelectPoi(null);
  }, [pois, zoom, offset, onSelectPoi]);

  return <canvas ref={canvasRef} width={500} height={400} className="w-full h-full" onClick={handleClick} />;
}

export function MapsWindow() {
  const [zoom, setZoom] = useState(1);
  const [offset] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDirections, setShowDirections] = useState(false);

  const selected = POIS.find(p => p.id === selectedPoi);
  const filteredPois = searchQuery
    ? POIS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : POIS;

  return (
    <div className="h-[420px] bg-[hsl(0_0%_6%)] text-[hsl(0_0%_85%)] rounded-b-xl overflow-hidden relative">
      {/* Map */}
      <MapCanvas
        zoom={zoom}
        offset={offset}
        darkMode={darkMode}
        pois={filteredPois}
        selectedPoi={selectedPoi}
        onSelectPoi={setSelectedPoi}
      />

      {/* Search Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(0_0%_8%/0.9)] backdrop-blur-xl border border-[hsl(0_0%_15%)] shadow-lg">
          <Search className="h-3.5 w-3.5 text-[hsl(0_0%_40%)]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search places..."
            className="flex-1 bg-transparent text-[12px] text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_30%)] outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}><X className="h-3 w-3 text-[hsl(0_0%_40%)]" /></button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery && filteredPois.length > 0 && (
          <div className="mt-1 rounded-xl bg-[hsl(0_0%_8%/0.95)] backdrop-blur-xl border border-[hsl(0_0%_15%)] shadow-lg overflow-hidden">
            {filteredPois.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedPoi(p.id); setSearchQuery(""); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[hsl(0_0%_15%)] transition-colors"
              >
                <span>{p.icon}</span>
                <div>
                  <p className="text-[11px] font-medium">{p.name}</p>
                  <p className="text-[9px] text-[hsl(0_0%_40%)]">{p.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute right-3 bottom-20 flex flex-col gap-1 z-10">
        <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%/0.9)] backdrop-blur-lg border border-[hsl(0_0%_20%)] flex items-center justify-center hover:bg-[hsl(0_0%_15%)]">
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%/0.9)] backdrop-blur-lg border border-[hsl(0_0%_20%)] flex items-center justify-center hover:bg-[hsl(0_0%_15%)]">
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setDarkMode(!darkMode)} className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%/0.9)] backdrop-blur-lg border border-[hsl(0_0%_20%)] flex items-center justify-center hover:bg-[hsl(0_0%_15%)]">
          <Layers className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setShowDirections(!showDirections)} className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%/0.9)] backdrop-blur-lg border border-[hsl(0_0%_20%)] flex items-center justify-center hover:bg-[hsl(0_0%_15%)]">
          <Route className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* POI Info Card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-3 left-3 right-3 z-10 rounded-xl bg-[hsl(0_0%_8%/0.95)] backdrop-blur-xl border border-[hsl(0_0%_15%)] p-3 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${selected.color}22` }}>
                {selected.icon}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">{selected.name}</p>
                <p className="text-[10px] text-[hsl(0_0%_45%)]">{selected.category}</p>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 rounded-lg text-[10px] font-medium transition-colors" style={{ background: selected.color, color: "white" }}>
                    Directions
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-[hsl(0_0%_15%)] text-[10px] text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_20%)]">
                    Save
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedPoi(null)}>
                <X className="h-3.5 w-3.5 text-[hsl(0_0%_40%)]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directions Panel */}
      <AnimatePresence>
        {showDirections && (
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -200 }}
            className="absolute top-0 left-0 bottom-0 w-48 bg-[hsl(0_0%_8%/0.95)] backdrop-blur-xl border-r border-[hsl(0_0%_15%)] z-20 p-3"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold">Directions</span>
              <button onClick={() => setShowDirections(false)}><X className="h-3 w-3 text-[hsl(0_0%_40%)]" /></button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(152_55%_48%)]" />
                <input placeholder="Start" className="flex-1 bg-[hsl(0_0%_12%)] rounded px-2 py-1 text-[10px] outline-none border border-[hsl(0_0%_18%)]" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(0_65%_50%)]" />
                <input placeholder="End" className="flex-1 bg-[hsl(0_0%_12%)] rounded px-2 py-1 text-[10px] outline-none border border-[hsl(0_0%_18%)]" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {["Drive — 12 min", "Walk — 35 min", "Transit — 20 min"].map(r => (
                <div key={r} className="px-2 py-1.5 rounded-lg bg-[hsl(0_0%_12%)] text-[10px] text-[hsl(0_0%_55%)] hover:bg-[hsl(0_0%_15%)] cursor-pointer transition-colors">
                  {r}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
