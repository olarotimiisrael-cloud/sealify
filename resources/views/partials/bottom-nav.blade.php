<!-- MOBILE / APP BOTTOM NAV (marketplace app style) -->
<nav class="fixed bottom-0 left-0 right-0 z-[60]">
    <div class="bg-white/95 backdrop-blur-lg border-t border-emerald-100 shadow-[0_-4px_20px_rgba(16,185,129,0.12)] px-2 pt-1.5 pb-2">
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
        <div class="max-w-md mx-auto grid grid-cols-5 gap-1 items-end">
            <a href="{{ route('home') }}"
               class="{{ request()->routeIs('home') ? 'text-emerald-600' : 'text-slate-400' }} flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all {{ request()->routeIs('home') ? 'bg-emerald-50' : 'hover:bg-slate-50' }}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                <span class="text-[10px] font-bold uppercase tracking-wider">Home</span>
            </a>
            <a href="{{ route('categories.index') }}"
               class="{{ request()->routeIs('categories.*') ? 'text-emerald-600' : 'text-slate-400' }} flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all {{ request()->routeIs('categories.*') ? 'bg-emerald-50' : 'hover:bg-slate-50' }}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                <span class="text-[10px] font-bold uppercase tracking-wider">Categories</span>
            </a>
            <a href="{{ route('listings.create') }}"
               class="flex flex-col items-center gap-0.5 -mt-4">
                <span class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-400/50 flex items-center justify-center active:scale-95 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14m7-7H5"/></svg>
                </span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sell</span>
            </a>
            <a href="{{ route('messages.index') }}"
               class="{{ request()->routeIs('messages.*') ? 'text-emerald-600' : 'text-slate-400' }} flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all {{ request()->routeIs('messages.*') ? 'bg-emerald-50' : 'hover:bg-slate-50' }}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                <span class="text-[10px] font-bold uppercase tracking-wider">Messages</span>
            </a>
            <a href="{{ route('profile.show') }}"
               class="{{ request()->routeIs('profile.*') ? 'text-emerald-600' : 'text-slate-400' }} flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all {{ request()->routeIs('profile.*') ? 'bg-emerald-50' : 'hover:bg-slate-50' }}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span class="text-[10px] font-bold uppercase tracking-wider">Profile</span>
            </a>
        </div>
    </div>
</nav>

<style>
    html { scroll-padding-top: 4rem; scroll-padding-bottom: 6rem; }
</style>