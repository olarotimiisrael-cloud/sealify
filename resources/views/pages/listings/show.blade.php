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
                    @include('partials.watermark-image', [
                        'src' => $mainImage,
                        'alt' => $listing->title,
                        'class' => 'w-full h-full object-cover',
                        'download' => false,
                    ])
                    <span class="absolute top-3 left-3 bg-white text-{{ $catColor }}-600 text-xs font-bold px-2 py-1 rounded-lg shadow-md z-20">
                        {{ $listing->condition_label }}
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
                            <div class="w-16 h-16 rounded-lg object-cover border border-slate-200 hover:border-{{ $catColor }}-500 cursor-pointer flex-shrink-0 transition-colors relative overflow-hidden">
                                @include('partials.watermark-image', [
                                    'src' => $img->url,
                                    'alt' => $listing->title,
                                    'class' => 'w-full h-full object-cover',
                                    'download' => false,
                                ])
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>

            <div class="lg:col-span-4 space-y-6">
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-{{ $catColor }}-600 bg-{{ $catColor }}-50">
                        {{ $catIcon }} {{ $listing->condition_label }}
                    </span>
                    @if ($listing->user->is_verified_seller)
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-green-600 bg-green-50">
                            ✓ Verified Seller
                        </span>
                    @endif
                </div>

                <h1 class="text-3xl font-black text-slate-900 tracking-tight">{{ $listing->title }}</h1>
                
                <!-- Share Button -->
                <div class="mt-3 flex items-center gap-2">
                    <button type="button" 
                            onclick="navigator.clipboard.writeText('{{ route('listings.show', $listing) }}'); alert('Link copied to clipboard!');"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        Share
                    </button>
                    <a href="https://wa.me/?text={{ urlencode($listing->title . ' - ' . route('listings.show', $listing)) }}" 
                       target="_blank"
                       class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                    </a>
                </div>
                
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
                    <div class="flex justify-between items-start gap-4 bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500 shrink-0">Condition</span>
                        <span class="font-bold text-slate-900 text-right">{{ $listing->condition_label }}</span>
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

        {{-- Comments Section --}}
        <div class="mt-12">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Comments ({{ $comments->count() }})
            </h3>

            {{-- Comment Form --}}
            @auth
                <form method="POST" action="{{ route('listings.comment', $listing) }}" class="mb-6">
                    @csrf
                    <textarea name="content" rows="3" placeholder="Write a comment..." 
                              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required></textarea>
                    <button type="submit" class="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors text-sm">
                        Post Comment
                    </button>
                </form>
            @else
                <p class="text-sm text-slate-500 mb-6">
                    <a href="{{ route('login') }}" class="text-emerald-600 font-bold hover:underline">Log in</a> to leave a comment.
                </p>
            @endauth

            {{-- Comments List --}}
            @if ($comments->isEmpty())
                <p class="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
            @else
                <div class="space-y-4">
                    @foreach ($comments as $comment)
                        <div class="p-4 bg-white rounded-xl border border-slate-100">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                        {{ strtoupper(substr($comment->user->name ?? 'U', 0, 1)) }}
                                    </div>
                                <div>
                                    <span class="text-sm font-bold text-slate-900">{{ $comment->user->name ?? 'User' }}</span>
                                    <p class="text-xs text-slate-400">{{ $comment->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                            </div>
                            <p class="text-sm text-slate-600">{{ $comment->content }}</p>

                            {{-- Replies --}}
                            @if ($comment->replies->isNotEmpty())
                                <div class="mt-3 ml-6 space-y-3 border-l-2 border-slate-100 pl-4">
                                    @foreach ($comment->replies as $reply)
                                        <div class="p-3 bg-slate-50 rounded-lg">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-xs font-bold text-slate-900">{{ $reply->user->name ?? 'User' }}</span>
                                                <span class="text-xs text-slate-400">{{ $reply->created_at->diffForHumans() }}</span>
                                            </div>
                                            <p class="text-sm text-slate-600">{{ $reply->content }}</p>
                                        </div>
                                    @endforeach
                                </div>
                            @endif

                            {{-- Reply Form --}}
                            @auth
                                <details class="mt-3">
                                    <summary class="text-xs text-emerald-600 font-bold cursor-pointer hover:underline">Reply</summary>
                                    <form method="POST" action="{{ route('listings.comment', $listing) }}" class="mt-2">
                                        @csrf
                                        <input type="hidden" name="parent_id" value="{{ $comment->id }}">
                                        <textarea name="content" rows="2" placeholder="Write a reply..." 
                                                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required></textarea>
                                        <button type="submit" class="mt-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1 rounded-lg transition-colors text-xs">
                                            Reply
                                        </button>
                                    </form>
                                </details>
                            @endauth
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
@endsection
