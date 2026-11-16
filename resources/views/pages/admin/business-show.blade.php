@extends('layouts.admin')

@section('adminContent')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Business Details</h1>
            <p class="text-slate-600">{{ $user->business_name ?? 'Business Profile' }}</p>
        </div>
        <a href="{{ route('admin.businesses') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Businesses</a>
    </div>

    <!-- Business Info -->
    <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <div class="flex items-center justify-between mb-6">
<div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-2xl">
                    {{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl font-bold text-slate-900">{{ $user->business_name ?? 'Business Name' }}</h2>
                        @if ($user->hasBadge())
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-{{ $user->badgeColor() }}-100 text-{{ $user->badgeColor() }}-700">
                                {{ $user->badgeLabel() }}
                            </span>
                        @endif
                    </div>
                    <p class="text-sm text-slate-600">@{{ $user->username ?? $user->email }}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full
                    {{ $user->is_verified_seller ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' }}
                    text-xs font-bold">
                    {{ $user->is_verified_seller ? '✓ Verified Business' : '⚠ Unverified' }}
                </span>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Owner</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->name }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->email }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->whatsapp_number ?? $user->phone ?? 'Not set' }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->business_category ?? 'Not set' }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CAC Number</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->cac_number ?? 'Not set' }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Business Hours</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->business_hours ?? 'Not set' }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Website</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->website_url ?? 'Not set' }}</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Instagram</p>
                <p class="text-sm text-slate-900 font-medium">{{ $user->instagram_handle ?? 'Not set' }}</p>
            </div>
<div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rating</p>
                <p class="text-sm text-slate-900 font-medium">
                    @php $br = $user->averageRating(); $brc = $user->reviewCount(); @endphp
                    {{ number_format($br, 1) }} / 5 ({{ $brc }} review{{ $brc === 1 ? '' : 's' }})
                </p>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex gap-3">
            @if ($user->is_verified_seller)
                <form method="POST" action="{{ route('admin.businesses.unverify', $user) }}" class="inline">
                    @csrf
                    <button class="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-6 py-3 rounded-xl transition-colors">
                        Unverify Business
                    </button>
                </form>
            @else
                <form method="POST" action="{{ route('admin.businesses.verify', $user) }}" class="inline">
                    @csrf
                    <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                        Verify Business
                    </button>
                </form>
            @endif
            <a href="{{ route('admin.users') }}" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors">
                User Management
            </a>
        </div>
    </div>

    <!-- Business Listings -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Business Listings ({{ $user->listings->count() }})</h3>
        @if ($user->listings->isEmpty())
            <p class="text-slate-500 text-center py-8">No listings yet.</p>
        @else
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach ($user->listings as $listing)
                    <a href="{{ route('listings.show', $listing) }}" class="block group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                        <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                            @include('partials.watermark-image', [
                                'src' => $listing->images->first()?->url ?? asset('images/sealify-placeholder.png'),
                                'alt' => $listing->title,
                                'class' => 'w-full h-full object-cover',
                            ])
                        </div>
                        <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                        <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                    </a>
                @endforeach
            </div>
        @endif
    </div>

    <!-- KYC History -->
    @if ($user->kycVerifications->count() > 0)
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">KYC History</h3>
            <div class="space-y-3">
                @foreach ($user->kycVerifications as $kyc)
                    <div class="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <div>
                            <p class="font-medium text-slate-900 text-sm">{{ ucfirst($kyc->id_type ?? 'ID Verification') }}</p>
                            <p class="text-xs text-slate-500">{{ $kyc->created_at?->format('M d, Y') }}</p>
                        </div>
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                            {{ $kyc->status === 'approved' ? 'bg-emerald-100 text-emerald-600' : ($kyc->status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600') }}">
                            {{ ucfirst($kyc->status ?? 'pending') }}
                        </span>
                    </div>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection

