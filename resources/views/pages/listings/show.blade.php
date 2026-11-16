@extends('layouts.app')

@section('content')
<?php
    $iconMap = [
        'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
        'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
        'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
    ];
    $color = $category = $listing->category;
    $catColor = $color ? ($color->color ?? 'emerald') : 'emerald';
    $catIcon = $color ? ($iconMap[$color->icon] ?? '🏷️') : '🏷️';
    
    $placeholderMap = [
        'iPhone' => 'https://images.unsplash.com/photo-1575745234279-3a74b6e0e514?w=800&q=80',
        'Toyota' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
        'MacBook' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        'Dining' => 'https://images.unsplash.com/photo-1533770270245-0e4cbf2565d3?w=800&q=80',
        'Ankara' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        'Samsung' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        'Bajaj' => 'https://images.unsplash.com/photo-1558981806-ec537fa0bca3?w=800&q=80',
        'LG' => 'https://images.unsplash.com/photo-1601813177118-5de6f5222e1b?w=800&q=80',
    ];
    $mainImage = $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80');
    $isFav = auth()->check() && auth()->user()->favoriteListings()->where('listings.id', $listing->id)->exists();
?>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-8">
                <div class="aspect-video bg-gradient-to-br from-{{ $catColor }}-50 to-slate-50 rounded-2xl overflow-hidden mb-6 border border-{{ $catColor }}-100 relative">
                    <img src="{{ $mainImage }}" alt="{{ $listing->title }}"
                         class="w-full h-full object-cover">
                    <span class="absolute top-3 left-3 bg-white text-{{ $catColor }}-600 text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                        {{ ucfirst($listing->condition ?? 'New') }}
                    </span>
                    @if ($listing->user->is_verified_seller)
                        <span class="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                            Verified
                        </span>
                    @endif
                    @if ($activePromotion)
                        <span class="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1 mt-2 ml-auto">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L2 7l8 5 8-5-8-5zM2 17l8 5 8-5M2 12l8 5 8-5"></path></svg>
                            {{ $activePromotion->kind === 'referral' ? 'Free Promotion' : 'Featured Promotion' }}
                        </span>
                    @endif
                    @include('partials.favorite-button', ['listing' => $listing, 'isFav' => $isFav, 'formClass' => 'absolute bottom-3 right-3 z-10'])
                </div>
                @if ($listing->images->count() > 1)
                    <div class="flex gap-2 overflow-x-auto pb-4">
                        @foreach ($listing->images as $img)
                            <img src="{{ $img->url }}" class="w-16 h-16 rounded-lg object-cover border border-slate-200 hover:border-{{ $catColor }}-500 cursor-pointer flex-shrink-0 transition-colors">
                        @endforeach
                    </div>
                @endif
            </div>

            <div class="lg:col-span-4 space-y-6">
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-{{ $catColor }}-600 bg-{{ $catColor }}-50">
                        {{ $catIcon }} {{ ucfirst($listing->condition ?? 'New') }}
                    </span>
                    @if ($listing->user->is_verified_seller)
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-green-600 bg-green-50">
                            ✓ Verified Seller
                        </span>
                    @endif
                </div>

                <h1 class="text-3xl font-black text-slate-900 tracking-tight">{{ $listing->title }}</h1>
                
                <!-- Non-aggressive AdSense Ad - Listing Detail Top -->
                @if($settings && $settings->adsense_enabled && $settings->adsense_placement_detail_top && $settings->adsense_client_id)
                    <div class="mb-4 flex justify-center">
                        <ins class="adsbygoogle" style="display:block" data-ad-client="{{ $settings->adsense_client_id }}" data-ad-slot="{{ $settings->adsense_slot_detail }}" data-ad-format="auto" data-full-width-responsive="true"></ins>
                        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                    </div>
                @endif
                
                <div class="text-2xl font-bold text-{{ $catColor }}-600">₦{{ number_format($listing->price, 0) }}</div>
                <p class="text-slate-600 mb-6 leading-relaxed">{{ $listing->description }}</p>

                <div class="space-y-3 text-sm text-slate-600">
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Location</span>
                        <span class="font-bold text-slate-900">{{ $listing->location }}</span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Condition</span>
                        <span class="font-bold text-slate-900 capitalize">{{ $listing->condition ?? 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Category</span>
                        <span class="font-bold text-slate-900">{{ $listing->category->name ?? 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Seller</span>
                        <span class="font-bold text-slate-900">{{ $listing->user->name ?? 'Sealify User' }}</span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Views</span>
                        <span class="font-bold text-slate-900">{{ $listing->views_count }}</span>
                    </div>
                </div>

                <div class="space-y-3">
                    <a href="{{ route('messages.index') }}" class="w-full bg-{{ $catColor }}-500 hover:bg-{{ $catColor }}-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-{{ $catColor }}-200 hover:shadow-{{ $catColor }}-300 text-center text-sm font-black">
                        Message Seller
                    </a>
                    <a href="{{ route('listings.favorite', $listing) }}" class="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3.5 rounded-xl transition-colors text-center">
                        Save to Favorites
                    </a>
                    <a href="{{ route('reports.listing', $listing) }}" class="w-full border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold py-3.5 rounded-xl transition-colors text-center text-sm">
                        ⚠ Report Listing
                    </a>
                </div>
            </div>
        </div>

        <div class="mt-12">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-7 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                About the Seller
            </h3>
            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                        {{ strtoupper(substr($listing->user->name ?? 'U', 0, 1)) }}
                    </div>
                    <div>
                        <p class="font-bold text-slate-900">{{ $listing->user->name ?? 'Sealify User' }}</p>
                        @if ($listing->user->is_verified_seller)
                            <span class="text-xs text-green-600 font-bold flex items-center gap-1">✓ Verified</span>
                        @endif
                        @php $sellerAvg = $listing->user->averageRating(); $sellerReviews = $listing->user->reviewCount(); @endphp
                        @if ($sellerReviews > 0)
                            <div class="flex items-center gap-1 mt-1">
                                @for ($i = 1; $i <= 5; $i++)
                                    <svg class="w-3.5 h-3.5 {{ $i <= round($sellerAvg) ? 'text-amber-400' : 'text-slate-300' }}" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                @endfor
                                <span class="text-xs text-slate-500 ml-1">{{ number_format($sellerAvg, 1) }} ({{ $sellerReviews }})</span>
                            </div>
                        @endif
                    </div>
                </div>
                <p class="text-slate-600 text-sm">{{ $listing->user->location ?? 'Ogbomosoland, Oyo State' }}</p>
                @if ($activePromotion)
                    <div class="mt-4 pt-4 border-t border-slate-200">
                        <div class="flex items-center gap-2 text-xs text-slate-600">
                            <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L2 7l8 5 8-5-8-5zM2 17l8 5 8-5M2 12l8 5 8-5"></path></svg>
                            <span>
                                Promoted by <strong class="font-bold text-slate-700">{{ $activePromotion->user->name ?? 'Seller' }}</strong>
                                @if ($activePromotion->kind === 'referral')
                                    via referral
                                @endif
                                until {{ $activePromotion->ends_at->format('M d, Y') }}
                            </span>
                        </div>
                    </div>
                @endif
            </div>

            {{-- Seller Rating --}}
            <div class="mt-6 pt-6 border-t border-slate-200">
                <div class="flex items-center gap-3 mb-4">
                    <h4 class="font-bold text-slate-900">Seller Rating</h4>
                    <div class="flex items-center gap-1">
                        @php
                            $avgRating = $listing->user->averageRating();
                            $reviewCount = $listing->user->reviewCount();
                        @endphp
                        @for ($i = 1; $i <= 5; $i++)
                            <svg class="w-5 h-5 {{ $i <= round($avgRating) ? 'text-amber-400' : 'text-slate-300' }}" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0z"></path>
                            </svg>
                        @endfor
                        <span class="text-sm text-slate-600 ml-2">{{ number_format($avgRating, 1) }} ({{ $reviewCount }} review{{ $reviewCount === 1 ? '' : 's' }})</span>
                    </div>
                </div>

                {{-- Review Form --}}
                @auth
                    @if (auth()->id() !== $listing->user_id)
                        <form method="POST" action="{{ route('listings.review', $listing) }}" class="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            @csrf
                            <p class="text-sm font-bold text-slate-700 mb-2">Rate this seller</p>
                            <div class="flex items-center gap-2 mb-3" id="star-rating">
                                @for ($i = 1; $i <= 5; $i++)
                                    <label class="cursor-pointer">
                                        <input type="radio" name="rating" value="{{ $i }}" class="hidden peer" {{ $userReview && $userReview->rating === $i ? 'checked' : '' }} required>
                                        <svg class="w-7 h-7 text-slate-300 peer-checked:text-amber-400 hover:text-amber-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                    </label>
                                @endfor
                            </div>
                            <textarea name="comment" rows="2" placeholder="Share your experience (optional)..." class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">{{ $userReview->comment ?? '' }}</textarea>
                            <button type="submit" class="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors text-sm">
                                {{ $userReview ? 'Update Review' : 'Submit Review' }}
                            </button>
                        </form>
                    @endif
                @else
                    <p class="text-sm text-slate-500 mb-4">
                        <a href="{{ route('login') }}" class="text-emerald-600 font-bold hover:underline">Log in</a> to rate this seller.
                    </p>
                @endauth

                {{-- Reviews List --}}
                @if ($reviews->isNotEmpty())
                    <div class="space-y-4">
                        <h5 class="font-bold text-slate-700 text-sm">Reviews</h5>
                        @foreach ($reviews as $review)
                            <div class="p-4 bg-white rounded-xl border border-slate-100">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                            {{ strtoupper(substr($review->buyer->name ?? 'U', 0, 1)) }}
                                        </div>
                                        <span class="text-sm font-bold text-slate-900">{{ $review->buyer->name ?? 'User' }}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        @for ($i = 1; $i <= 5; $i++)
                                            <svg class="w-4 h-4 {{ $i <= $review->rating ? 'text-amber-400' : 'text-slate-300' }}" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                        @endfor
                                    </div>
                                </div>
                                @if ($review->comment)
                                    <p class="text-sm text-slate-600">{{ $review->comment }}</p>
                                @endif
                                <p class="text-xs text-slate-400 mt-2">{{ $review->created_at->diffForHumans() }}</p>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection
