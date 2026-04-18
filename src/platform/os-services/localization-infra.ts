// ═══════════════════════════════════════════════════════════════
// SITA OS — Localization Infrastructure
// Language packs, RTL, locale formatting, IME support
// ═══════════════════════════════════════════════════════════════

export interface LanguagePack {
  locale: string;
  displayName: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  loaded: boolean;
  strings: Record<string, string>;
  dateFormat: string;
  timeFormat: string;
  numberFormat: { decimal: string; thousands: string; currency: string };
}

export interface IMEConfig {
  id: string;
  name: string;
  locale: string;
  active: boolean;
  type: 'keyboard' | 'handwriting' | 'voice' | 'pinyin' | 'kana';
}

class LocalizationInfra {
  private packs = new Map<string, LanguagePack>();
  private activeLocale = 'en-US';
  private imeConfigs: IMEConfig[] = [];

  constructor() {
    // Register default packs
    const defaults: LanguagePack[] = [
      { locale: 'en-US', displayName: 'English (US)', nativeName: 'English', direction: 'ltr', loaded: true, strings: {}, dateFormat: 'MM/DD/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'USD' } },
      { locale: 'en-GB', displayName: 'English (UK)', nativeName: 'English', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'GBP' } },
      { locale: 'es-ES', displayName: 'Spanish', nativeName: 'Español', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR' } },
      { locale: 'fr-FR', displayName: 'French', nativeName: 'Français', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'EUR' } },
      { locale: 'de-DE', displayName: 'German', nativeName: 'Deutsch', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR' } },
      { locale: 'ja-JP', displayName: 'Japanese', nativeName: '日本語', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'YYYY/MM/DD', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'JPY' } },
      { locale: 'zh-CN', displayName: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'CNY' } },
      { locale: 'ar-SA', displayName: 'Arabic', nativeName: 'العربية', direction: 'rtl', loaded: false, strings: {}, dateFormat: 'DD/MM/YYYY', timeFormat: 'hh:mm', numberFormat: { decimal: '٫', thousands: '٬', currency: 'SAR' } },
      { locale: 'he-IL', displayName: 'Hebrew', nativeName: 'עברית', direction: 'rtl', loaded: false, strings: {}, dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'ILS' } },
      { locale: 'ko-KR', displayName: 'Korean', nativeName: '한국어', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'YYYY.MM.DD', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'KRW' } },
      { locale: 'pt-BR', displayName: 'Portuguese (Brazil)', nativeName: 'Português', direction: 'ltr', loaded: false, strings: {}, dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'BRL' } },
    ];
    defaults.forEach(p => this.packs.set(p.locale, p));
  }

  getActiveLocale(): string { return this.activeLocale; }
  getActivePack(): LanguagePack | undefined { return this.packs.get(this.activeLocale); }
  isRTL(): boolean { return this.getActivePack()?.direction === 'rtl'; }

  setLocale(locale: string): boolean {
    if (!this.packs.has(locale)) return false;
    this.activeLocale = locale;
    return true;
  }

  availableLocales(): { locale: string; displayName: string; nativeName: string; direction: string }[] {
    return [...this.packs.values()].map(p => ({ locale: p.locale, displayName: p.displayName, nativeName: p.nativeName, direction: p.direction }));
  }

  /** Format a number according to current locale */
  formatNumber(value: number): string {
    const pack = this.getActivePack();
    if (!pack) return value.toString();
    try { return new Intl.NumberFormat(pack.locale).format(value); } catch { return value.toString(); }
  }

  /** Format a date according to current locale */
  formatDate(date: Date): string {
    const pack = this.getActivePack();
    if (!pack) return date.toLocaleDateString();
    try { return new Intl.DateTimeFormat(pack.locale).format(date); } catch { return date.toLocaleDateString(); }
  }

  /** Format currency */
  formatCurrency(value: number, currency?: string): string {
    const pack = this.getActivePack();
    const curr = currency ?? pack?.numberFormat.currency ?? 'USD';
    try { return new Intl.NumberFormat(pack?.locale ?? 'en-US', { style: 'currency', currency: curr }).format(value); } catch { return `${curr} ${value}`; }
  }

  // ── IME ────────────────────────────────────────────────────
  getIMEConfigs(): IMEConfig[] { return [...this.imeConfigs]; }
  getActiveIME(): IMEConfig | undefined { return this.imeConfigs.find(i => i.active); }

  registerIME(config: IMEConfig): void { this.imeConfigs.push(config); }
  setActiveIME(id: string): void {
    this.imeConfigs.forEach(i => { i.active = i.id === id; });
  }
}

export const localizationInfra = new LocalizationInfra();
