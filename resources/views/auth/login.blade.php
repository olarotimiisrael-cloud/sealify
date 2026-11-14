<x-guest-layout>
    <x-form-card title="Sign in to Sealify" subtitle="Welcome back. Buy, sell, and connect locally.">
        <div class="flex items-center justify-center mb-6">
            <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-8 w-auto">
            <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
        </div>

        @if (session('status'))
            <div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
                {{ session('status') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                <ul class="list-disc list-inside space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('login.submit') }}" class="space-y-4">
            @csrf

            <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" required
                       value="{{ old('email') }}"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                <input id="password" name="password" type="password" required minlength="6"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input id="remember" name="remember" type="checkbox" class="w-4 h-4 text-emerald-600 rounded border-slate-200">
                    <label for="remember" class="ml-2 text-sm text-slate-600">Remember me</label>
                </div>
                <a href="{{ route('password.request') }}" class="text-xs text-emerald-600 font-bold hover:underline">Forgot password?</a>
            </div>

            <button type="submit"
                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Sign In
            </button>
        </form>

        <div class="mt-6 border-t border-slate-100 pt-6 text-center relative">
            <span class="absolute -top-1.5 bg-white px-2 text-xs text-slate-400">Or continue with</span>
            <div class="grid grid-cols-2 gap-3 mt-2">
                <a href="{{ route('auth.google') }}"
                   class="flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Google
                </a>
                <a href="{{ route('auth.apple') }}"
                   class="flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                    Apple
                </a>
            </div>
        </div>

        <div class="mt-8 text-center">
            <p class="text-xs text-slate-500">Don't have an account?</p>
            <a href="{{ route('register') }}" class="text-emerald-600 font-bold text-xs hover:underline">Sign Up</a>
        </div>
    </x-form-card>
</x-guest-layout>
