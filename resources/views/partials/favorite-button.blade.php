@auth
    <form method="POST" action="{{ route('listings.favorite', $listing) }}" class="{{ $formClass ?? 'absolute top-3 right-3 z-10' }}">
        @csrf
        <button type="submit" class="fav-btn {{ !empty($isFav) ? 'is-fav' : '' }}" title="{{ !empty($isFav) ? 'Remove from favorites' : 'Save to favorites' }}" aria-label="Save to favorites" aria-pressed="{{ !empty($isFav) ? 'true' : 'false' }}">
            <svg class="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
    </form>
@endauth
