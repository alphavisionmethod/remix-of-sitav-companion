// ═══════════════════════════════════════════════════════════════
// Nova SDK — Graphics Context
// Lightweight 2D drawing API wrapping Canvas
// Enforces system colors, radii, and typography
// ═══════════════════════════════════════════════════════════════

export interface NovaColor {
  h: number; s: number; l: number; a?: number;
}

function colorToCSS(c: NovaColor): string {
  return `hsl(${c.h} ${c.s}% ${c.l}%${c.a !== undefined ? ` / ${c.a}` : ""})`;
}

export class NovaContext {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
    // Set default font
    this.ctx.font = "13px 'Inter', system-ui, sans-serif";
    this.ctx.textBaseline = "top";
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  fillRect(x: number, y: number, w: number, h: number, color: NovaColor): void {
    this.ctx.fillStyle = colorToCSS(color);
    this.ctx.fillRect(x, y, w, h);
  }

  drawRoundedRect(x: number, y: number, w: number, h: number, radius: number, color: NovaColor): void {
    this.ctx.fillStyle = colorToCSS(color);
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, radius);
    this.ctx.fill();
  }

  drawText(text: string, x: number, y: number, color: NovaColor, fontSize = 13): void {
    this.ctx.fillStyle = colorToCSS(color);
    this.ctx.font = `${fontSize}px 'Inter', system-ui, sans-serif`;
    this.ctx.fillText(text, x, y);
  }

  drawGradient(x: number, y: number, w: number, h: number, colorA: NovaColor, colorB: NovaColor, angle = 135): void {
    const rad = (angle * Math.PI) / 180;
    const gx = x + w * Math.cos(rad);
    const gy = y + h * Math.sin(rad);
    const gradient = this.ctx.createLinearGradient(x, y, gx, gy);
    gradient.addColorStop(0, colorToCSS(colorA));
    gradient.addColorStop(1, colorToCSS(colorB));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);
  }

  drawCircle(cx: number, cy: number, radius: number, color: NovaColor): void {
    this.ctx.fillStyle = colorToCSS(color);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawImage(img: HTMLImageElement, x: number, y: number, w?: number, h?: number): void {
    if (w && h) {
      this.ctx.drawImage(img, x, y, w, h);
    } else {
      this.ctx.drawImage(img, x, y);
    }
  }

  get raw(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
