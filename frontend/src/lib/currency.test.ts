// src/lib/currency.test.ts - Tests for currency module
import { 
  getCurrencyByCode, 
  getActivePaymentGateways, 
  getPaymentGatewayById, 
  calculatePaymentFee,
  getSupportedCurrencies,
  isCurrencySupported,
  getDefaultCurrency,
  getCryptoPaymentGateways,
  getFiatPaymentGateways,
  getRecommendedGateway,
  formatCurrencyForGateway,
  getLocalizedCurrencyName,
  getLocalizedGatewayType,
  formatCurrencyLocalized,
} from './currency';

import { SUPPORTED_LANGUAGES } from '@/translations/languages';

console.log('Running currency module tests...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`âœ“ ${message}`);
    passed++;
  } else {
    console.error(`âœâ€” ${message}`);
    failed++;
  }
}

// Test currency metadata
console.log('--- Currency Metadata Tests ---');
const ngn = getCurrencyByCode('NGN');
assert(ngn.code === 'NGN', 'NGN currency code');
assert(ngn.name === 'Nigerian Naira', 'NGN currency name');
assert(ngn.symbol === 'â‚¦', 'NGN currency symbol');
assert(ngn.fractionDigits === 2, 'NGN fraction digits');
assert(ngn.supported === true, 'NGN supported');

const usdt = getCurrencyByCode('USDT');
assert(usdt.code === 'USDT', 'USDT currency code');
assert(usdt.fractionDigits === 2, 'USDT fraction digits');

const btc = getCurrencyByCode('BTC');
assert(btc.fractionDigits === 8, 'BTC fraction digits (8)');

const eth = getCurrencyByCode('ETH');
assert(eth.fractionDigits === 6, 'ETH fraction digits (6)');

// Test unknown currency
const unknown = getCurrencyByCode('XYZ');
assert(unknown.supported === false, 'Unknown currency not supported');
assert(unknown.symbol === '', 'Unknown currency empty symbol');

console.log('\n--- Payment Gateway Tests ---');
// Test gateway retrieval
const paystack = getPaymentGatewayById('paystack');
assert(paystack !== undefined, 'Paystack gateway exists');
assert(paystack?.id === 'paystack', 'Paystack ID');
assert(paystack?.type === 'card', 'Paystack type is card');
assert(paystack?.supportedCurrencies.includes('NGN'), 'Paystack supports NGN');
assert(paystack?.fees.percentage === 1.5, 'Paystack percentage fee');
assert(paystack?.fees.fixed === 50, 'Paystack fixed fee');
assert(paystack?.requiresKYC === true, 'Paystack requires KYC');

const cryptoGateway = getPaymentGatewayById('crypto');
assert(cryptoGateway !== undefined, 'Crypto gateway exists');
assert(cryptoGateway?.type === 'crypto', 'Crypto gateway type');
assert(cryptoGateway?.supportedCurrencies.includes('USDT'), 'Crypto supports USDT');
assert(cryptoGateway?.supportedCurrencies.includes('BTC'), 'Crypto supports BTC');
assert(cryptoGateway?.supportedCurrencies.includes('ETH'), 'Crypto supports ETH');
assert(cryptoGateway?.requiresKYC === false, 'Crypto does not require KYC');

// Test unknown gateway
assert(getPaymentGatewayById('unknown') === undefined, 'Unknown gateway returns undefined');

console.log('\n--- Active Gateways Tests ---');
const activeNGN = getActivePaymentGateways('NGN');
assert(activeNGN.length > 0, 'Active NGN gateways exist');
assert(activeNGN.every(g => g.isActive), 'All active gateways are active');
assert(activeNGN.every(g => g.supportedCurrencies.includes('NGN')), 'All support NGN');

const activeUSDT = getActivePaymentGateways('USDT');
assert(activeUSDT.length > 0, 'Active USDT gateways exist');
assert(activeUSDT.every(g => g.supportedCurrencies.includes('USDT')), 'All support USDT');

const allActive = getActivePaymentGateways();
assert(allActive.length >= activeNGN.length, 'All active includes NGN gateways');

console.log('\n--- Fee Calculation Tests ---');
const feeNGN = calculatePaymentFee('paystack', 10000, 'NGN');
assert(feeNGN.fee === 200, 'Paystack fee: 1.5% of 10000 + 50 = 200');
assert(feeNGN.total === 10200, 'Paystack total: 10000 + 200 = 10200');

const feeSmall = calculatePaymentFee('paystack', 1000, 'NGN');
assert(feeSmall.fee === 65, 'Paystack small fee: 1.5% of 1000 + 50 = 65');

const feeBank = calculatePaymentFee('bank-transfer', 50000, 'NGN');
assert(feeBank.fee === 100, 'Bank transfer fee: 0% + 100 = 100');
assert(feeBank.total === 50100, 'Bank transfer total: 50000 + 100 = 50100');

const feeCrypto = calculatePaymentFee('crypto', 100, 'USDT');
assert(feeCrypto.fee === 0.5, 'Crypto fee: 0.5% of 100 = 0.5');
assert(feeCrypto.total === 100.5, 'Crypto total: 100 + 0.5 = 100.5');

console.log('\n--- Supported Currencies Tests ---');
const currencies = getSupportedCurrencies();
assert(currencies.length === 4, '4 supported currencies (NGN, USDT, BTC, ETH)');
assert(currencies.some(c => c.code === 'NGN'), 'Includes NGN');
assert(currencies.some(c => c.code === 'USDT'), 'Includes USDT');
assert(currencies.some(c => c.code === 'BTC'), 'Includes BTC');
assert(currencies.some(c => c.code === 'ETH'), 'Includes ETH');

assert(isCurrencySupported('NGN') === true, 'NGN is supported');
assert(isCurrencySupported('USDT') === true, 'USDT is supported');
assert(isCurrencySupported('XYZ') === false, 'XYZ is not supported');

console.log('\n--- Default & Filter Tests ---');
assert(getDefaultCurrency() === 'NGN', 'Default currency is NGN');

const cryptoGateways = getCryptoPaymentGateways();
assert(cryptoGateways.length >= 1, 'At least 1 crypto gateway');
assert(cryptoGateways.every(g => g.type === 'crypto'), 'All crypto gateways are crypto type');

const fiatGateways = getFiatPaymentGateways();
assert(fiatGateways.length >= 1, 'At least 1 fiat gateway');
assert(fiatGateways.every(g => g.type !== 'crypto'), 'No crypto in fiat gateways');

console.log('\n--- Recommendation Tests ---');
const recSmall = getRecommendedGateway(1000, 'NGN', false);
assert(recSmall !== undefined, 'Small amount recommendation exists');

const recMedium = getRecommendedGateway(25000, 'NGN', false);
assert(recMedium !== undefined, 'Medium amount recommendation exists');

const recLarge = getRecommendedGateway(100000, 'NGN', true);
assert(recLarge !== undefined, 'Large amount recommendation exists');

console.log('\n--- Format Tests ---');
const formatted = formatCurrencyForGateway(10000, 'NGN', 'paystack');
assert(formatted.includes('â‚¦'), 'Format includes NGN symbol');
assert(formatted.includes('10,000') || formatted.includes('10000'), 'Format includes amount');

const formattedCrypto = formatCurrencyForGateway(1.5, 'USDT', 'crypto');
assert(formattedCrypto.includes('$'), 'Crypto format includes $ symbol');
assert(formattedCrypto.includes('USDT'), 'Crypto format includes currency code');

console.log('\n--- Localization Tests ---');
assert(getLocalizedCurrencyName('NGN', 'en') === 'Nigerian Naira', 'NGN EN name');
assert(getLocalizedCurrencyName('NGN', 'yo') === 'Naira OrÃ­láº¹Ì€-Ã¨dÃ¨', 'NGN YO name');
assert(getLocalizedCurrencyName('NGN', 'ha') === 'Naira Naijiria', 'NGN HA name');
assert(getLocalizedCurrencyName('NGN', 'ig') === 'Naira Naijiria', 'NGN IG name');
assert(getLocalizedCurrencyName('NGN', 'zh') === 'å°¼æâ€”¥åˆ©äºšå¥ˆæ‹‰', 'NGN ZH name');

assert(getLocalizedCurrencyName('USDT', 'en') === 'Tether USD', 'USDT EN name');
assert(getLocalizedCurrencyName('BTC', 'en') === 'Bitcoin', 'BTC EN name');
assert(getLocalizedCurrencyName('ETH', 'en') === 'Ethereum', 'ETH EN name');

assert(getLocalizedGatewayType('card', 'en') === 'Card Payment', 'Card EN type');
assert(getLocalizedGatewayType('bank', 'en') === 'Bank Transfer', 'Bank EN type');
assert(getLocalizedGatewayType('mobile', 'en') === 'Mobile Money', 'Mobile EN type');
assert(getLocalizedGatewayType('crypto', 'en') === 'Cryptocurrency', 'Crypto EN type');
assert(getLocalizedGatewayType('ussd', 'en') === 'USSD Transfer', 'USSD EN type');

// Test all languages
for (const lang of SUPPORTED_LANGUAGES) {
  const name = getLocalizedCurrencyName('NGN', lang.code);
  assert(typeof name === 'string' && name.length > 0, `NGN name for ${lang.code} is string`);
  
  const type = getLocalizedGatewayType('card', lang.code);
  assert(typeof type === 'string' && type.length > 0, `Card type for ${lang.code} is string`);
}

const localizedFormat = formatCurrencyLocalized(5000, 'NGN', 'en');
assert(localizedFormat.includes('â‚¦'), 'Localized format includes symbol');
assert(localizedFormat.includes('Nigerian Naira'), 'Localized format includes name');

console.log('\n--- Summary ---');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.error('\nâŒ Some tests failed!');
  process.exit(1);
} else {
  console.log('\nâœ… All tests passed!');
}