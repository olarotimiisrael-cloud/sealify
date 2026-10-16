import { SupportedLanguage } from '@/translations/languages';

export type CurrencyCode = 'NGN' | 'USDT' | 'BTC' | 'ETH' | string;

export interface CurrencyMeta {
  code: CurrencyCode;
  name: string;
  symbol: string;
  fractionDigits: number;
  supported: boolean;
  exchangeRate?: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'mobile' | 'crypto' | 'ussd';
  supportedCurrencies: CurrencyCode[];
  fees: {
    percentage: number;
    fixed: number;
  };
  isActive: boolean;
  requiresKYC: boolean;
  countries?: string[];
}

const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    fractionDigits: 2,
    supported: true,
    exchangeRate: 1.0,
  },
  USDT: {
    code: 'USDT',
    name: 'Tether USD',
    symbol: '$',
    fractionDigits: 2,
    supported: true,
    exchangeRate: 1.0,
  },
  BTC: {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    fractionDigits: 8,
    supported: true,
    exchangeRate: 0.00008,
  },
  ETH: {
    code: 'ETH',
    name: 'Ethereum',
    symbol: 'Ξ',
    fractionDigits: 6,
    supported: true,
    exchangeRate: 0.005,
  },
};

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    type: 'card',
    supportedCurrencies: ['NGN'],
    fees: { percentage: 1.5, fixed: 50 },
    isActive: true,
    requiresKYC: true,
    countries: ['NG'],
  },
  {
    id: 'opay',
    name: 'Opay',
    type: 'mobile',
    supportedCurrencies: ['NGN'],
    fees: { percentage: 2.0, fixed: 20 },
    isActive: true,
    requiresKYC: true,
    countries: ['NG'],
  },
  {
    id: 'paga',
    name: 'Paga',
    type: 'mobile',
    supportedCurrencies: ['NGN'],
    fees: { percentage: 1.0, fixed: 30 },
    isActive: true,
    requiresKYC: true,
    countries: ['NG'],
  },
  {
    id: 'palmpay',
    name: 'PalmPay',
    type: 'mobile',
    supportedCurrencies: ['NGN'],
    fees: { percentage: 1.5, fixed: 25 },
    isActive: true,
    requiresKYC: true,
    countries: ['NG'],
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    type: 'bank',
    supportedCurrencies: ['NGN'],
    fees: { percentage: 0.0, fixed: 100 },
    isActive: true,
    requiresKYC: true,
    countries: ['NG'],
  },
  {
    id: 'crypto',
    name: 'Crypto Wallet',
    type: 'crypto',
    supportedCurrencies: ['USDT', 'BTC', 'ETH'],
    fees: { percentage: 0.5, fixed: 0 },
    isActive: true,
    requiresKYC: false,
    countries: ['NG', 'US', 'GLOBAL'],
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    type: 'card',
    supportedCurrencies: ['NGN'],
    fees: { percentage: 2.0, fixed: 100 },
    isActive: true,
    requiresKYC: true,
    countries: ['NG'],
  },
];

export function getCurrencyByCode(code: CurrencyCode): CurrencyMeta {
  return CURRENCIES[code] || {
    code,
    name: code,
    symbol: '',
    fractionDigits: 2,
    supported: false,
  };
}

export function getActivePaymentGateways(currency?: CurrencyCode): PaymentGateway[] {
  return PAYMENT_GATEWAYS.filter(gateway => {
    if (!gateway.isActive) return false;
    if (currency && gateway.supportedCurrencies.length > 0 && !gateway.supportedCurrencies.includes(currency)) {
      return false;
    }
    return true;
  });
}

export function getPaymentGatewayById(id: string): PaymentGateway | undefined {
  return PAYMENT_GATEWAYS.find(gateway => gateway.id === id);
}

export function calculatePaymentFee(
  gatewayId: string,
  amount: number,
  currency: CurrencyCode = 'NGN'
): { fee: number; total: number } {
  const gateway = getPaymentGatewayById(gatewayId);
  if (!gateway) {
    return { fee: 0, total: amount };
  }

  const rate = CURRENCIES[currency]?.exchangeRate || 1.0;
  const amountInBase = currency === 'NGN' ? amount : amount * rate;
  const fee = (amountInBase * (gateway.fees.percentage / 100)) + gateway.fees.fixed;
  const total = amountInBase + fee;

  return {
    fee: currency === 'NGN' ? fee : fee / rate,
    total: currency === 'NGN' ? total : total / rate,
  };
}

export function getSupportedCurrencies(): CurrencyMeta[] {
  return Object.values(CURRENCIES);
}

export function isCurrencySupported(code: string): boolean {
  return code in CURRENCIES;
}

export function getDefaultCurrency(): CurrencyCode {
  return 'NGN';
}

export function getCryptoPaymentGateways(): PaymentGateway[] {
  return PAYMENT_GATEWAYS.filter(gateway => gateway.type === 'crypto');
}

export function getFiatPaymentGateways(): PaymentGateway[] {
  return PAYMENT_GATEWAYS.filter(gateway => gateway.type !== 'crypto');
}

export function getRecommendedGateway(
  amount: number,
  currency: CurrencyCode = 'NGN',
  userHasKYC?: boolean
): PaymentGateway {
  const gateways = getActivePaymentGateways(currency);
  
  const sorted = gateways
    .filter(g => !userHasKYC && g.requiresKYC ? false : true)
    .sort((a, b) => {
      if (amount < 5000) return a.fees.fixed - b.fees.fixed;
      if (amount < 50000) return b.fees.percentage - a.fees.percentage;
      return a.fees.percentage - b.fees.percentage;
    });

  return sorted[0] || gateways[0];
}

export function formatCurrencyForGateway(
  amount: number,
  currency: CurrencyCode = 'NGN',
  gatewayId?: string
): string {
  const currencyMeta = getCurrencyByCode(currency);
  const symbol = currencyMeta.symbol;
  const formatted = amount.toLocaleString('en-NG', {
    minimumFractionDigits: currencyMeta.fractionDigits,
    maximumFractionDigits: currencyMeta.fractionDigits,
  });

  if (gatewayId) {
    const gateway = getPaymentGatewayById(gatewayId);
    if (gateway?.type === 'crypto') {
      return `${symbol}${formatted} ${currency}`;
    }
  }

  return `${symbol}${formatted}`;
}

// Localized currency names by language
export const LOCALIZED_CURRENCY_NAMES: Record<string, Record<CurrencyCode, string>> = {
  en: {
    NGN: 'Nigerian Naira',
    USDT: 'Tether USD',
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
  },
  yo: {
    NGN: 'Naira Orílẹ̀-èdè',
    USDT: 'Tether USD',
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
  },
  ha: {
    NGN: 'Naira Naijiria',
    USDT: 'Tether USD',
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
  },
  ig: {
    NGN: 'Naira Naijiria',
    USDT: 'Tether USD',
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
  },
  zh: {
    NGN: '尼日利亚奈拉',
    USDT: '泰达币',
    BTC: '比特币',
    ETH: '以太币',
  },
};

// Localized gateway type labels
export const LOCALIZED_GATEWAY_TYPES: Record<string, Record<string, string>> = {
  card: {
    en: 'Card Payment',
    yo: 'Eti Káàdì',
    ha: 'Bukuku na Kàdí',
    ig: 'Ezigbo Káádì',
    zh: '卡支付',
  },
  bank: {
    en: 'Bank Transfer',
    yo: 'Ìfowọkan Nínú Ìṣẹ́pọ̀wọ́',
    ha: 'Kìnge Banki',
    ig: 'Nchịkọta Bank',
    zh: '银行转账',
  },
  mobile: {
    en: 'Mobile Money',
    yo: 'Owó Ìlaparí',
    ha: 'Mutum Money',
    ig: 'Ego Mobile',
    zh: '移动支付',
  },
  crypto: {
    en: 'Cryptocurrency',
    yo: 'Ìwé-ẹrọ ẹmi',
    ha: 'Kìrɑfiwò',
    ig: 'Ntanụta ịnụ ọnọ',
    zh: '加密货币',
  },
  ussd: {
    en: 'USSD Transfer',
    yo: 'Ìfowọkan USSD',
    ha: 'Kìnge USSD',
    ig: 'Nchịkọta USSD',
    zh: 'USSD 转账',
  },
};

// Get localized currency name
export function getLocalizedCurrencyName(
  code: CurrencyCode,
  language: SupportedLanguage = 'en'
): string {
  return LOCALIZED_CURRENCY_NAMES[language]?.[code] || CURRENCIES[code]?.name || code;
}

// Get localized gateway type label
export function getLocalizedGatewayType(
  type: PaymentGateway['type'],
  language: SupportedLanguage = 'en'
): string {
  return LOCALIZED_GATEWAY_TYPES[type]?.[language] || type;
}

// Format currency amount with localized currency name for display
export function formatCurrencyLocalized(
  amount: number,
  currency: CurrencyCode = 'NGN',
  language: SupportedLanguage = 'en'
): string {
  const currencyMeta = getCurrencyByCode(currency);
  const localizedName = getLocalizedCurrencyName(currency, language);
  
  if (typeof window === 'undefined') {
    return `${amount} ${localizedName}`;
  }

  try {
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-NG',
      yo: 'en-NG',
      ha: 'en-NG',
      ig: 'en-NG',
      zh: 'zh-CN',
    };
    
    const formatted = new Intl.NumberFormat(localeMap[language] || 'en-NG', {
      minimumFractionDigits: currencyMeta.fractionDigits === 0 ? 0 : 2,
      maximumFractionDigits: currencyMeta.fractionDigits === 0 ? 0 : 2,
    }).format(amount);
    
    return `${currencyMeta.symbol}${formatted} (${localizedName})`;
  } catch {
    return `${currencyMeta.symbol}${amount.toLocaleString()} (${localizedName})`;
  }
}

export { CURRENCIES };
export type { SupportedLanguage };
export default CURRENCIES;