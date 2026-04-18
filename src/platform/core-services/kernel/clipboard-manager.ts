// ═══════════════════════════════════════════════════════════════
// SITA OS — Clipboard & Selection Transfer Manager
// MIME-typed clipboard with primary/clipboard selections,
// copy/paste/cut protocol, data offer/accept model, history
// ring buffer, and inter-window transfer protocol.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type ClipboardSelection = "clipboard" | "primary" | "secondary";

export type ClipboardMimeType =
  | "text/plain"
  | "text/html"
  | "text/uri-list"
  | "image/png"
  | "image/jpeg"
  | "application/json"
  | "application/octet-stream"
  | string; // extensible

export interface ClipboardEntry {
  id: string;
  mimeType: ClipboardMimeType;
  data: Uint8Array | string;
  sourceWindowId: string | null;
  timestamp: number;
  /** Size in bytes */
  size: number;
}

export interface ClipboardOffer {
  offerId: string;
  sourceWindowId: string;
  availableTypes: ClipboardMimeType[];
  timestamp: number;
}

export interface ClipboardRequest {
  requestId: string;
  targetWindowId: string;
  requestedType: ClipboardMimeType;
  offerId: string;
  timestamp: number;
}

export interface DragDropOffer {
  offerId: string;
  sourceWindowId: string;
  availableTypes: ClipboardMimeType[];
  x: number;
  y: number;
  timestamp: number;
}

export interface DragDropResult {
  accepted: boolean;
  targetWindowId: string | null;
  acceptedType: ClipboardMimeType | null;
  data: Uint8Array | string | null;
}

export interface ClipboardManagerStats {
  clipboardEntries: number;
  primarySelection: boolean;
  historySize: number;
  maxHistorySize: number;
  totalCopies: number;
  totalPastes: number;
  totalCuts: number;
  activeDragDrop: boolean;
  pendingOffers: number;
}

type ClipboardEventType = "copy" | "paste" | "cut" | "clear" | "offer" | "dnd-start" | "dnd-drop" | "dnd-cancel";

interface ClipboardEvent {
  type: ClipboardEventType;
  selection: ClipboardSelection;
  mimeType?: ClipboardMimeType;
  windowId?: string;
  timestamp: number;
}

type ClipboardEventListener = (event: ClipboardEvent) => void;

// ── Constants ────────────────────────────────────────────────

const MAX_HISTORY = 25;
const MAX_ENTRY_SIZE = 64 * 1024 * 1024; // 64 MB max per entry

// ═════════════════════════════════════════════════════════════

export class ClipboardManager {
  // Selections: clipboard (Ctrl+C/V), primary (auto-select), secondary (rare)
  private _selections = new Map<ClipboardSelection, ClipboardEntry | null>([
    ["clipboard", null],
    ["primary", null],
    ["secondary", null],
  ]);

  // History ring buffer (clipboard selection only)
  private _history: ClipboardEntry[] = [];
  private _maxHistory = MAX_HISTORY;

  // Pending data offers (lazy transfer model)
  private _offers = new Map<string, ClipboardOffer>();
  private _offerDataProviders = new Map<string, (mimeType: ClipboardMimeType) => Uint8Array | string | null>();

  // Drag-and-drop state
  private _activeDnD: DragDropOffer | null = null;
  private _dndDataProvider: ((mimeType: ClipboardMimeType) => Uint8Array | string | null) | null = null;

  // Tracking
  private _totalCopies = 0;
  private _totalPastes = 0;
  private _totalCuts = 0;
  private _nextId = 1;
  private _listeners: ClipboardEventListener[] = [];

  // ── Copy ───────────────────────────────────────────────────

  /**
   * Copy data to a selection.
   * For "primary" selection, this is typically auto-invoked on text select.
   */
  copy(
    mimeType: ClipboardMimeType,
    data: Uint8Array | string,
    selection: ClipboardSelection = "clipboard",
    sourceWindowId: string | null = null
  ): ClipboardEntry {
    const size = typeof data === "string" ? new TextEncoder().encode(data).length : data.length;
    if (size > MAX_ENTRY_SIZE) {
      throw new Error(`Clipboard entry exceeds max size (${size} > ${MAX_ENTRY_SIZE})`);
    }

    const entry: ClipboardEntry = {
      id: `clip-${this._nextId++}`,
      mimeType,
      data,
      sourceWindowId,
      timestamp: Date.now(),
      size,
    };

    this._selections.set(selection, entry);
    this._totalCopies++;

    // Add to history ring (clipboard only)
    if (selection === "clipboard") {
      this._history.unshift(entry);
      if (this._history.length > this._maxHistory) {
        this._history.pop();
      }
    }

    this._emit({ type: "copy", selection, mimeType, windowId: sourceWindowId ?? undefined, timestamp: entry.timestamp });
    return entry;
  }

  /**
   * Copy with lazy data provider (offer model).
   * Data is only materialized when paste is requested.
   */
  copyDeferred(
    availableTypes: ClipboardMimeType[],
    provider: (mimeType: ClipboardMimeType) => Uint8Array | string | null,
    selection: ClipboardSelection = "clipboard",
    sourceWindowId: string | null = null
  ): ClipboardOffer {
    const offer: ClipboardOffer = {
      offerId: `offer-${this._nextId++}`,
      sourceWindowId: sourceWindowId ?? "",
      availableTypes: [...availableTypes],
      timestamp: Date.now(),
    };

    this._offers.set(offer.offerId, offer);
    this._offerDataProviders.set(offer.offerId, provider);

    // Set a placeholder entry
    this._selections.set(selection, {
      id: offer.offerId,
      mimeType: availableTypes[0] ?? "application/octet-stream",
      data: "", // deferred
      sourceWindowId,
      timestamp: offer.timestamp,
      size: 0,
    });

    this._emit({ type: "offer", selection, windowId: sourceWindowId ?? undefined, timestamp: offer.timestamp });
    return offer;
  }

  // ── Paste ─────────────────────────────────────────────────

  /**
   * Read from a selection. Returns null if empty.
   * For "primary" selection, typically invoked on middle-click.
   */
  paste(
    mimeType?: ClipboardMimeType,
    selection: ClipboardSelection = "clipboard",
    targetWindowId?: string
  ): ClipboardEntry | null {
    const entry = this._selections.get(selection) ?? null;
    if (!entry) return null;

    // Check if this is a deferred offer that needs materialization
    const offer = this._offers.get(entry.id);
    if (offer) {
      const provider = this._offerDataProviders.get(entry.id);
      if (provider) {
        const requestedType = mimeType ?? offer.availableTypes[0] ?? "text/plain";
        if (!offer.availableTypes.includes(requestedType)) return null;

        const data = provider(requestedType);
        if (data === null) return null;

        // Materialize
        const materialized: ClipboardEntry = {
          ...entry,
          mimeType: requestedType,
          data,
          size: typeof data === "string" ? new TextEncoder().encode(data).length : data.length,
        };
        this._totalPastes++;
        this._emit({ type: "paste", selection, mimeType: requestedType, windowId: targetWindowId, timestamp: Date.now() });
        return materialized;
      }
    }

    // Direct paste
    if (mimeType && entry.mimeType !== mimeType) {
      // Type mismatch — attempt conversion for text types
      if (mimeType === "text/plain" && entry.mimeType === "text/html") {
        const text = typeof entry.data === "string" ? entry.data.replace(/<[^>]*>/g, "") : "";
        this._totalPastes++;
        this._emit({ type: "paste", selection, mimeType, windowId: targetWindowId, timestamp: Date.now() });
        return { ...entry, mimeType: "text/plain", data: text };
      }
      return null; // incompatible types
    }

    this._totalPastes++;
    this._emit({ type: "paste", selection, mimeType: entry.mimeType, windowId: targetWindowId, timestamp: Date.now() });
    return { ...entry };
  }

  /**
   * Check what MIME types are available without materializing data.
   */
  getAvailableTypes(selection: ClipboardSelection = "clipboard"): ClipboardMimeType[] {
    const entry = this._selections.get(selection);
    if (!entry) return [];

    const offer = this._offers.get(entry.id);
    if (offer) return [...offer.availableTypes];

    return [entry.mimeType];
  }

  // ── Cut ───────────────────────────────────────────────────

  /**
   * Cut = copy + signal source to delete.
   * Returns the copied entry; source app should listen for "cut" event.
   */
  cut(
    mimeType: ClipboardMimeType,
    data: Uint8Array | string,
    sourceWindowId: string | null = null
  ): ClipboardEntry {
    const entry = this.copy(mimeType, data, "clipboard", sourceWindowId);
    this._totalCuts++;
    this._emit({ type: "cut", selection: "clipboard", mimeType, windowId: sourceWindowId ?? undefined, timestamp: Date.now() });
    return entry;
  }

  // ── Clear ─────────────────────────────────────────────────

  clear(selection: ClipboardSelection = "clipboard"): void {
    const entry = this._selections.get(selection);
    if (entry) {
      this._offers.delete(entry.id);
      this._offerDataProviders.delete(entry.id);
    }
    this._selections.set(selection, null);
    this._emit({ type: "clear", selection, timestamp: Date.now() });
  }

  clearAll(): void {
    for (const sel of this._selections.keys()) this.clear(sel);
  }

  // ── History ───────────────────────────────────────────────

  getHistory(): ClipboardEntry[] {
    return [...this._history];
  }

  getHistoryEntry(index: number): ClipboardEntry | null {
    return this._history[index] ?? null;
  }

  /**
   * Paste from history by index (promotes to current clipboard).
   */
  pasteFromHistory(index: number, targetWindowId?: string): ClipboardEntry | null {
    const entry = this._history[index];
    if (!entry) return null;

    // Promote to current clipboard
    this._selections.set("clipboard", { ...entry, timestamp: Date.now() });
    this._totalPastes++;
    this._emit({ type: "paste", selection: "clipboard", mimeType: entry.mimeType, windowId: targetWindowId, timestamp: Date.now() });
    return { ...entry };
  }

  clearHistory(): void {
    this._history = [];
  }

  setMaxHistory(max: number): void {
    this._maxHistory = Math.max(1, Math.min(100, max));
    while (this._history.length > this._maxHistory) this._history.pop();
  }

  // ── Drag-and-Drop Protocol ────────────────────────────────

  /**
   * Source window initiates a drag with available data types.
   */
  dndStart(
    sourceWindowId: string,
    availableTypes: ClipboardMimeType[],
    provider: (mimeType: ClipboardMimeType) => Uint8Array | string | null,
    x: number,
    y: number
  ): DragDropOffer {
    const offer: DragDropOffer = {
      offerId: `dnd-${this._nextId++}`,
      sourceWindowId,
      availableTypes: [...availableTypes],
      x, y,
      timestamp: Date.now(),
    };
    this._activeDnD = offer;
    this._dndDataProvider = provider;
    this._emit({ type: "dnd-start", selection: "clipboard", windowId: sourceWindowId, timestamp: offer.timestamp });
    return offer;
  }

  /**
   * Update drag position (for hover feedback routing).
   */
  dndMove(x: number, y: number): void {
    if (this._activeDnD) {
      this._activeDnD.x = x;
      this._activeDnD.y = y;
    }
  }

  /**
   * Target window accepts the drop.
   */
  dndDrop(
    targetWindowId: string,
    acceptedType: ClipboardMimeType
  ): DragDropResult {
    if (!this._activeDnD || !this._dndDataProvider) {
      return { accepted: false, targetWindowId: null, acceptedType: null, data: null };
    }

    if (!this._activeDnD.availableTypes.includes(acceptedType)) {
      return { accepted: false, targetWindowId, acceptedType: null, data: null };
    }

    const data = this._dndDataProvider(acceptedType);
    const result: DragDropResult = {
      accepted: data !== null,
      targetWindowId,
      acceptedType: data !== null ? acceptedType : null,
      data,
    };

    this._emit({ type: "dnd-drop", selection: "clipboard", windowId: targetWindowId, timestamp: Date.now() });
    this._activeDnD = null;
    this._dndDataProvider = null;
    return result;
  }

  /**
   * Cancel active drag-and-drop.
   */
  dndCancel(): void {
    if (this._activeDnD) {
      this._emit({ type: "dnd-cancel", selection: "clipboard", windowId: this._activeDnD.sourceWindowId, timestamp: Date.now() });
      this._activeDnD = null;
      this._dndDataProvider = null;
    }
  }

  getActiveDnD(): DragDropOffer | null {
    return this._activeDnD ? { ...this._activeDnD } : null;
  }

  // ── Events ────────────────────────────────────────────────

  addEventListener(listener: ClipboardEventListener): () => void {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter((l) => l !== listener); };
  }

  private _emit(event: ClipboardEvent): void {
    for (const l of this._listeners) l(event);
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): ClipboardManagerStats {
    return {
      clipboardEntries: Array.from(this._selections.values()).filter((e) => e !== null).length,
      primarySelection: this._selections.get("primary") !== null,
      historySize: this._history.length,
      maxHistorySize: this._maxHistory,
      totalCopies: this._totalCopies,
      totalPastes: this._totalPastes,
      totalCuts: this._totalCuts,
      activeDragDrop: this._activeDnD !== null,
      pendingOffers: this._offers.size,
    };
  }
}
