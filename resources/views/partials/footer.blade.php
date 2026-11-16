<footer class="bg-white border-t border-slate-200 pt-8 pb-32 lg:pb-8 mt-6 font-sans shadow-sm">
    <div class="max-w-7xl mx-auto px-4 space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Logo & Tagline -->
            <div class="space-y-4">
                <div class="flex items-center gap-2">
                    <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-6 w-auto">
                    <span class="text-emerald-600 font-black text-lg tracking-tight">Sealify</span>
                </div>
                <p class="text-xs text-slate-800 leading-relaxed max-w-xs">
                    Nigeria's most trusted local marketplace. We connect verified buyers and sellers in Ogbomosoland, Oyo State, and across the federation.
                </p>
                <div class="flex items-center gap-3 mt-4">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-500 hover:text-white transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-500 hover:text-white transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-500 hover:text-white transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                    </a>
                </div>
            </div>
            <!-- Marketplace -->
            <div class="space-y-4">
                <h4 class="text-sm font-black text-slate-700 uppercase tracking-wider">Marketplace</h4>
                <ul class="space-y-2 text-xs text-slate-800">
                    <li><a href="{{ route('listings.index') }}" class="hover:text-emerald-600 transition-colors">Browse All Ads</a></li>
                    <li><a href="{{ route('community') }}" class="hover:text-emerald-600 transition-colors">Community News Board</a></li>
                    <li><a href="{{ route('vendors') }}" class="hover:text-emerald-600 transition-colors">Verified Merchants Directory</a></li>
                    <li><a href="{{ route('listings.create') }}" class="hover:text-emerald-600 transition-colors">Post an Ad</a></li>
                    <li><a href="{{ route('safety') }}" class="hover:text-emerald-600 transition-colors">Safety Center</a></li>
                </ul>
            </div>
            <!-- Support & Community -->
            <div class="space-y-4">
                <h4 class="text-sm font-black text-slate-700 uppercase tracking-wider">Support &amp; Community</h4>
                <ul class="space-y-2 text-xs text-slate-800">
                    <li><a href="{{ route('faq') }}" class="hover:text-emerald-600 transition-colors">Help &amp; FAQ</a></li>
                    <li><a href="{{ route('contact') }}" class="hover:text-emerald-600 transition-colors">Contact Us</a></li>
                    <li><a href="{{ route('dispute') }}" class="hover:text-emerald-600 transition-colors">File Trade Dispute</a></li>
                </ul>
            </div>
            <!-- Contact -->
            <div class="space-y-4">
                <h4 class="text-sm font-black text-slate-700 uppercase tracking-wider">Contact</h4>
                <ul class="space-y-3 text-xs text-slate-700">
                    <li class="flex items-start gap-3">
                        <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>Ogbomosoland, Oyo State, Nigeria</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        <a href="mailto:support@sealify.ng" class="hover:text-emerald-600 transition-colors">support@sealify.ng</a>
                    </li>
                    <li class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        <a href="tel:+2348131208468" class="hover:text-emerald-600 transition-colors">+234 813 120 8468</a>
                    </li>
                </ul>
                <div class="space-y-2 pt-1">
                    <a href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Join WhatsApp Group
                    </a>
                    <a href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Follow WhatsApp Channel
                    </a>
                </div>
            </div>
        </div>
        <!-- Install App -->
        <div class="max-w-xs">
            <h4 class="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Install App</h4>
            <button id="install-app-btn" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2" onclick="installApp()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L4 8m4-4v12"></path></svg>
                Install App
            </button>
            <p class="text-xs text-slate-500 text-center mt-2">Install Sealify on your device</p>
        </div>
    </div>
    <div class="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-800 uppercase font-black tracking-widest">
        <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>© 2027 SEALIFY NIGERIA. ALL RIGHTS RESERVED.</span>
        </div>
        <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 019-9"></path></svg>
            <span>Proudly Serving Ogbomosoland &amp; Oyo State</span>
        </div>
    </div>
</footer>
