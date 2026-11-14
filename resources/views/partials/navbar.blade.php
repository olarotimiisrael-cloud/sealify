<nav class="bg-white border-b border-emerald-50 sticky top-0 z-50 shadow-sm">
    <div class="relative">
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
        <div class="max-w-7xl mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
                <a href="{{ route('home') }}" class="flex items-center gap-2 group">
                    <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-8 w-auto">
                    <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
                </a>

                <div class="hidden md:flex items-center gap-4">
                    <a href="{{ route('home') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Home</a>
                    <a href="{{ route('listings.index') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Listings</a>
                    <a href="{{ route('services') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Services</a>
                    <a href="{{ route('how-it-works') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">How It Works</a>
                    <a href="{{ route('contact') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Contact</a>
                </div>

                <div class="flex items-center gap-3">
                    <a href="{{ route('messages.index') }}" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </a>
                    <button class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v-.347C7.67 6.165 9 8.51 9 11a1.5 1.5 0 003 0m-1 15l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </button>
                    @auth
                        <a href="{{ route('profile.show') }}" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </a>
                    @else
                        <button class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl" onclick="document.getElementById('user-menu').classList.toggle('hidden')">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </button>
                    @endauth
                </div>
            </div>
        </div>
    </div>

    @auth
        <div id="user-menu" class="hidden absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
            <div class="px-4 py-2 border-b border-slate-100">
                <p class="text-xs font-black text-slate-900 uppercase tracking-wider">User Menu</p>
            </div>
            <a href="{{ route('profile.show') }}" class="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors block">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Profile
            </a>
            <a href="{{ route('settings') }}" class="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors block">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Settings
            </a>
            @if (auth()->user()->isAdmin())
                <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors block">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Admin Panel
                </a>
            @endif
            <form method="POST" action="{{ route('logout') }}" class="block">
                @csrf
                <button type="submit" class="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors text-left">
                    <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Logout
                </button>
            </form>
        </div>
    @else
        <div id="user-menu" class="hidden absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
            <div class="px-4 py-2 border-b border-slate-100">
                <p class="text-xs font-black text-slate-900 uppercase tracking-wider">User Menu</p>
            </div>
            <a href="{{ route('register') }}" class="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors block">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Sign Up
            </a>
            <a href="{{ route('login') }}" class="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors block">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                Sign In
            </a>
        </div>
    @endauth
</nav>
