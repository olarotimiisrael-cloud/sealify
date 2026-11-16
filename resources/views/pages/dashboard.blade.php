@extends('layouts.app')

@section('content')
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
            <h1 class="text-2xl font-black mb-1">Welcome back, {{ $user->name ?? 'User' }}! 👋</h1>
            <p class="text-emerald-100 text-sm">Here's what's happening with your account today.</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <a href="{{ route('listings.my') }}" class="bg-white rounded-xl border border-slate-100 p-4 hover:border-emerald-300 transition-colors shadow-sm">
                <div class="text-2xl font-bold text-emerald-600">{{ $stats['listings'] }}</div>
                <div class="text-xs text-slate-500">Total Listings</div>
            </a>
            <a href="{{ route('favorites.index') }}" class="bg-white rounded-xl border border-slate-100 p-4 hover:border-rose-300 transition-colors shadow-sm">
                <div class="text-2xl font-bold text-rose-500">{{ $stats['favorites'] }}</div>
                <div class="text-xs text-slate-500">Favorites</div>
            </a>
            <a href="{{ route('notifications.index') }}" class="bg-white rounded-xl border border-slate-100 p-4 hover:border-emerald-300 transition-colors shadow-sm">
                <div class="text-2xl font-bold text-amber-500">{{ $stats['unread_notifications'] }}</div>
                <div class="text-xs text-slate-500">Unread Alerts</div>
            </a>
            <div class="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div class="text-2xl font-bold text-emerald-600">{{ number_format($stats['wallet_balance'], 0) }}</div>
                <div class="text-xs text-slate-500">Wallet (₦)</div>
            </div>
            <a href="{{ route('messages.index') }}" class="bg-white rounded-xl border border-slate-100 p-4 hover:border-blue-300 transition-colors shadow-sm">
                <div class="text-2xl font-bold text-blue-600">{{ $stats['unread_messages'] }}</div>
                <div class="text-xs text-slate-500">Unread Messages</div>
            </a>
            <div class="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div class="text-2xl font-bold text-amber-500">{{ number_format($stats['average_rating'], 1) }}</div>
                <div class="text-xs text-slate-500">Avg Rating ({{ $stats['review_count'] }} reviews)</div>
            </div>
            <a href="{{ route('referrals') }}" class="bg-white rounded-xl border border-slate-100 p-4 hover:border-purple-300 transition-colors shadow-sm">
                <div class="text-2xl font-bold text-purple-600">{{ $stats['referral_count'] }}</div>
                <div class="text-xs text-slate-500">Referrals</div>
            </a>
            <a href="{{ route('kyc.index') }}" class="bg-white rounded-xl border border-slate-100 p-4 hover:border-emerald-300 transition-colors shadow-sm">
                <div class="text-2xl font-bold {{ $user->isKycVerified() ? 'text-emerald-600' : 'text-amber-500' }}">{{ $user->isKycVerified() ? '✓' : '!' }}</div>
                <div class="text-xs text-slate-500">KYC Status</div>
            </a>
        </div>

        <!-- Profile Completion Checklist -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Profile Setup Checklist</h3>
            <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 rounded-xl {{ $user->profile_completed ? 'bg-emerald-50' : 'bg-slate-50' }}">
                    <span class="w-6 h-6 rounded-full {{ $user->profile_completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400' }} flex items-center justify-center text-xs font-bold">{{ $user->profile_completed ? '✓' : '1' }}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-900">Complete Your Profile</p>
                        <p class="text-xs text-slate-500">Add your name, phone, and location</p>
                    </div>
                    @if (!$user->profile_completed)
                        <a href="{{ route('profile.complete') }}" class="text-xs font-bold text-emerald-600 hover:underline">Complete →</a>
                    @endif
                </div>
                <div class="flex items-center gap-3 p-3 rounded-xl {{ $user->business_profile_completed ? 'bg-emerald-50' : 'bg-slate-50' }}">
                    <span class="w-6 h-6 rounded-full {{ $user->business_profile_completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400' }} flex items-center justify-center text-xs font-bold">{{ $user->business_profile_completed ? '✓' : '2' }}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-900">Business Profile</p>
                        <p class="text-xs text-slate-500">Set up your business details and storefront</p>
                    </div>
                    @if (!$user->business_profile_completed)
                        <a href="{{ route('business.profile') }}" class="text-xs font-bold text-emerald-600 hover:underline">Setup →</a>
                    @endif
                </div>
                <div class="flex items-center gap-3 p-3 rounded-xl {{ $user->isKycVerified() ? 'bg-emerald-50' : 'bg-slate-50' }}">
                    <span class="w-6 h-6 rounded-full {{ $user->isKycVerified() ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400' }} flex items-center justify-center text-xs font-bold">{{ $user->isKycVerified() ? '✓' : '3' }}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-900">Identity Verification (KYC)</p>
                        <p class="text-xs text-slate-500">Submit government ID for verification</p>
                    </div>
                    @if (!$user->isKycVerified())
                        <a href="{{ route('kyc.index') }}" class="text-xs font-bold text-emerald-600 hover:underline">Verify →</a>
                    @endif
                </div>
                <div class="flex items-center gap-3 p-3 rounded-xl {{ $user->is_verified_seller ? 'bg-emerald-50' : 'bg-slate-50' }}">
                    <span class="w-6 h-6 rounded-full {{ $user->is_verified_seller ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400' }} flex items-center justify-center text-xs font-bold">{{ $user->is_verified_seller ? '✓' : '4' }}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-900">Verified Seller Badge</p>
                        <p class="text-xs text-slate-500">Get the green checkmark next to your name</p>
                    </div>
                    @if (!$user->is_verified_seller && !$user->verified_badge_application)
                        <form method="POST" action="{{ route('verified-badge.apply') }}" class="inline">
                            @csrf
                            <button type="submit" class="text-xs font-bold text-emerald-600 hover:underline">Apply →</button>
                        </form>
                    @elseif ($user->verified_badge_application)
                        <span class="text-xs font-bold text-amber-600">Pending Review</span>
                    @endif
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <a href="{{ route('listings.create') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                    <span class="text-2xl">📝</span>
                    <span class="text-xs font-bold text-slate-700">Post Ad</span>
                </a>
                <a href="{{ route('messages.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <span class="text-2xl">💬</span>
                    <span class="text-xs font-bold text-slate-700">Messages</span>
                </a>
                <a href="{{ route('favorites.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-rose-300 hover:bg-rose-50 transition-colors">
                    <span class="text-2xl">❤️</span>
                    <span class="text-xs font-bold text-slate-700">Favorites</span>
                </a>
                <a href="{{ route('payments.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                    <span class="text-2xl">💰</span>
                    <span class="text-xs font-bold text-slate-700">Payments</span>
                </a>
                <a href="{{ route('settings') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                    <span class="text-2xl">⚙️</span>
                    <span class="text-xs font-bold text-slate-700">Settings</span>
                </a>
                <a href="{{ route('kyc.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                    <span class="text-2xl">🪪</span>
                    <span class="text-xs font-bold text-slate-700">Verify ID</span>
                </a>
                <a href="{{ route('business.profile') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                    <span class="text-2xl">🏪</span>
                    <span class="text-xs font-bold text-slate-700">Business</span>
                </a>
                <a href="{{ route('profile.show') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                    <span class="text-2xl">👤</span>
                    <span class="text-xs font-bold text-slate-700">My Profile</span>
                </a>
            </div>
        </div>

        <!-- Recent Listings -->
        @if($user->listings->isNotEmpty())
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-slate-900">Recent Listings</h3>
                <a href="{{ route('listings.my') }}" class="text-xs text-emerald-600 font-bold hover:underline">View all →</a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                @foreach($user->listings->take(3) as $listing)
                    <a href="{{ route('listings.show', $listing) }}" class="block group">
                        <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2 border border-slate-100">
                            @include('partials.watermark-image', [
                                'src' => $listing->images->first()?->url ?? asset('logo.png'),
                                'alt' => $listing->title,
                                'class' => 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                            ])
                        </div>
                        <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600 truncate">{{ $listing->title }}</h4>
                        <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                    </a>
                @endforeach
            </div>
        </div>
        @endif
    </div>
@endsection