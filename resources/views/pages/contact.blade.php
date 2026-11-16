@extends('layouts.app')

@section('content')
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="relative">
            {{-- Gradient glow behind the card --}}
            <div class="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 blur-xl opacity-30"></div>

            <div class="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white/70 shadow-2xl shadow-emerald-500/25 overflow-hidden">
                {{-- Top accent bar --}}
                <div class="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>

                <div class="p-6 sm:p-10">
                    <div class="text-center mb-8">
                        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">Contact Us</h2>
                        <p class="text-slate-500 text-sm">Have a question or need help? Our support team is here for you.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {{-- Contact details --}}
                        <div class="space-y-4">
                            <div class="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                    <p class="text-sm font-medium text-slate-900">support@sealify.com.ng</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 1.453l-.986 2.89a2 2 0 01-1.143 1.491l-1.549.773c.256.128.509.193.771.193h1.71c.756 0 .999-.256.999-.53V9a2 2 0 012-2h5a2 2 0 012 2v5.093c0 .35.339.581.688.53"/></svg>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                    <p class="text-sm font-medium text-slate-900">+234 813 120 8468</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Office</p>
                                    <p class="text-sm font-medium text-slate-900">Ogbomosoland, Oyo State, Nigeria</p>
                                </div>
                            </div>

                            <div class="space-y-3 pt-2">
                                <a href="https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4?s=cl&p=a&iam=2" target="_blank" rel="noreferrer" class="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 active:scale-95">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    Join WhatsApp Group
                                </a>
                                <a href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" target="_blank" rel="noreferrer" class="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 active:scale-95">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 006.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    Follow Official Channel
                                </a>
                            </div>
                        </div>

                        {{-- Contact form --}}
                        <div class="p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
                            <h3 class="text-lg font-bold text-slate-900 mb-4">Send us a message</h3>
                            <form class="space-y-4" onsubmit="event.preventDefault(); alert('Thanks! Our team will get back to you shortly.');">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input type="text" placeholder="Your name" class="w-full rounded-xl px-4 py-3">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input type="email" placeholder="you@example.com" class="w-full rounded-xl px-4 py-3">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                    <textarea rows="4" placeholder="How can we help?" class="w-full rounded-xl px-4 py-3"></textarea>
                                </div>
                                <button class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200/60 hover:shadow-emerald-300/70 active:scale-95">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection