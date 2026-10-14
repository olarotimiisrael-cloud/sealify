<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Process payment through local payment gateway
     */
    public function processPayment($amount, $currency, $paymentMethod, $user, $metadata = [])
    {
        $paymentConfig = config('services.payment_gateways');
        
        try {
            switch ($paymentMethod) {
                case 'stripe':
                    return $this->processStripePayment($amount, $currency, $user, $metadata);
                
                case 'flutterwave':
                    return $this->processFlutterwavePayment($amount, $currency, $user, $metadata);
                
                case 'paypal':
                    return $this->processPaypalPayment($amount, $currency, $user, $metadata);
                
                case 'bank_transfer':
                    return $this->processBankTransferPayment($amount, $currency, $user, $metadata);
                
                case 'mobile_money':
                    return $this->processMobileMoneyPayment($amount, $currency, $user, $metadata);
                
                case 'cash':
                    return $this->processCashPayment($amount, $currency, $user, $metadata);
                
                default:
                    throw new \Exception("Unsupported payment method: {$paymentMethod}");
            }
        } catch (\Exception $e) {
            Log::error("Payment processing failed: " . $e->getMessage(), [
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethod,
                'user_id' => $user->id ?? null,
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Process payment via Stripe
     */
    private function processStripePayment($amount, $currency, $user, $metadata)
    {
        $stripeConfig = config('services.payment_gateways.stripe');
        
        // Create payment intent
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $stripeConfig['secret'],
            'Content-Type' => 'application/x-www-form-urlencoded',
        ])->post('https://api.stripe.com/v1/payment_intents', [
            'amount' => $this->convertToSmallestUnit($amount, $currency),
            'currency' => strtolower($currency),
            'description' => $metadata['description'] ?? 'Sealify transaction',
            'metadata' => $this->formatStripeMetadata($metadata),
            'receipt_email' => $user->email ?? null,
        ]);
        
        if ($response->failed()) {
            throw new \Exception('Payment processing failed: ' . $response->json('error.message'));
        }
        
        return [
            'status' => 'success',
            'payment_method' => 'stripe',
            'payment_id' => $response->json('id'),
            'client_secret' => $response->json('client_secret'),
            'amount' => $amount,
            'currency' => $currency,
            'status_detail' => $response->json('status'),
        ];
    }
    
    /**
     * Process payment via Flutterwave
     */
    private function processFlutterwavePayment($amount, $currency, $user, $metadata)
    {
        $flutterwaveConfig = config('services.payment_gateways.flutterwave');
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $flutterwaveConfig['secret_key'],
            'Content-Type' => 'application/json',
        ])->post($flutterwaveConfig['base_url'] . '/payments', [
            'tx_ref' => Str::uuid(),
            'amount' => $amount,
            'currency' => $currency,
            'payment_options' => 'card, banktransfer, mobilemoney',
            'customer' => [
                'email' => $user->email ?? null,
                'name' => $user->name ?? null,
            ],
            'metadata' => $this->formatMetadata($metadata),
            'redirect_url' => route('payment.callback'),
        ]);
        
        if ($response->failed()) {
            throw new \Exception('Flutterwave payment failed: ' . $response->json('message'));
        }
        
        return [
            'status' => 'success',
            'payment_method' => 'flutterwave',
            'payment_id' => $response->json('data.id'),
            'payment_link' => $response->json('data.link'),
            'amount' => $amount,
            'currency' => $currency,
            'status_detail' => $response->json('data.status'),
        ];
    }
    
    /**
     * Process payment via PayPal
     */
    private function processPaypalPayment($amount, $currency, $user, $metadata)
    {
        $paypalConfig = config('services.payment_gateways.paypal');
        
        // Get PayPal access token
        $tokenResponse = Http::asForm()->withBasicAuth(
            $paypalConfig['client_id'],
            $paypalConfig['client_secret']
        )->post('https://api.paypal.com/v1/oauth2/token', [
            'grant_type' => 'client_credentials',
        ]);
        
        if ($tokenResponse->failed()) {
            throw new \Exception('PayPal authentication failed');
        }
        
        $accessToken = $tokenResponse->json('access_token');
        
        // Create payment
        $paymentResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
            'Content-Type' => 'application/json',
        ])->post('https://api.paypal.com/v1/payments/payment', [
            'intent' => 'sale',
            'payer' => [
                'payment_method' => 'paypal',
            ],
            'transactions' => [
                [
                    'amount' => [
                        'total' => $amount,
                        'currency' => $currency,
                    ],
                    'description' => $metadata['description'] ?? 'Sealify transaction',
                    'custom' => json_encode($this->formatMetadata($metadata)),
                ],
            ],
            'redirect_urls' => [
                'return_url' => route('payment.callback'),
                'cancel_url' => route('payment.cancel'),
            ],
        ]);
        
        if ($paymentResponse->failed()) {
            throw new \Exception('PayPal payment failed: ' . $paymentResponse->json('message'));
        }
        
        return [
            'status' => 'success',
            'payment_method' => 'paypal',
            'payment_id' => $paymentResponse->json('id'),
            'approval_url' => $this->getApprovalUrl($paymentResponse->json('links')),
            'amount' => $amount,
            'currency' => $currency,
            'status_detail' => $paymentResponse->json('state'),
        ];
    }
    
    /**
     * Process bank transfer payment
     */
    private function processBankTransferPayment($amount, $currency, $user, $metadata)
    {
        // Create bank transfer reference
        $reference = 'TXN-' . strtoupper(Str::random(10));
        
        $bankDetails = $this->getLocalBankDetails($currency);
        
        return [
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'bank_details' => $bankDetails,
            'instructions' => 'Please complete the bank transfer using the reference number above.',
            'expires_at' => now()->addHours(24)->toIso8601String(),
        ];
    }
    
    /**
     * Process mobile money payment
     */
    private function processMobileMoneyPayment($amount, $currency, $user, $metadata)
    {
        // Mobile money processing logic
        // This would integrate with local mobile money providers
        
        return [
            'status' => 'pending',
            'payment_method' => 'mobile_money',
            'transaction_id' => 'MM-' . strtoupper(Str::random(12)),
            'amount' => $amount,
            'currency' => $currency,
            'instructions' => 'Please complete the mobile money transaction.',
            'expires_at' => now()->addHours(2)->toIso8601String(),
        ];
    }
    
    /**
     * Process cash payment
     */
    private function processCashPayment($amount, $currency, $user, $metadata)
    {
        return [
            'status' => 'pending',
            'payment_method' => 'cash',
            'reference' => 'CASH-' . strtoupper(Str::random(10)),
            'amount' => $amount,
            'currency' => $currency,
            'instructions' => 'Cash on delivery. Payment will be collected upon delivery.',
        ];
    }
    
    /**
     * Get available payment methods for country
     */
    public function getAvailablePaymentMethods($countryCode, $currency)
    {
        $countryMethods = [
            'US' => ['stripe', 'paypal', 'bank_transfer'],
            'GB' => ['stripe', 'paypal', 'bank_transfer'],
            'NG' => ['flutterwave', 'bank_transfer', 'mobile_money', 'cash'],
            'CA' => ['stripe', 'paypal', 'bank_transfer'],
            'AU' => ['stripe', 'paypal', 'bank_transfer'],
            'DE' => ['stripe', 'paypal', 'bank_transfer'],
            'FR' => ['stripe', 'paypal', 'bank_transfer'],
            'ES' => ['stripe', 'paypal', 'bank_transfer'],
            'PT' => ['stripe', 'paypal', 'bank_transfer'],
            'IT' => ['stripe', 'paypal', 'bank_transfer'],
            'CN' => ['bank_transfer', 'alipay', 'wechat_pay'],
            'IN' => ['flutterwave', 'bank_transfer', 'upi', 'cash'],
            'AE' => ['stripe', 'bank_transfer'],
            'SA' => ['stripe', 'bank_transfer', 'cash'],
        ];
        
        $methods = $countryMethods[$countryCode] ?? ['stripe', 'paypal', 'bank_transfer'];
        
        // Filter by supported currencies
        $paymentConfig = config('services.payment_gateways');
        $filteredMethods = [];
        
        foreach ($methods as $method) {
            if (isset($paymentConfig[$method]['supported_currencies'])) {
                if (in_array($currency, $paymentConfig[$method]['supported_currencies'])) {
                    $filteredMethods[] = $method;
                }
            } else {
                $filteredMethods[] = $method;
            }
        }
        
        return $filteredMethods;
    }
    
    /**
     * Convert amount to smallest currency unit
     */
    private function convertToSmallestUnit($amount, $currency)
    {
        // Currencies without fractional units
        $noDecimalCurrencies = ['JPY', 'KRW', 'VND'];
        
        if (in_array($currency, $noDecimalCurrencies)) {
            return (int) $amount;
        }
        
        return (int) ($amount * 100);
    }
    
    /**
     * Format metadata for Stripe
     */
    private function formatStripeMetadata($metadata)
    {
        $formatted = [];
        foreach ($metadata as $key => $value) {
            $formatted[$key] = substr($value, 0, 22);
        }
        return $formatted;
    }
    
    /**
     * Format metadata for API
     */
    private function formatMetadata($metadata)
    {
        $formatted = [];
        foreach ($metadata as $key => $value) {
            $formatted[$key] = is_string($value) ? $value : json_encode($value);
        }
        return $formatted;
    }
    
    /**
     * Get approval URL from PayPal links
     */
    private function getApprovalUrl($links)
    {
        foreach ($links as $link) {
            if ($link['rel'] === 'approval_url') {
                return $link['href'];
            }
        }
        return null;
    }
    
    /**
     * Get local bank details for currency
     */
    private function getLocalBankDetails($currency)
    {
        $bankDetails = [
            'USD' => [
                'bank_name' => 'Wells Fargo',
                'account_number' => '1234567890',
                'routing_number' => '121042882',
                'account_holder' => 'Sealify Inc',
            ],
            'NGN' => [
                'bank_name' => 'First Bank of Nigeria',
                'account_number' => '1234567890',
                'routing_number' => '011000138',
                'account_holder' => 'Sealify Limited',
            ],
            'EUR' => [
                'bank_name' => 'Deutsche Bank',
                'account_number' => '1234567890',
                'iban' => 'DE44500604000123456789',
                'bic' => 'COBADEFFXXX',
                'account_holder' => 'Sealify GmbH',
            ],
        ];
        
        return $bankDetails[$currency] ?? $bankDetails['USD'];
    }
    
    /**
     * Verify payment status
     */
    public function verifyPayment($paymentId, $paymentMethod)
    {
        $paymentConfig = config('services.payment_gateways');
        
        try {
            switch ($paymentMethod) {
                case 'stripe':
                    return $this->verifyStripePayment($paymentId);
                
                case 'flutterwave':
                    return $this->verifyFlutterwavePayment($paymentId);
                
                case 'paypal':
                    return $this->verifyPaypalPayment($paymentId);
                
                default:
                    return [
                        'status' => 'unknown',
                        'message' => 'Payment verification not available for this method',
                    ];
            }
        } catch (\Exception $e) {
            Log::error("Payment verification failed: " . $e->getMessage(), [
                'payment_id' => $paymentId,
                'payment_method' => $paymentMethod,
            ]);
            
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Verify Stripe payment
     */
    private function verifyStripePayment($paymentId)
    {
        $stripeConfig = config('services.payment_gateways.stripe');
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $stripeConfig['secret'],
        ])->get("https://api.stripe.com/v1/payment_intents/{$paymentId}");
        
        if ($response->failed()) {
            return ['status' => 'error', 'message' => 'Payment not found'];
        }
        
        return [
            'status' => $response->json('status'),
            'amount' => $response->json('amount'),
            'currency' => $response->json('currency'),
            'created' => $response->json('created'),
            'charges' => $response->json('latest_charge.data'),
        ];
    }
    
    /**
     * Verify Flutterwave payment
     */
    private function verifyFlutterwavePayment($paymentId)
    {
        $flutterwaveConfig = config('services.payment_gateways.flutterwave');
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $flutterwaveConfig['secret_key'],
        ])->get($flutterwaveConfig['base_url'] . "/payments/{$paymentId}/verify");
        
        if ($response->failed()) {
            return ['status' => 'error', 'message' => 'Payment not found'];
        }
        
        return [
            'status' => $response->json('data.status'),
            'amount' => $response->json('data.amount'),
            'currency' => $response->json('data.currency'),
            'payment_type' => $response->json('data.payments[0].type'),
        ];
    }
    
    /**
     * Verify PayPal payment
     */
    private function verifyPaypalPayment($paymentId)
    {
        $paypalConfig = config('services.payment_gateways.paypal');
        
        // Get access token
        $tokenResponse = Http::asForm()->withBasicAuth(
            $paypalConfig['client_id'],
            $paypalConfig['client_secret']
        )->post('https://api.paypal.com/v1/oauth2/token', [
            'grant_type' => 'client_credentials',
        ]);
        
        if ($tokenResponse->failed()) {
            return ['status' => 'error', 'message' => 'PayPal authentication failed'];
        }
        
        $accessToken = $tokenResponse->json('access_token');
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
        ])->get("https://api.paypal.com/v1/payments/payment/{$paymentId}");
        
        if ($response->failed()) {
            return ['status' => 'error', 'message' => 'Payment not found'];
        }
        
        return [
            'status' => $response->json('state'),
            'amount' => $response->json('transactions[0].amount.total'),
            'currency' => $response->json('transactions[0].amount.currency'),
            'payer_email' => $response->json('payer.payer_info.email'),
        ];
    }
    
    /**
     * Calculate tax for transaction
     */
    public function calculateTax($amount, $countryCode, $stateCode = null)
    {
        $taxConfig = config('services.regional.tax_configurations');
        
        if (!isset($taxConfig[$countryCode])) {
            return ['tax_amount' => 0, 'tax_rate' => 0, 'tax_type' => 'none'];
        }
        
        $countryTax = $taxConfig[$countryCode];
        $taxAmount = 0;
        $taxType = 'none';
        $taxRate = 0;
        
        if ($countryTax['vat_enabled'] ?? false) {
            $taxRate = $countryTax['vat_rate'] ?? 0;
            $taxAmount = $amount * $taxRate;
            $taxType = 'VAT';
        } elseif ($countryTax['sales_tax_enabled'] ?? false) {
            $taxRate = $countryTax['tax_rates']['state'] ?? 0;
            $taxAmount = $amount * $taxRate;
            $taxType = 'Sales Tax';
        } elseif ($countryTax['gst_enabled'] ?? false) {
            $taxRate = $countryTax['gst_rate'] ?? 0;
            $taxAmount = $amount * $taxRate;
            $taxType = 'GST';
        }
        
        return [
            'tax_amount' => round($taxAmount, 2),
            'tax_rate' => $taxRate,
            'tax_type' => $taxType,
            'total_with_tax' => round($amount + $taxAmount, 2),
        ];
    }
    
    /**
     * Get local payment methods for country
     */
    public function getLocalPaymentMethods($countryCode)
    {
        return [
            'NG' => [
                'name' => 'Nigeria',
                'methods' => ['bank_transfer', 'mobile_money', 'cash'],
                'mobile_money_providers' => ['MTN', 'Airtel', 'Glo', '9Mobile'],
            ],
            'IN' => [
                'name' => 'India',
                'methods' => ['upi', 'net_banking', 'wallet', 'cash'],
                'upi_apps' => ['GPay', 'PhonePe', 'Paytm', 'Amazon Pay'],
            ],
            'CN' => [
                'name' => 'China',
                'methods' => ['alipay', 'wechat_pay'],
                'providers' => ['Alipay', 'WeChat Pay'],
            ],
            'SA' => [
                'name' => 'Saudi Arabia',
                'methods' => ['bank_transfer', 'mada', 'cash'],
                'providers' => ['Mada', 'STC Pay'],
            ],
            'AE' => [
                'name' => 'UAE',
                'methods' => ['bank_transfer', 'cash'],
                'providers' => ['Emirates NBD', 'ADIB'],
            ],
        ][$countryCode] ?? null;
    }
}