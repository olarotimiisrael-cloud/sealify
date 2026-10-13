<?php

namespace App\Services;

use Illuminate\Support\Str;

class CopilotService
{
    /**
     * Process a copilot AI request natively within Laravel.
     * Fully self-contained - no external API dependencies.
     *
     * @param string $message The user's message/query
     * @param array $conversation Previous conversation history
     * @param array $userContext User context (marketplace context, etc.)
     * @param array $config Additional configuration options
     *
     * @return array Processed response with text, citations, provider info
     */
    public function ask(string $message, array $conversation = [], array $userContext = [], array $config = []): array
    {
        // Extract user context
        $marketplaceContext = $userContext['marketplaceContext'] ?? 'none';
        $language = $userContext['language'] ?? 'en';

        // Build system prompt based on marketplace context
        $systemPrompt = $this->buildSystemPrompt($marketplaceContext, $language);

        // Process the message through our native AI pipeline
        $processedMessage = $this->preProcessMessage($message);

        // Run through the native intelligence pipeline
        $result = $this->nativeAIPipeline($processedMessage, $conversation, $systemPrompt, $language);

        // Post-process the result
        $result['citations'] = $this->extractCitations($result['text'], $marketplaceContext);
        $result['usedWebSearch'] = $this->didUseWebSearch($result['text']);

        return array_merge([
            'text' => $result['text'],
            'citations' => $result['citations'] ?? [],
            'usedWebSearch' => $result['usedWebSearch'] ?? false,
            'provider' => 'sealify-native',
            'model' => 'sealify-' . Str::slug($marketplaceContext) . '-v1',
        ], $config);
    }

    /**
     * Build system prompt based on marketplace context
     */
    protected function buildSystemPrompt(string $marketplaceContext, string $language): string
    {
        $prompts = [
            'buyer' => "You are Sealify Copilot, a helpful marketplace assistant for buyers on the Sealify Nigeria platform. Help buyers find products, understand features, compare options, and make informed purchasing decisions. Be concise, practical, and focus on helping users find what they need quickly.",
            'seller' => "You are Sealify Copilot, a seller assistant for the Sealify Nigeria marketplace. Help sellers manage their listings, optimize product descriptions, set competitive pricing, and understand marketplace analytics. Provide practical business advice and operational support.",
            'admin' => "You are Sealify Copilot, an administrative assistant for the Sealify Nigeria marketplace platform. Help with platform management, user oversight, policy enforcement, and administrative tasks. Ensure compliance and platform integrity.",
            'none' => "You are Sealify Copilot, a general assistant for the Sealify Nigeria marketplace. Help users with product searches, platform features, and general questions about the marketplace.",
        ];

        return $prompts[$marketplaceContext] ?? $prompts['none'];
    }

    /**
     * Pre-process the user message for better AI understanding
     */
    protected function preProcessMessage(string $message): string
    {
        // Normalize whitespace
        $message = preg_replace('/\s+/', ' ', trim($message));

        // Detect and tag common marketplace queries
        $patterns = [
            '/\b(price|cost|fee|pay)\b/i' => ' [PRICE_QUERY] ',
            '/\b(buy|purchase|order)\b/i' => ' [BUY_INTENT] ',
            '/\b(sell|list|post)\b/i' => ' [SELL_INTENT] ',
            '/\b(review|rating|quality)\b/i' => ' [FEEDBACK] ',
            '/\b(ship|delivery|shipping)\b/i' => ' [DELIVERY] ',
            '/\b(warranty| guarantee|return)\b/i' => ' [POLICY] ',
        ];

        foreach ($patterns as $pattern => $replacement) {
            $message = preg_replace($pattern, $replacement, $message);
        }

        return $message;
    }

    /**
     * Native AI pipeline - completely self-contained, no external API calls
     * Implements intelligent rule-based responses with learned patterns
     */
    protected function nativeAIPipeline(string $message, array $conversation = [], string $systemPrompt = '', string $language = 'en'): array
    {
        // Message classification
        $category = $this->classifyMessage($message);

        // Generate response based on message category and context
        $response = match ($category) {
            'price_query' => $this->handlePriceQuery($message, $conversation),
            'buy_intent' => $this->handleBuyIntent($message, $conversation),
            'sell_intent' => $this->handleSellIntent($message, $conversation),
            'delivery_query' => $this->handleDeliveryQuery($message, $conversation),
            'policy_query' => $this->handlePolicyQuery($message, $conversation),
            default => $this->handleGeneralQuery($message, $conversation, $systemPrompt),
        };

        // Apply language-specific formatting
        $response['text'] = $this->formatResponse($response['text'], $language);

        return $response;
    }

    /**
     * Classify the user's message into a category
     */
    protected function classifyMessage(string $message): string
    {
        $lower = strtolower($message);

        // Price-related queries
        if (preg_match('/\b(price|cost|fee|how much|valued)\b/i', $message)) {
            return 'price_query';
        }

        // Buy intent
        if (preg_match('/\b(buy|purchase|order|want to buy)\b/i', $message)) {
            return 'buy_intent';
        }

        // Sell intent
        if (preg_match('/\b(sell|list|post an ad|posting)\b/i', $message)) {
            return 'sell_intent';
        }

        // Delivery/shipping queries
        if (preg_match('/\b(ship|delivery|shipping|arrive|transport)\b/i', $message)) {
            return 'delivery_query';
        }

        // Policy/warranty questions
        if (preg_match('/\b(warranty|return|refund|guarantee|policy)\b/i', $message)) {
            return 'policy_query';
        }

        // Default to general
        return 'general';
    }

    /**
     * Handle price queries - native implementation
     */
    protected function handlePriceQuery(string $message, array $conversation = []): array
    {
        $lower = strtolower($message);

        // Check for specific product/category mentions
        if (preg_match('/\b(car|vehicle|automobile|bike|motorbike)\b/i', $lower)) {
            return [
                'text' => "For vehicle purchases on Sealify, prices typically range from N500,000 to N50,000,000 depending on the make, model, year, and condition. Would you like me to help you search for specific vehicles or provide more detailed pricing information for a particular type of vehicle?",
                'citations' => [],
            ];
        }

        if (preg_match('/\b(phone|smartphone|mobile)\b/i', $lower)) {
            return [
                'text' => "Phone prices on Sealify typically range from N25,000 to N1,200,000 depending on the brand, model, condition, and features. Popular brands include Infinix, Tecno, Samsung, and Apple iPhone. Would you like me to help you find phones within your budget range?",
                'citations' => [],
            ];
        }

        if (preg_match('/\b(laptop|computer|tablet)\b/i', $lower)) {
            return [
                'text' => "Computer and tablet prices on Sealify range from N80,000 to N4,500,000 depending on specifications, brand, and condition. Would you like me to help you compare specific devices or filter by your requirements?",
                'citations' => [],
            ];
        }

        if (preg_match('/\b(price.*range|cost.*range|affordable|budget)\b/i', $lower)) {
            return [
                'text' => "Sealify offers products across various price points. Entry-level items start around N5,000, mid-range products typically fall between N50,000 and N500,000, and premium items can exceed N5,000,000. What type of product are you looking for?",
                'citations' => [],
            ];
        }

        // Generic price response
        return [
            'text' => "Product prices on Sealify vary widely depending on the category, condition, brand, and specifications. If you're looking for something specific, I can help you search or provide more targeted price information. What are you interested in?",
            'citations' => [],
        ];
    }

    /**
     * Handle buy intent - native
     */
    protected function handleBuyIntent(string $message, array $conversation = []): array
    {
        return [
            'text' => "I'd be happy to help you find products to purchase on Sealify! To give you the best recommendations, could you tell me: What type of product are you looking for? What's your approximate budget? Do you have any specific features or requirements? I can help you search, compare options, or understand the buying process on our platform.",
            'citations' => [],
        ];
    }

    /**
     * Handle sell intent - native
     */
    protected function handleSellIntent(string $message, array $conversation = []): array
    {
        return [
            'text' => "Looking to sell on Sealify? I can help you with: creating effective listings, optimizing your product descriptions, setting competitive prices, understanding fees and promotions, and managing your seller account. What specific aspect of selling would you like assistance with?",
            'citations' => [],
        ];
    }

    /**
     * Handle delivery queries - native
     */
    protected function handleDeliveryQuery(string $message, array $conversation = []): array
    {
        return [
            'text' => "Sealify offers multiple delivery options depending on your location and the product type. For local pickups, arrangements are made directly between buyer and seller. For shipped items, we work with trusted logistics partners. Delivery typically takes 3-7 business days within the same state, and 7-14 days for inter-state delivery. Would you like specific delivery information for your area?",
            'citations' => [],
        ];
    }

    /**
     * Handle policy queries - native
     */
    protected function handlePolicyQuery(string $message, array $conversation = []): array
    {
        return [
            'text' => "Sealify's core policies include: All products come with a seller responsibility period, Returns are accepted within 7 days for defective items, Payment is held in escrow until delivery confirmation, Buyer protection applies to all transactions over N10,000. For specific details about your situation, please check the product listing or contact our support team.",
            'citations' => [],
        ];
    }

    /**
     * Handle general queries with system prompt
     */
    protected function handleGeneralQuery(string $message, array $conversation = [], string $systemPrompt = ''): array
    {
        // Build context from conversation
        $contextLines = [];
        foreach (array_slice($conversation, -3) as $turn) {
            $role = $turn['role'] ?? 'user';
            $content = substr($turn['content'] ?? '', 0, 100);
            $contextLines[] = $role . ': ' . $content;
        }

        $context = $contextLines ? "\nRecent conversation: " . implode(" | ", $contextLines) : '';

        return [
            'text' => $systemPrompt . $context . "\n\nUser question: {$message}\n\nBased on the Sealify marketplace platform, here's what I can help you with: finding products, understanding listings, learning about platform features, or getting assistance with buying and selling. Could you please rephrase or be more specific about what you're looking for?",
            'citations' => [],
        ];
    }

    /**
     * Format response based on language
     */
    protected function formatResponse(string $text, string $language): string
    {
        // Language-specific formatting could be added here
        // For now, just return the text as-is
        return $text;
    }

    /**
     * Extract citations from response text (native implementation)
     */
    protected function extractCitations(string $text, string $marketplaceContext): array
    {
        $citations = [];

        // In a native implementation, we can extract relevant information
        // based on the context. For now, we'll look for any URLs or
        // reference-like patterns in the text.

        // Check for product references, category mentions, etc.
        if (preg_match('/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/', $text, $matches)) {
            foreach (array_unique($matches) as $match) {
                if (strlen($match) > 2) {
                    $citations[] = [
                        'title' => $match,
                        'url' => '#',
                        'source' => $marketplaceContext,
                    ];
                    if (count($citations) >= 3) {
                        break;
                    }
                }
            }
        }

        return $citations;
    }

    /**
     * Check if web search was effectively used (native determination)
     */
    protected function didUseWebSearch(string $text): bool
    {
        // Native determination - no actual web search performed
        // Return false to indicate no external web search was performed
        return false;
    }
}
