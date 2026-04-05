// ═══════════════════════════════════════════════════════════════
// SITA OS — Multi-Language Runtime
// Real-time UI translation based on user locale
// ═══════════════════════════════════════════════════════════════
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — stateful module, persist via universal adapter

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ar' | 'zh' | 'ja' | 'hi' | 'ko';

export interface TranslationBundle {
  locale: SupportedLocale;
  strings: Record<string, string>;
  rtl: boolean;
  dateFormat: string;
  currencySymbol: string;
  numberFormat: { decimal: string; thousands: string };
}

const BASE_TRANSLATIONS: Record<SupportedLocale, Partial<TranslationBundle>> = {
  en: { rtl: false, dateFormat: 'MM/DD/YYYY', currencySymbol: '$', numberFormat: { decimal: '.', thousands: ',' } },
  es: { rtl: false, dateFormat: 'DD/MM/YYYY', currencySymbol: '€', numberFormat: { decimal: ',', thousands: '.' } },
  fr: { rtl: false, dateFormat: 'DD/MM/YYYY', currencySymbol: '€', numberFormat: { decimal: ',', thousands: ' ' } },
  de: { rtl: false, dateFormat: 'DD.MM.YYYY', currencySymbol: '€', numberFormat: { decimal: ',', thousands: '.' } },
  pt: { rtl: false, dateFormat: 'DD/MM/YYYY', currencySymbol: 'R$', numberFormat: { decimal: ',', thousands: '.' } },
  ar: { rtl: true, dateFormat: 'YYYY/MM/DD', currencySymbol: 'د.إ', numberFormat: { decimal: '.', thousands: ',' } },
  zh: { rtl: false, dateFormat: 'YYYY-MM-DD', currencySymbol: '¥', numberFormat: { decimal: '.', thousands: ',' } },
  ja: { rtl: false, dateFormat: 'YYYY/MM/DD', currencySymbol: '¥', numberFormat: { decimal: '.', thousands: ',' } },
  hi: { rtl: false, dateFormat: 'DD-MM-YYYY', currencySymbol: '₹', numberFormat: { decimal: '.', thousands: ',' } },
  ko: { rtl: false, dateFormat: 'YYYY.MM.DD', currencySymbol: '₩', numberFormat: { decimal: '.', thousands: ',' } },
};

const UI_STRINGS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    'nav.home': 'Home', 'nav.business': 'Business', 'nav.money': 'Money', 'nav.concierge': 'Concierge',
    'nav.settings': 'Settings', 'nav.search': 'Search', 'nav.notifications': 'Notifications',
    'action.approve': 'Approve', 'action.reject': 'Reject', 'action.save': 'Save', 'action.cancel': 'Cancel',
    'action.delete': 'Delete', 'action.edit': 'Edit', 'action.create': 'Create', 'action.close': 'Close',
    'status.active': 'Active', 'status.pending': 'Pending', 'status.completed': 'Completed',
    'greeting.morning': 'Good morning', 'greeting.afternoon': 'Good afternoon', 'greeting.evening': 'Good evening',
  },
  es: {
    'nav.home': 'Inicio', 'nav.business': 'Negocios', 'nav.money': 'Dinero', 'nav.concierge': 'Conserje',
    'nav.settings': 'Configuración', 'nav.search': 'Buscar', 'nav.notifications': 'Notificaciones',
    'action.approve': 'Aprobar', 'action.reject': 'Rechazar', 'action.save': 'Guardar', 'action.cancel': 'Cancelar',
    'action.delete': 'Eliminar', 'action.edit': 'Editar', 'action.create': 'Crear', 'action.close': 'Cerrar',
    'status.active': 'Activo', 'status.pending': 'Pendiente', 'status.completed': 'Completado',
    'greeting.morning': 'Buenos días', 'greeting.afternoon': 'Buenas tardes', 'greeting.evening': 'Buenas noches',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.business': 'Affaires', 'nav.money': 'Finances', 'nav.concierge': 'Concierge',
    'nav.settings': 'Paramètres', 'nav.search': 'Rechercher', 'nav.notifications': 'Notifications',
    'action.approve': 'Approuver', 'action.reject': 'Rejeter', 'action.save': 'Enregistrer', 'action.cancel': 'Annuler',
    'action.delete': 'Supprimer', 'action.edit': 'Modifier', 'action.create': 'Créer', 'action.close': 'Fermer',
    'status.active': 'Actif', 'status.pending': 'En attente', 'status.completed': 'Terminé',
    'greeting.morning': 'Bonjour', 'greeting.afternoon': 'Bon après-midi', 'greeting.evening': 'Bonsoir',
  },
  de: {
    'nav.home': 'Startseite', 'nav.business': 'Geschäft', 'nav.money': 'Finanzen', 'nav.concierge': 'Concierge',
    'nav.settings': 'Einstellungen', 'nav.search': 'Suchen', 'nav.notifications': 'Benachrichtigungen',
    'action.approve': 'Genehmigen', 'action.reject': 'Ablehnen', 'action.save': 'Speichern', 'action.cancel': 'Abbrechen',
    'action.delete': 'Löschen', 'action.edit': 'Bearbeiten', 'action.create': 'Erstellen', 'action.close': 'Schließen',
    'status.active': 'Aktiv', 'status.pending': 'Ausstehend', 'status.completed': 'Abgeschlossen',
    'greeting.morning': 'Guten Morgen', 'greeting.afternoon': 'Guten Tag', 'greeting.evening': 'Guten Abend',
  },
  pt: {
    'nav.home': 'Início', 'nav.business': 'Negócios', 'nav.money': 'Dinheiro', 'nav.concierge': 'Concierge',
    'nav.settings': 'Configurações', 'nav.search': 'Pesquisar', 'nav.notifications': 'Notificações',
    'action.approve': 'Aprovar', 'action.reject': 'Rejeitar', 'action.save': 'Salvar', 'action.cancel': 'Cancelar',
    'action.delete': 'Excluir', 'action.edit': 'Editar', 'action.create': 'Criar', 'action.close': 'Fechar',
    'status.active': 'Ativo', 'status.pending': 'Pendente', 'status.completed': 'Concluído',
    'greeting.morning': 'Bom dia', 'greeting.afternoon': 'Boa tarde', 'greeting.evening': 'Boa noite',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.business': 'الأعمال', 'nav.money': 'المال', 'nav.concierge': 'الكونسيرج',
    'nav.settings': 'الإعدادات', 'nav.search': 'بحث', 'nav.notifications': 'الإشعارات',
    'action.approve': 'موافقة', 'action.reject': 'رفض', 'action.save': 'حفظ', 'action.cancel': 'إلغاء',
    'action.delete': 'حذف', 'action.edit': 'تعديل', 'action.create': 'إنشاء', 'action.close': 'إغلاق',
    'status.active': 'نشط', 'status.pending': 'قيد الانتظار', 'status.completed': 'مكتمل',
    'greeting.morning': 'صباح الخير', 'greeting.afternoon': 'مساء الخير', 'greeting.evening': 'مساء الخير',
  },
  zh: {
    'nav.home': '首页', 'nav.business': '商业', 'nav.money': '财务', 'nav.concierge': '管家',
    'nav.settings': '设置', 'nav.search': '搜索', 'nav.notifications': '通知',
    'action.approve': '批准', 'action.reject': '拒绝', 'action.save': '保存', 'action.cancel': '取消',
    'action.delete': '删除', 'action.edit': '编辑', 'action.create': '创建', 'action.close': '关闭',
    'status.active': '活跃', 'status.pending': '待处理', 'status.completed': '已完成',
    'greeting.morning': '早上好', 'greeting.afternoon': '下午好', 'greeting.evening': '晚上好',
  },
  ja: {
    'nav.home': 'ホーム', 'nav.business': 'ビジネス', 'nav.money': '財務', 'nav.concierge': 'コンシェルジュ',
    'nav.settings': '設定', 'nav.search': '検索', 'nav.notifications': '通知',
    'action.approve': '承認', 'action.reject': '拒否', 'action.save': '保存', 'action.cancel': 'キャンセル',
    'action.delete': '削除', 'action.edit': '編集', 'action.create': '作成', 'action.close': '閉じる',
    'status.active': 'アクティブ', 'status.pending': '保留中', 'status.completed': '完了',
    'greeting.morning': 'おはようございます', 'greeting.afternoon': 'こんにちは', 'greeting.evening': 'こんばんは',
  },
  hi: {
    'nav.home': 'होम', 'nav.business': 'व्यापार', 'nav.money': 'धन', 'nav.concierge': 'कंसीयज',
    'nav.settings': 'सेटिंग्स', 'nav.search': 'खोजें', 'nav.notifications': 'सूचनाएं',
    'action.approve': 'स्वीकृत', 'action.reject': 'अस्वीकार', 'action.save': 'सहेजें', 'action.cancel': 'रद्द करें',
    'action.delete': 'हटाएं', 'action.edit': 'संपादित', 'action.create': 'बनाएं', 'action.close': 'बंद करें',
    'status.active': 'सक्रिय', 'status.pending': 'लंबित', 'status.completed': 'पूर्ण',
    'greeting.morning': 'सुप्रभात', 'greeting.afternoon': 'नमस्कार', 'greeting.evening': 'शुभ संध्या',
  },
  ko: {
    'nav.home': '홈', 'nav.business': '비즈니스', 'nav.money': '재무', 'nav.concierge': '컨시어지',
    'nav.settings': '설정', 'nav.search': '검색', 'nav.notifications': '알림',
    'action.approve': '승인', 'action.reject': '거절', 'action.save': '저장', 'action.cancel': '취소',
    'action.delete': '삭제', 'action.edit': '편집', 'action.create': '생성', 'action.close': '닫기',
    'status.active': '활성', 'status.pending': '대기중', 'status.completed': '완료',
    'greeting.morning': '좋은 아침입니다', 'greeting.afternoon': '안녕하세요', 'greeting.evening': '좋은 저녁입니다',
  },
};

class MultiLanguageRuntime {
  private currentLocale: SupportedLocale = 'en';
  private listeners: Set<(locale: SupportedLocale) => void> = new Set();

  get locale(): SupportedLocale {
    return this.currentLocale;
  }

  get isRTL(): boolean {
    return BASE_TRANSLATIONS[this.currentLocale]?.rtl || false;
  }

  get dateFormat(): string {
    return BASE_TRANSLATIONS[this.currentLocale]?.dateFormat || 'MM/DD/YYYY';
  }

  get currencySymbol(): string {
    return BASE_TRANSLATIONS[this.currentLocale]?.currencySymbol || '$';
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocale = locale;
    if (typeof document !== 'undefined') {
      document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
    this.listeners.forEach((l) => l(locale));
  }

  t(key: string, fallback?: string): string {
    return UI_STRINGS[this.currentLocale]?.[key] || UI_STRINGS.en[key] || fallback || key;
  }

  formatNumber(value: number): string {
    const fmt = BASE_TRANSLATIONS[this.currentLocale]?.numberFormat || { decimal: '.', thousands: ',' };
    const parts = value.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousands);
    return parts.join(fmt.decimal);
  }

  formatCurrency(value: number): string {
    const symbol = this.currencySymbol;
    const formatted = this.formatNumber(value);
    return this.isRTL ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  }

  detectLocale(): SupportedLocale {
    if (typeof navigator === 'undefined') return 'en';
    const browserLang = navigator.language.split('-')[0] as SupportedLocale;
    return UI_STRINGS[browserLang] ? browserLang : 'en';
  }

  getSupportedLocales(): Array<{ code: SupportedLocale; name: string }> {
    return [
      { code: 'en', name: 'English' }, { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' }, { code: 'de', name: 'Deutsch' },
      { code: 'pt', name: 'Português' }, { code: 'ar', name: 'العربية' },
      { code: 'zh', name: '中文' }, { code: 'ja', name: '日本語' },
      { code: 'hi', name: 'हिन्दी' }, { code: 'ko', name: '한국어' },
    ];
  }

  onLocaleChange(listener: (locale: SupportedLocale) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const multiLanguageRuntime = new MultiLanguageRuntime();
