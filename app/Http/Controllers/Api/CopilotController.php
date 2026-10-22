<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CopilotController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation' => ['nullable', 'array'],
        ]);

        $message = strtolower(trim($request->input('message')));
        $conversation = $request->input('conversation', []);

        $response = $this->generateResponse($message, $conversation);

        return response()->json([
            'message' => $response['text'],
            'citations' => $response['citations'] ?? [],
            'provider' => 'sealify-rule-based',
            'usedWebSearch' => false,
        ]);
    }

    private function generateResponse(string $message, array $conversation): array
    {
        $keywords = [
            'how does sealify work' => 'how-it-works',
            'what is sealify' => 'what-is',
            'create listing' => 'create-listing',
            'post ad' => 'create-listing',
            'sell item' => 'create-listing',
            'safe meeting' => 'safe-meetup',
            'meet seller' => 'safe-meetup',
            'meetup' => 'safe-meetup',
            'scam' => 'safe-meetup',
            'fraud' => 'safe-meetup',
            'price' => 'pricing',
            'how much' => 'pricing',
            'negotiate' => 'pricing',
            'delivery' => 'delivery',
            'ship' => 'delivery',
            'courier' => 'delivery',
            'payment' => 'payment',
            'pay' => 'payment',
            'paystack' => 'payment',
            'flutterwave' => 'payment',
            'register' => 'registration',
            'sign up' => 'registration',
            'login' => 'authentication',
            'sign in' => 'authentication',
            'forgot password' => 'authentication',
            'reset password' => 'authentication',
            'kyc' => 'verification',
            'verify' => 'verification',
            'verify email' => 'verification',
            'voice note' => 'voice-notes',
            'chat' => 'messaging',
            'message' => 'messaging',
            'follow' => 'follow',
            'seller' => 'follow',
            'buyer' => 'follow',
            'favorite' => 'favorite',
            'save' => 'favorite',
            'listing' => 'listing-help',
            'item' => 'listing-help',
            'product' => 'listing-help',
            'search' => 'search-help',
            'find' => 'search-help',
            'category' => 'category-help',
        ];

        $matched = null;
        foreach ($keywords as $key => $topic) {
            if (str_contains($message, $key)) {
                $matched = $topic;
                break;
            }
        }

        if (! $matched) {
            $matched = 'general';
        }

        return $this->buildResponse($matched, $message);
    }

    private function buildResponse(string $topic, string $message): array
    {
        $responses = [
            'how-it-works' => [
                'text' => "Sealify is a local marketplace for buying and selling items safely.\n\nHow it works:\n1. Browse listings in your area\n2. Chat with sellers directly (text or voice notes)\n3. Agree on price and meetup spot\n4. Meet in a public place and inspect before paying\n5. Leave feedback after the transaction\n\nTip: Always verify the item matches the listing before handing over cash.",
                'citations' => [
                    ['title' => 'How It Works', 'url' => '/how-it-works', 'source' => 'Sealify Help'],
                ],
            ],
            'what-is' => [
                'text' => 'Sealify is a community marketplace app where you can buy and sell secondhand items locally. Think of it as a safer, local alternative to classifieds — with built-in chat, voice notes, and trusted meetup tips.',
                'citations' => [],
            ],
            'create-listing' => [
                'text' => "To create a listing:\n1. Go to 'Post Ad' from the home screen\n2. Choose a category and write a clear title\n3. Add photos and an honest description\n4. Set your price and location\n5. Publish — buyers can now chat with you\n\nPro tip: Good photos and detailed descriptions sell faster.",
                'citations' => [
                    ['title' => 'Post a Listing', 'url' => '/post-ad', 'source' => 'Sealify Help'],
                ],
            ],
            'safe-meetup' => [
                'text' => "Stay safe when meeting a buyer or seller:\n• Meet in a public, well-lit place (coffee shop, mall, police station safe zone)\n• Bring a friend or let someone know where you're going\n• Inspect the item thoroughly before paying\n• Test electronics before handing over cash\n• Avoid wiring money or paying before seeing the item\n• Trust your gut — if something feels off, walk away",
                'citations' => [
                    ['title' => 'Safety Center', 'url' => '/safety', 'source' => 'Sealify Safety'],
                ],
            ],
            'pricing' => [
                'text' => "Pricing is set by the seller. You can:\n• Make an offer through chat\n• Negotiate politely — many sellers expect some haggling\n• Check similar listings to gauge fair market value\n• Bundle items for a better deal\n\nRemember: the listed price is often a starting point, not the final price.",
                'citations' => [],
            ],
            'delivery' => [
                'text' => "Delivery options depend on the seller:\n• Some sellers offer local delivery for a fee\n• Others prefer meetup only\n• You can ask about delivery in the chat before committing\n• For high-value items, consider using a trusted courier with tracking",
                'citations' => [],
            ],
            'payment' => [
                'text' => "Payment is handled between you and the other party:\n• Cash on meetup is most common for local deals\n• Some sellers accept bank transfer or mobile money\n• Never pay before inspecting the item\n• Sealify does not hold payments in escrow\n• Get a receipt or confirmation after payment",
                'citations' => [],
            ],
            'registration' => [
                'text' => "To create an account:\n1. Tap 'Sign Up' on the welcome screen\n2. Enter your full name, phone number, email, and password\n3. Verify your email/phone with the OTP code\n4. Complete your profile with a photo\n\nVerification helps build trust with other users.",
                'citations' => [
                    ['title' => 'Create Account', 'url' => '/auth/register?mode=signup', 'source' => 'Sealify Auth'],
                ],
            ],
            'authentication' => [
                'text' => "To sign in:\n1. Tap 'Sign In' and enter your email/phone and password\n2. If you forgot your password, tap 'Forgot password?'\n3. We'll send a reset link to your email\n\nFor faster access, you can also sign in with Google or Apple.",
                'citations' => [
                    ['title' => 'Log In', 'url' => '/auth/login?mode=login', 'source' => 'Sealify Auth'],
                ],
            ],
            'verification' => [
                'text' => "Verification (KYC) helps prove you're a real person:\n1. Go to KYC in your profile settings\n2. Upload a valid ID (national ID, driver's license, or passport)\n3. Complete face verification if prompted\n4. Wait for approval (usually within 24 hours)\n\nVerified users get more trust and better response rates.",
                'citations' => [
                    ['title' => 'KYC Verification', 'url' => '/kyc', 'source' => 'Sealify KYC'],
                ],
            ],
            'voice-notes' => [
                'text' => "Voice notes let you send audio messages in chat:\n1. Open any conversation\n2. Tap the microphone icon in the message composer\n3. Hold to record, release to send\n4. The recipient can play it back instantly\n\nGreat for quick questions or negotiating without typing.",
                'citations' => [],
            ],
            'messaging' => [
                'text' => "Chat with buyers and sellers directly:\n1. From any listing, tap 'Message Seller'\n2. Send text messages or voice notes\n3. Share quick replies for common questions\n4. Mark conversations as read when you're done\n\nAll messages are stored in your inbox.",
                'citations' => [],
            ],
            'follow' => [
                'text' => "Follow users you like:\n1. Visit a seller's profile\n2. Tap 'Follow' to get updates on their new listings\n3. See their items in your feed\n4. Get notified when they post something new\n\nUnfollow anytime from their profile.",
                'citations' => [],
            ],
            'favorite' => [
                'text' => "Save items you love:\n1. Tap the heart icon on any listing to favorite it\n2. View all your saved items in 'My Ads' > 'Saved'\n3. Get notified if the price drops\n4. Unfavorite anytime\n\nFavorites are private — only you can see them.",
                'citations' => [],
            ],
            'listing-help' => [
                'text' => "Listing tips for sellers:\n• Write a clear, honest title\n• Take photos in good lighting from multiple angles\n• Describe any flaws or wear — transparency builds trust\n• Price competitively by checking similar items\n• Respond quickly to messages\n\nGood listings sell 3x faster.",
                'citations' => [],
            ],
            'search-help' => [
                'text' => "Find what you're looking for:\n• Use the search bar at the top\n• Filter by category, location, and price\n• Sort by newest, price, or distance\n• Save searches to get notified of new matches\n\nTry broader terms if you don't find exactly what you want.",
                'citations' => [],
            ],
            'category-help' => [
                'text' => "Browse by category:\n• Electronics, phones, laptops\n• Fashion, shoes, bags\n• Home & furniture\n• Vehicles & parts\n• Books, sports, toys\n• Services\n\nEach category has subcategories for more specific browsing.",
                'citations' => [],
            ],
            'general' => [
                'text' => "I'm your Sealify Copilot! I can help with:\n• How the marketplace works\n• Creating and editing listings\n• Safe meetup and trading tips\n• Pricing, delivery, and payment questions\n• Account setup and verification\n• Finding items and using search\n\nJust ask me anything — for example: 'How do I create a listing?' or 'Is it safe to meet a seller?'",
                'citations' => [],
            ],
        ];

        $response = $responses[$topic] ?? $responses['general'];

        return [
            'text' => $response['text'],
            'citations' => $response['citations'],
        ];
    }
}
