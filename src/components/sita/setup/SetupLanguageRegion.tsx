// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Step: Language, Region, Timezone & Currency
// Full timezone/currency/country selection with live preview
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Clock, Calendar, DollarSign, ChevronRight, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

interface Props {
  onNext: (data: { language: string; region: string; timezone: string; dateFormat: string; currency: string }) => void;
  onBack: () => void;
  step: number;
  total: number;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" },
  { code: "tr", label: "Türkçe" },
  { code: "sv", label: "Svenska" },
  { code: "pl", label: "Polski" },
];

const COUNTRIES = [
  { code: "US", label: "United States", tz: "America/New_York", date: "MM/DD/YYYY", currency: "USD" },
  { code: "GB", label: "United Kingdom", tz: "Europe/London", date: "DD/MM/YYYY", currency: "GBP" },
  { code: "DE", label: "Germany", tz: "Europe/Berlin", date: "DD.MM.YYYY", currency: "EUR" },
  { code: "FR", label: "France", tz: "Europe/Paris", date: "DD/MM/YYYY", currency: "EUR" },
  { code: "ES", label: "Spain", tz: "Europe/Madrid", date: "DD/MM/YYYY", currency: "EUR" },
  { code: "IT", label: "Italy", tz: "Europe/Rome", date: "DD/MM/YYYY", currency: "EUR" },
  { code: "NL", label: "Netherlands", tz: "Europe/Amsterdam", date: "DD-MM-YYYY", currency: "EUR" },
  { code: "CH", label: "Switzerland", tz: "Europe/Zurich", date: "DD.MM.YYYY", currency: "CHF" },
  { code: "AT", label: "Austria", tz: "Europe/Vienna", date: "DD.MM.YYYY", currency: "EUR" },
  { code: "BE", label: "Belgium", tz: "Europe/Brussels", date: "DD/MM/YYYY", currency: "EUR" },
  { code: "PT", label: "Portugal", tz: "Europe/Lisbon", date: "DD/MM/YYYY", currency: "EUR" },
  { code: "SE", label: "Sweden", tz: "Europe/Stockholm", date: "YYYY-MM-DD", currency: "SEK" },
  { code: "NO", label: "Norway", tz: "Europe/Oslo", date: "DD.MM.YYYY", currency: "NOK" },
  { code: "DK", label: "Denmark", tz: "Europe/Copenhagen", date: "DD.MM.YYYY", currency: "DKK" },
  { code: "FI", label: "Finland", tz: "Europe/Helsinki", date: "DD.MM.YYYY", currency: "EUR" },
  { code: "IE", label: "Ireland", tz: "Europe/Dublin", date: "DD/MM/YYYY", currency: "EUR" },
  { code: "PL", label: "Poland", tz: "Europe/Warsaw", date: "DD.MM.YYYY", currency: "PLN" },
  { code: "AE", label: "United Arab Emirates", tz: "Asia/Dubai", date: "DD/MM/YYYY", currency: "AED" },
  { code: "SA", label: "Saudi Arabia", tz: "Asia/Riyadh", date: "DD/MM/YYYY", currency: "SAR" },
  { code: "QA", label: "Qatar", tz: "Asia/Qatar", date: "DD/MM/YYYY", currency: "QAR" },
  { code: "KW", label: "Kuwait", tz: "Asia/Kuwait", date: "DD/MM/YYYY", currency: "KWD" },
  { code: "BH", label: "Bahrain", tz: "Asia/Bahrain", date: "DD/MM/YYYY", currency: "BHD" },
  { code: "SG", label: "Singapore", tz: "Asia/Singapore", date: "DD/MM/YYYY", currency: "SGD" },
  { code: "HK", label: "Hong Kong", tz: "Asia/Hong_Kong", date: "DD/MM/YYYY", currency: "HKD" },
  { code: "JP", label: "Japan", tz: "Asia/Tokyo", date: "YYYY/MM/DD", currency: "JPY" },
  { code: "KR", label: "South Korea", tz: "Asia/Seoul", date: "YYYY.MM.DD", currency: "KRW" },
  { code: "CN", label: "China", tz: "Asia/Shanghai", date: "YYYY-MM-DD", currency: "CNY" },
  { code: "TW", label: "Taiwan", tz: "Asia/Taipei", date: "YYYY/MM/DD", currency: "TWD" },
  { code: "IN", label: "India", tz: "Asia/Kolkata", date: "DD/MM/YYYY", currency: "INR" },
  { code: "AU", label: "Australia", tz: "Australia/Sydney", date: "DD/MM/YYYY", currency: "AUD" },
  { code: "NZ", label: "New Zealand", tz: "Pacific/Auckland", date: "DD/MM/YYYY", currency: "NZD" },
  { code: "CA", label: "Canada", tz: "America/Toronto", date: "YYYY-MM-DD", currency: "CAD" },
  { code: "MX", label: "Mexico", tz: "America/Mexico_City", date: "DD/MM/YYYY", currency: "MXN" },
  { code: "BR", label: "Brazil", tz: "America/Sao_Paulo", date: "DD/MM/YYYY", currency: "BRL" },
  { code: "AR", label: "Argentina", tz: "America/Argentina/Buenos_Aires", date: "DD/MM/YYYY", currency: "ARS" },
  { code: "CL", label: "Chile", tz: "America/Santiago", date: "DD-MM-YYYY", currency: "CLP" },
  { code: "CO", label: "Colombia", tz: "America/Bogota", date: "DD/MM/YYYY", currency: "COP" },
  { code: "ZA", label: "South Africa", tz: "Africa/Johannesburg", date: "YYYY/MM/DD", currency: "ZAR" },
  { code: "NG", label: "Nigeria", tz: "Africa/Lagos", date: "DD/MM/YYYY", currency: "NGN" },
  { code: "EG", label: "Egypt", tz: "Africa/Cairo", date: "DD/MM/YYYY", currency: "EGP" },
  { code: "KE", label: "Kenya", tz: "Africa/Nairobi", date: "DD/MM/YYYY", currency: "KES" },
  { code: "TR", label: "Turkey", tz: "Europe/Istanbul", date: "DD.MM.YYYY", currency: "TRY" },
  { code: "IL", label: "Israel", tz: "Asia/Jerusalem", date: "DD/MM/YYYY", currency: "ILS" },
  { code: "TH", label: "Thailand", tz: "Asia/Bangkok", date: "DD/MM/YYYY", currency: "THB" },
  { code: "MY", label: "Malaysia", tz: "Asia/Kuala_Lumpur", date: "DD/MM/YYYY", currency: "MYR" },
  { code: "ID", label: "Indonesia", tz: "Asia/Jakarta", date: "DD/MM/YYYY", currency: "IDR" },
  { code: "PH", label: "Philippines", tz: "Asia/Manila", date: "MM/DD/YYYY", currency: "PHP" },
  { code: "VN", label: "Vietnam", tz: "Asia/Ho_Chi_Minh", date: "DD/MM/YYYY", currency: "VND" },
  { code: "RU", label: "Russia", tz: "Europe/Moscow", date: "DD.MM.YYYY", currency: "RUB" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", label: "Hong Kong Dollar" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", label: "Danish Krone" },
  { code: "PLN", symbol: "zł", label: "Polish Zloty" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal" },
  { code: "QAR", symbol: "﷼", label: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", label: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "BD", label: "Bahraini Dinar" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "KRW", symbol: "₩", label: "Korean Won" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan" },
  { code: "TWD", symbol: "NT$", label: "Taiwan Dollar" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real" },
  { code: "MXN", symbol: "$", label: "Mexican Peso" },
  { code: "ARS", symbol: "$", label: "Argentine Peso" },
  { code: "CLP", symbol: "$", label: "Chilean Peso" },
  { code: "COP", symbol: "$", label: "Colombian Peso" },
  { code: "ZAR", symbol: "R", label: "South African Rand" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
  { code: "EGP", symbol: "E£", label: "Egyptian Pound" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
  { code: "TRY", symbol: "₺", label: "Turkish Lira" },
  { code: "ILS", symbol: "₪", label: "Israeli Shekel" },
  { code: "THB", symbol: "฿", label: "Thai Baht" },
  { code: "MYR", symbol: "RM", label: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", label: "Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", label: "Philippine Peso" },
  { code: "VND", symbol: "₫", label: "Vietnamese Dong" },
  { code: "RUB", symbol: "₽", label: "Russian Ruble" },
];

// Generate timezone list from Intl API
function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older browsers
    return COUNTRIES.map(c => c.tz).filter((v, i, a) => a.indexOf(v) === i).sort();
  }
}

const ALL_TIMEZONES = getAllTimezones();

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function SetupLanguageRegion({ onNext, onBack, step, total }: Props) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [regionCode, setRegionCode] = useState(() => {
    // Auto-detect from browser
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = COUNTRIES.find(c => c.tz === tz);
    return match?.code || "US";
  });
  const [countrySearch, setCountrySearch] = useState("");
  const [showAllCountries, setShowAllCountries] = useState(false);

  // Currency: auto-set from country but user can override
  const country = COUNTRIES.find(r => r.code === regionCode) || COUNTRIES[0];
  const [currency, setCurrency] = useState(country.currency);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");

  // Timezone: auto-set from country but user can override
  const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || country.tz;
  const [timezone, setTimezone] = useState(detectedTz);
  const [showTzDropdown, setShowTzDropdown] = useState(false);
  const [tzSearch, setTzSearch] = useState("");

  // When country changes, update currency & tz
  // Set document direction and i18n language when language changes
  useEffect(() => {
    const isRtl = RTL_LANGUAGES.includes(language);
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const selectCountry = (code: string) => {
    setRegionCode(code);
    const c = COUNTRIES.find(r => r.code === code);
    if (c) {
      setCurrency(c.currency);
      setTimezone(c.tz);
    }
  };

  const filteredCountries = countrySearch
    ? COUNTRIES.filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;

  const displayedCountries = showAllCountries ? filteredCountries : filteredCountries.slice(0, 12);

  const filteredCurrencies = currencySearch
    ? CURRENCIES.filter(c => c.label.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase()))
    : CURRENCIES;

  const filteredTimezones = tzSearch
    ? ALL_TIMEZONES.filter(tz => tz.toLowerCase().includes(tzSearch.toLowerCase()))
    : ALL_TIMEZONES;

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const livePreview = useMemo(() => {
    const now = new Date();
    let timeStr: string;
    try {
      timeStr = now.toLocaleTimeString("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });
    } catch {
      timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    const dateStr = country.date
      .replace("YYYY", String(now.getFullYear()))
      .replace("MM", String(now.getMonth() + 1).padStart(2, "0"))
      .replace("DD", String(now.getDate()).padStart(2, "0"));
    return { time: timeStr, date: dateStr, currency: `${selectedCurrency.symbol}1,234.56`, tz: timezone.replace(/_/g, " ") };
  }, [timezone, country, selectedCurrency]);

  return (
    <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Left — Controls */}
      <div className="flex-1 min-w-0">
        <StepBar step={step} total={total} />
        <motion.h2 {...fadeIn} transition={{ delay: 0.1 }} className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
          Let's make this yours
        </motion.h2>
        <motion.p {...fadeIn} transition={{ delay: 0.15 }} className="text-sm text-muted-foreground mb-8">
          Choose the language, country, timezone, and currency SITA should use.
        </motion.p>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Language */}
          <FieldGroup icon={Globe} label="Language">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    language === l.code
                      ? "border-primary/50 bg-primary/8 text-foreground"
                      : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground"
                  )}>
                  {l.label}
                </button>
              ))}
            </div>
          </FieldGroup>

          {/* Country */}
          <FieldGroup icon={Globe} label="Country">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search countries…"
                className="w-full rounded-xl border border-border/40 bg-secondary/20 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {displayedCountries.map(r => (
                <button key={r.code} onClick={() => selectCountry(r.code)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200",
                    regionCode === r.code
                      ? "border-primary/50 bg-primary/8 text-foreground font-medium"
                      : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground"
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
            {!showAllCountries && filteredCountries.length > 12 && (
              <button onClick={() => setShowAllCountries(true)}
                className="mt-2 text-xs text-primary hover:underline">
                Show all {filteredCountries.length} countries
              </button>
            )}
          </FieldGroup>

          {/* Timezone */}
          <FieldGroup icon={Clock} label="Timezone">
            <div className="relative">
              <button onClick={() => { setShowTzDropdown(!showTzDropdown); setShowCurrencyDropdown(false); }}
                className="w-full rounded-xl border border-border/40 bg-secondary/20 px-4 py-2.5 text-sm text-foreground text-left flex items-center justify-between hover:border-primary/40 transition-colors">
                <span>{timezone.replace(/_/g, " ")}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", showTzDropdown && "rotate-180")} />
              </button>
              {showTzDropdown && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-xl max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input value={tzSearch} onChange={e => setTzSearch(e.target.value)}
                        placeholder="Search timezones…" autoFocus
                        className="w-full rounded-lg border-none bg-secondary/40 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {filteredTimezones.slice(0, 100).map(tz => (
                      <button key={tz} onClick={() => { setTimezone(tz); setShowTzDropdown(false); setTzSearch(""); }}
                        className={cn("w-full text-left px-3 py-2 text-xs hover:bg-secondary/40 transition-colors",
                          timezone === tz ? "bg-primary/10 text-primary font-medium" : "text-foreground")}>
                        {tz.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </FieldGroup>

          {/* Currency */}
          <FieldGroup icon={DollarSign} label="Currency">
            <div className="relative">
              <button onClick={() => { setShowCurrencyDropdown(!showCurrencyDropdown); setShowTzDropdown(false); }}
                className="w-full rounded-xl border border-border/40 bg-secondary/20 px-4 py-2.5 text-sm text-foreground text-left flex items-center justify-between hover:border-primary/40 transition-colors">
                <span>{selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.label}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", showCurrencyDropdown && "rotate-180")} />
              </button>
              {showCurrencyDropdown && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-xl max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)}
                        placeholder="Search currencies…" autoFocus
                        className="w-full rounded-lg border-none bg-secondary/40 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {filteredCurrencies.map(c => (
                      <button key={c.code} onClick={() => { setCurrency(c.code); setShowCurrencyDropdown(false); setCurrencySearch(""); }}
                        className={cn("w-full text-left px-3 py-2 text-xs hover:bg-secondary/40 transition-colors flex items-center gap-2",
                          currency === c.code ? "bg-primary/10 text-primary font-medium" : "text-foreground")}>
                        <span className="w-8 text-right font-mono">{c.symbol}</span>
                        <span>{c.code} — {c.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </FieldGroup>
        </div>

        <div className="flex items-center justify-between pt-8">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
          <button
            onClick={() => onNext({ language, region: regionCode, timezone, dateFormat: country.date, currency })}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right — Live Preview */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="lg:w-72 shrink-0">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 space-y-5 sticky top-8" style={{ backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
          <PreviewRow icon={Clock} label="Time" value={livePreview.time} />
          <PreviewRow icon={Calendar} label="Date" value={livePreview.date} />
          <PreviewRow icon={DollarSign} label="Currency" value={livePreview.currency} />
          <PreviewRow icon={Globe} label="Timezone" value={livePreview.tz} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function FieldGroup({ icon: Icon, label, children }: { icon: typeof Globe; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

function PreviewRow({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
          i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
      ))}
    </div>
  );
}
