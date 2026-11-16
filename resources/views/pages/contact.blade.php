@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Contact Us</h2>
            <p class="text-slate-600 mb-6">Have a question? Reach our support team.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
<div class="space-y-4">
                    <p class="text-sm font-medium text-slate-900">Email</p>
                    <p class="text-slate-600">support@sealify.com.ng</p>
                    <p class="text-sm font-medium text-slate-900">Phone</p>
                    <p class="text-slate-600">+234 813 120 8468</p>
                    <p class="text-sm font-medium text-slate-900">Office</p>
                    <p class="text-slate-600">Ogbomosoland, Oyo State, Nigeria</p>
                    <p class="text-sm font-medium text-slate-900 mt-4">WhatsApp Official Group</p>
                    <a href="https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4?s=cl&p=a&iam=2" target="_blank" rel="noreferrer" class="block bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Join WhatsApp Group
                    </a>
                    <p class="text-sm font-medium text-slate-900 mt-2">Official Channel</p>
                    <a href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" target="_blank" rel="noreferrer" class="block bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Follow Official Channel
                    </a>
                </div>
                <div>
                    <form class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Name</label>
                            <input type="text" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Message</label>
                            <textarea rows="4" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
                        </div>
                        <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition-colors w-full">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
