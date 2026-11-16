@extends('layouts.app')

@section('content')
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Business Cover Header -->
        <div class="relative h-64 bg-slate-200 rounded-2xl overflow-hidden mb-6 mb-4">
            @if ($user->cover_url)
                <img src="{{ $user->cover_url }}" alt="Cover" class="w-full h-full object-cover">
            @else
                <div class="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center">
                    <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L4 8m4-4v12"></path></svg>
                </div>
            @endif
            
            <!-- Company Logo Overlay -->
            <div class="absolute -bottom-10 left-8">
                @if ($user->avatar_url)
                    <img src="{{ $user->avatar_url }}" alt="Logo" class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white">
                @else
                    <div class="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-emerald-600 bg-white">
                        {{ strtoupper(substr($user->name ?? 'B', 0, 1)) }}
                    </div>
                @endif
            </div>
        </div>

        <!-- Business Header Info -->
        <div class="flex flex-col lg:flex-row gap-8 mb-8">
            <div class="lg:w-1/3">
                <div class="flex flex-col items-center text-center">
                    @if ($user->avatar_url)
                        <img src="{{ $user->avatar_url }}" alt="Profile" class="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-white mb-4">
                    @else
                        <div class="w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl font-bold text-emerald-600 bg-white mb-4">
                            {{ strtoupper(substr($user->name ?? 'B', 0, 1)) }}
                        </div>
                    @endif
                    <h1 class="text-2xl font-black text-slate-900 mb-1">{{ $user->business_name ?? $user->name }}</h1>
                    @if ($user->is_verified_seller)
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-4">
                            ✓ Verified Business
                        </span>
                    @endif
                    <p class="text-slate-600 text-sm">{{ $user->business_category ?? 'Business' }}</p>
                    
                    <!-- Follow / Contact Buttons -->
                    <div class="flex gap-3 mt-6 w-full">
                        @auth
                            @if(auth()->id() !== $user->id)
                                @if($user->isFollowedBy(auth()->user()))
                                    <button class="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5.5 5.5A.5.5 0 016 5v6a.5.5 0 01-1 0V5a.5.5 0 01.5-.5zm2.5 3a.5.5 0 000 1h1a.5.5 0 000-1H8zm3 0a.5.5 0 000 1h1a.5.5 0 000-1h-1zm3 0a.5.5 0 000 1h1a.5.5 0 000-1h-1zm-6 2a.5.5 0 000 1h1a.5.5 0 000-1H8zm3 0a.5.5 0 000 1h1a.5.5 0 000-1h-1zm3 0a.5.5 0 000 1h1a.5.5 0 000-1h-1zm-6 2a.5.5 0 000 1h1a.5.5 0 000-1H8zm3 0a.5.5 0 000 1h1a.5.5 0 000-1h-1zm3 0a.5.5 0 000 1h1a.5.5 0 000-1h-1z" clip-rule="evenodd"></path></svg>
                                        Following
                                    </button>
                                @else
                                    <button class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        Follow
                                    </button>
                                @endif
                                <a href="{{ route('messages.index') }}" class="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4-4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm8 0c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"/></svg>
                                    Message
                                </a>
                            @else
                                <a href="{{ route('business.profile') }}" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors">
                                    Edit Business Profile
                                </a>
                            @endif
                        @else
                            <a href="{{ route('login') }}" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors text-center">
                                Login to Follow
                            </a>
                        @endauth
                    </div>
                </div>
            </div>

            <div class="lg:w-2/3 space-y-6">
                <!-- Business Info Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Value Traded</p>
                        <p class="text-lg font-bold text-slate-900">₦{{ number_format($user->total_value_traded ?? 0, 0) }}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed Deals</p>
                        <p class="text-lg font-bold text-slate-900">{{ $user->completed_deals }}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Listings</p>
                        <p class="text-lg font-bold text-slate-900">{{ $user->listings->count() }}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trust Score</p>
                        <div class="flex items-center gap-1">
                            <span class="text-lg font-bold text-slate-900">{{ $user->trust_score ?? 100 }}</span>
                            <span class="text-xs text-emerald-600">/100</span>
                        </div>
                    </div>
                </div>

                <!-- About Section -->
                @if ($user->bio || $user->business_address || $user->website_url || $user->cac_number)
                    <div class="p-6 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                            About Business
                        </h3>
                        
                        @if ($user->bio)
                            <p class="text-slate-600 mb-4">{{ $user->bio }}</p>
                        @endif
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            @if ($user->business_address)
                                <div class="flex items-center gap-3">
                                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span class="text-sm text-slate-700">{{ $user->business_address }}</span>
                                </div>
                            @endif
                            @if ($user->cac_number)
                                <div class="flex items-center gap-3">
                                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span class="text-sm text-slate-700">CAC: {{ $user->cac_number }}</span>
                                </div>
                            @endif
                            @if ($user->website_url)
                                <div class="flex items-center gap-3">
                                    <a href="{{ $user->website_url }}" target="_blank" rel="noreferrer" class="flex items-center gap-3 text-emerald-600 hover:text-emerald-500 text-sm font-medium">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37M9 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"></path></svg>
                                        {{ $user->website_url }}
                                    </a>
                                </div>
                            @endif
                        </div>
                    </div>
                @endif

                <!-- Social Links -->
                @if ($user->instagram_handle || $user->twitter_handle || $user->whatsapp_number)
                    <div class="p-6 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <h3 class="text-lg font-bold text-slate-900 mb-4">Connect</h3>
                        <div class="flex gap-4">
                            @if ($user->instagram_handle)
                                <a href="https://instagram.com/{{ $user->instagram_handle }}" target="_blank" rel="noreferrer" class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4a5 5 0 015-5h4a5 5 0 015 5v4a5 5 0 01-5 5H4a5 5 0 01-5-5V4z"></path></svg>
                                </a>
                            @endif
                            @if ($user->twitter_handle)
                                <a href="https://twitter.com/{{ $user->twitter_handle }}" target="_blank" rel="noreferrer" class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4.5h5.667h4A11.952 11.952 0 0118 9.87v.018a7.58 7.58 0 01-2.16 3.835l-1.174 1.174C16.974 15.286 18 16.68 18 18.22v.072A13.2 13.2 0 015.192 18.53c-3.479.69-5.392-1.225-5.392-4.938v-1.43c0-.752.123-1.485.34-2.165a6.79 6.79 0 011.472-2.956A10.45 10.45 0 014 11.557c0-.532.045-1.053.128-1.566a4.79 4.79 0 001.31-3.278c-.355.125-.719.238-1.092.348a10 10 0 01-.417-.132 9.98 9.98 0 01-.51-.507c-.013-.012-.026-.024-.039-.037a3 3 0 01-.39-.527c-.083-.207-.137-.428-.147-.655a1 1 0 01.2-.548c.265-.266.637-.422 1.05-.422a1 1 0 01.632.158c.365.353.727.858 1.042 1.418a10 10 0 01-1.417-.02c-2.604-.002-4.958 1.052-6.676 2.748a9.97 9.97 0 00-2.09 4.302c0 .743.156 1.457.429 2.128a10.2 10.2 0 000 2.172c.273.672.601 1.364 1.013 1.997.69.999 1.553 1.842 2.538 2.438 1.043.628 2.181 1.107 3.392 1.418 1.202.311 2.448.446 3.736-.374a10 10 0 002.003-.29c.668-.139 1.3-.382 1.886-.732a9 9 0 002.79-1.328c.722-.482 1.367-1.073 1.936-1.757a9.96 9.96 0 002.42-2.504c.256-.368.49-.771.7-1.2a9.8 9.8 0 00.534-1.253c.053-.146.09-.295.12-.446a8 8 0 00.14-.594c.029-.113.047-.227.066-.342a10 10 0 00.082-.577c.009-.036.024-.071.029-.108a8 8 0 00.034-.318 7 7 0 00.01-.257c0-.085-.006-.17-.012-.254a7 7 0 00-.017-.375 8 8 0 00-.03-.594c-.007-.044-.025-.086-.036-.129a9 9 0 00-.118-.33c-.024-.063-.034-.129-.063-.19a8 8 0 00-.136-.26c-.036-.072-.065-.148-.106-.216a10 10 0 00-.244-.41c-.033-.057-.059-.117-.096-.17a10 10 0 00-.31-.397c-.04-.048-.087-.09-.128-.136a10 10 0 00-.354-.314c-.036-.026-.078-.045-.117-.068a9 9 0 00-.356-.188c-.042-.017-.087-.028-.13-.042a8 8 0 00-.458-.127c-.065-.02-.126-.047-.193-.062a10 10 0 00-.438-.101c-.083-.016-.168-.027-.254-.038a8 8 0 00-.543-.048c-.147-.006-.293-.008-.441-.011a9 9 0 00-.448-.003c-.155-.001-.309-.005-.464-.005h-.001c-.155 0-.31.004-.464.005q-.216.004-.43.01c-.16.004-.318.017-.475.031a8 8 0 00-.577.103c-.101.028-.196.068-.292.104a9 9 0 00-.67.315c-.09.057-.173.122-.259.186a10 10 0 00-.667.666c-.073.094-.138.196-.203.296a10 10 0 00-.437.797c-.04.09-.074.183-.107.276a10 10 0 00-.174.745c-.013.118-.026.235-.033.354a9 9 0 00-.025.713c0 .161.009.321.022.48.014.168.036.333.063.496.032.202.076.399.134.594.032.104.056.21.093.312.052.144.116.282.182.418.045.091.083.185.133.273.055.096.118.188.18.278.074.108.154.209.235.311.095.122.196.236.302.348.123.131.253.253.388.37.15.131.304.252.465.366.148.104.299.198.456.288.157.09.319.169.485.244.166.075.335.139.508.2.173.062.348.114.527.162.18.047.362.084.547.118.186.034.373.058.561.079.189.021.378.033.569.042.191.009.382.009.573-.001a10 10 0 00.609-.079c.106-.018.21-.044.314-.068a9 9 0 00.674-.196c.073-.028.143-.064.214-.097a9 9 0 00.7-.32c.09-.05.175-.107.262-.163a9 9 0 00.638-.461c.065-.061.127-.127.19-.192a9 9 0 00.567-.647c.053-.067.102-.137.153-.206a9 9 0 00.454-.753c.029-.058.053-.118.08-.178a9 9 0 00.3-.76c.019-.06.033-.121.05-.182a10 10 0 00.27-.83c.016-.07.027-.141.04-.212a8 8 0 00.14-.66c.012-.074.019-.149.027-.223c.012-.118.019-.236.025-.354.005-.122.005-.244.005-.366s0-.244-.005-.366c-.006-.118-.013-.236-.025-.354-.008-.074-.015-.149-.027-.223a8 8 0 00-.14-.66c-.013-.071-.024-.142-.04-.212a10 10 0 00-.27-.83c-.017-.061-.031-.122-.05-.182a9 9 0 00-.3-.76c-.027-.06-.051-.12-.08-.178a9 9 0 00-.454-.753c-.051-.07-.1-.139-.153-.206a9 9 0 00-.567-.647c-.063-.065-.125-.131-.19-.192a9 9 0 00-.638-.461c-.087-.056-.172-.113-.262-.163a9 9 0 00-.7-.32c-.071-.033-.141-.069-.214-.097a9 9 0 00-.674-.196c-.104-.024-.208-.05-.314-.068a10 10 0 00-.609-.079c-.191.009-.382.009-.573-.042-.188-.021-.375-.044-.561-.079-.185-.034-.367-.071-.547-.118-.179-.047-.354-.099-.527-.162-.173-.061-.35-.154-.508-.2-.166-.075-.328-.154-.485-.244-.157-.09-.308-.184-.456-.288-.161-.114-.315-.235-.465-.366-.135-.117-.265-.239-.388-.37-.106-.112-.207-.226-.302-.348-.081-.102-.161-.203-.235-.311-.062-.09-.125-.182-.18-.278-.066-.136-.13-.274-.182-.418-.037-.102-.061-.208-.093-.312-.058-.195-.102-.392-.134-.594-.027-.163-.049-.328-.063-.496-.013-.159-.022-.319-.022-.48s-.009-.32-.025-.713c-.007-.119-.02-.236-.033-.354a10 10 0 00-.174-.745c-.033-.093-.067-.186-.107-.276a10 10 0 00-.437-.797c-.065-.1-.13-.202-.203-.296a10 10 0 00-.667-.666c-.086-.064-.169-.129-.259-.186a9 9 0 00-.67-.315c-.096-.036-.191-.076-.292-.104a8 8 0 00-.577-.103c-.157-.014-.315-.027-.475-.031q-.214-.006-.43-.01h-.001c-.155-.001-.309-.005-.464-.005a9 9 0 00-.448-.003c-.148-.003-.294-.005-.441-.011a8 8 0 00-.543-.048c-.086-.011-.171-.022-.254-.038a10 10 0 00-.438-.101c-.067-.015-.128-.042-.193-.062a8 8 0 00-.458-.127c-.043-.014-.088-.025-.13-.042a9 9 0 00-.356-.188c-.039-.023-.081-.042-.117-.068a10 10 0 00-.354-.314c-.041-.039-.089-.074-.126-.16a10 10 0 00-.244-.41c-.041-.068-.07-.144-.106-.216a9 9 0 00-.136-.26c-.029-.061-.063-.127-.096-.19a9 9 0 00-.118-.33c-.011-.043-.029-.085-.036-.129a8 8 0 00-.03-.594c-.007-.085-.012-.17-.012-.254s-.01-.257-.01-.257c0-.085.006-.17.012-.254a7 7 0 01.017-.375 8 8 0 01.03-.594c.029-.077.063-.152.102-.226a8 8 0 01.22-.356c.053-.067.102-.137.153-.206a9 9 0 01.454-.753c.051-.069.1-.139.153-.206a9 9 0 01.567-.647c.063-.065.125-.131.19-.192a9 9 0 01.638-.461c.087-.056.172-.113.262-.163a9 9 0 01.7-.32c.071-.033-.141-.069-.214-.097a9 9 0 00-.674-.196c-.104-.024-.208-.05-.314-.068a10 10 0 00-.609-.079c-.191-.009-.382-.009-.573-.042-.188-.021-.375-.044-.561-.079-.185-.034-.367-.071-.547-.118-.179-.047-.354-.099-.527-.162-.173-.061-.35-.154-.508-.2-.166-.075-.328-.154-.485-.244-.157-.09-.308-.184-.456-.288-.161-.114-.315-.235-.465-.366-.135-.117-.265-.239-.388-.37-.106-.112-.207-.226-.302-.348-.081-.102-.161-.203-.235-.311-.062-.09-.125-.182-.18-.278-.066-.136-.13-.274-.182-.418-.037-.102-.061-.208-.093-.312-.058-.195-.102-.392-.134-.594-.027-.163-.049-.328-.063-.496-.013-.159-.022-.319-.022-.48z"></path></svg>
                                </a>
                            @endif
                            @if ($user->whatsapp_number)
                                <a href="https://wa.me/{{ $user->whatsapp_number }}" target="_blank" rel="noreferrer" class="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="#25d366" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-.546-.01-1.09-7.827 1.6-9.267-3.968-9.267-3.968-.836-2.12-2.04-2.72-2.04-2.72-1.67-1.13.12-1.11.12-1.11 1.44.167 2.2 1.476 2.2 1.476 1.795 2.2 4.08 1.567 5.08 1.126.203-.875.695-1.476 1.25-1.826-2.835-.33-5.825-1.41-5.825-7.113 0-1.57.57-2.85 1.535-3.858-.143-.397-.6-.75-1.034-.978-2.75-.363-5.65 1.35-5.65 1.35 1.003.604 2.263.82 3.456.893-1.18 1.22-1.86 2.72-1.86 4.52 0 1.57.634 2.984 1.746 3.994.326.237.703.446 1.138.598-1.457-.917-2.47-2.597-1.406-4.693 0 0 1.176-.39 3.86 1.456a9.2 9.2 0 012.812.836c1.035 0 2.07-.28 3.057-.857a9.25 9.25 0 003.06-.855c1.025-.343 2.117-.56 3.26-.56 1.144 0 2.23.22 3.26.56a9.25 9.25 0 013.057.855c2.69-1.846 3.86-1.456 3.86-1.456 1.064-2.096.41-4.693-1.406-4.693.435-.152.812-.361 1.138-.598 1.112-1.01 1.746-2.424 1.746-3.994 0-1.8-.684-3.3-1.86-4.52-.143-.073-.28-.146-.428-.208a9 9 0 00-1.81-.556c-.39-.1-.8-.16-1.2-.177z"></path></svg>
                                </a>
                            @endif
                        </div>
                    </div>
                @endif
            </div>
        </div>

        <!-- Business Listings -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-black text-slate-900">Products &amp; Services</h2>
                @if ($user->listings->count() > 0)
                    <a href="{{ route('listings.my') }}" class="text-sm text-emerald-600 font-bold hover:underline">View All →</a>
                @endif
            </div>

            @if ($user->listings->isEmpty())
                <div class="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div class="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-4xl">📦</div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">No Products Yet</h3>
                    <p class="text-slate-600 mb-6 max-w-sm mx-auto">This business hasn't posted any listings yet.</p>
                    @auth
                        @if(auth()->id() === $user->id)
                            <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                                Post Your First Ad
                            </a>
                        @endif
                    @endauth
                </div>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach ($user->listings->take(9) as $listing)
                        <a href="{{ route('listings.show', $listing) }}" class="block group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                            <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                                @include('partials.watermark-image', [
                                    'src' => $listing->images->first()?->url ?? asset('logo.png'),
                                    'alt' => $listing->title,
                                    'class' => 'w-full h-full object-cover',
                                ])
                            </div>
                            <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600 line-clamp-1">{{ $listing->title }}</h4>
                            <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                        </a>
                    @endforeach
                </div>
                @if ($user->listings->count() > 9)
                    <div class="mt-4 text-center">
                        <a href="{{ route('listings.my') }}" class="text-sm text-emerald-600 font-bold hover:underline">View all {{ $user->listings->count() }} listings →</a>
                    </div>
                @endif
            @endif
        </div>
    </div>
@endsection
