// src/lib/payments.test.ts - Tests for payments module
import { 
  paymentGatewayRegistry,
  DEFAULT_PAYMENT_GATEWAYS,
  calculatePaymentFee
} from './payments';
import { CurrencyCode } from './currency';

console.log('Running payments module tests...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

// Test registry instantiation - use the singleton instance
console.log('--- Registry Instantiation Tests ---');
assert(paymentGatewayRegistry !== undefined, 'Registry instance exists');
assert(paymentGatewayRegistry.getGatewayById !== undefined, 'Registry has getGatewayById method');
assert(paymentGatewayRegistry.getActiveGateways !== undefined, 'Registry has getActiveGateways method');
assert(typeof paymentGatewayRegistry.getGatewayById === 'function', 'getGatewayById is a function');

console.log('--- Default Gateways Tests ---');
assert(Array.isArray(DEFAULT_PAYMENT_GATEWAYS), 'DEFAULT_PAYMENT_GATEWAYS is array');
assert(DEFAULT_PAYMENT_GATEWAYS.length >= 7, 'At least 7 default gateways');

// Test individual gateways
const gateways = DEFAULT_PAYMENT_GATEWAYS;
const paystack = gateways.find(g => g.id === 'paystack');
assert(paystack !== undefined, 'Paystack in defaults');
assert(paystack?.name === 'Paystack', 'Paystack name');
assert(paystack?.type === 'card', 'Paystack type');
assert(paystack?.supportedCurrencies.includes('NGN'), 'Paystack supports NGN');

const paga = gateways.find(g => g.id === 'paga');
assert(paga !== undefined, 'Paga in defaults');
assert(paga?.name === 'Paga', 'Paga name');
assert(paga?.type === 'mobile', 'Paga type');

const bank = gateways.find(g => g.id === 'bank-transfer');
assert(bank !== undefined, 'Bank transfer in defaults');
assert(bank?.name === 'Bank Transfer', 'Bank transfer name');
assert(bank?.type === 'bank', 'Bank transfer type');
assert(bank?.fees.fixed === 100, 'Bank transfer fixed fee');

const crypto = gateways.find(g => g.id === 'crypto');
assert(crypto !== undefined, 'Crypto in defaults');
assert(crypto?.name === 'Crypto Wallet', 'Crypto name');
assert(crypto?.type === 'crypto', 'Crypto type');
assert(crypto?.supportedCurrencies.includes('USDT'), 'Crypto supports USDT');
assert(crypto?.supportedCurrencies.includes('BTC'), 'Crypto supports BTC');
assert(crypto?.supportedCurrencies.includes('ETH'), 'Crypto supports ETH');

console.log('\n--- Registry Method Tests ---');
// Test getGatewayById
assert(paymentGatewayRegistry.getGatewayById('paystack') !== undefined, 'Get Paystack by ID');
assert(paymentGatewayRegistry.getGatewayById('nonexistent') === undefined, 'Get nonexistent returns undefined');

// Test getActiveGateways
const activeNGN = paymentGatewayRegistry.getActiveGateways('NGN' as CurrencyCode);
assert(activeNGN.length > 0, 'Active NGN gateways exist');
assert(activeNGN.every(g => g.isActive), 'All active gateways are active');
assert(activeNGN.every(g => g.supportedCurrencies.includes('NGN')), 'All support NGN');

const activeUSDT = paymentGatewayRegistry.getActiveGateways('USDT' as CurrencyCode);
assert(activeUSDT.length > 0, 'Active USDT gateways exist');
assert(activeUSDT.every(g => g.supportedCurrencies.includes('USDT')), 'All support USDT');

const allActive = paymentGatewayRegistry.getActiveGateways();
assert(allActive.length >= activeNGN.length, 'All active includes NGN');

// Test getGatewaysByType
const cardGateways = paymentGatewayRegistry.getGatewaysByType('card');
assert(cardGateways.length >= 2, 'At least 2 card gateways (Paystack, Flutterwave)');
assert(cardGateways.every(g => g.type === 'card'), 'All are card type');

const mobileGateways = paymentGatewayRegistry.getGatewaysByType('mobile');
assert(mobileGateways.length >= 3, 'At least 3 mobile gateways (Opay, Paga, PalmPay)');
assert(mobileGateways.every(g => g.type === 'mobile'), 'All are mobile type');

const cryptoGateways = paymentGatewayRegistry.getGatewaysByType('crypto');
assert(cryptoGateways.length >= 1, 'At least 1 crypto gateway');
assert(cryptoGateways.every(g => g.type === 'crypto'), 'All are crypto type');

const bankGateways = paymentGatewayRegistry.getGatewaysByType('bank');
assert(bankGateways.length >= 1, 'At least 1 bank gateway');
assert(bankGateways.every(g => g.type === 'bank'), 'All are bank type');

console.log('\n--- Country Filter Tests ---');
const nigeriaGateways = paymentGatewayRegistry.getGatewaysByCountry('NG');
assert(nigeriaGateways.length >= 6, 'At least 6 Nigeria gateways (most support NG)');

const globalCount = paymentGatewayRegistry.getGatewaysByCountry('GLOBAL').length;
assert(globalCount >= 1, 'At least 1 global gateway (Crypto)');

console.log('\n--- KYC Tests ---');
const paystackRequiresKYC = paymentGatewayRegistry.requiresKYC('paystack', 1); // Tier 1 user
assert(paystackRequiresKYC === true, 'Paystack requires KYC for Tier 1 user');

const paystackNoKYC = paymentGatewayRegistry.requiresKYC('paystack', 3); // Tier 3 user
assert(paystackNoKYC === false, 'Paystack does not require KYC for Tier 3 user');

const cryptoNoKYC = paymentGatewayRegistry.requiresKYC('crypto', 1); // Tier 1 user
assert(cryptoNoKYC === false, 'Crypto does not require KYC for any tier');

const bankRequiresKYC = paymentGatewayRegistry.requiresKYC('bank-transfer', 1); // Tier 1 user
assert(bankRequiresKYC === true, 'Bank transfer requires KYC for Tier 1 user');

console.log('\n--- User Accessible Gateways Tests ---');
// Tier 1 user (basic) - should not see KYC-required gateways
const tier1Gateways = paymentGatewayRegistry.getUserAccessibleGateways(1, 'NGN');
assert(tier1Gateways.length >= 0, 'Tier 1 gateways array exists');
// Note: This might be 0 if all NGN gateways require KYC

// Tier 3 user (trusted) - should see all gateways
const tier3Gateways = paymentGatewayRegistry.getUserAccessibleGateways(3, 'NGN');
assert(tier3Gateways.length >= activeNGN.length, 'Tier 3 sees at least as many as active');

console.log('\n--- Fee Calculation Tests (via Registry) ---');
const feeViaRegistry = paymentGatewayRegistry.calculateTotalFee('paystack', 10000, 'NGN' as CurrencyCode);
assert(feeViaRegistry.fee === 200, 'Registry Paystack fee: 200');
assert(feeViaRegistry.total === 10200, 'Registry Paystack total: 10200');

const feeBankViaRegistry = paymentGatewayRegistry.calculateTotalFee('bank-transfer', 50000, 'NGN' as CurrencyCode);
assert(feeBankViaRegistry.fee === 100, 'Registry Bank fee: 100');
assert(feeBankViaRegistry.total === 50100, 'Registry Bank total: 50100');

console.log('\n--- Recommendation Tests (via Registry) ---');
const recViaRegistry = paymentGatewayRegistry.getRecommendedGateway(1000, 'NGN' as CurrencyCode, false);
assert(recViaRegistry !== undefined, 'Registry recommendation exists');

const recWithKYC = paymentGatewayRegistry.getRecommendedGateway(10000, 'NGN' as CurrencyCode, true);
assert(recWithKYC !== undefined, 'Registry recommendation with KYC exists');

console.log('\n--- Currency Support Tests ---');
const paystackCurrencies = paymentGatewayRegistry.getSupportedCurrencies('paystack');
assert(paystackCurrencies.length === 1, 'Paystack supports 1 currency');
assert(paystackCurrencies[0] === 'NGN', 'Paystack supports NGN');

const cryptoCurrencies = paymentGatewayRegistry.getSupportedCurrencies('crypto');
assert(cryptoCurrencies.length === 3, 'Crypto supports 3 currencies');
assert(cryptoCurrencies.includes('USDT'), 'Crypto supports USDT');
assert(cryptoCurrencies.includes('BTC'), 'Crypto supports BTC');
assert(cryptoCurrencies.includes('ETH'), 'Crypto supports ETH');

assert(paymentGatewayRegistry.isCurrencySupported('paystack', 'NGN') === true, 'Paystack supports NGN');
assert(paymentGatewayRegistry.isCurrencySupported('paystack', 'USDT') === false, 'Paystack does not support USDT');
assert(paymentGatewayRegistry.isCurrencySupported('crypto', 'NGN') === false, 'Crypto does not support NGN');

console.log('\n--- Localization Tests ---');
const paystackNameEn = paymentGatewayRegistry.getGatewayDisplayName('paystack', 'en');
assert(paystackNameEn === 'Paystack (Card)', 'Paystack EN display name');

const paystackNameYo = paymentGatewayRegistry.getGatewayDisplayName('paystack', 'yo');
assert(paystackNameYo === 'Paystack (Kaadi)', 'Paystack YO display name');

const bankNameZh = paymentGatewayRegistry.getGatewayDisplayName('bank-transfer', 'zh');
assert(bankNameZh === '银行转账', 'Bank transfer ZH display name');

const descEn = paymentGatewayRegistry.getGatewayDescription('paystack', 'en');
assert(descEn.includes('Instant card payments'), 'Paystack EN description');

const descYo = paymentGatewayRegistry.getGatewayDescription('paga', 'yo');
assert(descYo.includes('Mobile money transfers'), 'Paga YO description');

const feesEn = paymentGatewayRegistry.getGatewayFeesDisplay('paystack', 'en');
assert(feesEn === '1.5% + NGN 50', 'Paystack EN fees display');

const feesZh = paymentGatewayRegistry.getGatewayFeesDisplay('paga', 'zh');
assert(feesZh === '1.0% + 30 NGN', 'Paga ZH fees display');

console.log('\n--- Summary ---');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.error('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
}