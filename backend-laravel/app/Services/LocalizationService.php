<?php

namespace App\Services;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class LocalizationService
{
    /**
     * Supported locales
     */
    const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'pt', 'it', 'zh', 'ar'];
    
    /**
     * Default locale
     */
    const DEFAULT_LOCALE = 'en';
    
    /**
     * Set the application locale
     */
    public function setLocale($locale)
    {
        if (!in_array($locale, self::SUPPORTED_LOCALES)) {
            $locale = self::DEFAULT_LOCALE;
        }
        
        App::setLocale($locale);
        App::setFallbackLocale(self::DEFAULT_LOCALE);
        
        Log::info("Locale set to: {$locale}");
    }
    
    /**
     * Detect locale from request
     */
    public function detectLocale($request)
    {
        // Check header
        $locale = $request->header('Accept-Language');
        if ($locale && in_array(substr($locale, 0, 2), self::SUPPORTED_LOCALES)) {
            return substr($locale, 0, 2);
        }
        
        // Check query parameter
        $locale = $request->query('lang');
        if ($locale && in_array($locale, self::SUPPORTED_LOCALES)) {
            return $locale;
        }
        
        // Check user preference if authenticated
        if ($request->user()) {
            $userLocale = $request->user()->preferred_locale ?? null;
            if ($userLocale && in_array($userLocale, self::SUPPORTED_LOCALES)) {
                return $userLocale;
            }
        }
        
        // Default
        return self::DEFAULT_LOCALE;
    }
    
    /**
     * Get all supported locales
     */
    public function getSupportedLocales()
    {
        return Cache::remember('supported_locales', 3600, function () {
            return collect(self::SUPPORTED_LOCALES)->mapWithKeys(function ($locale) {
                return [$locale => $this->getLocaleName($locale)];
            })->toArray();
        });
    }
    
    /**
     * Get locale name
     */
    public function getLocaleName($locale)
    {
        $names = [
            'en' => 'English',
            'fr' => 'Français',
            'es' => 'Español',
            'de' => 'Deutsch',
            'pt' => 'Português',
            'it' => 'Italiano',
            'zh' => '中文',
            'ar' => 'العربية',
        ];
        
        return $names[$locale] ?? 'English';
    }
    
    /**
     * Get locale flag
     */
    public function getLocaleFlag($locale)
    {
        $flags = [
            'en' => '🇺🇸',
            'fr' => '🇫🇷',
            'es' => '🇪🇸',
            'de' => '🇩🇪',
            'pt' => '🇵🇹',
            'it' => '🇮🇹',
            'zh' => '🇨🇳',
            'ar' => '🇸🇦',
        ];
        
        return $flags[$locale] ?? '🇺🇸';
    }
    
    /**
     * Format currency
     */
    public function formatCurrency($amount, $currency = 'USD', $locale = null)
    {
        $locale = $locale ?? App::getLocale();
        
        $formatter = new \NumberFormatter($locale, \NumberFormatter::CURRENCY);
        return $formatter->formatCurrency($amount, $currency);
    }
    
    /**
     * Convert currency
     */
    public function convertCurrency($amount, $fromCurrency, $toCurrency)
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }
        
        $cacheKey = "exchange_rate_{$fromCurrency}_{$toCurrency}";
        $rate = Cache::get($cacheKey);
        
        if (!$rate) {
            // In production, fetch from exchange rate API
            $rates = $this->getExchangeRates();
            $rate = $rates[$toCurrency] ?? 1;
            Cache::put($cacheKey, $rate, 3600); // Cache for 1 hour
        }
        
        return round($amount * $rate, 2);
    }
    
    /**
     * Get exchange rates
     */
    private function getExchangeRates()
    {
        // Mock rates - in production, fetch from API
        return [
            'USD' => 1,
            'EUR' => 0.92,
            'GBP' => 0.79,
            'NGN' => 1500,
            'CAD' => 1.35,
            'AUD' => 1.52,
            'JPY' => 150,
            'CNY' => 7.2,
            'INR' => 83,
        ];
    }
    
    /**
     * Format number for locale
     */
    public function formatNumber($number, $locale = null)
    {
        $locale = $locale ?? App::getLocale();
        $formatter = new \NumberFormatter($locale, \NumberFormatter::DECIMAL);
        return $formatter->format($number);
    }
    
    /**
     * Format date for locale
     */
    public function formatDate($date, $locale = null, $format = 'medium')
    {
        $locale = $locale ?? App::getLocale();
        
        $intlDateFormatter = new \IntlDateFormatter(
            $locale,
            $format === 'short' ? \IntlDateFormatter::SHORT : \IntlDateFormatter::MEDIUM,
            \IntlDateFormatter::NONE,
            'UTC',
            \IntlDateFormatter::GREGORIAN
        );
        
        return $intlDateFormatter->format($date);
    }
    
    /**
     * Get supported currencies
     */
    public function getSupportedCurrencies()
    {
        return [
            'USD' => ['name' => 'US Dollar', 'symbol' => '$', 'countries' => ['US', 'CA', 'AU']],
            'EUR' => ['name' => 'Euro', 'symbol' => '€', 'countries' => ['DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'BE']],
            'GBP' => ['name' => 'British Pound', 'symbol' => '£', 'countries' => ['GB']],
            'NGN' => ['name' => 'Nigerian Naira', 'symbol' => '₦', 'countries' => ['NG']],
            'CAD' => ['name' => 'Canadian Dollar', 'symbol' => 'C$', 'countries' => ['CA']],
            'AUD' => ['name' => 'Australian Dollar', 'symbol' => 'A$', 'countries' => ['AU']],
            'JPY' => ['name' => 'Japanese Yen', 'symbol' => '¥', 'countries' => ['JP']],
            'CNY' => ['name' => 'Chinese Yuan', 'symbol' => '¥', 'countries' => ['CN']],
            'INR' => ['name' => 'Indian Rupee', 'symbol' => '₹', 'countries' => ['IN']],
        ];
    }
    
    /**
     * Get currency for country
     */
    public function getCurrencyForCountry($countryCode)
    {
        $countryCurrencyMap = [
            'US' => 'USD',
            'GB' => 'GBP',
            'NG' => 'NGN',
            'CA' => 'CAD',
            'AU' => 'AUD',
            'JP' => 'JPY',
            'CN' => 'CNY',
            'IN' => 'INR',
            'FR' => 'EUR',
            'DE' => 'EUR',
            'ES' => 'EUR',
            'PT' => 'EUR',
            'IT' => 'EUR',
        ];
        
        return $countryCurrencyMap[$countryCode] ?? 'USD';
    }
    
    /**
     * Get locale for country
     */
    public function getLocaleForCountry($countryCode)
    {
        $countryLocaleMap = [
            'US' => 'en',
            'GB' => 'en',
            'NG' => 'en',
            'CA' => 'en',
            'AU' => 'en',
            'JP' => 'zh',
            'CN' => 'zh',
            'IN' => 'hi',
            'FR' => 'fr',
            'DE' => 'de',
            'ES' => 'es',
            'PT' => 'pt',
            'IT' => 'it',
            'SA' => 'ar',
            'AE' => 'ar',
        ];
        
        return $countryLocaleMap[$countryCode] ?? 'en';
    }
}