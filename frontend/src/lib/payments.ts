// src/lib/payments.ts - Payment Gateway Registry
// Comprehensive payment gateway management with multilingual support

import { CURRENCIES, CurrencyCode, PaymentGateway } from './currency';

export interface PaymentGatewayRegistry {
  // Core gateway management
  getGatewayById(id: string): PaymentGateway | undefined;
  getActiveGateways(currency?: CurrencyCode): PaymentGateway[];
  getGatewaysByType(type: PaymentGateway['type']): PaymentGateway[];
  getGatewaysByCountry(countryCode: string): PaymentGateway[];
  
  // KYC and verification
  requiresKYC(gatewayId: string, userTier: number): boolean;
  getUserAccessibleGateways(
    userTier: number,
    currency?: CurrencyCode,
    countryCode?: string
  ): PaymentGateway[];
  
  // Fees and calculations
  calculateTotalFee(
    gatewayId: string,
    amount: number,
    currency: CurrencyCode
  ): { fee: number; total: number };
  
  // Recommendations
  getRecommendedGateway(
    amount: number,
    currency: CurrencyCode,
    userHasKYC?: boolean
  ): PaymentGateway;
  
  // Currency support
  getSupportedCurrencies(gatewayId: string): CurrencyCode[];
  isCurrencySupported(gatewayId: string, currency: CurrencyCode): boolean;
  
  // Multilingual display
  getGatewayDisplayName(gatewayId: string, language: string): string;
  getGatewayDescription(gatewayId: string, language: string): string;
  getGatewayFeesDisplay(
    gatewayId: string,
    language: string
  ): string;
}

// Payment Gateway Registry Implementation
class PaymentGatewayRegistryImpl implements PaymentGatewayRegistry {
  constructor(private gateways: PaymentGateway[] = []) {}
  
  getGatewayById(id: string): PaymentGateway | undefined {
    return this.gateways.find(gateway => gateway.id === id);
  }
  
  getActiveGateways(currency?: CurrencyCode): PaymentGateway[] {
    return this.gateways.filter(gateway => {
      if (!gateway.isActive) return false;
      if (currency && gateway.supportedCurrencies.length > 0 && 
          !gateway.supportedCurrencies.includes(currency)) {
        return false;
      }
      return true;
    });
  }
  
  getGatewaysByType(type: PaymentGateway['type']): PaymentGateway[] {
    return this.gateways.filter(gateway => gateway.type === type);
  }
  
  getGatewaysByCountry(countryCode: string): PaymentGateway[] {
    return this.gateways.filter(gateway => {
      if (!gateway.countries || gateway.countries.length === 0) return true;
      return gateway.countries.includes(countryCode);
    });
  }
  
  requiresKYC(gatewayId: string, userTier: number): boolean {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) return false;
    
    // Tier-based KYC requirements
    // Tier 1: Basic (needs KYC for regulated services)
    // Tier 2: Verified (completed basic KYC)
    // Tier 3: Trusted (advanced verification)
    if (!gateway.requiresKYC) return false;
    return userTier < 2;
  }
  
  getUserAccessibleGateways(
    userTier: number,
    currency?: CurrencyCode,
    countryCode?: string
  ): PaymentGateway[] {
    let gateways = this.getActiveGateways(currency);
    
    // Filter by country
    gateways = gateways.filter(gateway => {
      if (!countryCode) return true;
      if (!gateway.countries || gateway.countries.length === 0) return true;
      return gateway.countries.includes(countryCode);
    });
    
    // Filter by KYC requirements based on user tier
    gateways = gateways.filter(gateway => {
      if (!this.requiresKYC(gateway.id, userTier)) return true;
      return false;
    });
    
    return gateways;
  }
  
  calculateTotalFee(
    gatewayId: string,
    amount: number,
    currency: CurrencyCode
  ): { fee: number; total: number } {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) return { fee: 0, total: amount };
    
    const rate = CURRENCIES[currency]?.exchangeRate || 1.0;
    const amountInBase = currency === 'NGN' ? amount : amount * rate;
    const fee = (amountInBase * (gateway.fees.percentage / 100)) + gateway.fees.fixed;
    const total = amountInBase + fee;
    
    return {
      fee: currency === 'NGN' ? fee : fee / rate,
      total: currency === 'NGN' ? total : total / rate,
    };
  }
  
  getRecommendedGateway(
    amount: number,
    currency: CurrencyCode,
    userHasKYC?: boolean
  ): PaymentGateway {
    const gateways = this.getActiveGateways(currency);
    
    // Filter by KYC if user hasn't completed KYC
    const filteredGateways = gateways.filter(gateway => {
      if (!userHasKYC && gateway.requiresKYC) return false;
      return true;
    });
    
    // Sort by recommendation logic
    const sorted = filteredGateways.sort((a, b) => {
      if (amount < 5000) return a.fees.fixed - b.fees.fixed;
      if (amount < 50000) return b.fees.percentage - a.fees.percentage;
      return a.fees.percentage - b.fees.percentage;
    });
    
    return sorted[0] || gateways[0];
  }
  
  getSupportedCurrencies(gatewayId: string): CurrencyCode[] {
    const gateway = this.getGatewayById(gatewayId);
    return gateway?.supportedCurrencies || [];
  }
  
  isCurrencySupported(gatewayId: string, currency: CurrencyCode): boolean {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) return false;
    return gateway.supportedCurrencies.includes(currency);
  }
  
  // Multilingual display methods
  getGatewayDisplayName(gatewayId: string, language: string): string {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) return gatewayId;
    
    // Simple localization for common gateways
    const displayNames: Record<string, Record<string, string>> = {
      'paystack': {
        'en': 'Paystack (Card)',
        'yo': 'Paystack (Kaadi)',
        'ha': 'Paystack (KÃ dÃ­)',
        'ig': 'Paystack (KÃ¡Ã¡dÃ¬)',
        'zh': 'Paystack (å¡)',
      },
      'opay': {
        'en': 'Opay',
        'yo': 'Opay',
        'ha': 'Opay',
        'ig': 'Opay',
        'zh': 'Opay',
      },
      'paga': {
        'en': 'Paga',
        'yo': 'Paga',
        'ha': 'Paga',
        'ig': 'Paga',
        'zh': 'Paga',
      },
      'flutterwave': {
        'en': 'Flutterwave',
        'yo': 'Flutterwave',
        'ha': 'Flutterwave',
        'ig': 'Flutterwave',
        'zh': 'Flutterwave',
      },
      'bank-transfer': {
        'en': 'Bank Transfer',
        'yo': 'ÃŒfá»wá»kan Banki',
        'ha': 'KÃ¬nge Banki',
        'ig': 'Nchá»‹ká»ta Bank',
        'zh': 'é“¶è¡Œè½¬è´¦',
      },
      'crypto': {
        'en': 'Crypto Wallet',
        'yo': 'WawÃ lÃ© WÃ¡jÃº áº¹mi',
        'ha': 'Banki Digital',
        'ig': 'Ntaná»¥ta á»Šná»¥ OtÃº',
        'zh': 'åŠ å¯†é’±åŒ…',
      },
    };
    
    return displayNames[gatewayId]?.[language] || gateway.name;
  }
  
  getGatewayDescription(gatewayId: string, language: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      'paystack': {
        'en': 'Instant card payments with 1.5% + NGN 50 fee',
        'yo': 'Awá»n sise iá¹£áº¹láº¹ kaadi ni 1.5% + NGN 50 ohuru',
        'ha': 'Tallafawa mai-gaye da hannaiji na 1.5% + NGN 50',
        'ig': 'Nkezi dá»‹ mma nke kaadi na 1.5% + NGN 50',
        'zh': 'å³æâ€”¶å¡æ”¯ä»˜ï¼Œ1.5% + 50 NGN æ‰‹ç»­è´¹',
      },
      'paga': {
        'en': 'Mobile money transfers across Nigeria',
        'yo': 'Awá»n gbigbe owÃ³ mobile ni Gangan-Nigeria',
        'ha': 'Gwa suQAyan walda ci gaban Nijeriya',
        'ig': 'Nkezi nke mbá»¥ doro na Nigeria',
        'zh': 'å°¼æâ€”¥åˆ©äºšç§»åŠ¨è´§å¸è½¬è´¦',
      },
      'flutterwave': {
        'en': 'Pan-African payment processor supporting multiple currencies',
        'yo': 'Oludopá» áº¹rá» wiwá»n ilu-iá¹£áº¹ ti o á¹£e atiláº¹yin awá»n á»ya ilu-iá¹£áº¹',
        'ha': 'Gudugudun baÆ™in mata da kowane Æ™arfinta',
        'ig': 'Ohuru nke awa nke puku awa á»¥dá»‹',
        'zh': 'æ³›éžæ´²æ”¯ä»˜å¤„ç†å™¨ï¼Œæ”¯æŒå¤šç§è´§å¸',
      },
      'bank-transfer': {
        'en': 'Direct bank deposit with no percentage fee',
        'yo': 'Awá»n sise banki ni idijepe ni iye áº¹ru ati si á»ká»',
        'ha': 'Gudanin babban banki tare da gini harayin da hannaiji',
        'ig': 'Nka ejimma nke banki wa nke agbá»ha ihe nile',
        'zh': 'æâ€” ç™¾åˆ†æ¯”è´¹ç”¨çš„ç›´æŽ¥é“¶è¡Œè½¬è´¦',
      },
      'crypto': {
        'en': 'Crypto payments for USDT, BTC, and ETH',
        'yo': 'Awá»n sise á»ya áº¹mi fun USDT, BTC, ati ETH',
        'ha': 'Rubutuwa mata takardun sha\'a shi da hannaiji',
        'ig': 'Ezigbo ihe nke crypto fun USDT, BTC, na ETH',
        'zh': 'USDTã€BTC å’Œ ETH çš„åŠ å¯†è´§å¸æ”¯ä»˜',
      },
    };
    
    return descriptions[gatewayId]?.[language] || 'Secure payment method';
  }
  
  getGatewayFeesDisplay(gatewayId: string, language: string): string {
    const gateway = this.getGatewayById(gatewayId);
    if (!gateway) return '';
    
    const feeDisplay: Record<string, Record<string, string>> = {
      'paystack': {
        'en': '1.5% + NGN 50',
        'yo': '1.5% + NGN 50',
        'ha': '1.5% + NGN 50',
        'ig': '1.5% + NGN 50',
        'zh': '1.5% + 50 NGN',
      },
      'paga': {
        'en': '1.0% + NGN 30',
        'yo': '1.0% + NGN 30',
        'ha': '1.0% + NGN 30',
        'ig': '1.0% + NGN 30',
        'zh': '1.0% + 30 NGN',
      },
      'flutterwave': {
        'en': '2.0% + NGN 100',
        'yo': '2.0% + NGN 100',
        'ha': '2.0% + NGN 100',
        'ig': '2.0% + NGN 100',
        'zh': '2.0% + 100 NGN',
      },
      'bank-transfer': {
        'en': 'No fee (NGN 100 fixed)',
        'yo': 'Kini áº¹ru (NGN 100 pataki)',
        'ha': 'Babu ci gaban banki (NGN 100)',
        'ig': 'Nâ€™ihu ihe (NGN 100)',
        'zh': 'æâ€” æ‰‹ç»­è´¹ (100 NGN å›ºå®šè´¹)',
      },
      'crypto': {
        'en': '0.5% + NGN 0',
        'yo': '0.5% + NGN 0',
        'ha': '0.5% + NGN 0',
        'ig': '0.5% + NGN 0',
        'zh': '0.5% + 0 NGN',
      },
    };
    
    return feeDisplay[gatewayId]?.[language] || `${gateway.fees.percentage}% + ${gateway.fees.fixed} NGN`;
  }
}

// Default payment gateways registry
export const DEFAULT_PAYMENT_GATEWAYS: PaymentGateway[] = [
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

// Create singleton registry instance
export const paymentGatewayRegistry = new PaymentGatewayRegistryImpl(DEFAULT_PAYMENT_GATEWAYS);

// Re-export types and utilities
export type { PaymentGateway, PaymentGatewayRegistry };
export { calculatePaymentFee } from './currency';