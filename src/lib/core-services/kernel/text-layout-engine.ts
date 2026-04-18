// ═══════════════════════════════════════════════════════════════
// SITA OS — Text Layout Engine
// Line breaking (greedy + Knuth-Plass), word wrap, alignment,
// paragraph layout, font metrics, fallback chain, bidi stub
// ═══════════════════════════════════════════════════════════════

// ── Font Metrics ─────────────────────────────────────────────

export interface FontMetrics {
  family: string;
  size: number;
  ascent: number;
  descent: number;
  lineGap: number;
  unitsPerEm: number;
  xHeight: number;
  capHeight: number;
}

export interface GlyphMetrics {
  charCode: number;
  advance: number;   // horizontal advance in px
  bearingX: number;
  bearingY: number;
  width: number;
  height: number;
}

/** Simulated font metrics lookup */
function getSimulatedFontMetrics(family: string, size: number): FontMetrics {
  // Approximate metrics based on common fonts
  const scale = size / 1000;
  return {
    family,
    size,
    ascent: Math.round(800 * scale),
    descent: Math.round(200 * scale),
    lineGap: Math.round(90 * scale),
    unitsPerEm: 1000,
    xHeight: Math.round(500 * scale),
    capHeight: Math.round(700 * scale),
  };
}

/** Simulated glyph advance width */
function getSimulatedGlyphAdvance(charCode: number, fontSize: number): number {
  // Monospace approximation adjusted by char class
  const base = fontSize * 0.6;
  if (charCode === 32) return base * 0.5; // space
  if (charCode === 9) return base * 2;    // tab
  if (charCode >= 65 && charCode <= 90) return base * 1.1; // uppercase wider
  if (charCode === 109 || charCode === 119) return base * 1.2; // m, w
  if (charCode === 105 || charCode === 108) return base * 0.5; // i, l
  return base;
}

// ── Text Layout Types ────────────────────────────────────────

export type TextAlign = "left" | "center" | "right" | "justify";
export type TextOverflow = "clip" | "ellipsis" | "visible";
export type VerticalAlign = "top" | "middle" | "bottom";
export type LineBreakMode = "greedy" | "optimal";
export type TextDirection = "ltr" | "rtl";

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: number; // multiplier, default 1.2
  letterSpacing?: number;
  wordSpacing?: number;
  color?: { r: number; g: number; b: number; a: number };
}

export interface TextLayoutBox {
  maxWidth: number;
  maxHeight?: number;
  maxLines?: number;
  align?: TextAlign;
  verticalAlign?: VerticalAlign;
  overflow?: TextOverflow;
  lineBreakMode?: LineBreakMode;
  direction?: TextDirection;
  indent?: number; // first-line indent
}

export interface PositionedGlyph {
  charCode: number;
  x: number;
  y: number;
  advance: number;
  fontSize: number;
  fontFamily: string;
}

export interface TextLine {
  glyphs: PositionedGlyph[];
  width: number;
  ascent: number;
  descent: number;
  lineHeight: number;
  y: number; // baseline Y position
  isTruncated: boolean;
}

export interface TextLayoutResult {
  lines: TextLine[];
  totalWidth: number;
  totalHeight: number;
  truncated: boolean;
  glyphCount: number;
  lineCount: number;
}

export interface FontFallbackEntry {
  family: string;
  ranges: Array<[number, number]>; // Unicode ranges [start, end]
}

export interface TextLayoutEngineStats {
  totalLayouts: number;
  totalGlyphsPositioned: number;
  totalLinesCreated: number;
  greedyBreaks: number;
  optimalBreaks: number;
  truncations: number;
  fallbackLookups: number;
}

// ── Text Layout Engine ───────────────────────────────────────

export class TextLayoutEngine {
  private _fallbackChain: FontFallbackEntry[] = [];
  private _stats: TextLayoutEngineStats = {
    totalLayouts: 0,
    totalGlyphsPositioned: 0,
    totalLinesCreated: 0,
    greedyBreaks: 0,
    optimalBreaks: 0,
    truncations: 0,
    fallbackLookups: 0,
  };

  // ── Font Fallback Chain ──────────────────────────────────

  setFallbackChain(chain: FontFallbackEntry[]): void {
    this._fallbackChain = chain;
  }

  resolveFontFamily(charCode: number, preferred: string): string {
    // Check if preferred font covers this codepoint (assume yes for ASCII)
    if (charCode < 128) return preferred;

    for (const entry of this._fallbackChain) {
      for (const [start, end] of entry.ranges) {
        if (charCode >= start && charCode <= end) {
          this._stats.fallbackLookups++;
          return entry.family;
        }
      }
    }
    return preferred;
  }

  // ── Layout ────────────────────────────────────────────────

  layout(text: string, style: TextStyle, box: TextLayoutBox): TextLayoutResult {
    this._stats.totalLayouts++;

    const metrics = getSimulatedFontMetrics(style.fontFamily, style.fontSize);
    const lineHeightMul = style.lineHeight ?? 1.2;
    const lineHeight = (metrics.ascent + metrics.descent + metrics.lineGap) * lineHeightMul;
    const letterSpacing = style.letterSpacing ?? 0;
    const wordSpacing = style.wordSpacing ?? 0;

    // Measure all glyphs
    const glyphAdvances: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      let advance = getSimulatedGlyphAdvance(charCode, style.fontSize) + letterSpacing;
      if (charCode === 32) advance += wordSpacing;
      glyphAdvances.push(advance);
    }

    // Break into lines
    const breakMode = box.lineBreakMode ?? "greedy";
    const lineBreaks = breakMode === "optimal"
      ? this._optimalBreak(text, glyphAdvances, box.maxWidth, box.indent ?? 0)
      : this._greedyBreak(text, glyphAdvances, box.maxWidth, box.indent ?? 0);

    if (breakMode === "optimal") this._stats.optimalBreaks++;
    else this._stats.greedyBreaks++;

    // Build lines with positioned glyphs
    const lines: TextLine[] = [];
    let currentY = metrics.ascent;
    let truncated = false;

    for (let li = 0; li < lineBreaks.length; li++) {
      // Check max lines
      if (box.maxLines && li >= box.maxLines) {
        truncated = true;
        this._stats.truncations++;
        break;
      }
      // Check max height
      if (box.maxHeight && currentY + metrics.descent > box.maxHeight) {
        truncated = true;
        this._stats.truncations++;
        break;
      }

      const { start, end } = lineBreaks[li];
      const lineGlyphs: PositionedGlyph[] = [];
      let lineWidth = 0;

      for (let ci = start; ci < end; ci++) {
        const charCode = text.charCodeAt(ci);
        const family = this.resolveFontFamily(charCode, style.fontFamily);
        lineGlyphs.push({
          charCode,
          x: lineWidth,
          y: currentY,
          advance: glyphAdvances[ci],
          fontSize: style.fontSize,
          fontFamily: family,
        });
        lineWidth += glyphAdvances[ci];
      }

      // Trim trailing whitespace width
      let trimmedWidth = lineWidth;
      for (let i = lineGlyphs.length - 1; i >= 0; i--) {
        if (text.charCodeAt(lineBreaks[li].start + i) === 32) {
          trimmedWidth -= lineGlyphs[i].advance;
        } else break;
      }

      // Handle ellipsis truncation
      const isTruncated = truncated && li === (box.maxLines ?? Infinity) - 1;
      if (isTruncated && box.overflow === "ellipsis" && lineGlyphs.length > 0) {
        const ellipsisWidth = getSimulatedGlyphAdvance(0x2026, style.fontSize);
        while (lineGlyphs.length > 0 && trimmedWidth + ellipsisWidth > box.maxWidth) {
          const removed = lineGlyphs.pop()!;
          trimmedWidth -= removed.advance;
        }
        lineGlyphs.push({
          charCode: 0x2026, // …
          x: trimmedWidth,
          y: currentY,
          advance: ellipsisWidth,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
        });
        trimmedWidth += ellipsisWidth;
      }

      // Apply alignment
      this._applyAlignment(lineGlyphs, trimmedWidth, box.maxWidth, box.align ?? "left");

      lines.push({
        glyphs: lineGlyphs,
        width: trimmedWidth,
        ascent: metrics.ascent,
        descent: metrics.descent,
        lineHeight,
        y: currentY,
        isTruncated,
      });

      this._stats.totalLinesCreated++;
      this._stats.totalGlyphsPositioned += lineGlyphs.length;
      currentY += lineHeight;
    }

    // Vertical alignment
    const totalHeight = lines.length * lineHeight;
    if (box.maxHeight && box.verticalAlign) {
      const offset = box.verticalAlign === "middle"
        ? (box.maxHeight - totalHeight) / 2
        : box.verticalAlign === "bottom"
          ? box.maxHeight - totalHeight
          : 0;
      if (offset > 0) {
        for (const line of lines) {
          line.y += offset;
          for (const g of line.glyphs) g.y += offset;
        }
      }
    }

    return {
      lines,
      totalWidth: Math.max(0, ...lines.map(l => l.width)),
      totalHeight,
      truncated,
      glyphCount: lines.reduce((sum, l) => sum + l.glyphs.length, 0),
      lineCount: lines.length,
    };
  }

  getStats(): TextLayoutEngineStats {
    return { ...this._stats };
  }

  // ── Line Breaking ──────────────────────────────────────────

  private _greedyBreak(
    text: string,
    advances: number[],
    maxWidth: number,
    indent: number
  ): Array<{ start: number; end: number }> {
    const lines: Array<{ start: number; end: number }> = [];
    let lineStart = 0;
    let lineWidth = indent;
    let lastBreak = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);

      // Newline
      if (ch === 10) {
        lines.push({ start: lineStart, end: i });
        lineStart = i + 1;
        lineWidth = 0;
        lastBreak = lineStart;
        continue;
      }

      lineWidth += advances[i];

      // Word boundary
      if (ch === 32 || ch === 9) {
        lastBreak = i + 1;
      }

      // Overflow
      if (lineWidth > maxWidth && i > lineStart) {
        if (lastBreak > lineStart) {
          lines.push({ start: lineStart, end: lastBreak });
          lineStart = lastBreak;
        } else {
          // Force break at current position (no word boundary found)
          lines.push({ start: lineStart, end: i });
          lineStart = i;
        }
        // Recalculate line width
        lineWidth = 0;
        for (let j = lineStart; j <= i; j++) lineWidth += advances[j];
        lastBreak = lineStart;
      }
    }

    if (lineStart < text.length) {
      lines.push({ start: lineStart, end: text.length });
    }

    return lines;
  }

  /** Knuth-Plass optimal line breaking (simplified) */
  private _optimalBreak(
    text: string,
    advances: number[],
    maxWidth: number,
    indent: number
  ): Array<{ start: number; end: number }> {
    // Find all possible breakpoints (spaces, hyphens)
    const breakpoints: number[] = [0];
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 32 || ch === 10 || ch === 45) { // space, newline, hyphen
        breakpoints.push(i + 1);
      }
    }
    breakpoints.push(text.length);

    const n = breakpoints.length;
    const cost = new Float64Array(n).fill(Infinity);
    const parent = new Int32Array(n).fill(-1);
    cost[0] = 0;

    for (let i = 0; i < n - 1; i++) {
      if (cost[i] === Infinity) continue;
      let width = (i === 0) ? indent : 0;

      for (let j = i + 1; j < n; j++) {
        // Measure width from breakpoints[i] to breakpoints[j]
        for (let k = (j === i + 1) ? breakpoints[i] : breakpoints[j - 1]; k < breakpoints[j]; k++) {
          width += advances[k];
        }

        if (width > maxWidth * 1.1 && j > i + 1) break; // prune

        const slack = maxWidth - width;
        const penalty = j === n - 1 ? 0 : slack * slack; // minimize raggedness
        const forced = text.charCodeAt(breakpoints[j] - 1) === 10 ? 0 : 0;

        if (cost[i] + penalty + forced < cost[j]) {
          cost[j] = cost[i] + penalty + forced;
          parent[j] = i;
        }

        // Reset width for next j (recompute from scratch)
        if (j + 1 < n) {
          width = (i === 0) ? indent : 0;
          for (let k = breakpoints[i]; k < breakpoints[j + 1]; k++) {
            width += advances[k];
          }
          // Actually, we need cumulative — simplified approach:
          // Just recalculate
        }
      }
    }

    // Trace back
    const lineBreakIndices: number[] = [];
    let idx = n - 1;
    while (idx > 0) {
      lineBreakIndices.unshift(idx);
      idx = parent[idx];
    }

    const lines: Array<{ start: number; end: number }> = [];
    let prev = 0;
    for (const bi of lineBreakIndices) {
      lines.push({ start: breakpoints[prev], end: breakpoints[bi] });
      prev = bi;
    }

    return lines.length > 0 ? lines : this._greedyBreak(text, advances, maxWidth, indent);
  }

  private _applyAlignment(
    glyphs: PositionedGlyph[],
    lineWidth: number,
    maxWidth: number,
    align: TextAlign
  ): void {
    if (glyphs.length === 0) return;

    switch (align) {
      case "center": {
        const offset = (maxWidth - lineWidth) / 2;
        for (const g of glyphs) g.x += offset;
        break;
      }
      case "right": {
        const offset = maxWidth - lineWidth;
        for (const g of glyphs) g.x += offset;
        break;
      }
      case "justify": {
        // Distribute extra space between words
        const spaces = glyphs.filter(g => g.charCode === 32).length;
        if (spaces > 0 && lineWidth < maxWidth) {
          const extra = (maxWidth - lineWidth) / spaces;
          let accumulated = 0;
          for (const g of glyphs) {
            g.x += accumulated;
            if (g.charCode === 32) accumulated += extra;
          }
        }
        break;
      }
      // "left" — no adjustment needed
    }
  }
}
