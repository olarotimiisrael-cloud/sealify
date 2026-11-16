<!-- MOBILE BOTTOM NAV (marketplace app style) -->
<nav class="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 shadow-lg px-2 pb-4 md:pb-4 lg:hidden">
    <div class="max-w-md mx-auto grid grid-cols-5 gap-1">
        <a href="{{ route('home') }}"
           class="{{ request()->routeIs('home') ? 'text-emerald-600' : 'text-slate-500' }} flex flex-col items-center gap-1 px-1 py-2 rounded-xl transition-colors {{ request()->routeIs('home') ? 'bg-emerald-50' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </a>
        <a href="{{ route('listings.index') }}"
           class="{{ request()->routeIs('listings.index') ? 'text-emerald-600' : 'text-slate-500' }} flex flex-col items-center gap-1 px-1 py-2 rounded-xl transition-colors {{ request()->routeIs('listings.index') ? 'bg-emerald-50' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 114 0v11a2 2 0 11-4 0V6zm16 13a2 2 0 10-4 0v-4a2 2 0 114 0v4zm-6-5a2 2 0 10-4 0v3a2 2 0 004 0v-3zm0 0l4 4m0 0l-4-4m4 4V9h4v12"/></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider">Browse</span>
        </a>
        <a href="{{ route('listings.create') }}"
           class="flex flex-col items-center gap-1 px-1 py-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200/60 transition-all active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider">Sell</span>
        </a>
<a href="{{ route('messages.index') }}"
            class="{{ request()->routeIs('messages.*') ? 'text-emerald-600' : 'text-slate-500' }} flex flex-col items-center gap-1 px-1 py-2 rounded-xl transition-colors {{ request()->routeIs('messages.*') ? 'bg-emerald-50' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider">Messages</span>
        </a>
        <a href="{{ route('profile.show') }}"
           class="{{ request()->routeIs('profile.*') ? 'text-emerald-600' : 'text-slate-500' }} flex flex-col items-center gap-1 px-1 py-2 rounded-xl transition-colors {{ request()->routeIs('profile.*') ? 'bg-emerald-50' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </a>
    </div>
</nav>

<style>
    html { scroll-padding-top: 4rem; scroll-padding-bottom: 14rem; }
</style>
