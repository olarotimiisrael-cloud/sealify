<nav class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
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
                    <a href="{{ route('messages.index') }}" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl group" title="Messages">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        @auth
                            @php
                                $unreadMessages = App\Models\Message::where('receiver_id', auth()->id())->where('is_read', false)->count();
                            @endphp
                            @if ($unreadMessages > 0)
                                <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ $unreadMessages }}</span>
                            @endif
                        @endauth
                    </a>
                    <button id="notif-btn" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl group" onclick="toggleNotifDrawer()" title="Notifications">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13 19l0-1M14 19l0-1M19 19l0-1"></path></svg>
                        @auth
                            @php
                                $unreadNotifications = App\Models\Notification::where('user_id', auth()->id())->where('read_at', null)->count();
                            @endphp
                            @if ($unreadNotifications > 0)
                                <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ $unreadNotifications }}</span>
                            @endif
                        @endauth
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
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Profile
            </a>
            <a href="{{ route('settings') }}" class="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors block">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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

    <!-- NOTIFICATIONS DRAWER -->
    @auth
    <div id="notif-backdrop" class="hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]" onclick="toggleNotifDrawer()"></div>
    <div id="notif-drawer" class="hidden fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[61] flex flex-col transition-transform duration-300 translate-x-full">
        <div class="flex items-start justify-between p-6 border-b border-slate-100">
            <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13 19l0-1M14 19l0-1M19 19l0-1"/></svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-slate-900 leading-tight">Notifications</h3>
                    <p class="text-sm text-slate-500">
                        @php $unreadCount = App\Models\Notification::where('user_id', auth()->id())->where('read_at', null)->count(); @endphp
                        {{ $unreadCount }} unread update{{ $unreadCount === 1 ? '' : 's' }}
                    </p>
                </div>
            </div>
            <button type="button" onclick="toggleNotifDrawer()" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="Close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto">
            @php $drawerNotifications = App\Models\Notification::where('user_id', auth()->id())->latest()->take(20)->get(); @endphp
            @if ($drawerNotifications->isEmpty())
                <div class="flex items-center justify-center h-full">
                    <p class="text-slate-500 text-sm">No notifications right now.</p>
                </div>
            @else
                <ul class="divide-y divide-slate-100">
                    @foreach ($drawerNotifications as $notification)
                        <li class="px-6 py-4 hover:bg-slate-50 transition-colors {{ $notification->read_at ? '' : 'bg-emerald-50/40' }}">
                            <div class="flex items-start gap-3">
                                <span class="mt-1 w-2 h-2 rounded-full {{ $notification->read_at ? 'bg-transparent' : 'bg-emerald-500' }}"></span>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-slate-900">{{ $notification->title ?? 'Notification' }}</p>
                                    @if (!empty($notification->description))
                                        <p class="text-sm text-slate-600 mt-0.5">{{ $notification->description }}</p>
                                    @endif
                                    <p class="text-xs text-slate-400 mt-1">{{ $notification->created_at?->diffForHumans() }}</p>
                                </div>
                            </div>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>

        <div class="p-4 border-t border-slate-100">
            <a href="{{ route('notifications.index') }}" class="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">View all notifications</a>
        </div>
    </div>
    @endauth
</nav>

<script>
function toggleNotifDrawer() {
    const drawer = document.getElementById('notif-drawer');
    const backdrop = document.getElementById('notif-backdrop');
    if (!drawer || !backdrop) return;
    const isOpening = drawer.classList.contains('hidden');
    if (isOpening) {
        drawer.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => drawer.classList.remove('translate-x-full'));
    } else {
        drawer.classList.add('translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
            backdrop.classList.add('hidden');
        }, 300);
    }
}
</script>
