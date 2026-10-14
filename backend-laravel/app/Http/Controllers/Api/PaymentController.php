<?php

namespace App\Http\Controllers\Api;

use App\Services\PaymentService;
use App\Services\LocalizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Get available payment methods for user's country
     */
    public function getAvailablePaymentMethods(Request $request, string $countryCode = 'US'): JsonResponse
    {
        try {
            $currency = $request->query('currency', 'USD');
            $paymentService = app(PaymentService::class);
            
            $methods = $paymentService->getAvailablePaymentMethods($countryCode, $currency);
            $localMethods = $paymentService->getLocalPaymentMethods($countryCode);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'country' => $countryCode,
                    'currency' => $currency,
                    'payment_methods' => $methods,
                    'local_payment_methods' => $localMethods,
                ],
            ], 200);
            
        } catch (\Exception $e) {
            Log::error("Error getting payment methods: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get payment methods',
            ], 500);
        }
    }
    
    /**
     * Process a payment
     */
    public function processPayment(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string|size:3',
                'payment_method' => 'required|string',
                'metadata' => 'nullable|array',
            ]);
            
            $paymentService = app(PaymentService::class);
            
            $payment = $paymentService->processPayment(
                $validated['amount'],
                $validated['currency'],
                $validated['payment_method'],
                $user,
                $validated['metadata'] ?? []
            );
            
            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment processed successfully',
            ], 201);
            
        } catch (\Exception $e) {
            Log::error("Payment processing failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed: ' . $e->getMessage(),
            ], 400);
        }
    }
    
    /**
     * Verify a payment
     */
    public function verifyPayment(Request $request, string $paymentId, string $paymentMethod): JsonResponse
    {
        try {
            $paymentService = app(PaymentService::class);
            
            $verification = $paymentService->verifyPayment($paymentId, $paymentMethod);
            
            return response()->json([
                'success' => true,
                'data' => $verification,
                'message' => 'Payment verified successfully',
            ], 200);
            
        } catch (\Exception $e) {
            Log::error("Payment verification failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed',
            ], 500);
        }
    }
    
    /**
     * Calculate tax for a transaction
     */
    public function calculateTax(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'country_code' => 'required|string|size:2',
                'state_code' => 'nullable|string|size:2',
            ]);
            
            $paymentService = app(PaymentService::class);
            
            $taxInfo = $paymentService->calculateTax(
                $validated['amount'],
                $validated['country_code'],
                $validated['state_code']
            );
            
            return response()->json([
                'success' => true,
                'data' => $taxInfo,
                'message' => 'Tax calculated successfully',
            ], 200);
            
        } catch (\Exception $e) {
            Log::error("Tax calculation failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Tax calculation failed',
            ], 500);
        }
    }
    
    /**
     * Get supported currencies
     */
    public function getSupportedCurrencies(): JsonResponse
    {
        $localizationService = app(LocalizationService::class);
        $currencies = $localizationService->getSupportedCurrencies();
        
        return response()->json([
            'success' => true,
            'data' => $currencies,
            'message' => 'Supported currencies retrieved successfully',
        ], 200);
    }
    
    /**
     * Get supported locales
     */
    public function getSupportedLocales(): JsonResponse
    {
        $localizationService = app(LocalizationService::class);
        $locales = $localizationService->getSupportedLocales();
        
        return response()->json([
            'success' => true,
            'data' => $locales,
            'current_locale' => app('current.locale'),
            'message' => 'Supported locales retrieved successfully',
        ], 200);
    }
    
    /**
     * Convert currency
     */
    public function convertCurrency(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'from_currency' => 'required|string|size:3',
                'to_currency' => 'required|string|size:3',
            ]);
            
            $localizationService = app(LocalizationService::class);
            
            $convertedAmount = $localizationService->convertCurrency(
                $validated['amount'],
                $validated['from_currency'],
                $validated['to_currency']
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'original_amount' => $validated['amount'],
                    'from_currency' => $validated['from_currency'],
                    'converted_amount' => $convertedAmount,
                    'to_currency' => $validated['to_currency'],
                ],
                'message' => 'Currency converted successfully',
            ], 200);
            
        } catch (\Exception $e) {
            Log::error("Currency conversion failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Currency conversion failed',
            ], 500);
        }
    }
    
    /**
     * Payment callback handler
     */
    public function paymentCallback(Request $request): JsonResponse
    {
        // Handle payment callback from gateway
        // This would verify the payment and update the system
        
        $transactionId = $request->query('transaction_id') ?? $request->input('transaction_id');
        $status = $request->query('status') ?? $request->input('status', 'success');
        
        Log::info("Payment callback received", [
            'transaction_id' => $transactionId,
            'status' => $status,
            'request_data' => $request->all(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Payment callback processed successfully',
        ], 200);
    }
}